import {
  isValid24HourTime,
  isValidIanaTimezone,
} from '../../utils/timeValidation.ts';
import type { NotificationPreferences } from './types';

export function validateNotificationPreferences(
  preferences: NotificationPreferences
) {
  return {
    quietHours:
      !preferences.quietHours.enabled ||
      (isValid24HourTime(preferences.quietHours.start) &&
        isValid24HourTime(preferences.quietHours.end)),
    timezone: isValidIanaTimezone(preferences.timezone),
  };
}
