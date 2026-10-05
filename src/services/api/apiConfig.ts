export const apiConfig = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || '',
  timeout: 10_000,
} as const;
