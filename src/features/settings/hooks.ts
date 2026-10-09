import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import { settingsApi } from './settingsApi';
import type { NotificationItem, NotificationPreferences } from './types';
import type { ApiPage } from '@/services/api';

const keys = {
  notifications: (userId?: string) => ['account', userId, 'notifications'] as const,
  unread: (userId?: string) =>
    ['account', userId, 'notifications', 'unread'] as const,
  preferences: (userId?: string) =>
    ['account', userId, 'notification-preferences'] as const,
};

export function useNotifications() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: keys.notifications(userId),
    queryFn: settingsApi.notifications,
    enabled: Boolean(userId),
  });
}

export function useUnreadNotificationCount() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: keys.unread(userId),
    queryFn: settingsApi.unreadCount,
    enabled: Boolean(userId),
  });
}

export function useNotificationActions() {
  const client = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const listKey = keys.notifications(userId);
  const refresh = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: listKey }),
      client.invalidateQueries({ queryKey: keys.unread(userId) }),
    ]);
  const markRead = useMutation({
    mutationFn: settingsApi.markRead,
    onMutate: async (id: string) => {
      await client.cancelQueries({ queryKey: listKey });
      const before = client.getQueryData<ApiPage<NotificationItem>>(listKey);
      client.setQueryData<ApiPage<NotificationItem>>(listKey, (page) => ({
        ...(page ?? { data: [] }),
        data: (page?.data ?? []).map((item) =>
          item._id === id
            ? { ...item, status: 'read' as const, readAt: new Date().toISOString() }
            : item
        ),
      }));
      return { before };
    },
    onError: (_error, _id, context) => client.setQueryData(listKey, context?.before),
    onSettled: refresh,
  });
  const markAllRead = useMutation({
    mutationFn: settingsApi.markAllRead,
    onMutate: async () => {
      await client.cancelQueries({ queryKey: listKey });
      const before = client.getQueryData<ApiPage<NotificationItem>>(listKey);
      const readAt = new Date().toISOString();
      client.setQueryData<ApiPage<NotificationItem>>(listKey, (page) => ({
        ...(page ?? { data: [] }),
        data: (page?.data ?? []).map((item) => ({
          ...item,
          status: 'read' as const,
          readAt,
        })),
      }));
      return { before };
    },
    onError: (_error, _variables, context) =>
      client.setQueryData(listKey, context?.before),
    onSettled: refresh,
  });
  const remove = useMutation({
    mutationFn: settingsApi.deleteNotification,
    onSuccess: refresh,
  });
  return { markRead, markAllRead, remove };
}

export function useNotificationPreferences() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: keys.preferences(userId),
    queryFn: settingsApi.notificationPreferences,
    enabled: Boolean(userId),
  });
}

export function useSaveNotificationPreferences() {
  const client = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const key = keys.preferences(userId);
  return useMutation({
    mutationFn: (preferences: NotificationPreferences) =>
      settingsApi.saveNotificationPreferences(preferences),
    onSuccess: (preferences) => client.setQueryData(key, preferences),
  });
}
