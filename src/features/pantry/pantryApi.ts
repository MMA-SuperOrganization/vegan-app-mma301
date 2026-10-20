import { apiClient, unwrapApiRequest } from '@/services/api';
import type { Pantry, PantryItemInput, PantryItemUpdate } from './types';

export const pantryApi = {
  get: () => unwrapApiRequest<Pantry>(() => apiClient.get('/pantry')),
  addItem: (input: PantryItemInput) =>
    unwrapApiRequest<Pantry>(() => apiClient.post('/pantry/items', input)),
  updateItem: (itemId: string, input: PantryItemUpdate) =>
    unwrapApiRequest<Pantry>(() =>
      apiClient.patch(`/pantry/items/${itemId}`, input)
    ),
  deleteItem: (itemId: string) =>
    unwrapApiRequest<Pantry>(() => apiClient.delete(`/pantry/items/${itemId}`)),
};
