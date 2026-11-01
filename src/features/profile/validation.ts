export { isValidIanaTimezone } from '../../utils/timeValidation.ts';

/** Blank targets preserve the saved value; malformed non-empty input must fail. */
export function parseNutritionTarget(input: string, min: number, max: number) {
  const normalized = input.trim().replace(',', '.');
  if (!normalized) return { valid: true, value: undefined };
  const value = /^\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : NaN;
  return {
    valid: Number.isFinite(value) && value >= min && value <= max && value > 0,
    value,
  };
}

export function validateProfileText(displayName: string, bio: string) {
  return {
    name: displayName.trim().length > 0 && displayName.trim().length <= 100,
    bio: bio.trim().length <= 500,
  };
}

export function validateOptionalUsername(username: string) {
  const normalized = username.trim();
  return normalized.length === 0 || /^[a-zA-Z0-9_]{3,30}$/.test(normalized);
}

export function validateOptionalMeasurement(
  value: string,
  min: number,
  max: number
) {
  if (!value.trim()) return true;
  const parsed = Number(value.trim().replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= min && parsed <= max;
}
