import { apiClient, unwrapApiRequest } from '@/services/api';
import { authSession, firebaseAuth } from '@/services/auth';
import { storage, storageKeys } from '@/services/storage';
import { AppError } from '@/services/errors';
import type { User } from '../types/auth.types';

interface AccountDto {
  _id: string;
  userId: string;
  email?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'deleted';
  onboardingCompleted?: boolean | null;
}

export interface LoginResponse {
  user: User;
  token: string;
}

function toUser(account: AccountDto): User {
  return {
    id: account.userId || account._id,
    name: account.displayName || account.email?.split('@')[0] || 'Bạn',
    email: account.email || '',
    avatarUrl: account.avatarUrl || undefined,
    role: account.role,
    status: account.status,
    onboardingCompleted: account.onboardingCompleted === true,
  };
}

async function syncAccount(token: string): Promise<LoginResponse> {
  const account = await unwrapApiRequest<AccountDto>(() =>
    apiClient.post('/auth/sync', {})
  );
  const user = toUser(account);
  await storage.setItem(storageKeys.authUser, JSON.stringify(user));
  return { user, token };
}

async function readCachedUser(): Promise<User | null> {
  try {
    const value = await storage.getItem(storageKeys.authUser);
    if (!value) return null;
    const user = JSON.parse(value) as Partial<User>;
    return typeof user.id === 'string' && typeof user.email === 'string'
      ? (user as User)
      : null;
  } catch {
    return null;
  }
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const session = await firebaseAuth.signIn(email, password);
    await authSession.save(session);
    try {
      return await syncAccount(session.idToken);
    } catch (error) {
      await authSession.clear();
      throw error;
    }
  },

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<LoginResponse> {
    let session = await firebaseAuth.signUp(email, password);
    session = await firebaseAuth.updateDisplayName(session, name);
    await authSession.save(session);
    try {
      return await syncAccount(session.idToken);
    } catch (error) {
      await authSession.clear();
      throw error;
    }
  },

  async loginWithGoogle(
    googleIdToken: string,
    requestUri: string
  ): Promise<LoginResponse> {
    const session = await firebaseAuth.signInWithGoogle(googleIdToken, requestUri);
    await authSession.save(session);
    try {
      return await syncAccount(session.idToken);
    } catch (error) {
      await authSession.clear();
      throw error;
    }
  },

  sendPasswordReset(email: string) {
    return firebaseAuth.sendPasswordReset(email);
  },

  logout() {
    return Promise.all([
      authSession.clear(),
      storage.removeItem(storageKeys.authUser),
    ]).then(() => undefined);
  },

  async restoreSession(): Promise<LoginResponse | null> {
    try {
      const token = await authSession.getValidToken();
      return token ? await syncAccount(token) : null;
    } catch (error) {
      if (error instanceof AppError && error.status === 401) {
        await authSession.clear();
        await storage.removeItem(storageKeys.authUser);
        return null;
      }
      const token = await authSession.getValidToken().catch(() => null);
      const user = await readCachedUser();
      if (token && user) return { token, user };
      throw error;
    }
  },
};
