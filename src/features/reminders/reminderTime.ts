function wallParts(value: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(value);
  const part = (type: string) =>
    parts.find((entry) => entry.type === type)?.value || '';
  return {
    date: part('year') + '-' + part('month') + '-' + part('day'),
    time: part('hour') + ':' + part('minute'),
  };
}
export function reminderWallTime(iso: string, timezone: string) {
  return wallParts(new Date(iso), timezone);
}
/** Resolve a wall time in an IANA zone and reject nonexistent DST/calendar times. */
export function onceReminderAt(
  date: string,
  time: string,
  timezone: string
): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time))
    return null;
  const wanted = Date.parse(date + 'T' + time + ':00Z');
  if (
    !Number.isFinite(wanted) ||
    new Date(wanted).toISOString().slice(0, 10) !== date
  )
    return null;
  try {
    let timestamp = wanted;
    for (let step = 0; step < 4; step++) {
      const wall = wallParts(new Date(timestamp), timezone);
      if (wall.date === date && wall.time === time)
        return new Date(timestamp).toISOString();
      timestamp += wanted - Date.parse(wall.date + 'T' + wall.time + ':00Z');
    }
  } catch {
    return null;
  }
  return null;
}
