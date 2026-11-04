import type { CommentLocale } from './commentPresentation';

/** Short, human-quotable reference code derived from the report id, e.g. "A1B2C3". */
export function formatReportCode(id?: string | null): string {
  if (!id) return '';
  return id.slice(-6).toUpperCase();
}

/** Formal absolute timestamp, e.g. "02/11/2026 14:49". Returns null for missing/invalid dates. */
export function formatReportDateTime(
  isoDate?: string | null,
  _locale: CommentLocale = 'vi'
): string | null {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}
