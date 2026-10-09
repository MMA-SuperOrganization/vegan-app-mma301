import type { ApiPage } from '@/services/api';
import type { NotificationItem } from './types';

export function markNotificationRead(
  page: ApiPage<NotificationItem> | undefined,
  id: string,
  readAt: string
): ApiPage<NotificationItem> {
  return {
    ...(page ?? { data: [] }),
    data: (page?.data ?? []).map((notification) =>
      notification._id === id
        ? { ...notification, status: 'read', readAt }
        : notification
    ),
  };
}

export function markAllNotificationsRead(
  page: ApiPage<NotificationItem> | undefined,
  readAt: string
): ApiPage<NotificationItem> {
  return {
    ...(page ?? { data: [] }),
    data: (page?.data ?? []).map((notification) => ({
      ...notification,
      status: 'read',
      readAt,
    })),
  };
}
