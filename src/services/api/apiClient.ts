import axios from 'axios';
import { authSession } from '@/services/auth';
import { apiConfig } from './apiConfig';

export const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach auth token if available
apiClient.interceptors.request.use(async (config) => {
  const token = await authSession.getValidToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Codes the API returns once an admin suspends, disables or deletes the account.
export const BLOCKED_ACCOUNT_CODES = new Set([
  'ACCOUNT_SUSPENDED',
  'ACCOUNT_DISABLED',
  'ACCOUNT_DELETED',
  'ACCOUNT_INACTIVE',
  'USER_DISABLED',
]);

type BlockedAccountListener = (code: string) => void;
const blockedAccountListeners = new Set<BlockedAccountListener>();

/** Lets the auth layer sign out when any request reports a blocked account. */
export function onAccountBlocked(listener: BlockedAccountListener) {
  blockedAccountListeners.add(listener);
  return () => {
    blockedAccountListeners.delete(listener);
  };
}

apiClient.interceptors.response.use(undefined, (error) => {
  const code = axios.isAxiosError(error)
    ? (error.response?.data as { error?: { code?: unknown } } | undefined)?.error
        ?.code
    : undefined;
  if (
    axios.isAxiosError(error) &&
    error.response?.status === 403 &&
    typeof code === 'string' &&
    BLOCKED_ACCOUNT_CODES.has(code)
  )
    blockedAccountListeners.forEach((listener) => listener(code));
  return Promise.reject(error);
});
