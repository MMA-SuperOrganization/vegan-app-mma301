import type { AxiosResponse } from 'axios';
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
    throw new Error(normalizeApiError(error).message);
  }
}
