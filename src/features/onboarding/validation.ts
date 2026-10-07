import { translate } from '../../i18n/translator.ts';

export function parseDecimal(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function validateMeasurement(
  value: string,
  label: string,
  min: number,
  max: number
) {
  const parsed = parseDecimal(value);
  if (parsed === null)
    return translate('onboarding.validation.required', { label: label.toLowerCase() });
  if (parsed < min || parsed > max)
    return translate('onboarding.validation.range', { label, min, max });
  return null;
}

export function dateInputToIso(value: string): string | null {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const iso = `${year}-${month}-${day}`;
  const date = new Date(`${iso}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== iso)
    return null;
  if (date > new Date()) return null;
  return iso;
}

export function toggleAllergenSelection(selectedIds: string[], id: string) {
  return selectedIds.includes(id)
    ? selectedIds.filter((selectedId) => selectedId !== id)
    : [...selectedIds, id];
}
