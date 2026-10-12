import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppButton, AppInput, AppText, BottomSheet } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import { useWeightMutations } from '../hooks/useTrackingApi';
import {
  combineDateAndTime,
  formatDayMonthYear,
  parseDayMonthYear,
  parseDecimal,
  toLocalIsoDate,
} from '../trackingState';
import type { WeightLog } from '../types';

/** Backend `weightKg` upper bound. */
const MAX_WEIGHT_KG = 500;
const NOTE_MAX_LENGTH = 1000;

type FieldErrors = Partial<Record<'weight' | 'date', string>>;

export interface WeightLogModalProps {
  visible: boolean;
  /** Changes on every opening; the form resets from `log` when it does. */
  openKey: number;
  /** The measurement to edit or delete; omit to log a new one. */
  log?: WeightLog;
  /** Prefills a new measurement, usually the latest weight. */
  defaultWeightKg?: number;
  onClose: () => void;
}

/**
 * Add, edit or delete a weight measurement in a bottom sheet. Keep it mounted and
 * toggle `visible`, like the water log modal.
 */
export function WeightLogModal({
  visible,
  openKey,
  log,
  defaultWeightKg,
  onClose,
}: WeightLogModalProps) {
  const { t } = useTranslation();
  const { createWeight, updateWeight, removeWeight } = useWeightMutations();
  const initialWeight = log?.weightKg ?? defaultWeightKg;

  const [weightText, setWeightText] = useState(
    initialWeight != null ? String(initialWeight) : ''
  );
  const [dateText, setDateText] = useState(() =>
    formatDayMonthYear(toLocalIsoDate(log?.recordedAt ?? new Date()))
  );
  const [note, setNote] = useState(log?.note ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Reset the form from `log` at the start of every opening only.
  useEffect(() => {
    setWeightText(initialWeight != null ? String(initialWeight) : '');
    setDateText(formatDayMonthYear(toLocalIsoDate(log?.recordedAt ?? new Date())));
    setNote(log?.note ?? '');
    setErrors({});
    setConfirmingDelete(false);
    createWeight.reset();
    updateWeight.reset();
    removeWeight.reset();
  }, [openKey]);

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
    else if (date > today) {
      nextErrors.date = t('tracking.weightEntry.errorFuture');
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !weightKg || !date) return;

    // Editing keeps the original time of day; a new log today uses "now" and
    // a new log on an earlier day uses noon.
    const source = log ? new Date(log.recordedAt) : new Date();
    const recordedAt =
      !log && date === today
        ? source.toISOString()
        : combineDateAndTime(date, {
            hours: log ? source.getHours() : 12,
            minutes: log ? source.getMinutes() : 0,
          });
    const input = { weightKg, recordedAt, note: note.trim() || undefined };
    try {
      if (log) await updateWeight.mutateAsync({ id: log._id, input });
      else await createWeight.mutateAsync(input);
      onClose();
    } catch {
      // Keep the sheet open and show the request error below.
    }
  };

  const remove = async () => {
    if (!log) return;
    try {
      await removeWeight.mutateAsync(log._id);
      onClose();
    } catch {
      // Keep the sheet open so the user can retry.
    }
  };

  if (confirmingDelete) {
    return (
      <BottomSheet
        visible={visible}
        title={t('tracking.weightEntry.deleteConfirmTitle')}
        onClose={onClose}
      >
        <AppText color={colors.text.secondary}>
          {t('tracking.weightEntry.deleteConfirmBody')}
        </AppText>
        {removeWeight.error ? (
          <AppText color={colors.status.danger}>
            {t('tracking.data.saveError')}
          </AppText>
        ) : null}
        <AppButton
          title={t('tracking.weightEntry.delete')}
          variant="danger"
          loading={removeWeight.isPending}
          onPress={() => void remove()}
        />
        <AppButton
          title={t('common.back')}
          variant="outline"
          onPress={() => setConfirmingDelete(false)}
        />
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      visible={visible}
      title={
        log ? t('tracking.weightEntry.editTitle') : t('tracking.weightEntry.title')
      }
      onClose={onClose}
    >
      <AppText variant="bodySmall" color={colors.text.secondary}>
        {t('tracking.weightEntry.subtitle')}
      </AppText>
      <View style={styles.fields}>
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
      {createWeight.error || updateWeight.error ? (
        <AppText color={colors.status.danger}>
          {t('tracking.data.saveError')}
        </AppText>
      ) : null}
      <AppButton
        title={t('tracking.weightEntry.save')}
        loading={createWeight.isPending || updateWeight.isPending}
        onPress={() => void save()}
      />
      {log ? (
        <AppButton
          title={t('tracking.weightEntry.delete')}
          variant="danger"
          onPress={() => setConfirmingDelete(true)}
        />
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  fields: { gap: spacing.md },
});
