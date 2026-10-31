import type { FoodUnit } from '@/features/tracking/types';

export type PantryUnit = FoodUnit;
export interface IngredientReviewValue {
  foodItemId?: string;
  name: string;
  quantity: number;
  unit: FoodUnit;
  expiryDate?: string;
  reviewKey?: string;
}

export interface PantryItem {
  itemId: string;
  foodItemId?: string;
  personalIngredientId?: string;
  foodNameSnapshot: string;
  quantity: number;
  unit: PantryUnit;
  expiresAt?: string | null;
  note?: string;
  addedAt: string;
  updatedAt: string;
}

export interface Pantry {
  _id: string;
  userId: string;
  items: PantryItem[];
  version: number;
}

export interface PantryItemInput {
  foodItemId?: string;
  personalIngredientId?: string;
  quantity: number;
  unit: PantryUnit;
  expiresAt?: string | null;
  note?: string;
}

export type PantryItemUpdate = Partial<Omit<PantryItemInput, 'foodItemId'>>;
export type PantryFilter = 'all' | 'expiring' | 'expired';
