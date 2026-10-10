export { isValidIanaTimezone } from '../../utils/timeValidation.ts';

export function validateProfileText(displayName: string, bio: string) {
  return {
    name: displayName.trim().length > 0 && displayName.trim().length <= 100,
    bio: bio.trim().length <= 500,
  };
}
