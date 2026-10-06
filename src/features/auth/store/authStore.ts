import { create } from 'zustand';
import { authApi } from '../services/authApi';
import type { AuthState, User } from '../types/auth.types';

export type { User, AuthState };

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
        error: error instanceof Error ? error.message : 'Không thể đăng nhập.',
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
        error: error instanceof Error ? error.message : 'Không thể tạo tài khoản.',
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
        error: error instanceof Error ? error.message : 'Không thể gửi liên kết.',
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
  clearError: () => set({ error: null }),
}));
