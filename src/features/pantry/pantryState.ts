import type { PantryFilter, PantryItem, PantryUnit } from './types';

export const PANTRY_UNITS: PantryUnit[] = [
  'g',
  'kg',
  'ml',
  'l',
  'piece',
  'tbsp',
  'tsp',
  'cup',
  'serving',
];
export const EXPIRING_DAYS = 7;

export function parsePantryQuantity(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
  const quantity = Number(normalized);
  return Number.isFinite(quantity) && quantity > 0 && quantity <= 1_000_000
    ? quantity
    : null;
}

/** Expiry dates entered as calendar days remain usable until local end of day. */
export function parsePantryExpiry(value: string): string | null | undefined {
  if (!value.trim()) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1900 || year > 9999) return undefined;
  const date = new Date(year, month - 1, day, 23, 59, 59, 999);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  return date.toISOString();
}

export function pantryExpiryDay(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function pantryExpiryStatus(
  item: Pick<PantryItem, 'expiresAt'>,
  now: number
) {
  const expiry = item.expiresAt ? Date.parse(item.expiresAt) : NaN;
  if (!Number.isFinite(expiry)) return 'none';
  if (expiry < now) return 'expired';
  return expiry <= now + EXPIRING_DAYS * 86_400_000 ? 'expiring' : 'fresh';
}

export function selectPantryItems(
  items: PantryItem[],
  filter: PantryFilter,
  search: string,
  now: number
) {
  const term = search.trim().toLocaleLowerCase();
  return items
    .filter(
      (item) =>
        (filter === 'all' || pantryExpiryStatus(item, now) === filter) &&
        (!term || item.foodNameSnapshot.toLocaleLowerCase().includes(term))
    )
    .sort((a, b) => {
      const expiryA = a.expiresAt ? Date.parse(a.expiresAt) : Infinity;
      const expiryB = b.expiresAt ? Date.parse(b.expiresAt) : Infinity;
      return (
        expiryA - expiryB || a.foodNameSnapshot.localeCompare(b.foodNameSnapshot)
      );
    });
}
