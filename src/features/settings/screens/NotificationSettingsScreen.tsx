import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppInput,
  AppText,
  CustomHeader,
  EmptyState,
  LoadingSpinner,
  ScreenWrapper,
  TimezonePickerField,
  Toggle,
} from '@/components';
import { useDevicePermissions } from '@/features/onboarding/hooks/useDevicePermissions';
import { useSafeBack } from '@/hooks';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import {
  useNotificationPreferences,
  useSaveNotificationPreferences,
} from '../hooks';
import type { NotificationPreferences } from '../types';
import { validateNotificationPreferences } from '../validation';

export function NotificationSettingsScreen() {
  const { t } = useTranslation();
  const goBack = useSafeBack('/(tabs)/profile');
  const query = useNotificationPreferences();
  const save = useSaveNotificationPreferences();
  const permission = useDevicePermissions();
  const [draft, setDraft] = useState<NotificationPreferences | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  useEffect(() => {
    if (query.data) setDraft(query.data);
  }, [query.data]);
  const toggle =
    (
      key: keyof Pick<
        NotificationPreferences,
        | 'pushEnabled'
        | 'mealReminderEnabled'
        | 'waterReminderEnabled'
        | 'contentEnabled'
      >
    ) =>
    (value: boolean) =>
      setDraft((current) => (current ? { ...current, [key]: value } : current));
  const submit = async () => {
    if (!draft) return;
    const validation = validateNotificationPreferences(draft);
    const error = !validation.quietHours
      ? t('notifications.timeInvalid')
      : !validation.timezone
        ? t('notifications.timezoneInvalid')
        : null;
    setValidationError(error);
    if (error) return;
    try {
      await save.mutateAsync(draft);
      goBack();
    } catch {
      // The mutation keeps the normalized API error for the inline error state.
    }
  };
  if (query.isLoading)
    return (
      <ScreenWrapper contentContainerStyle={styles.screen}>
        <CustomHeader
          title={t('notifications.settingsTitle')}
          showBack
          onBack={goBack}
        />
        <LoadingSpinner />
      </ScreenWrapper>
    );
  if (query.isError || !draft)
    return (
      <ScreenWrapper contentContainerStyle={styles.screen}>
        <CustomHeader
          title={t('notifications.settingsTitle')}
          showBack
          onBack={goBack}
        />
        <EmptyState
          title={t('notifications.settingsError')}
          description={query.error?.message}
          actionLabel={t('common.retry')}
          onAction={() => void query.refetch()}
        />
      </ScreenWrapper>
    );
  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.screen}>
      <CustomHeader
        title={t('notifications.settingsTitle')}
        showBack
        onBack={goBack}
      />
      <AppText color={colors.text.secondary}>
        {t('notifications.settingsSubtitle')}
      </AppText>
      <View style={styles.toggles}>
        <Toggle
          label={t('notifications.push')}
          value={draft.pushEnabled}
          onValueChange={toggle('pushEnabled')}
        />
        <Toggle
          label={t('notifications.meal')}
          value={draft.mealReminderEnabled}
          onValueChange={toggle('mealReminderEnabled')}
        />
        <Toggle
          label={t('notifications.water')}
          value={draft.waterReminderEnabled}
          onValueChange={toggle('waterReminderEnabled')}
        />
        <Toggle
          label={t('notifications.content')}
          value={draft.contentEnabled}
          onValueChange={toggle('contentEnabled')}
        />
        <Toggle
          label={t('notifications.quietHours')}
          value={draft.quietHours.enabled}
          onValueChange={(enabled) =>
            setDraft({ ...draft, quietHours: { ...draft.quietHours, enabled } })
          }
        />
      </View>
      {draft.quietHours.enabled ? (
        <View style={styles.times}>
          <AppInput
            label={t('notifications.quietStart')}
            value={draft.quietHours.start}
            onChangeText={(start) =>
              setDraft({ ...draft, quietHours: { ...draft.quietHours, start } })
            }
            placeholder="22:00"
          />
          <AppInput
            label={t('notifications.quietEnd')}
            value={draft.quietHours.end}
            onChangeText={(end) =>
              setDraft({ ...draft, quietHours: { ...draft.quietHours, end } })
            }
            placeholder="07:00"
          />
        </View>
      ) : null}
      <TimezonePickerField
        label={t('notifications.timezone')}
        value={draft.timezone}
        onChange={(timezone) => setDraft({ ...draft, timezone })}
      />
      <AppButton
        title={
          permission.notifications === 'granted'
            ? t('notifications.deviceGranted')
            : permission.notifications === 'unsupported'
              ? t('notifications.deviceUnsupported')
              : t('notifications.openDeviceSettings')
        }
        variant="outline"
        disabled={
          permission.notifications === 'granted' ||
          permission.notifications === 'unsupported'
        }
        onPress={() => void permission.requestNotifications()}
      />
      <View style={styles.note}>
        <AppText variant="bodyStrong">{t('notifications.devicePermission')}</AppText>
        <AppText color={colors.text.secondary}>
          {t('notifications.devicePermissionDescription')}
        </AppText>
      </View>
      {save.error ? (
        <AppText color={colors.status.danger}>{save.error.message}</AppText>
      ) : null}
      {validationError ? (
        <AppText color={colors.status.danger}>{validationError}</AppText>
      ) : null}
      <AppButton
        title={t('notifications.save')}
        loading={save.isPending}
        onPress={() => void submit()}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: spacing.xl, gap: spacing.lg },
  toggles: { gap: spacing.md },
  times: { gap: spacing.md },
  note: {
    padding: spacing.xl,
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
  },
});
