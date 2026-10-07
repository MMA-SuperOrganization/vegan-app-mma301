import axios from 'axios';
import { appConfig } from '@/config';
import { getActiveLocale, translate, type TranslationKey } from '@/i18n';

const identityBaseUrl = 'https://identitytoolkit.googleapis.com/v1';
const tokenBaseUrl = 'https://securetoken.googleapis.com/v1';

export interface FirebaseSession {
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  localId: string;
  email?: string;
  displayName?: string;
}

interface FirebaseAuthResponse {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  email?: string;
  displayName?: string;
}

interface FirebaseRefreshResponse {
  id_token: string;
  refresh_token: string;
  expires_in: string;
  user_id: string;
}

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

function requireApiKey() {
  if (!appConfig.firebaseApiKey) {
    throw new AuthServiceError(
      translate('firebase.notConfigured'),
      'FIREBASE_NOT_CONFIGURED'
    );
  }
  return appConfig.firebaseApiKey;
}

function mapFirebaseError(error: unknown): never {
  if (error instanceof AuthServiceError) throw error;

  if (!axios.isAxiosError(error)) {
    throw new AuthServiceError(
      error instanceof Error
        ? translate('firebase.deviceError', { message: error.message })
        : translate('firebase.unexpected'),
      'AUTH_CLIENT_ERROR'
    );
  }

  const rawCode = String(error.response?.data?.error?.message ?? 'NETWORK_ERROR');
  const code = rawCode.split(' : ')[0];
  const messageKeys: Record<string, TranslationKey> = {
    EMAIL_EXISTS: 'firebase.emailExists',
    EMAIL_NOT_FOUND: 'firebase.emailNotFound',
    INVALID_LOGIN_CREDENTIALS: 'firebase.invalidCredentials',
    INVALID_PASSWORD: 'firebase.invalidCredentials',
    USER_DISABLED: 'error.accountDisabled',
    TOO_MANY_ATTEMPTS_TRY_LATER: 'firebase.tooManyAttempts',
    OPERATION_NOT_ALLOWED: 'firebase.operationNotAllowed',
    WEAK_PASSWORD: 'firebase.weakPassword',
    INVALID_EMAIL: 'auth.validation.emailInvalid',
    TOKEN_EXPIRED: 'error.tokenExpired',
    INVALID_REFRESH_TOKEN: 'error.tokenInvalid',
    PROJECT_NUMBER_MISMATCH: 'firebase.projectMismatch',
    INVALID_IDP_RESPONSE: 'firebase.invalidIdp',
    FEDERATED_USER_ID_ALREADY_LINKED: 'firebase.federatedUserConflict',
    NETWORK_ERROR: 'firebase.network',
  };

  throw new AuthServiceError(
    messageKeys[code] ? translate(messageKeys[code]) : translate('firebase.authFailed'),
    code
  );
}

function toSession(response: FirebaseAuthResponse): FirebaseSession {
  return {
    idToken: response.idToken,
    refreshToken: response.refreshToken,
    expiresIn: Number(response.expiresIn),
    localId: response.localId,
    email: response.email,
    displayName: response.displayName,
  };
}

async function passwordRequest(
  endpoint: 'signInWithPassword' | 'signUp',
  email: string,
  password: string
) {
  try {
    const response = await axios.post<FirebaseAuthResponse>(
      `${identityBaseUrl}/accounts:${endpoint}?key=${requireApiKey()}`,
      { email, password, returnSecureToken: true },
      { timeout: 15_000 }
    );
    return toSession(response.data);
  } catch (error) {
    return mapFirebaseError(error);
  }
}

export const firebaseAuth = {
  signIn(email: string, password: string) {
    return passwordRequest('signInWithPassword', email, password);
  },

  signUp(email: string, password: string) {
    return passwordRequest('signUp', email, password);
  },

  async signInWithGoogle(googleIdToken: string, requestUri: string) {
    try {
      const postBody = new URLSearchParams({
        id_token: googleIdToken,
        providerId: 'google.com',
      }).toString();
      const response = await axios.post<FirebaseAuthResponse>(
        `${identityBaseUrl}/accounts:signInWithIdp?key=${requireApiKey()}`,
        {
          postBody,
          requestUri,
          returnIdpCredential: true,
          returnSecureToken: true,
        },
        { timeout: 15_000 }
      );
      return toSession(response.data);
    } catch (error) {
      return mapFirebaseError(error);
    }
  },

  async updateDisplayName(session: FirebaseSession, displayName: string) {
    try {
      const response = await axios.post<FirebaseAuthResponse>(
        `${identityBaseUrl}/accounts:update?key=${requireApiKey()}`,
        { idToken: session.idToken, displayName, returnSecureToken: true },
        { timeout: 15_000 }
      );
      return toSession(response.data);
    } catch (error) {
      return mapFirebaseError(error);
    }
  },

  async sendPasswordReset(email: string) {
    try {
      await axios.post(
        `${identityBaseUrl}/accounts:sendOobCode?key=${requireApiKey()}`,
        { requestType: 'PASSWORD_RESET', email },
        { timeout: 15_000, headers: { 'X-Firebase-Locale': getActiveLocale() } }
      );
    } catch (error) {
      return mapFirebaseError(error);
    }
  },

  async refresh(refreshToken: string): Promise<FirebaseSession> {
    try {
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString();
      const response = await axios.post<FirebaseRefreshResponse>(
        `${tokenBaseUrl}/token?key=${requireApiKey()}`,
        body,
        {
          timeout: 15_000,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );
      return {
        idToken: response.data.id_token,
        refreshToken: response.data.refresh_token,
        expiresIn: Number(response.data.expires_in),
        localId: response.data.user_id,
      };
    } catch (error) {
      return mapFirebaseError(error);
    }
  },
};
