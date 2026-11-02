export type CommentLocale = 'vi' | 'en';

/**
 * Formats a comment creation timestamp into a compact social-media relative time.
 * e.g., 'Vừa xong', '15 phút', '2 giờ', '3 ngày' (or 'Just now', '15m', '2h', '3d').
 */
export function formatCommentRelativeTime(
  isoDate?: string | null,
  locale: CommentLocale = 'vi',
  now: number = Date.now()
): string | null {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  const time = date.getTime();
  if (Number.isNaN(time)) return null;

  const diffMs = Math.max(0, now - time);
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);

  const vi = locale === 'vi';

  if (minutes < 1) {
    return vi ? 'Vừa xong' : 'Just now';
  }
  if (minutes < 60) {
    return vi ? `${minutes} phút` : `${minutes}m`;
  }
  if (hours < 24) {
    return vi ? `${hours} giờ` : `${hours}h`;
  }
  if (days < 7) {
    return vi ? `${days} ngày` : `${days}d`;
  }
  return date.toLocaleDateString(vi ? 'vi-VN' : 'en-US', {
    day: 'numeric',
    month: 'short',
  });
}

