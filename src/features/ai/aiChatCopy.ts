import { translateFor } from '../../i18n/translator.ts';
import type { Locale } from '../../i18n/translations.ts';
import {
  AI_CHAT_LIMITS,
  AI_STARTER_PROMPT_DEFINITIONS,
  AI_TRANSLATION_KEYS,
  AiDateLocale,
  type AiStarterPromptId,
} from './aiConstants.ts';

export interface AiStarterPrompt {
  id: AiStarterPromptId;
  tag: string;
  prompt: string;
}

export function getAiStarterPrompts(locale: Locale): AiStarterPrompt[] {
  return AI_STARTER_PROMPT_DEFINITIONS.map((item) => ({
    id: item.id,
    tag: translateFor(locale, item.tagKey),
    prompt: translateFor(locale, item.promptKey),
  }));
}

export const AI_STARTER_PROMPTS: Record<Locale, AiStarterPrompt[]> = {
  vi: getAiStarterPrompts('vi'),
  en: getAiStarterPrompts('en'),
};

export function formatAiMessageTime(
  isoDate: string | undefined,
  localeOrVi: Locale | boolean
): string | null {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  const isVi = typeof localeOrVi === 'boolean' ? localeOrVi : localeOrVi === 'vi';
  return new Intl.DateTimeFormat(isVi ? AiDateLocale.VI : AiDateLocale.EN, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function deriveConversationTitle(
  question: string,
  localeOrVi: Locale | boolean
): string {
  const locale: Locale =
    typeof localeOrVi === 'boolean' ? (localeOrVi ? 'vi' : 'en') : localeOrVi;
  const cleaned = question.replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return translateFor(locale, AI_TRANSLATION_KEYS.COMMON.NEW_CONVERSATION);
  }
  return cleaned.length > AI_CHAT_LIMITS.TITLE_MAX_LENGTH
    ? `${cleaned.slice(0, AI_CHAT_LIMITS.TITLE_TRUNCATE_AT).trimEnd()}…`
    : cleaned;
}
