import { storage, storageKeys } from '@/services/storage';
import type { User } from '../types/auth.types';

export interface LoginResponse {
  user: User;
  token: string;
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    // Simulate network latency for authentic feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock authentication validation
    if (!email.includes('@') || password.length < 6) {
      throw new Error(
        'Invalid email address or password must be at least 6 characters.'
      );
    }

    const mockUser: User = {
      id: 'usr_001',
      name: email.split('@')[0] || 'Vegan Explorer',
      email,
    };
    const mockToken = `mock_jwt_token_${Date.now()}`;

    // Persist session to local storage
    await storage.setItem(storageKeys.authToken, mockToken);
    await storage.setItem(storageKeys.authUser, JSON.stringify(mockUser));

    return { user: mockUser, token: mockToken };
  },

  async logout(): Promise<void> {
    await storage.removeItem(storageKeys.authToken);
    await storage.removeItem(storageKeys.authUser);
  },

  async restoreSession(): Promise<LoginResponse | null> {
    const storedToken = await storage.getItem(storageKeys.authToken);
    const storedUser = await storage.getItem(storageKeys.authUser);

    if (storedToken && storedUser) {
      const user = JSON.parse(storedUser) as User;
      return { user, token: storedToken };
    }

    return null;
  },
};
