import { isValidIanaTimezone } from './timeValidation.ts';

const COMMON_TIMEZONES = [
  'UTC',
  'Pacific/Honolulu',
  'America/Anchorage',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Toronto',
  'America/Sao_Paulo',
  'America/Argentina/Buenos_Aires',
  'Atlantic/Reykjavik',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Helsinki',
  'Europe/Istanbul',
  'Europe/Moscow',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Ho_Chi_Minh',
  'Asia/Singapore',
  'Asia/Kuala_Lumpur',
  'Asia/Hong_Kong',
  'Asia/Shanghai',
  'Asia/Taipei',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Perth',
  'Australia/Adelaide',
  'Australia/Sydney',
  'Pacific/Auckland',
] as const;

type IntlWithTimezoneList = typeof Intl & {
  supportedValuesOf?: (key: 'timeZone') => string[];
};

export interface TimezoneOption {
  value: string;
  label: string;
}

function offsetMinutes(timezone: string, at: Date) {
  const reference = new Date(at);
  reference.setSeconds(0, 0);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(reference);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const zonedAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute)
  );
  return Math.round((zonedAsUtc - reference.getTime()) / 60_000);
}

export function formatUtcOffset(timezone: string, at = new Date()) {
  const totalMinutes = offsetMinutes(timezone, at);
  const sign = totalMinutes >= 0 ? '+' : '-';
  const absolute = Math.abs(totalMinutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, '0');
  const minutes = String(absolute % 60).padStart(2, '0');
  return `UTC${sign}${hours}:${minutes}`;
}

export function formatTimezoneLabel(timezone: string, at = new Date()) {
  if (!isValidIanaTimezone(timezone)) return timezone;
  return `${timezone} · ${formatUtcOffset(timezone, at)}`;
}

export function getTimezoneOptions(current?: string, at = new Date()) {
  const supported = (Intl as IntlWithTimezoneList).supportedValuesOf?.('timeZone');
  const device = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const zones = new Set<string>([
    'UTC',
    ...(supported?.length ? supported : COMMON_TIMEZONES),
    ...(device ? [device] : []),
    ...(current ? [current] : []),
  ]);
  return [...zones]
    .filter(isValidIanaTimezone)
    .sort((left, right) => left.localeCompare(right))
    .map<TimezoneOption>((value) => ({
      value,
      label: formatTimezoneLabel(value, at),
    }));
}
