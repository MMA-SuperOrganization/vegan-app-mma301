export function validReminderSchedule(
  mode: string,
  at: string,
  days: number[],
  now = Date.now()
) {
  if (mode === 'once') {
    const parts =
      /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.exec(
        at
      );
    if (!parts) return false;
    const date = new Date(
      Date.UTC(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
    );
    if (date.toISOString().slice(0, 10) !== at.slice(0, 10)) return false;
    return Number.isFinite(Date.parse(at)) && Date.parse(at) > now;
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(at)) return false;
  return (
    mode === 'daily' ||
    (mode === 'weekly' &&
      days.length > 0 &&
      new Set(days).size === days.length &&
      days.every((day) => Number.isInteger(day) && day >= 0 && day <= 6))
  );
}
