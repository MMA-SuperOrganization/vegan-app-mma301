import { apiClient, unwrapApiPageRequest, unwrapApiRequest } from '@/services/api';
import type {
  GroceryItemInput,
  GroceryItemUpdate,
  GroceryList,
  GroceryPantryTransfer,
  GroceryStatus,
  GroceryUnit,
  IngredientSuggestion,
  PersonalIngredient,
} from './types';

export const groceryApi = {
  lists: (status: GroceryStatus = 'active') =>
    unwrapApiPageRequest<GroceryList>(() =>
      apiClient.get('/grocery-lists', { params: { page: 1, limit: 50, status } })
    ),
  list: (id: string) =>
    unwrapApiRequest<GroceryList>(() => apiClient.get(`/grocery-lists/${id}`)),
  create: (name: string) =>
    unwrapApiRequest<GroceryList>(() =>
      apiClient.post('/grocery-lists', { name, items: [] })
    ),
  generateFromMealPlan: (
    planId: string,
    name?: string,
    range?: { from: string; to: string },
    subtractPantry = false
  ) =>
    unwrapApiRequest<GroceryList>(() =>
      apiClient.post(`/meal-plans/${planId}/grocery-list`, {
        ...(name?.trim() ? { name: name.trim() } : {}),
        subtractPantry,
        ...range,
      })
    ),
  update: (id: string, input: { name?: string; status?: GroceryStatus }) =>
    unwrapApiRequest<GroceryList>(() =>
      apiClient.patch(`/grocery-lists/${id}`, input)
    ),
  archive: (id: string) =>
    unwrapApiRequest<GroceryList>(() => apiClient.delete(`/grocery-lists/${id}`)),
  addItem: (id: string, input: GroceryItemInput) =>
    unwrapApiRequest<GroceryList>(() =>
      apiClient.post(`/grocery-lists/${id}/items`, input)
    ),
  updateItem: (id: string, itemId: string, input: GroceryItemUpdate) =>
    unwrapApiRequest<GroceryList>(() =>
      apiClient.patch(`/grocery-lists/${id}/items/${itemId}`, input)
    ),
  deleteItem: (id: string, itemId: string) =>
    unwrapApiRequest<GroceryList>(() =>
      apiClient.delete(`/grocery-lists/${id}/items/${itemId}`)
    ),
  clearChecked: (id: string) =>
    unwrapApiRequest<GroceryList>(() =>
      apiClient.post(`/grocery-lists/${id}/clear-checked`, {})
    ),
  transferCheckedToPantry: (id: string) =>
    unwrapApiRequest<GroceryPantryTransfer>(() =>
      apiClient.post(`/grocery-lists/${id}/transfer-checked-to-pantry`, {})
    ),
  ingredientSuggestions: (query: string) =>
    unwrapApiRequest<IngredientSuggestion[]>(() =>
      apiClient.get('/ingredients/suggestions', {
        params: { q: query, limit: 30 },
      })
    ),
  createPersonalIngredient: (input: { name: string; defaultUnit: GroceryUnit }) =>
    unwrapApiRequest<PersonalIngredient>(() =>
      apiClient.post('/personal-ingredients', input)
    ),
};
