import type { Href } from 'expo-router';
import type { NotificationItem } from './types';

type NotificationSource = Pick<NotificationItem, 'type' | 'data'>;

export function notificationHref(notification: NotificationSource): Href | null {
  const data = notification.data;
  const targetType = typeof data?.targetType === 'string' ? data.targetType : null;
  const targetId = typeof data?.targetId === 'string' ? data.targetId : null;

  if (targetType === 'recipe' && targetId)
    return { pathname: '/(discover)/recipe/[id]', params: { id: targetId } };
  if (targetType === 'post' && targetId)
    return { pathname: '/community/post', params: { id: targetId } };
  if (targetType === 'video' && targetId)
    return { pathname: '/community/video', params: { id: targetId } };
  if (['meal', 'water', 'custom'].includes(notification.type)) return '/reminders';

  return null;
}
