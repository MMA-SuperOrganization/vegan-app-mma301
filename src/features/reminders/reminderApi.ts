import { apiClient, unwrapApiPageRequest, unwrapApiRequest } from '@/services/api';
import { collectPages } from '@/services/api/collectPages';
export interface ReminderSchedule {
  mode: 'once' | 'daily' | 'weekly';
  at: string;
  timezone: string;
  daysOfWeek?: number[];
}
export interface Reminder {
  _id: string;
  type: 'meal' | 'water' | 'custom';
  title: string;
  body: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  schedule: ReminderSchedule;
  nextRunAt?: string;
}
export type ReminderInput = Pick<Reminder, 'type' | 'title' | 'body' | 'schedule'>;
export const reminderApi = {
  list: () =>
    collectPages((page) =>
      unwrapApiPageRequest<Reminder>(() =>
        apiClient.get('/reminders', { params: { page, limit: 100 } })
      )
    ),
  create: (input: ReminderInput) =>
    unwrapApiRequest<Reminder>(() => apiClient.post('/reminders', input)),
  update: (
    id: string,
    input: Partial<ReminderInput> & { status?: 'active' | 'paused' }
  ) => unwrapApiRequest<Reminder>(() => apiClient.patch(`/reminders/${id}`, input)),
  remove: (id: string) =>
    unwrapApiRequest(() => apiClient.delete(`/reminders/${id}`)),
  registerDevice: (token: string, deviceName: string) =>
    unwrapApiRequest<{ tokenId: string }>(() =>
      apiClient.post('/auth/fcm-tokens', { token, platform: 'android', deviceName })
    ),
  unregisterDevice: (tokenId: string) =>
    unwrapApiRequest(() => apiClient.delete(`/auth/fcm-tokens/${tokenId}`)),
};
