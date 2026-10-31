export type GroceryStatus = 'active' | 'completed' | 'archived';

export type GroceryUnit =
  'g' | 'kg' | 'ml' | 'l' | 'piece' | 'tbsp' | 'tsp' | 'cup' | 'serving';

export interface GroceryItem {
  itemId: string;
  foodItemId?: string;
  personalIngredientId?: string;
  nameSnapshot: string;
  quantity: number;
  unit: GroceryUnit;
  categorySnapshot?: string;
  checked: boolean;
  note?: string;
}

export interface GroceryList {
  _id: string;
  name: string;
  status: GroceryStatus;
  items: GroceryItem[];
  sourceMealPlanId?: string;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroceryPantryTransfer {
  groceryList: GroceryList;
  pantry: Pantry;
  transferredCount: number;
  skippedItems: Array<{ itemId: string; nameSnapshot: string }>;
}

export interface GroceryItemInput {
  foodItemId?: string;
  personalIngredientId?: string;
  nameSnapshot?: string;
  quantity: number;
  unit: GroceryUnit;
  note?: string;
  checked?: boolean;
}

export type GroceryItemUpdate = Partial<GroceryItemInput>;

export interface IngredientSuggestion {
  id: string;
  source: 'catalog' | 'personal';
  name: string;
  defaultUnit: GroceryUnit;
  foodItemId?: string;
  personalIngredientId?: string;
}

export interface PersonalIngredient {
  _id: string;
  name: string;
  defaultUnit: GroceryUnit;
  status: 'active' | 'inactive';
}

export type IngredientSelection = Pick<
  IngredientSuggestion,
  'id' | 'source' | 'name' | 'defaultUnit' | 'foodItemId' | 'personalIngredientId'
>;
import type { Pantry } from '@/features/pantry/types';
