import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  AppButton,
  AppText,
  CustomHeader,
  ProgressBar,
  ScreenWrapper,
} from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { DiaryMealCard } from '../components/DiaryMealCard';
import { TrackingQueryState } from '../components/TrackingQueryState';
import {
  useDiary,
  useDiarySummary,
  useTrackingTargets,
} from '../hooks/useTrackingApi';
import { useTrackingFormat } from '../hooks/useTrackingFormat';
import {
  PRIMARY_MEAL_TYPES,
  diaryEntriesForDate,
  groupDiaryByMeal,
  sumNutrition,
  toLocalIsoDate,
} from '../trackingState';
import type { DiaryEntry } from '../types';

export function FoodDiaryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { formatNumber, formatShortDate, mealLabel } = useTrackingFormat();

  const today = toLocalIsoDate(new Date());
  const diary = useDiary(today);
  const summary = useDiarySummary(today);
  const profileTargets = useTrackingTargets();
  const diaryEntries = diary.data?.data ?? [];
  const targetKcal =
    summary.data?.dailyTargets.caloriesKcal ?? profileTargets.energyKcal;
  const todayEntries = useMemo(
    () => diaryEntriesForDate(diaryEntries, today),
    [diaryEntries, today]
  );
  const byMeal = groupDiaryByMeal(todayEntries);
  const consumedKcal = sumNutrition(todayEntries).caloriesKcal;
  const mealTypes = byMeal.snack.length
    ? [...PRIMARY_MEAL_TYPES, 'snack' as const]
    : PRIMARY_MEAL_TYPES;

  const openEntry = (entry: DiaryEntry) =>
    router.push({ pathname: '/(tracking)/diary-entry', params: { id: entry._id } });

  return (
    <ScreenWrapper
      scrollable
      keyboardAvoiding={false}
      edges={['top', 'left', 'right', 'bottom']}
      contentContainerStyle={styles.screen}
      header={
        <CustomHeader
          title={t('tracking.foodDiary.title')}
          showBack
          backFallbackHref="/(tabs)/diary"
        />
      }
    >
      <View style={styles.content}>
        <TrackingQueryState
          loading={diary.isLoading || summary.isLoading}
          error={diary.isError || summary.isError}
          onRetry={() => void Promise.all([diary.refetch(), summary.refetch()])}
        />
        {!diary.isLoading &&
        !summary.isLoading &&
        !diary.isError &&
        !summary.isError ? (
          <>
            <AppText variant="bodySmall" color={colors.text.secondary}>
              {t('tracking.diary.dateLine', { date: formatShortDate(today) })}
            </AppText>

            <View style={styles.energy}>
              <AppText variant="heading3" color={colors.primary[700]}>
                {t('tracking.diary.energyTitle')}
              </AppText>
              <View style={styles.energyValue}>
                <AppText variant="display" color={colors.primary[700]}>
                  {formatNumber(consumedKcal)}
                </AppText>
                <AppText variant="bodyLarge" color={colors.text.secondary}>
                  {targetKcal
                    ? t('tracking.diary.ofTargetKcal', {
                        target: formatNumber(targetKcal),
                      })
                    : t('tracking.diary.kcalUnit')}
                </AppText>
              </View>
              {targetKcal ? (
                <ProgressBar
                  value={consumedKcal}
                  max={targetKcal}
                  accessibilityLabel={t('tracking.diary.energyTitle')}
                />
              ) : null}
            </View>

            {mealTypes.map((mealType) => (
              <DiaryMealCard
                key={mealType}
                title={mealLabel(mealType)}
                entries={byMeal[mealType]}
                onPressEntry={openEntry}
              />
            ))}

            <AppButton
              title={t('tracking.diary.viewSummary')}
              variant="outline"
              onPress={() => router.push('/(tracking)/nutrition-summary')}
            />

            <AppButton
              title={t('tracking.diary.addEntry')}
              onPress={() => router.push('/(tracking)/diary-entry')}
            />

            <View style={styles.note}>
              <AppText variant="bodyStrong" color={colors.text.secondary}>
                {t('tracking.diary.planVsActualTitle')}
              </AppText>
              <AppText variant="bodySmall" color={colors.text.secondary}>
                {t('tracking.diary.planVsActualBody')}
              </AppText>
            </View>
          </>
        ) : null}
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
  card: {
    backgroundColor: colors.background.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  energy: { gap: spacing.sm, paddingVertical: spacing.sm },
  energyValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  note: {
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.md,
  },
});
