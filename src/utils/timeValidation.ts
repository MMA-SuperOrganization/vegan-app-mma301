const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValid24HourTime(value: string) {
  return TIME_PATTERN.test(value);
}

export function isValidIanaTimezone(value: string) {
  const timezone = value.trim();
  if (!timezone) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}
