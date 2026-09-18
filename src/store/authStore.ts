import { create } from 'zustand';
import { storage } from '@/services/storage/storage';
import type { User, AuthState } from '@/types';

export type { User, AuthState };

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
};

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
      // Simulate network latency for authentic feel
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Simple mock authentication validation
      if (!email.includes('@') || password.length < 6) {
        set({
          isLoading: false,
          error: 'Invalid email address or password must be at least 6 characters.',
        });
        return false;
      }

      // Mock successful user data
      const mockUser: User = {
        id: 'usr_001',
        name: email.split('@')[0] || 'Vegan Explorer',
        email,
      };
      const mockToken = `mock_jwt_token_${Date.now()}`;

      // Persist to local storage
      await storage.setItem(STORAGE_KEYS.TOKEN, mockToken);
      await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));

      set({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch {
      set({
        isLoading: false,
        error: 'An unexpected error occurred during login. Please try again.',
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await storage.removeItem(STORAGE_KEYS.TOKEN);
      await storage.removeItem(STORAGE_KEYS.USER);
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
      const storedToken = await storage.getItem(STORAGE_KEYS.TOKEN);
      const storedUser = await storage.getItem(STORAGE_KEYS.USER);

      if (storedToken && storedUser) {
        const user = JSON.parse(storedUser) as User;
        set({
          token: storedToken,
          user,
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
