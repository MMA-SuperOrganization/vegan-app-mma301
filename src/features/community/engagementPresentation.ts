export type EngagementLocale = 'vi' | 'en';

const normalizeCount = (count: number) =>
  Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;

export function formatEngagementCount(count: number, locale: EngagementLocale) {
  const normalized = normalizeCount(count);
  const localeTag = locale === 'vi' ? 'vi-VN' : 'en-US';
  if (normalized < 1_000) return new Intl.NumberFormat(localeTag).format(normalized);

  const [divider, suffix] =
    normalized >= 1_000_000_000
      ? [1_000_000_000, 'B']
      : normalized >= 1_000_000
        ? [1_000_000, 'M']
        : [1_000, 'K'];
  const scaled = normalized / divider;
  const displayValue =
    scaled >= 100 ? Math.floor(scaled) : Math.floor(scaled * 10) / 10;

  return `${new Intl.NumberFormat(localeTag, {
    maximumFractionDigits: 1,
  }).format(displayValue)}${suffix}`;
}

export function formatFullEngagementCount(count: number, locale: EngagementLocale) {
  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(
    normalizeCount(count)
  );
}
