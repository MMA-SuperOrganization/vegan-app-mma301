import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidIanaTimezone,
  validateProfileText,
} from '../src/features/profile/validation.ts';
import { validateNotificationPreferences } from '../src/features/settings/validation.ts';
import {
  markAllNotificationsRead,
  markNotificationRead,
} from '../src/features/settings/notificationState.ts';

test('profile validation matches backend text and IANA timezone constraints', () => {
  assert.deepEqual(validateProfileText('Ngọc', 'Plant-based profile'), {
    name: true,
    bio: true,
  });
  assert.equal(validateProfileText('', '').name, false);
  assert.equal(validateProfileText('x'.repeat(101), '').name, false);
  assert.equal(validateProfileText('Ngọc', 'x'.repeat(501)).bio, false);
  assert.equal(isValidIanaTimezone('Asia/Ho_Chi_Minh'), true);
  assert.equal(isValidIanaTimezone('not/a-zone'), false);
});

test('notification preference validation matches backend HH:mm and timezone schema', () => {
  const valid = {
    pushEnabled: true,
    mealReminderEnabled: true,
    waterReminderEnabled: true,
    contentEnabled: true,
    quietHours: { enabled: true, start: '22:00', end: '07:00' },
    timezone: 'Asia/Ho_Chi_Minh',
  };
  assert.deepEqual(validateNotificationPreferences(valid), {
    quietHours: true,
    timezone: true,
  });
  assert.equal(
    validateNotificationPreferences({
      ...valid,
      quietHours: { enabled: true, start: '25:00', end: '7:00' },
    }).quietHours,
    false
  );
  assert.equal(
    validateNotificationPreferences({ ...valid, timezone: 'Saigon' }).timezone,
    false
  );
});

test('notification optimistic updates affect only the intended account cache page', () => {
  const page = {
    data: [
      { _id: 'one', status: 'sent', readAt: null },
      { _id: 'two', status: 'sent', readAt: null },
    ],
    meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
  };
  const oneRead = markNotificationRead(page, 'one', '2026-10-09T00:00:00.000Z');
  assert.equal(oneRead.data[0].status, 'read');
  assert.equal(oneRead.data[1].status, 'sent');
  assert.deepEqual(oneRead.meta, page.meta);
  const allRead = markAllNotificationsRead(page, '2026-10-09T00:00:00.000Z');
  assert.equal(
    allRead.data.every((notification) => notification.status === 'read'),
    true
  );
});
