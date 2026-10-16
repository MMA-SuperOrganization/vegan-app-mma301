import type { TranslationKey } from '../../i18n/translations';

// Only these codes select user-facing copy. Never display a provider/server message.
const publicMessageKeys: Partial<Record<string, TranslationKey>> = {
  ACCOUNT_DISABLED: 'error.accountDisabled',
  USER_DISABLED: 'error.accountDisabled',
  ACCOUNT_SUSPENDED: 'error.accountSuspended',
  ACCOUNT_DELETED: 'error.accountDeleted',
  TOKEN_EXPIRED: 'error.tokenExpired',
  TOKEN_INVALID: 'error.tokenInvalid',
  INVALID_REFRESH_TOKEN: 'error.tokenInvalid',
  ONBOARDING_INCOMPLETE: 'error.onboardingIncomplete',
  EMAIL_EXISTS: 'firebase.emailExists',
  EMAIL_NOT_FOUND: 'firebase.invalidCredentials',
  INVALID_LOGIN_CREDENTIALS: 'firebase.invalidCredentials',
  INVALID_PASSWORD: 'firebase.invalidCredentials',
  TOO_MANY_ATTEMPTS_TRY_LATER: 'firebase.tooManyAttempts',
  WEAK_PASSWORD: 'firebase.weakPassword',
  INVALID_EMAIL: 'auth.validation.emailInvalid',
  NETWORK_ERROR: 'error.network',
  ERR_NETWORK: 'error.network',
  ECONNABORTED: 'error.network',
  ETIMEDOUT: 'error.network',
};

export function resolvePublicErrorMessage(
  error: unknown,
  fallback: string,
  translate: (key: TranslationKey) => string
): string {
  const candidate =
    error && typeof error === 'object'
      ? (error as { code?: unknown; status?: unknown })
      : undefined;
  // Server failures must not reveal infrastructure, even with a recognized code.
  if (typeof candidate?.status === 'number' && candidate.status >= 500)
    return fallback;
  const code = candidate?.code;
  const key =
    typeof code === 'string' && Object.hasOwn(publicMessageKeys, code)
      ? publicMessageKeys[code]
      : undefined;
  return key ? translate(key) : fallback;
}
