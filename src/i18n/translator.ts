import { translations, type Locale, type TranslationKey } from './translations.ts';

export type TranslationParams = Record<string, string | number>;

let activeLocale: Locale = 'vi';

export function setActiveLocale(locale: Locale) {
  activeLocale = locale;
}

export function getActiveLocale() {
  return activeLocale;
}

export function translateFor(
  locale: Locale,
  key: TranslationKey,
  params: TranslationParams = {}
) {
  const template = translations[locale][key] ?? translations.vi[key];
  return template.replace(/\{\{(\w+)\}\}/g, (_match, name: string) =>
    String(params[name] ?? `{{${name}}}`)
  );
}

export function translate(key: TranslationKey, params?: TranslationParams) {
  return translateFor(activeLocale, key, params);
}
