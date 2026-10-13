import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppText,
  CustomHeader,
  ProgressBar,
  ScreenWrapper,
} from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { DayNavigator } from '../components/DayNavigator';
import { LogHistoryItem } from '../components/LogHistoryItem';
import { TrackingQueryState } from '../components/TrackingQueryState';
import { WaterGlassRow } from '../components/WaterGlassRow';
import { WaterLogModal } from '../components/WaterLogModal';
import {
  useWaterMutations,
  useTrackingTargets,
  useWater,
} from '../hooks/useTrackingApi';
import { useTrackingFormat } from '../hooks/useTrackingFormat';
import {
  WATER_GLASS_ML,
  combineDateAndTime,
  formatTimeOfDay,
  sumWater,
  toLocalIsoDate,
  waterGlasses,
  waterLogsForDate,
} from '../trackingState';
import type { WaterLog } from '../types';

interface ModalState {
  open: boolean;
  /** New for every opening, so the form resets. */
  key: number;
  log?: WaterLog;
}

export function WaterTrackingScreen() {
  const { t } = useTranslation();
  const { formatNumber } = useTrackingFormat();
  const today = toLocalIsoDate(new Date());
  const [date, setDate] = useState(today);
  const isToday = date === today;
  const water = useWater(date);
  const waterLogs = water.data?.data ?? [];
  const targetMl = useTrackingTargets().waterMl;
  const { createWater } = useWaterMutations();
  const [modal, setModal] = useState<ModalState>({ open: false, key: 0 });
  const [focusId, setFocusId] = useState<string | null>(null);
  const historyRef = useRef<ScrollView>(null);
  const itemOffsets = useRef(new Map<string, number>());

  const dayLogs = useMemo(
    () => waterLogsForDate(waterLogs, date),
    [waterLogs, date]
  );
  const ready = !water.isLoading && !water.isError;
  // An earlier day with nothing logged is read-only and shows only "no data".
  const isPastWithoutData = !isToday && dayLogs.length === 0;
  const consumedMl = sumWater(dayLogs);
  const remainingMl = targetMl ? Math.max(0, targetMl - consumedMl) : null;
  const glasses = waterGlasses(consumedMl, targetMl);
  const ml = (value: number) => formatNumber(value);

  // Scroll the history to a drink that was just added or edited.
  const scrollToFocus = () => {
    if (!focusId) return;
    const offset = itemOffsets.current.get(focusId);
    if (offset == null) return;
    historyRef.current?.scrollTo({
      y: Math.max(0, offset - spacing.sm),
      animated: true,
    });
    setFocusId(null);
  };
  useEffect(scrollToFocus, [focusId, dayLogs]);

  const openModal = (log?: WaterLog) =>
    setModal({ open: true, key: Date.now(), log });
  // Keep `log` while the sheet slides out so its content does not flash.
  const closeModal = () => setModal((current) => ({ ...current, open: false }));
  const addGlass = async () => {
    // On an earlier day, log the glass at the current time of day on that day.
    const now = new Date();
    const recordedAt = isToday
      ? now.toISOString()
      : combineDateAndTime(date, {
          hours: now.getHours(),
          minutes: now.getMinutes(),
        });
    try {
      const created = await createWater.mutateAsync({
        amountMl: WATER_GLASS_ML,
        recordedAt,
        note: undefined,
      });
      setFocusId(created._id);
    } catch {
      // The visible request error lets the user retry without fake local data.
    }
  };

  return (
    <ScreenWrapper
      keyboardAvoiding={false}
      edges={['top', 'left', 'right', 'bottom']}
      header={
        <CustomHeader
          title={t('tracking.water.title')}
          showBack
          backFallbackHref="/(tabs)/diary"
        />
      }
    >
      <View style={styles.content}>
        <DayNavigator date={date} onChange={setDate} />
        <TrackingQueryState
          loading={water.isLoading}
          error={water.isError}
          onRetry={() => void water.refetch()}
        />
        {ready && isPastWithoutData ? (
          <AppText color={colors.text.secondary} style={styles.noData}>
            {t('tracking.day.noData')}
          </AppText>
        ) : null}
        {ready && !isPastWithoutData ? (
          <>
            <AppText variant="bodySmall" color={colors.text.secondary}>
              {targetMl
                ? t('tracking.water.totalLine', {
                    consumed: ml(consumedMl),
                    target: ml(targetMl),
                  })
                : t('tracking.water.totalLineNoTarget', {
                    consumed: ml(consumedMl),
                  })}
            </AppText>

            <View style={styles.hero}>
              <AppText variant="overline" color={colors.text.inverse}>
                {t('tracking.water.reminderTitle')}
              </AppText>
              <View style={styles.heroValue}>
                <AppText variant="display" color={colors.text.inverse}>
                  {ml(consumedMl)}
                </AppText>
                {targetMl ? (
                  <AppText color={colors.text.inverse}>
                    {t('tracking.water.ofTarget', { target: ml(targetMl) })}
                  </AppText>
                ) : null}
              </View>
              {remainingMl != null ? (
                <AppText variant="bodySmall" color={colors.text.inverse}>
                  {remainingMl > 0
                    ? t('tracking.hub.waterRemaining', {
                        remaining: ml(remainingMl),
                      })
                    : t('tracking.hub.waterDone')}
                </AppText>
              ) : null}
              {targetMl ? (
                <ProgressBar
                  value={consumedMl}
                  max={targetMl}
                  tone="water"
                  accessibilityLabel={t('tracking.water.title')}
                />
              ) : null}
            </View>

            <WaterGlassRow
              total={glasses.total}
              filled={glasses.filled}
              accessibilityLabel={t('tracking.water.glassesA11y', {
                filled: glasses.filled,
                total: glasses.total,
              })}
              addGlassLabel={t('tracking.water.addGlassA11y', {
                ml: ml(WATER_GLASS_ML),
              })}
              onAddGlass={addGlass}
            />
            <AppText variant="caption" color={colors.text.secondary}>
              {t('tracking.water.glassHint', { ml: ml(WATER_GLASS_ML) })}
            </AppText>

            <AppText variant="heading4">
              {isToday
                ? t('tracking.water.historyTitle')
                : t('tracking.water.historyTitleDay')}
            </AppText>
            <View style={styles.historyBox}>
              {dayLogs.length === 0 ? (
                <AppText
                  variant="bodySmall"
                  color={colors.text.secondary}
                  style={styles.historyEmpty}
                >
                  {isToday
                    ? t('tracking.water.historyEmpty')
                    : t('tracking.water.historyEmptyDay')}
                </AppText>
              ) : (
                <ScrollView ref={historyRef} showsVerticalScrollIndicator>
                  {dayLogs.map((log, index) => (
                    <View
                      key={log._id}
                      onLayout={(event) => {
                        itemOffsets.current.set(log._id, event.nativeEvent.layout.y);
                        if (log._id === focusId) scrollToFocus();
                      }}
                    >
                      {index > 0 ? <View style={styles.divider} /> : null}
                      <LogHistoryItem
                        variant="row"
                        unit="ml"
                        title={formatTimeOfDay(log.recordedAt)}
                        value={t('tracking.water.amount', { ml: ml(log.amountMl) })}
                        onPress={() => openModal(log)}
                      />
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
            {createWater.error ? (
              <AppText color={colors.status.danger}>
                {t('tracking.data.saveError')}
              </AppText>
            ) : null}
          </>
        ) : null}
      </View>

      {ready && !isPastWithoutData ? (
        <View style={styles.footer}>
          <AppButton
            title={t('tracking.water.add')}
            onPress={() => openModal()}
            loading={createWater.isPending}
          />
        </View>
      ) : null}

      <WaterLogModal
        visible={modal.open}
        openKey={modal.key}
        log={modal.log}
        date={date}
        onClose={closeModal}
        onSaved={(id) => {
          closeModal();
          setFocusId(id);
        }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  hero: {
    backgroundColor: colors.status.info,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  heroValue: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  historyBox: {
    flex: 1,
    minHeight: 120,
    borderRadius: radius.xl,
    padding: spacing.xs,
    backgroundColor: colors.background.surface,
  },
  historyEmpty: { padding: spacing.md },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: spacing.md,
    backgroundColor: colors.border.default,
  },
  noData: { textAlign: 'center', paddingVertical: spacing['4xl'] },
  footer: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
});
