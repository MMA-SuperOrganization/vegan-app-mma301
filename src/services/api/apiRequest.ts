import type { AxiosResponse } from 'axios';
import { AppError } from '@/services/errors';
import { normalizeApiError } from './apiError';

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiPage<T> {
  data: T[];
  meta?: PaginationMeta;
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

/** Keeps pagination metadata while accepting the legacy array-only envelope. */
export async function unwrapApiPageRequest<T>(
  request: () => Promise<AxiosResponse<ApiEnvelope<T[]> | ApiEnvelope<ApiPage<T>>>>
): Promise<ApiPage<T>> {
  try {
    const envelope = (await request()).data;
    if (Array.isArray(envelope.data)) {
      return { data: envelope.data, meta: envelope.meta };
    }
    return {
      data: Array.isArray(envelope.data?.data) ? envelope.data.data : [],
      meta: envelope.data?.meta ?? envelope.meta,
    };
  } catch (error) {
    const normalized = normalizeApiError(error);
    throw new AppError(
      normalized.message,
      normalized.code ?? 'API_REQUEST_FAILED',
      normalized.status
    );
  }
}
