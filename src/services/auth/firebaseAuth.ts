import axios from 'axios';
import { appConfig } from '@/config';

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
      'Ứng dụng chưa được cấu hình Firebase. Hãy thêm EXPO_PUBLIC_FIREBASE_API_KEY.',
      'FIREBASE_NOT_CONFIGURED'
    );
  }
  return appConfig.firebaseApiKey;
}

function mapFirebaseError(error: unknown): never {
  if (!axios.isAxiosError(error)) {
    throw new AuthServiceError(
      'Đã có lỗi không mong muốn. Vui lòng thử lại.',
      'UNKNOWN'
    );
  }

  const rawCode = String(error.response?.data?.error?.message ?? 'NETWORK_ERROR');
  const code = rawCode.split(' : ')[0];
  const messages: Record<string, string> = {
    EMAIL_EXISTS: 'Email này đã được sử dụng.',
    EMAIL_NOT_FOUND: 'Không tìm thấy tài khoản với email này.',
    INVALID_LOGIN_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
    INVALID_PASSWORD: 'Email hoặc mật khẩu không đúng.',
    USER_DISABLED: 'Tài khoản đã bị vô hiệu hóa.',
    TOO_MANY_ATTEMPTS_TRY_LATER: 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.',
    OPERATION_NOT_ALLOWED: 'Phương thức đăng nhập này chưa được bật.',
    WEAK_PASSWORD: 'Mật khẩu phải có ít nhất 6 ký tự.',
    INVALID_EMAIL: 'Email không hợp lệ.',
    TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn.',
    INVALID_REFRESH_TOKEN: 'Phiên đăng nhập không còn hợp lệ.',
    PROJECT_NUMBER_MISMATCH: 'Cấu hình Firebase không khớp với dự án.',
    NETWORK_ERROR: 'Không thể kết nối tới dịch vụ đăng nhập.',
  };

  throw new AuthServiceError(
    messages[code] ?? 'Không thể xác thực tài khoản. Vui lòng thử lại.',
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
        { timeout: 15_000, headers: { 'X-Firebase-Locale': 'vi' } }
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
