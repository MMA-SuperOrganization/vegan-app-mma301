import type { AppErrorDetails } from '@/services/errors';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'deleted';
  onboardingCompleted: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRestoringSession: boolean;
  error: AppErrorDetails | null;

  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (googleIdToken: string, requestUri: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  markOnboardingCompleted: () => void;
  reportError: (
    error: unknown,
    operation: string,
    fallbackMessage: string,
    fallbackCode?: string
  ) => void;
  clearError: () => void;
}
