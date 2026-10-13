import { apiClient, unwrapApiPageRequest, unwrapApiRequest } from '@/services/api';
import type {
  GroceryItemInput,
  GroceryItemUpdate,
  GroceryList,
  GroceryStatus,
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
};
