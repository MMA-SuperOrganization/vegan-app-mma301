import type { GroceryItem, GroceryList } from './types';

export interface GroceryGroup {
  category: string;
  items: GroceryItem[];
}

export function groupGroceryItems(items: GroceryItem[], fallback: string) {
  const groups = new Map<string, GroceryItem[]>();
  for (const item of items) {
    const category = item.categorySnapshot?.trim() || fallback;
    groups.set(category, [...(groups.get(category) ?? []), item]);
  }
  return [...groups.entries()].map(([category, categoryItems]) => ({
    category,
    items: [...categoryItems].sort(compareChecked),
  }));
}

function compareChecked(a: GroceryItem, b: GroceryItem) {
  return Number(a.checked) - Number(b.checked);
}

export function groceryProgress(list: Pick<GroceryList, 'items'>) {
  return {
    checked: list.items.filter((item) => item.checked).length,
    total: list.items.length,
  };
}

export function parseGroceryQuantity(value: string) {
  const normalized = value.trim().replace(',', '.');
  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
  const quantity = Number(normalized);
  return Number.isFinite(quantity) && quantity > 0 && quantity <= 1_000_000
    ? quantity
    : null;
}

export function updateItemChecked(
  list: GroceryList | undefined,
  itemId: string,
  checked: boolean
) {
  if (!list) return list;
  return {
    ...list,
    items: list.items.map((item) =>
      item.itemId === itemId ? { ...item, checked } : item
    ),
  };
}
