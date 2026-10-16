import { translate } from '@/i18n';
import { resolvePublicErrorMessage } from './publicError';

export function getUserErrorMessage(
  error: unknown,
  fallback = translate('error.unexpected')
): string {
  return resolvePublicErrorMessage(error, fallback, translate);
}
