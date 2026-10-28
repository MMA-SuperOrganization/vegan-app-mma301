import { useState } from 'react';
import { View } from 'react-native';
import {
  AppButton,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
  Toggle,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { SelectionField } from '@/features/onboarding/components/SelectionField';
import { TimezonePickerField } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useReminders } from '../hooks';
import { DevicePushRegistration } from '../DevicePushRegistration';
import { validReminderSchedule } from '../schedule';
import { onceReminderAt, reminderWallTime } from '../reminderTime';
import type { Reminder, ReminderInput, ReminderSchedule } from '../reminderApi';

export function RemindersScreen() {
  const vi = useTranslation().locale === 'vi';
  const actions = useReminders();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<ReminderInput['type']>('custom');
  const [mode, setMode] = useState<ReminderSchedule['mode']>('daily');
  const [at, setAt] = useState('08:00');
  const [onceDate, setOnceDate] = useState(
    () =>
      reminderWallTime(
        new Date(Date.now() + 86400000).toISOString(),
        Intl.DateTimeFormat().resolvedOptions().timeZone
      ).date
  );
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const busy =
    actions.create.isPending || actions.update.isPending || actions.remove.isPending;
  const scheduledAt = mode === 'once' ? onceReminderAt(onceDate, at, timezone) : at;
  const valid =
    title.trim() &&
    body.trim() &&
    scheduledAt &&
    validReminderSchedule(mode, scheduledAt, weekdays);
  const edit = (reminder: Reminder) => {
    setEditingId(reminder._id);
    setTitle(reminder.title);
    setBody(reminder.body);
    setType(reminder.type);
    setMode(reminder.schedule.mode);
    if (reminder.schedule.mode === 'once') {
      const wall = reminderWallTime(
        reminder.schedule.at,
        reminder.schedule.timezone
      );
      setOnceDate(wall.date);
      setAt(wall.time);
    } else setAt(reminder.schedule.at);
    setTimezone(reminder.schedule.timezone);
    setWeekdays(reminder.schedule.daysOfWeek || []);
  };
  const clear = () => {
    setEditingId(null);
    setTitle('');
    setBody('');
    actions.create.reset();
    actions.update.reset();
  };
  const save = () => {
    if (!valid || !scheduledAt || busy) return;
    const input: ReminderInput = {
      title: title.trim(),
      body: body.trim(),
      type,
      schedule: {
        mode,
        at: scheduledAt,
        timezone,
        ...(mode === 'weekly' ? { daysOfWeek: weekdays } : {}),
      },
    };
    if (editingId)
      actions.update.mutate({ id: editingId, input }, { onSuccess: clear });
    else actions.create.mutate(input, { onSuccess: clear });
  };
  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
      header={
        <CustomHeader
          title={vi ? 'Nhắc lịch & push' : 'Reminders & push'}
          showBack
          backFallbackHref="/(tabs)/profile"
        />
      }
    >
      <DevicePushRegistration />
      <AppText variant="heading3">
        {editingId
          ? vi
            ? 'Sửa nhắc lịch'
            : 'Edit reminder'
          : vi
            ? 'Tạo nhắc lịch'
            : 'Create reminder'}
      </AppText>
      <AppInput
        label={vi ? 'Tiêu đề' : 'Title'}
        value={title}
        onChangeText={setTitle}
        maxLength={200}
        editable={!busy}
      />
      <AppInput
        label={vi ? 'Nội dung' : 'Message'}
        value={body}
        onChangeText={setBody}
        maxLength={4000}
        multiline
        editable={!busy}
      />
      <SelectionField
        label={vi ? 'Loại' : 'Type'}
        value={type}
        placeholder=""
        onChange={setType}
        options={[
          { value: 'custom', label: vi ? 'Tùy chỉnh' : 'Custom' },
          { value: 'meal', label: vi ? 'Bữa ăn' : 'Meal' },
          { value: 'water', label: vi ? 'Uống nước' : 'Water' },
        ]}
      />
      <SelectionField
        label={vi ? 'Lặp lại' : 'Repeat'}
        value={mode}
        placeholder=""
        onChange={(next) => {
          setMode(next);
          setAt('08:00');
        }}
        options={[
          { value: 'once', label: vi ? 'Một lần' : 'Once' },
          { value: 'daily', label: vi ? 'Mỗi ngày' : 'Daily' },
          { value: 'weekly', label: vi ? 'Mỗi tuần' : 'Weekly' },
        ]}
      />
      {mode === 'once' ? (
        <AppInput
          label={vi ? 'Ngày (YYYY-MM-DD)' : 'Date (YYYY-MM-DD)'}
          value={onceDate}
          onChangeText={setOnceDate}
          editable={!busy}
        />
      ) : null}
      <AppInput
        label={vi ? 'Giờ (HH:mm)' : 'Time (HH:mm)'}
        value={at}
        onChangeText={setAt}
        editable={!busy}
      />
      <TimezonePickerField
        label={vi ? 'Múi giờ' : 'Time zone'}
        value={timezone}
        onChange={setTimezone}
      />
      {!scheduledAt || !validReminderSchedule(mode, scheduledAt, weekdays) ? (
        <AppText color={colors.status.danger}>
          {vi
            ? 'Chọn ngày giờ hợp lệ trong tương lai và ít nhất một ngày nếu lặp theo tuần.'
            : 'Choose a valid future time and at least one weekday for weekly reminders.'}
        </AppText>
      ) : null}
      {mode === 'weekly'
        ? Array.from({ length: 7 }, (_, day) => (
            <Toggle
              key={day}
              label={new Intl.DateTimeFormat(vi ? 'vi-VN' : 'en-US', {
                weekday: 'long',
              }).format(new Date(2026, 9, 18 + day))}
              value={weekdays.includes(day)}
              onValueChange={(value) =>
                setWeekdays((current) =>
                  value
                    ? [...current, day]
                    : current.filter((entry) => entry !== day)
                )
              }
              disabled={busy}
            />
          ))
        : null}
      <FeatureState
        error={actions.create.error || actions.update.error || actions.remove.error}
      />
      <AppButton
        title={vi ? 'Lưu nhắc lịch' : 'Save reminder'}
        disabled={!valid || busy}
        loading={actions.create.isPending || actions.update.isPending}
        onPress={save}
      />
      {editingId ? (
        <AppButton
          title={vi ? 'Hủy sửa' : 'Cancel editing'}
          variant="ghost"
          disabled={busy}
          onPress={clear}
        />
      ) : null}
      <FeatureState
        loading={actions.query.isLoading}
        error={actions.query.error}
        retry={() => void actions.query.refetch()}
      />
      {actions.query.data?.data.filter((reminder) => reminder.status !== 'cancelled')
        .length === 0 ? (
        <AppText>{vi ? 'Chưa có nhắc lịch.' : 'No reminders yet.'}</AppText>
      ) : null}
      {actions.query.data?.data
        .filter((reminder) => reminder.status !== 'cancelled')
        .map((reminder) => (
          <View
            key={reminder._id}
            style={{
              padding: spacing.lg,
              borderRadius: radius.lg,
              backgroundColor: colors.background.surface,
              gap: spacing.sm,
            }}
          >
            <AppText variant="heading4">{reminder.title}</AppText>
            <AppText>{reminder.body}</AppText>
            <AppText>
              {reminder.schedule.at} · {reminder.schedule.timezone} ·{' '}
              {reminder.status === 'active'
                ? vi
                  ? 'Đang bật'
                  : 'Active'
                : reminder.status === 'paused'
                  ? vi
                    ? 'Tạm dừng'
                    : 'Paused'
                  : vi
                    ? 'Hoàn tất'
                    : 'Completed'}
            </AppText>
            {['active', 'paused'].includes(reminder.status) ? (
              <>
                <AppButton
                  title={vi ? 'Sửa' : 'Edit'}
                  variant="outline"
                  disabled={busy}
                  onPress={() => edit(reminder)}
                />
                <AppButton
                  title={
                    reminder.status === 'active'
                      ? vi
                        ? 'Tạm dừng'
                        : 'Pause'
                      : vi
                        ? 'Bật lại'
                        : 'Resume'
                  }
                  variant="ghost"
                  disabled={busy}
                  onPress={() =>
                    actions.update.mutate({
                      id: reminder._id,
                      input: {
                        status: reminder.status === 'active' ? 'paused' : 'active',
                      },
                    })
                  }
                />
              </>
            ) : null}
            {deletingId === reminder._id ? (
              <>
                <AppText>
                  {vi ? 'Xác nhận xóa nhắc lịch?' : 'Delete this reminder?'}
                </AppText>
                <AppButton
                  title={vi ? 'Xác nhận xóa' : 'Confirm deletion'}
                  disabled={busy}
                  onPress={() =>
                    actions.remove.mutate(reminder._id, {
                      onSuccess: () => setDeletingId(null),
                    })
                  }
                />
                <AppButton
                  title={vi ? 'Hủy' : 'Cancel'}
                  variant="ghost"
                  onPress={() => setDeletingId(null)}
                />
              </>
            ) : (
              <AppButton
                title={vi ? 'Xóa' : 'Delete'}
                variant="ghost"
                disabled={busy}
                onPress={() => setDeletingId(reminder._id)}
              />
            )}
          </View>
        ))}
    </ScreenWrapper>
  );
}
