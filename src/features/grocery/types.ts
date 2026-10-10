export type GroceryStatus = 'active' | 'completed' | 'archived';

export type GroceryUnit =
  | 'g'
  | 'kg'
  | 'ml'
  | 'l'
  | 'piece'
  | 'tbsp'
  | 'tsp'
  | 'cup'
  | 'serving';

export interface GroceryItem {
  itemId: string;
  foodItemId?: string;
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

export interface GroceryItemInput {
  nameSnapshot: string;
  quantity: number;
  unit: GroceryUnit;
  note?: string;
  checked?: boolean;
}

export type GroceryItemUpdate = Partial<GroceryItemInput>;
