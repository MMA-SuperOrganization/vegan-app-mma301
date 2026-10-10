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
  const water = useWater(today);
  const waterLogs = water.data?.data ?? [];
  const targetMl = useTrackingTargets().waterMl;
  const { createWater } = useWaterMutations();
  const [modal, setModal] = useState<ModalState>({ open: false, key: 0 });
  const [focusId, setFocusId] = useState<string | null>(null);
  const historyRef = useRef<ScrollView>(null);
  const itemOffsets = useRef(new Map<string, number>());

  const todayLogs = useMemo(
    () => waterLogsForDate(waterLogs, today),
    [waterLogs, today]
  );
  const consumedMl = sumWater(todayLogs);
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
  useEffect(scrollToFocus, [focusId, todayLogs]);

  const openModal = (log?: WaterLog) =>
    setModal({ open: true, key: Date.now(), log });
  // Keep `log` while the sheet slides out so its content does not flash.
  const closeModal = () => setModal((current) => ({ ...current, open: false }));
  const addGlass = async () => {
    try {
      const created = await createWater.mutateAsync({
        amountMl: WATER_GLASS_ML,
        recordedAt: new Date().toISOString(),
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
    >
      <CustomHeader
        title={t('tracking.water.title')}
        showBack
        backFallbackHref="/(tabs)/diary"
      />
      <View style={styles.content}>
        <TrackingQueryState
          loading={water.isLoading}
          error={water.isError}
          onRetry={() => void water.refetch()}
        />
        {!water.isLoading && !water.isError ? (
          <>
            <AppText variant="bodySmall" color={colors.text.secondary}>
              {targetMl
                ? t('tracking.water.todayLine', {
                    consumed: ml(consumedMl),
                    target: ml(targetMl),
                  })
                : t('tracking.water.todayLineNoTarget', {
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

            <AppText variant="heading4">{t('tracking.water.historyTitle')}</AppText>
            <View style={styles.historyBox}>
              {todayLogs.length === 0 ? (
                <AppText variant="bodySmall" color={colors.text.secondary}>
                  {t('tracking.water.historyEmpty')}
                </AppText>
              ) : (
                <ScrollView
                  ref={historyRef}
                  contentContainerStyle={styles.historyList}
                  showsVerticalScrollIndicator
                >
                  {todayLogs.map((log) => (
                    <View
                      key={log._id}
                      onLayout={(event) => {
                        itemOffsets.current.set(log._id, event.nativeEvent.layout.y);
                        if (log._id === focusId) scrollToFocus();
                      }}
                    >
                      <LogHistoryItem
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

      <View style={styles.footer}>
        <AppButton
          title={t('tracking.water.add')}
          onPress={() => openModal()}
          loading={createWater.isPending}
          disabled={water.isLoading || water.isError}
        />
      </View>

      <WaterLogModal
        visible={modal.open}
        openKey={modal.key}
        log={modal.log}
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
    padding: spacing.sm,
    backgroundColor: colors.background.muted,
  },
  historyList: { gap: spacing.sm },
  footer: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
});
