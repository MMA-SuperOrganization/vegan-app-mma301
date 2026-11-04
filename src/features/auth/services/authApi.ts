import { apiClient, unwrapApiRequest } from '@/services/api';
import { authSession, firebaseAuth } from '@/services/auth';
import { storage, storageKeys } from '@/services/storage';
import { translate } from '@/i18n';
import { unregisterStoredDevice } from '@/features/reminders/deviceRegistration';
import type { User } from '../types/auth.types';
import { isUnusableSessionCredential } from './sessionRecovery';

interface AccountDto {
  _id: string;
  userId: string;
  email?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'deleted';
  onboardingCompleted?: boolean | null;
  isNewAccount?: boolean;
  passwordSetupRequired?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
}

function toUser(account: AccountDto): User {
  return {
    id: account.userId || account._id,
    name:
      account.displayName ||
      account.email?.split('@')[0] ||
      translate('common.userFallback'),
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
  // Firebase sends a one-time password setup link. This gives a Google-first
  // account a password credential without ever emailing or storing plaintext.
  if (account.passwordSetupRequired && account.email) {
    await firebaseAuth.sendPasswordReset(account.email).catch(() => undefined);
  }
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

async function clearStoredSession() {
  await Promise.all([authSession.clear(), storage.removeItem(storageKeys.authUser)]);
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

  // Drops the local session only; used when the API rejects a blocked account.
  clearLocalSession: clearStoredSession,

  async logout() {
    const user = await readCachedUser();
    if (user) await unregisterStoredDevice(user.id);
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
      if (isUnusableSessionCredential(error)) {
        await clearStoredSession();
        return null;
      }
      throw error;
    }
  },
};
