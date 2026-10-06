import { create } from 'zustand';
import { logAppError, toAppErrorDetails } from '@/services/errors';
import { authApi } from '../services/authApi';
import type { AuthState, User } from '../types/auth.types';

export type { User, AuthState };

function captureError(
  error: unknown,
  operation: string,
  fallbackMessage: string,
  fallbackCode: string
) {
  const details = toAppErrorDetails(error, operation, fallbackMessage, fallbackCode);
  logAppError(details);
  return details;
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
          'Không thể đăng nhập.',
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
          'Không thể đăng nhập bằng Google.',
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
          'Không thể tạo tài khoản.',
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
          'Không thể gửi liên kết.',
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
    } finally {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  restoreSession: async () => {
    set({ isRestoringSession: true });
    try {
      const result = await authApi.restoreSession();
      set({
        token: result?.token ?? null,
        user: result?.user ?? null,
        isAuthenticated: !!result,
      });
    } finally {
      set({ isRestoringSession: false });
    }
  },

  markOnboardingCompleted: () =>
    set((state) => ({
      user: state.user ? { ...state.user, onboardingCompleted: true } : null,
    })),
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
