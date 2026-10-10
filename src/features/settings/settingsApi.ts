import { apiClient, unwrapApiPageRequest, unwrapApiRequest } from '@/services/api';
import type { NotificationItem, NotificationPreferences } from './types';

export const settingsApi = {
  notifications: () =>
    unwrapApiPageRequest<NotificationItem>(() =>
      apiClient.get('/notifications', { params: { page: 1, limit: 50 } })
    ),
  unreadCount: () =>
    unwrapApiRequest<{ count: number }>(() =>
      apiClient.get('/notifications/unread-count')
    ),
  markRead: (id: string) =>
    unwrapApiRequest<NotificationItem>(() =>
      apiClient.patch(`/notifications/${id}/read`, {})
    ),
  markAllRead: () =>
    unwrapApiRequest<{ count: number }>(() =>
      apiClient.post('/notifications/read-all', {})
    ),
  deleteNotification: (id: string) =>
    unwrapApiRequest<{ deleted: boolean }>(() =>
      apiClient.delete(`/notifications/${id}`)
    ),
  notificationPreferences: () =>
    unwrapApiRequest<NotificationPreferences>(() =>
      apiClient.get('/notification-preferences')
    ),
  saveNotificationPreferences: (preferences: NotificationPreferences) =>
    unwrapApiRequest<NotificationPreferences>(() =>
      apiClient.put('/notification-preferences', preferences)
    ),
};
