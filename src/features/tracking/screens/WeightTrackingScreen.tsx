import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  AppButton,
  AppText,
  CustomHeader,
  EmptyState,
  ProgressBar,
  ScreenWrapper,
} from '@/components';
import { useTranslation, type TranslationKey } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { LogHistoryItem } from '../components/LogHistoryItem';
import { WeightLineChart } from '../components/WeightLineChart';
import { useTrackingFormat } from '../hooks/useTrackingFormat';
import { useTrackingStore } from '../store/trackingStore';
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

const GOAL_KEYS: Record<WeightGoalDirection, TranslationKey> = {
  lose: 'tracking.weight.goalLose',
  gain: 'tracking.weight.goalGain',
  maintain: 'tracking.weight.goalMaintain',
};

export function WeightTrackingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { formatNumber, formatShortDate, relativeDay } = useTrackingFormat();
  const weightLogs = useTrackingStore((state) => state.weightLogs);
  const goalKg = useTrackingStore((state) => state.targets.weightKg);

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

  const openEntry = (id?: string) =>
    router.push(
      id
        ? { pathname: '/(tracking)/weight-entry', params: { id } }
        : '/(tracking)/weight-entry'
    );

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
      scrollable
      keyboardAvoiding={false}
      edges={['top', 'left', 'right', 'bottom']}
      contentContainerStyle={styles.screen}
    >
      <CustomHeader
        title={t('tracking.weight.title')}
        showBack
        backFallbackHref="/(tabs)/diary"
      />
      <View style={styles.content}>
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
            onAction={() => openEntry()}
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
              <AppText variant="heading4">{t('tracking.weight.chartTitle')}</AppText>
              {points.length > 0 ? (
                <WeightLineChart
                  points={points}
                  accessibilityLabel={t('tracking.weight.chartA11y', {
                    days: trend?.periodDays ?? points.length,
                    weights: points.map((point) => kg(point.weightKg)).join(', '),
                  })}
                  labelFor={(point) =>
                    point.daysAgo === 0
                      ? t('tracking.weight.chartToday', { kg: kg(point.weightKg) })
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

            <AppButton
              title={t('tracking.weight.add')}
              onPress={() => openEntry()}
            />

            <AppText variant="heading4">{t('tracking.weight.historyTitle')}</AppText>
            {history.map((log) => (
              <LogHistoryItem
                key={log._id}
                unit="kg"
                title={historyTitle(log.recordedAt)}
                value={t('tracking.hub.weightValue', { weight: kg(log.weightKg) })}
                onPress={() => openEntry(log._id)}
              />
            ))}
          </>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: spacing['4xl'] },
  content: {
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
});
