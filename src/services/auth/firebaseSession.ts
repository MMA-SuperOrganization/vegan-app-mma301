export interface FirebaseSession {
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  localId: string;
  email?: string;
  displayName?: string;
}

export interface FirebaseSessionPayload {
  idToken?: string;
  refreshToken?: string;
  expiresIn?: string | number;
  localId?: string;
  email?: string;
  displayName?: string;
}

export function normalizeFirebaseSession(
  payload: FirebaseSessionPayload,
  fallback?: FirebaseSession
): FirebaseSession {
  const idToken = payload.idToken || fallback?.idToken;
  const refreshToken = payload.refreshToken || fallback?.refreshToken;
  const expiresIn = Number(payload.expiresIn ?? fallback?.expiresIn);
  const localId = payload.localId || fallback?.localId;

  if (
    !idToken ||
    !refreshToken ||
    !localId ||
    !Number.isFinite(expiresIn) ||
    expiresIn <= 0
  ) {
    throw new Error('Firebase response is missing required session credentials.');
  }

  return {
    idToken,
    refreshToken,
    expiresIn,
    localId,
    email: payload.email ?? fallback?.email,
    displayName: payload.displayName ?? fallback?.displayName,
  };
}
