export interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  status: 'pending' | 'sent' | 'failed' | 'read';
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  mealReminderEnabled: boolean;
  waterReminderEnabled: boolean;
  contentEnabled: boolean;
  quietHours: { enabled: boolean; start: string; end: string };
  timezone: string;
}
