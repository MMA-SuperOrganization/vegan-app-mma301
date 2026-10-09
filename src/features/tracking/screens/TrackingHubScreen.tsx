import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, ScreenWrapper } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import { TrackingHubCard } from '../components/TrackingHubCard';
import { useTrackingFormat } from '../hooks/useTrackingFormat';
import { useTrackingStore } from '../store/trackingStore';
import { selectTrackingOverview } from '../trackingState';

export function TrackingHubScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { formatNumber, formatLongDate } = useTrackingFormat();
  const diaryEntries = useTrackingStore((state) => state.diaryEntries);
  const weightLogs = useTrackingStore((state) => state.weightLogs);
  const waterLogs = useTrackingStore((state) => state.waterLogs);
  const targets = useTrackingStore((state) => state.targets);
  const overview = useMemo(
    () =>
      selectTrackingOverview(
        { diaryEntries, weightLogs, waterLogs, targets },
        new Date()
      ),
    [diaryEntries, weightLogs, waterLogs, targets]
  );

  const dateLabel = formatLongDate(overview.date);

  const { energy, weight, water } = overview;
  const energyPercent = energy.targetKcal
    ? Math.round((energy.consumedKcal / energy.targetKcal) * 100)
    : null;
  const waterRemaining = water.targetMl
    ? Math.max(0, water.targetMl - water.consumedMl)
    : null;

  let weightDetail: string | undefined;
  if (weight?.changeKg != null) {
    const change = formatNumber(Math.abs(weight.changeKg), 1, 1);
    if (weight.changeKg < 0) {
      weightDetail = t('tracking.hub.weightDown', {
        change,
        days: weight.periodDays,
      });
    } else if (weight.changeKg > 0) {
      weightDetail = t('tracking.hub.weightUp', { change, days: weight.periodDays });
    } else {
      weightDetail = t('tracking.hub.weightSame', { days: weight.periodDays });
    }
  }

  return (
    <ScreenWrapper
      scrollable
      keyboardAvoiding={false}
      edges={['top', 'left', 'right']}
      contentContainerStyle={styles.screen}
    >
      <View style={styles.header}>
        <AppText variant="heading1">{t('tracking.hub.title')}</AppText>
        <AppText
          variant="bodyLarge"
          color={colors.text.secondary}
          style={styles.date}
        >
          {dateLabel}
        </AppText>
        <AppText color={colors.text.secondary}>{t('tracking.hub.subtitle')}</AppText>
      </View>

      <TrackingHubCard
        testID="tracking-hub-food-diary"
        tone="energy"
        unit="kcal"
        title={t('tracking.foodDiary.title')}
        value={
          energy.targetKcal
            ? t('tracking.hub.energyValue', {
                consumed: formatNumber(energy.consumedKcal),
                target: formatNumber(energy.targetKcal),
              })
            : t('tracking.hub.energyValueNoTarget', {
                consumed: formatNumber(energy.consumedKcal),
              })
        }
        detail={
          energyPercent != null
            ? t('tracking.hub.energyDetail', { percent: energyPercent })
            : undefined
        }
        progress={
          energy.targetKcal
            ? { value: energy.consumedKcal, max: energy.targetKcal }
            : undefined
        }
        onPress={() => router.push('/(tracking)/food-diary')}
      />

      <TrackingHubCard
        testID="tracking-hub-weight"
        tone="weight"
        unit="kg"
        title={t('tracking.weight.title')}
        value={
          weight
            ? t('tracking.hub.weightValue', {
                weight: formatNumber(weight.latestWeightKg, 1, 1),
              })
            : t('tracking.hub.weightEmpty')
        }
        detail={weight ? weightDetail : t('tracking.hub.weightEmptyDetail')}
        onPress={() => router.push('/(tracking)/weight')}
      />

      <TrackingHubCard
        testID="tracking-hub-water"
        tone="water"
        unit="ml"
        title={t('tracking.water.title')}
        value={
          water.targetMl
            ? t('tracking.hub.waterValue', {
                consumed: formatNumber(water.consumedMl),
                target: formatNumber(water.targetMl),
              })
            : t('tracking.hub.waterValueNoTarget', {
                consumed: formatNumber(water.consumedMl),
              })
        }
        detail={
          waterRemaining == null
            ? undefined
            : waterRemaining > 0
              ? t('tracking.hub.waterRemaining', {
                  remaining: formatNumber(waterRemaining),
                })
              : t('tracking.hub.waterDone')
        }
        progress={
          water.targetMl
            ? { value: water.consumedMl, max: water.targetMl }
            : undefined
        }
        onPress={() => router.push('/(tracking)/water')}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.lg },
  header: { gap: spacing.xs, marginBottom: spacing.sm },
  date: { textTransform: 'capitalize' },
});
