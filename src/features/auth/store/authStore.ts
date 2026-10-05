import { create } from 'zustand';
import { authApi } from '../services/authApi';
import type { AuthState, User } from '../types/auth.types';

export type { User, AuthState };

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isRestoringSession: true,
  error: null,

  login: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true, error: null });

    try {
      const { user, token } = await authApi.login(email, password);
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred during login. Please try again.';
      set({
        isLoading: false,
        error: message,
      });
      return false;
    }
  },

  logout: async () => {
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
      if (result) {
        set({
          token: result.token,
          user: result.user,
          isAuthenticated: true,
          isRestoringSession: false,
        });
        return;
      }
    } catch {
      // Session restore failed, clear state
    } finally {
      set({ isRestoringSession: false });
    }
  },

  clearError: () => set({ error: null }),
}));
