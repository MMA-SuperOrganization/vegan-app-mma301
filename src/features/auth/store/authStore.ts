import { create } from 'zustand';
import {
  getUserErrorMessage,
  logAppError,
  toAppErrorDetails,
} from '@/services/errors';
import { onAccountBlocked } from '@/services/api';
import { authApi } from '../services/authApi';
import type { AuthState, User } from '../types/auth.types';
import { translate } from '@/i18n';

export type { User, AuthState };

function captureError(
  error: unknown,
  operation: string,
  fallbackMessage: string,
  fallbackCode: string
) {
  const details = toAppErrorDetails(error, operation, fallbackMessage, fallbackCode);
  logAppError(details);
  return { ...details, message: getUserErrorMessage(error, fallbackMessage) };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isRestoringSession: true,
  error: null,

  login: async (email, password) => {
    if (get().isLoading) return false;
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authApi.login(email, password);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: captureError(
          error,
          'auth.login.password',
          translate('auth.error.login'),
          'PASSWORD_LOGIN_FAILED'
        ),
      });
      return false;
    }
  },

  loginWithGoogle: async (googleIdToken, requestUri) => {
    if (get().isLoading) return false;
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authApi.loginWithGoogle(
        googleIdToken,
        requestUri
      );
      set({ user, token, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: captureError(
          error,
          'auth.login.google.firebase',
          translate('auth.error.googleLogin'),
          'GOOGLE_LOGIN_FAILED'
        ),
      });
      return false;
    }
  },

  register: async (name, email, password) => {
    if (get().isLoading) return false;
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authApi.register(name, email, password);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: captureError(
          error,
          'auth.register.password',
          translate('auth.error.register'),
          'REGISTER_FAILED'
        ),
      });
      return false;
    }
  },

  sendPasswordReset: async (email) => {
    if (get().isLoading) return false;
    set({ isLoading: true, error: null });
    try {
      await authApi.sendPasswordReset(email);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: captureError(
          error,
          'auth.password_reset',
          translate('auth.error.reset'),
          'PASSWORD_RESET_FAILED'
        ),
      });
      return false;
    }
  },

  logout: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      await authApi.logout();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: captureError(
          error,
          'logout',
          translate('error.unexpected'),
          'LOGOUT_FAILED'
        ),
      });
      throw error;
    }
  },

  handleBlockedAccount: async (code) => {
    if (!get().isAuthenticated) return;
    // Sign out locally so the login screen explains why access stopped.
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: captureError(
        { code, status: 403 },
        'auth.account_blocked',
        translate('error.accountInactive'),
        code
      ),
    });
    await authApi.clearLocalSession().catch(() => undefined);
  },

  restoreSession: async () => {
    set({ isRestoringSession: true, error: null });
    try {
      const result = await authApi.restoreSession();
      set({
        token: result?.token ?? null,
        user: result?.user ?? null,
        isAuthenticated: !!result,
      });
    } catch (error) {
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        error: captureError(
          error,
          'auth.restore_session',
          translate('error.unexpected'),
          'SESSION_RESTORE_FAILED'
        ),
      });
    } finally {
      set({ isRestoringSession: false });
    }
  },

  markOnboardingCompleted: () =>
    set((state) => ({
      user: state.user ? { ...state.user, onboardingCompleted: true } : null,
    })),
  syncUser: (user) => set({ user, isAuthenticated: true }),
  reportError: (error, operation, fallbackMessage, fallbackCode) =>
    set({
      error: captureError(
        error,
        operation,
        fallbackMessage,
        fallbackCode ?? 'AUTH_FAILED'
      ),
    }),
  clearError: () => set({ error: null }),
}));

onAccountBlocked((code) => {
  void useAuthStore.getState().handleBlockedAccount(code);
});
