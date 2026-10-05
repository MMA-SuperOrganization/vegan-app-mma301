import axios from 'axios';

export interface ApiError {
  message: string;
  status?: number;
}

export function normalizeApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    return { message: error.message, status: error.response?.status };
  }

  return { message: 'An unexpected error occurred.' };
}
