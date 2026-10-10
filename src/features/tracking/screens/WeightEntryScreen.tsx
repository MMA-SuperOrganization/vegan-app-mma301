import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  AppButton,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
} from '@/components';
import { useSafeBack } from '@/hooks';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import { TrackingSheet } from '../components/TrackingSheet';
import { TrackingQueryState } from '../components/TrackingQueryState';
import { useWeightLogs, useWeightMutations } from '../hooks/useTrackingApi';
import {
  combineDateAndTime,
  formatDayMonthYear,
  parseDayMonthYear,
  parseDecimal,
  sortWeightLogs,
  toLocalIsoDate,
} from '../trackingState';

/** Backend `weightKg` upper bound. */
const MAX_WEIGHT_KG = 500;
const NOTE_MAX_LENGTH = 1000;

type FieldErrors = Partial<Record<'weight' | 'date', string>>;

export function WeightEntryScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { t } = useTranslation();
  const goBack = useSafeBack('/(tracking)/weight');
  const logs = useWeightLogs();
  const weightLogs = logs.data?.data ?? [];
  const log = id ? weightLogs.find((item) => item._id === id) : undefined;
  const lastWeightKg = sortWeightLogs(weightLogs)[0]?.weightKg;
  const { createWeight, updateWeight, removeWeight } = useWeightMutations();

  const [weightText, setWeightText] = useState(
    log ? String(log.weightKg) : lastWeightKg != null ? String(lastWeightKg) : ''
  );
  const [dateText, setDateText] = useState(
    formatDayMonthYear(toLocalIsoDate(log?.recordedAt ?? new Date()))
  );
  const [note, setNote] = useState(log?.note ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (log) {
      setWeightText(String(log.weightKg));
      setDateText(formatDayMonthYear(toLocalIsoDate(log.recordedAt)));
      setNote(log.note ?? '');
    } else if (!id && lastWeightKg != null) {
      setWeightText((current) => current || String(lastWeightKg));
    }
  }, [id, lastWeightKg, log]);

  if (logs.isLoading || logs.isError) {
    return (
      <ScreenWrapper
        edges={['top', 'left', 'right', 'bottom']}
        keyboardAvoiding={false}
        header={
          <CustomHeader title={t('tracking.weightEntry.title')} showBack />
        }
      >
        <TrackingQueryState
          loading={logs.isLoading}
          error={logs.isError}
          onRetry={() => void logs.refetch()}
        />
      </ScreenWrapper>
    );
  }

  if (id && !log) {
    return (
      <ScreenWrapper
        edges={['top', 'left', 'right', 'bottom']}
        keyboardAvoiding={false}
        header={
          <CustomHeader title={t('tracking.weightEntry.title')} showBack />
        }
      >
        <View style={styles.missing}>
          <AppText color={colors.text.secondary}>
            {t('tracking.weightEntry.notFound')}
          </AppText>
          <AppButton title={t('common.back')} variant="outline" onPress={goBack} />
        </View>
      </ScreenWrapper>
    );
  }

  const save = async () => {
    const weightKg = parseDecimal(weightText);
    const date = parseDayMonthYear(dateText);
    const today = toLocalIsoDate(new Date());
    const nextErrors: FieldErrors = {};
    if (!weightKg || weightKg <= 0 || weightKg > MAX_WEIGHT_KG) {
      nextErrors.weight = t('tracking.weightEntry.errorWeight', {
        max: MAX_WEIGHT_KG,
      });
    }
    if (!date) nextErrors.date = t('tracking.weightEntry.errorDate');
    else if (date > today) nextErrors.date = t('tracking.weightEntry.errorFuture');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !weightKg || !date) return;

    // Keep the original time of day when editing; use "now" for a new log today.
    const source = log ? new Date(log.recordedAt) : new Date();
    const recordedAt =
      !log && date === today
        ? source.toISOString()
        : combineDateAndTime(date, {
            hours: log ? source.getHours() : 12,
            minutes: log ? source.getMinutes() : 0,
          });
    const trimmedNote = note.trim() || undefined;

    try {
      const input = { weightKg, recordedAt, note: trimmedNote };
      if (log) await updateWeight.mutateAsync({ id: log._id, input });
      else await createWeight.mutateAsync(input);
      goBack();
    } catch {
      // React Query exposes the request error below the form.
    }
  };

  const confirmDelete = async () => {
    if (!log) return;
    try {
      await removeWeight.mutateAsync(log._id);
      setConfirmDeleteOpen(false);
      goBack();
    } catch {
      // Keep the confirmation open so the user can retry.
    }
  };

  return (
    <ScreenWrapper
      scrollable
      edges={['top', 'left', 'right', 'bottom']}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.screen}
      header={
        <CustomHeader
          title={t('tracking.weightEntry.title')}
          showBack
          backFallbackHref="/(tracking)/weight"
        />
      }
    >
      <View style={styles.content}>
        <AppText variant="bodySmall" color={colors.text.secondary}>
          {t('tracking.weightEntry.subtitle')}
        </AppText>
        <AppInput
          label={t('tracking.weightEntry.weightLabel')}
          value={weightText}
          onChangeText={setWeightText}
          keyboardType="decimal-pad"
          placeholder="65,0"
          error={errors.weight}
        />
        <AppInput
          label={t('tracking.weightEntry.dateLabel')}
          value={dateText}
          onChangeText={setDateText}
          keyboardType="numbers-and-punctuation"
          placeholder="DD/MM/YYYY"
          error={errors.date}
        />
        <AppInput
          label={t('tracking.weightEntry.noteLabel')}
          value={note}
          onChangeText={setNote}
          placeholder={t('tracking.weightEntry.notePlaceholder')}
          maxLength={NOTE_MAX_LENGTH}
          autoCapitalize="sentences"
        />
      </View>
      <View style={[styles.content, styles.actions]}>
        {createWeight.error || updateWeight.error || removeWeight.error ? (
          <AppText color={colors.status.danger}>
            {t('tracking.data.saveError')}
          </AppText>
        ) : null}
        <AppButton
          title={t('tracking.weightEntry.save')}
          onPress={() => void save()}
          loading={createWeight.isPending || updateWeight.isPending}
        />
        {log ? (
          <AppButton
            title={t('tracking.weightEntry.delete')}
            variant="danger"
            onPress={() => setConfirmDeleteOpen(true)}
          />
        ) : null}
      </View>

      <TrackingSheet
        visible={confirmDeleteOpen}
        title={t('tracking.weightEntry.deleteConfirmTitle')}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <AppText color={colors.text.secondary}>
          {t('tracking.weightEntry.deleteConfirmBody')}
        </AppText>
        <AppButton
          title={t('tracking.weightEntry.delete')}
          variant="danger"
          loading={removeWeight.isPending}
          onPress={() => void confirmDelete()}
        />
      </TrackingSheet>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, paddingBottom: spacing['4xl'] },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  actions: { marginTop: 'auto', paddingTop: spacing['2xl'] },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
});
