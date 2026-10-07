import { useCallback } from 'react';
import { create } from 'zustand';
import { storage, storageKeys } from '@/services/storage';
import { setActiveLocale, translateFor, type TranslationParams } from './translator';
import type { Locale, TranslationKey } from './translations';

interface I18nState {
  locale: Locale;
  isHydrated: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  setLocale: (locale: Locale) => Promise<void>;
}

function isLocale(value: string | null): value is Locale {
  return value === 'vi' || value === 'en';
}

export const useI18nStore = create<I18nState>((set, get) => ({
  locale: 'vi',
  isHydrated: false,
  error: null,
  hydrate: async () => {
    if (get().isHydrated) return;
    const savedLocale = await storage.getItem(storageKeys.locale).catch(() => null);
    const locale = isLocale(savedLocale) ? savedLocale : 'vi';
    setActiveLocale(locale);
    set({ locale, isHydrated: true });
  },
  setLocale: async (locale) => {
    try {
      await storage.setItem(storageKeys.locale, locale);
      setActiveLocale(locale);
      set({ locale, error: null });
    } catch {
      set({ error: translateFor(get().locale, 'language.saveError') });
    }
  },
}));

export function useTranslation() {
  const locale = useI18nStore((state) => state.locale);
  const setLocale = useI18nStore((state) => state.setLocale);
  const error = useI18nStore((state) => state.error);
  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) =>
      translateFor(locale, key, params),
    [locale]
  );
  return { locale, setLocale, error, t };
}
