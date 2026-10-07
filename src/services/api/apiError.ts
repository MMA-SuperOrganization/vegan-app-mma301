import axios from 'axios';
import { translate, type TranslationKey } from '@/i18n';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export function normalizeApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as
      { error?: { message?: string; code?: string } } | undefined;
    const code = payload?.error?.code;
    const status = error.response?.status;
    const backendMessageKeys: Record<string, TranslationKey> = {
      ACCOUNT_DISABLED: 'error.accountDisabled',
      ACCOUNT_SUSPENDED: 'error.accountSuspended',
      ACCOUNT_DELETED: 'error.accountDeleted',
      TOKEN_EXPIRED: 'error.tokenExpired',
      TOKEN_INVALID: 'error.tokenInvalid',
      ONBOARDING_INCOMPLETE: 'error.onboardingIncomplete',
      TRANSACTIONS_REQUIRED: 'error.transactionsRequired',
    };
    return {
      message:
        (code && backendMessageKeys[code] && translate(backendMessageKeys[code])) ||
        payload?.error?.message ||
        (status
          ? translate('error.requestFailed', { status })
          : translate('error.network')),
      status,
      code,
    };
  }

  return {
    message: error instanceof Error ? error.message : translate('error.unexpected'),
  };
}
