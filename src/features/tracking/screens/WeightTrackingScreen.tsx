import { Fragment, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppText,
  CustomHeader,
  EmptyState,
  ProgressBar,
  ScreenWrapper,
} from '@/components';
import { useTranslation, type TranslationKey } from '@/i18n';
import { useProfileStore } from '@/features/profile/profileStore';
import { colors, radius, spacing } from '@/theme';
import { LogHistoryItem } from '../components/LogHistoryItem';
import { TrackingQueryState } from '../components/TrackingQueryState';
import { WeightLineChart } from '../components/WeightLineChart';
import { WeightLogModal } from '../components/WeightLogModal';
import {
  useTrackingTargets,
  useWeightLogs,
  useWeightTrend,
} from '../hooks/useTrackingApi';
import { useTrackingFormat } from '../hooks/useTrackingFormat';
import {
  daysAgo,
  formatTimeOfDay,
  sortWeightLogs,
  toLocalIsoDate,
  weightChartPoints,
  weightGoalDirection,
  weightGoalProgress,
  weightTrend,
  type WeightGoalDirection,
} from '../trackingState';
import type { WeightLog } from '../types';

interface ModalState {
  open: boolean;
  /** New for every opening, so the form resets. */
  key: number;
  log?: WeightLog;
}

const GOAL_KEYS: Record<WeightGoalDirection, TranslationKey> = {
  lose: 'tracking.weight.goalLose',
  gain: 'tracking.weight.goalGain',
  maintain: 'tracking.weight.goalMaintain',
};

