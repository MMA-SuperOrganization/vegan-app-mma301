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
