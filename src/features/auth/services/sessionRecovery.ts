const UNUSABLE_FIREBASE_SESSION_CODES = new Set([
  'INVALID_GRANT',
  'INVALID_REFRESH_TOKEN',
  'TOKEN_EXPIRED',
  'USER_DISABLED',
  'USER_NOT_FOUND',
]);

interface SessionErrorLike {
  code?: unknown;
  status?: unknown;
}

export function isUnusableSessionCredential(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const candidate = error as SessionErrorLike;
  return (
    candidate.status === 401 ||
    (typeof candidate.code === 'string' &&
      UNUSABLE_FIREBASE_SESSION_CODES.has(candidate.code))
  );
}