export function WeightTrackingScreen() {
  const { t } = useTranslation();
  const { formatNumber, formatShortDate, relativeDay } = useTrackingFormat();
  const logs = useWeightLogs();
  const trendQuery = useWeightTrend();
  const weightLogs = logs.data?.data ?? [];
  const heightCm = useProfileStore(
    (state) => state.data?.nutritionProfile?.heightCm
  );
  const goalKg = useTrackingTargets().weightKg;
  const [modal, setModal] = useState<ModalState>({ open: false, key: 0 });

  const now = new Date();
  const { history, points, trend } = useMemo(() => {
    const today = new Date();
    return {
      history: sortWeightLogs(weightLogs),
      points: weightChartPoints(weightLogs, today),
      trend: weightTrend(weightLogs, today),
    };
  }, [weightLogs]);
  const latest = history[0];
  const logsPerDay = new Map<string, number>();
  for (const log of history) {
    const day = toLocalIsoDate(log.recordedAt);
    logsPerDay.set(day, (logsPerDay.get(day) ?? 0) + 1);
  }
  // Add the time when several measurements share a day.
  const historyTitle = (recordedAt: string) => {
    const day = relativeDay(daysAgo(recordedAt, now));
    return (logsPerDay.get(toLocalIsoDate(recordedAt)) ?? 0) > 1
      ? `${day} · ${formatTimeOfDay(recordedAt)}`
      : day;
  };
  const kg = (value: number) => formatNumber(value, 1, 1);
  const historyValue = (weightKg: number) => {
    const heightM = heightCm ? heightCm / 100 : 0;
    const bmi = heightM > 0 ? weightKg / (heightM * heightM) : null;
    return bmi == null
      ? t('tracking.hub.weightValue', { weight: kg(weightKg) })
      : t('tracking.weight.historyValue', {
          weight: kg(weightKg),
          bmi: kg(bmi),
        });
  };

  const openModal = (log?: WeightLog) =>
    setModal({ open: true, key: Date.now(), log });
  // Keep `log` while the sheet slides out so its content does not flash.
  const closeModal = () => setModal((current) => ({ ...current, open: false }));

  let changeText: string | undefined;
  if (trend?.changeKg != null) {
    const change = kg(Math.abs(trend.changeKg));
    const days = trend.periodDays;
    if (trend.changeKg < 0)
      changeText = t('tracking.hub.weightDown', { change, days });
    else if (trend.changeKg > 0)
      changeText = t('tracking.hub.weightUp', { change, days });
    else changeText = t('tracking.hub.weightSame', { days });
  }

  const goalProgress =
    latest && goalKg != null
      ? weightGoalProgress(
          points[0]?.weightKg ?? latest.weightKg,
          latest.weightKg,
          goalKg
        )
      : null;
  const latestAge = latest ? daysAgo(latest.recordedAt, now) : 0;

  return (
    <ScreenWrapper
      keyboardAvoiding={false}
      edges={['top', 'left', 'right', 'bottom']}
      header={
        <CustomHeader
          title={t('tracking.weight.title')}
          showBack
          backFallbackHref="/(tabs)/diary"
        />
      }
    >
      <View style={styles.content}>
        <TrackingQueryState
          loading={logs.isLoading || trendQuery.isLoading}
          error={logs.isError || trendQuery.isError}
          onRetry={() => void Promise.all([logs.refetch(), trendQuery.refetch()])}
        />
        {!logs.isLoading &&
        !trendQuery.isLoading &&
        !logs.isError &&
        !trendQuery.isError ? (
          <>
            {latest && goalKg != null ? (
              <AppText variant="bodySmall" color={colors.text.secondary}>
                {t(GOAL_KEYS[weightGoalDirection(latest.weightKg, goalKg)], {
                  goal: formatNumber(goalKg, 1),
                })}
              </AppText>
            ) : null}

            {!latest ? (
              <EmptyState
                title={t('tracking.hub.weightEmpty')}
                description={t('tracking.hub.weightEmptyDetail')}
                actionLabel={t('tracking.weight.add')}
                onAction={() => openModal()}
              />
            ) : (
              <>
                <View style={styles.hero}>
                  <AppText variant="overline" color={colors.text.inverse}>
                    {t('tracking.weight.progressTitle')}
                  </AppText>
                  <View style={styles.heroValue}>
                    <AppText variant="display" color={colors.text.inverse}>
                      {kg(latest.weightKg)}
                    </AppText>
                    <AppText color={colors.text.inverse}>
                      {latestAge === 0
                        ? t('tracking.weight.kgToday')
                        : t('tracking.weight.kgOn', {
                            date: formatShortDate(toLocalIsoDate(latest.recordedAt)),
                          })}
                    </AppText>
                  </View>
                  {changeText ? (
                    <AppText variant="bodySmall" color={colors.text.inverse}>
                      {changeText}
                    </AppText>
                  ) : null}
                  {goalProgress != null ? (
                    <ProgressBar
                      value={goalProgress}
                      max={1}
                      accessibilityLabel={t('tracking.weight.goalProgressA11y', {
                        percent: Math.round(goalProgress * 100),
                      })}
                    />
                  ) : null}
                </View>

                <View style={styles.card}>
                  <AppText variant="heading4">
                    {t('tracking.weight.chartTitle')}
                  </AppText>
                  {points.length > 0 ? (
                    <WeightLineChart
                      points={points}
                      accessibilityLabel={t('tracking.weight.chartA11y', {
                        days: trend?.periodDays ?? points.length,
                        weights: points
                          .map((point) => kg(point.weightKg))
                          .join(', '),
                      })}
                      labelFor={(point) =>
                        point.daysAgo === 0
                          ? t('tracking.weight.chartToday', {
                              kg: kg(point.weightKg),
                            })
                          : t('tracking.weight.chartDaysAgo', {
                              days: point.daysAgo,
                              kg: kg(point.weightKg),
                            })
                      }
                    />
                  ) : (
                    <AppText variant="bodySmall" color={colors.text.secondary}>
                      {t('tracking.weight.chartEmpty')}
                    </AppText>
                  )}
                </View>

                <AppText variant="heading4">
                  {t('tracking.weight.historyTitle')}
                </AppText>
                <View style={styles.historyBox}>
                  <ScrollView showsVerticalScrollIndicator>
                    {history.map((log, index) => (
                      <Fragment key={log._id}>
                        {index > 0 ? <View style={styles.divider} /> : null}
                        <LogHistoryItem
                          variant="row"
                          unit="kg"
                          title={historyTitle(log.recordedAt)}
                          value={historyValue(log.weightKg)}
                          onPress={() => openModal(log)}
                        />
                      </Fragment>
                    ))}
                  </ScrollView>
                </View>
              </>
            )}
          </>
        ) : null}
      </View>

      {latest && !logs.isError && !trendQuery.isError ? (
        <View style={styles.footer}>
          <AppButton title={t('tracking.weight.add')} onPress={() => openModal()} />
        </View>
      ) : null}
      <WeightLogModal
        visible={modal.open}
        openKey={modal.key}
        log={modal.log}
        defaultWeightKg={latest?.weightKg}
        onClose={closeModal}
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
    backgroundColor: colors.primary[800],
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  heroValue: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  card: {
    backgroundColor: colors.background.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  historyBox: {
    flex: 1,
    minHeight: 120,
    borderRadius: radius.xl,
    padding: spacing.xs,
    backgroundColor: colors.background.surface,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: spacing.md,
    backgroundColor: colors.border.default,
  },
  footer: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
});
