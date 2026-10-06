import { storage, storageKeys } from '@/services/storage';
import { firebaseAuth, type FirebaseSession } from './firebaseAuth';

const REFRESH_EARLY_MS = 60_000;
let sessionGeneration = 0;
let refreshInFlight: Promise<FirebaseSession> | null = null;

async function persistSession(session: FirebaseSession) {
  const expiresAt = Date.now() + session.expiresIn * 1000;
  await Promise.all([
    storage.setItem(storageKeys.authToken, session.idToken),
    storage.setItem(storageKeys.authRefreshToken, session.refreshToken),
    storage.setItem(storageKeys.authTokenExpiresAt, String(expiresAt)),
    storage.setItem(storageKeys.authFirebaseUserId, session.localId),
  ]);
}

function refreshSession(refreshToken: string) {
  if (refreshInFlight) return refreshInFlight;

  const generationAtStart = sessionGeneration;
  const operation = firebaseAuth.refresh(refreshToken).then(async (session) => {
    if (generationAtStart !== sessionGeneration) {
      throw new Error('Phiên đăng nhập đã thay đổi.');
    }
    await persistSession(session);
    return session;
  });
  refreshInFlight = operation;
  const release = () => {
    if (refreshInFlight === operation) refreshInFlight = null;
  };
  void operation.then(release, release);
  return operation;
}

export const authSession = {
  async save(session: FirebaseSession) {
    sessionGeneration += 1;
    await persistSession(session);
  },

  async getValidToken(): Promise<string | null> {
    const [token, refreshToken, expiresAtValue] = await Promise.all([
      storage.getItem(storageKeys.authToken),
      storage.getItem(storageKeys.authRefreshToken),
      storage.getItem(storageKeys.authTokenExpiresAt),
    ]);

    const expiresAt = Number(expiresAtValue);
    if (
      token &&
      Number.isFinite(expiresAt) &&
      expiresAt > Date.now() + REFRESH_EARLY_MS
    ) {
      return token;
    }
    if (!refreshToken) return null;

    const refreshed = await refreshSession(refreshToken);
    return refreshed.idToken;
  },

  async clear() {
    sessionGeneration += 1;
    await Promise.all([
      storage.removeItem(storageKeys.authToken),
      storage.removeItem(storageKeys.authRefreshToken),
      storage.removeItem(storageKeys.authTokenExpiresAt),
      storage.removeItem(storageKeys.authFirebaseUserId),
    ]);
  },
};
