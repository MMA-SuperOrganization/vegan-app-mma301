export type SelectionKey = string | number;
export type SelectionMode = 'single' | 'multi';
export function normalizeSelection<K extends SelectionKey>(
  keys: readonly K[],
  mode: SelectionMode
): K[] {
  const unique = [...new Set(keys)];
  return mode === 'single' ? unique.slice(0, 1) : unique;
}
export function toggleSelection<K extends SelectionKey>(
  keys: readonly K[],
  key: K,
  mode: SelectionMode
): K[] {
  return keys.includes(key)
    ? keys.filter((k) => k !== key)
    : mode === 'single'
      ? [key]
      : [...keys, key];
}
