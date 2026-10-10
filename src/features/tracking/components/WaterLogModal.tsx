import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppButton, AppInput, AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import { useTrackingFormat } from '../hooks/useTrackingFormat';
import { useWaterMutations } from '../hooks/useTrackingApi';
import {
  WATER_GLASS_ML,
  combineDateAndTime,
  formatTimeOfDay,
  parseDecimal,
  parseTimeOfDay,
  toLocalIsoDate,
} from '../trackingState';
import type { WaterLog } from '../types';
import { TrackingSheet } from './TrackingSheet';

/** Backend `amountMl` upper bound. */
const MAX_WATER_ML = 10000;

type FieldErrors = Partial<Record<'amount' | 'time', string>>;

export interface WaterLogModalProps {
  visible: boolean;
  /** Changes on every opening; the form resets from `log` when it does. */
  openKey: number;
  /** The drink to edit; omit to log a new one. */
  log?: WaterLog;
  onClose: () => void;
  /** Called with the saved drink's id so the list can scroll to it. */
  onSaved: (id: string) => void;
}

/**
 * Add or edit a drink in a bottom sheet. Keep it mounted and toggle `visible`:
 * on web the slide-in animation only runs when `visible` changes.
 */
export function WaterLogModal({
  visible,
  openKey,
  log,
  onClose,
  onSaved,
}: WaterLogModalProps) {
  const { t } = useTranslation();
  const { formatNumber, formatShortDate } = useTrackingFormat();
  const { createWater, updateWater, removeWater } = useWaterMutations();

  const [logDate, setLogDate] = useState(() =>
    toLocalIsoDate(log?.recordedAt ?? new Date())
  );
  const [amountText, setAmountText] = useState(
    String(log?.amountMl ?? WATER_GLASS_ML)
  );
  const [timeText, setTimeText] = useState(() =>
    formatTimeOfDay(log?.recordedAt ?? new Date())
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Reset the form from `log` at the start of every opening only.
  useEffect(() => {
    const now = new Date();
    setLogDate(toLocalIsoDate(log?.recordedAt ?? now));
    setAmountText(String(log?.amountMl ?? WATER_GLASS_ML));
    setTimeText(formatTimeOfDay(log?.recordedAt ?? now));
    setErrors({});
    setConfirmingDelete(false);
  }, [openKey]);

  const save = async () => {
    const amountMl = parseDecimal(amountText);
    const time = parseTimeOfDay(timeText);
    const recordedAt = time ? combineDateAndTime(logDate, time) : null;
    const nextErrors: FieldErrors = {};
    if (!amountMl || amountMl <= 0 || amountMl > MAX_WATER_ML) {
      nextErrors.amount = t('tracking.waterEntry.errorAmount', {
        max: formatNumber(MAX_WATER_ML),
      });
    }
    if (!recordedAt) nextErrors.time = t('tracking.entry.errorTime');
    else if (new Date(recordedAt) > new Date()) {
      nextErrors.time = t('tracking.waterEntry.errorFuture');
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !amountMl || !recordedAt) return;

    try {
      const input = { amountMl, recordedAt, note: log?.note };
      const saved = log
        ? await updateWater.mutateAsync({ id: log._id, input })
        : await createWater.mutateAsync(input);
      onSaved(saved._id);
    } catch {
      // Keep the sheet open and show the request error below.
    }
  };

  const remove = async () => {
    if (!log) return;
    try {
      await removeWater.mutateAsync(log._id);
      onClose();
    } catch {
      // Keep the sheet open so the user can retry.
    }
  };

  if (confirmingDelete) {
    return (
      <TrackingSheet
        visible={visible}
        title={t('tracking.waterEntry.deleteConfirmTitle')}
        onClose={onClose}
      >
        <AppText color={colors.text.secondary}>
          {t('tracking.waterEntry.deleteConfirmBody')}
        </AppText>
        <AppButton
          title={t('tracking.waterEntry.delete')}
          variant="danger"
          loading={removeWater.isPending}
          onPress={() => void remove()}
        />
        {removeWater.error ? (
          <AppText color={colors.status.danger}>
            {t('tracking.data.saveError')}
          </AppText>
        ) : null}
        <AppButton
          title={t('common.back')}
          variant="outline"
          onPress={() => setConfirmingDelete(false)}
        />
      </TrackingSheet>
    );
  }

  return (
    <TrackingSheet
      visible={visible}
      title={
        log ? t('tracking.waterEntry.editTitle') : t('tracking.waterEntry.title')
      }
      onClose={onClose}
    >
      <AppText variant="bodySmall" color={colors.text.secondary}>
        {t('tracking.waterEntry.subtitle')}
      </AppText>
      <View style={styles.fields}>
        <AppInput
          label={t('tracking.waterEntry.amountLabel')}
          value={amountText}
          onChangeText={setAmountText}
          keyboardType="decimal-pad"
          placeholder={String(WATER_GLASS_ML)}
          error={errors.amount}
        />
        <AppInput
          label={t('tracking.entry.timeLabel', { date: formatShortDate(logDate) })}
          value={timeText}
          onChangeText={setTimeText}
          keyboardType="numbers-and-punctuation"
          placeholder="15:00"
          error={errors.time}
        />
      </View>
      {createWater.error || updateWater.error ? (
        <AppText color={colors.status.danger}>
          {t('tracking.data.saveError')}
        </AppText>
      ) : null}
      <AppButton
        title={t('tracking.waterEntry.save')}
        onPress={() => void save()}
        loading={createWater.isPending || updateWater.isPending}
      />
      {log ? (
        <AppButton
          title={t('tracking.waterEntry.delete')}
          variant="danger"
          onPress={() => setConfirmingDelete(true)}
        />
      ) : null}
    </TrackingSheet>
  );
}

const styles = StyleSheet.create({
  fields: { gap: spacing.md },
});
