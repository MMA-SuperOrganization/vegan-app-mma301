import { translate } from '../../../i18n/translator.ts';

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return translate('auth.validation.emailRequired');
  if (!EMAIL_PATTERN.test(email.trim())) return translate('auth.validation.emailInvalid');
  return null;
}

export function validateLogin(email: string, password: string) {
  return {
    email: validateEmail(email),
    password: password ? null : translate('auth.validation.passwordRequired'),
  };
}

export function validateRegistration(
  name: string,
  email: string,
  password: string,
  confirmation: string
) {
  return {
    name: name.trim() ? null : translate('auth.validation.nameRequired'),
    email: validateEmail(email),
    password: password.length >= 6 ? null : translate('auth.validation.passwordLength'),
    confirmation:
      confirmation && confirmation === password
        ? null
        : translate('auth.validation.passwordMismatch'),
  };
}
