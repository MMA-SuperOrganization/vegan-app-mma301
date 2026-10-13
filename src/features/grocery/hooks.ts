import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import { groceryApi } from './groceryApi';
import { updateItemChecked } from './groceryState';
import type {
  GroceryItemInput,
  GroceryItemUpdate,
  GroceryList,
  GroceryStatus,
} from './types';

const groceryKeys = {
  root: (userId?: string) => ['account', userId, 'grocery'] as const,
  lists: (userId: string | undefined, status: GroceryStatus) =>
    [...groceryKeys.root(userId), 'lists', status] as const,
  list: (userId: string | undefined, id: string) =>
    [...groceryKeys.root(userId), 'list', id] as const,
};

export function useGroceryLists(status: GroceryStatus = 'active') {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: groceryKeys.lists(userId, status),
    queryFn: () => groceryApi.lists(status),
    enabled: Boolean(userId),
  });
}

export function useGroceryList(id?: string) {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: groceryKeys.list(userId, id ?? ''),
    queryFn: () => groceryApi.list(id!),
    enabled: Boolean(userId && id),
  });
}

export function useGroceryActions(listId?: string) {
  const client = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const detailKey = groceryKeys.list(userId, listId ?? '');
  const refreshLists = () =>
    client.invalidateQueries({ queryKey: groceryKeys.root(userId) });
  const storeList = (list: GroceryList) => {
    client.setQueryData(groceryKeys.list(userId, list._id), list);
    return refreshLists();
  };

  const create = useMutation({
    mutationFn: (name: string) => groceryApi.create(name),
    onSuccess: storeList,
  });
  const update = useMutation({
    mutationFn: (variables: {
      id: string;
      input: { name?: string; status?: GroceryStatus };
    }) => groceryApi.update(variables.id, variables.input),
    onSuccess: storeList,
  });
  const archive = useMutation({
    mutationFn: (id: string) => groceryApi.archive(id),
    onSuccess: storeList,
  });
  const addItem = useMutation({
    mutationFn: (input: GroceryItemInput) => groceryApi.addItem(listId!, input),
    onSuccess: storeList,
  });
  const updateItem = useMutation({
    mutationFn: (variables: { itemId: string; input: GroceryItemUpdate }) =>
      groceryApi.updateItem(listId!, variables.itemId, variables.input),
    onMutate: async ({ itemId, input }) => {
      if (typeof input.checked !== 'boolean') return undefined;
      await client.cancelQueries({ queryKey: detailKey });
      const before = client.getQueryData<GroceryList>(detailKey);
      client.setQueryData<GroceryList>(detailKey, (current) =>
        updateItemChecked(current, itemId, input.checked!)
      );
      return { before };
    },
    onError: (_error, _variables, context) => {
      if (context?.before) client.setQueryData(detailKey, context.before);
    },
    onSuccess: storeList,
  });
  const deleteItem = useMutation({
    mutationFn: (itemId: string) => groceryApi.deleteItem(listId!, itemId),
    onSuccess: storeList,
  });
  const clearChecked = useMutation({
    mutationFn: () => groceryApi.clearChecked(listId!),
    onSuccess: storeList,
  });

  return { create, update, archive, addItem, updateItem, deleteItem, clearChecked };
}
