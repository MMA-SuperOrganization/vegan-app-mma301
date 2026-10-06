import { appConfig } from '@/config';

export const apiConfig = {
  baseURL: appConfig.apiBaseUrl,
  timeout: 10_000,
} as const;
