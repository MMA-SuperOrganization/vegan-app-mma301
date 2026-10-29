/** Formats a DD/MM/YYYY field while preserving intentional backspace edits. */
export function formatDateInput(rawValue: string, previousValue = '') {
  const sanitized = rawValue.replace(/[^\d/]/g, '').replace(/\/{2,}/g, '/');
  if (rawValue.length < previousValue.length) return sanitized.slice(0, 10);

  if (sanitized.includes('/')) {
    const parts = sanitized.split('/').slice(0, 3);
    const day = parts[0].slice(0, 2);
    const month = parts[1]?.slice(0, 2);
    const year = parts[2]?.slice(0, 4);
    const dayValue = parts.length > 1 && day.length === 1 ? `0${day}` : day;
    const monthValue =
      parts.length > 2 && month?.length === 1 ? `0${month}` : (month ?? '');
    if (parts.length === 2 && monthValue.length === 2)
      return `${dayValue}/${monthValue}/`;
    return [
      dayValue,
      ...(parts.length > 1 ? [monthValue] : []),
      ...(parts.length > 2 ? [year ?? ''] : []),
    ]
      .join('/')
      .slice(0, 10);
  }

  const digits = sanitized.replace(/\D/g, '').slice(0, 8);
  if (digits.length < 2) return digits;
  if (digits.length < 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}
