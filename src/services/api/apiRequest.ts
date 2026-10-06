import type { AxiosResponse } from 'axios';
import { AppError } from '@/services/errors';
import { normalizeApiError } from './apiError';

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export async function unwrapApiRequest<T>(
  request: () => Promise<AxiosResponse<ApiEnvelope<T>>>
): Promise<T> {
  try {
    return (await request()).data.data;
  } catch (error) {
    const normalized = normalizeApiError(error);
    throw new AppError(
      normalized.message,
      normalized.code ?? 'API_REQUEST_FAILED',
      normalized.status
    );
  }
}
