import axios from 'axios';
import { translate } from '@/i18n';
import { getUserErrorMessage } from '@/services/errors';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

export function normalizeApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as
      { error?: { code?: unknown; details?: unknown } } | undefined;
    const code =
      typeof payload?.error?.code === 'string' ? payload.error.code : undefined;
    const status = error.response?.status;
    return {
      message: getUserErrorMessage(
        { code, status },
        translate(status ? 'error.requestFailed' : 'error.network')
      ),
      status,
      code,
      details: payload?.error?.details,
    };
  }
  return { message: getUserErrorMessage(error) };
}
