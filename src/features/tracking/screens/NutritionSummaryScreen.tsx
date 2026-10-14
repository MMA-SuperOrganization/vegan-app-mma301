import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppButton,
  AppText,
  CustomHeader,
  NutritionTargetCard,
  ScreenWrapper,
} from '@/components';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import { MacroDonutChart, type MacroSlice } from '../components/MacroDonutChart';
import { TrackingQueryState } from '../components/TrackingQueryState';
import {
  useDiary,
  useDiarySummary,
  useTrackingTargets,
} from '../hooks/useTrackingApi';
import { useTrackingFormat } from '../hooks/useTrackingFormat';
import {
  diaryEntriesForDate,
  isLocalIsoDate,
  macroEnergyShares,
  mealCalorieTotals,
  toLocalIsoDate,
} from '../trackingState';

export function NutritionSummaryScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { formatLongDate, formatNumber, mealLabel } = useTrackingFormat();
  const today = toLocalIsoDate(new Date());
  // The day comes from the diary screen, which owns day selection.
  const date = isLocalIsoDate(params.date) ? params.date : today;
  const summary = useDiarySummary(date);
  const diary = useDiary(date);
  const profileTargets = useTrackingTargets();
  const nutrition = summary.data?.nutrition;
  const targets = summary.data?.dailyTargets;

  const diaryEntries = diary.data?.data ?? [];
  const meals = useMemo(
    () => mealCalorieTotals(diaryEntriesForDate(diaryEntries, date)),
    [diaryEntries, date]
  );
  const shares = nutrition ? macroEnergyShares(nutrition) : null;
  const ready = !summary.isLoading && !summary.isError && Boolean(nutrition);
  // An earlier day with nothing logged shows only "no data", like the diary.
  const isPastWithoutData = date !== today && (summary.data?.entryCount ?? 0) === 0;

  const slices: MacroSlice[] =
    shares && nutrition
      ? [
          {
            key: 'carbs',
            label: t('tracking.summary.carbs'),
            percent: shares.carbs,
            grams: t('tracking.summary.grams', {
              grams: formatNumber(nutrition.carbsG, 1),
            }),
          },
          {
            key: 'protein',
            label: t('tracking.summary.protein'),
            percent: shares.protein,
            grams: t('tracking.summary.grams', {
              grams: formatNumber(nutrition.proteinG, 1),
            }),
          },
          {
            key: 'fat',
            label: t('tracking.summary.fat'),
            percent: shares.fat,
            grams: t('tracking.summary.grams', {
              grams: formatNumber(nutrition.fatG, 1),
            }),
          },
        ]
      : [];
  const mealsLine = meals.length
    ? `${meals
        .map(({ mealType, kcal }) =>
          t('tracking.summary.mealPart', {
            meal: mealLabel(mealType),
            kcal: formatNumber(kcal),
          })
        )
        .join(' + ')} ${t('tracking.summary.mealTotal', {
        kcal: formatNumber(meals.reduce((sum, meal) => sum + meal.kcal, 0)),
      })}`
    : t('tracking.summary.mealsEmpty');

  return (
    <ScreenWrapper
      scrollable
      keyboardAvoiding={false}
      edges={['top', 'left', 'right', 'bottom']}
      contentContainerStyle={styles.screen}
      header={
        <CustomHeader
          title={t('tracking.summary.title')}
          showBack
          backFallbackHref="/(tracking)/food-diary"
        />
      }
    >
      <View style={styles.content}>
        <TrackingQueryState
          loading={summary.isLoading}
          error={summary.isError}
          onRetry={() => void summary.refetch()}
        />
        {ready && isPastWithoutData ? (
          <AppText color={colors.text.secondary} style={styles.noData}>
            {t('tracking.day.noData')}
          </AppText>
        ) : null}
        {ready && nutrition && !isPastWithoutData ? (
          <>
            <View style={styles.heading}>
              <AppText variant="heading3">{formatLongDate(date)}</AppText>
              <AppText color={colors.text.secondary}>
                {t('tracking.summary.entryCount', {
                  count: summary.data?.entryCount ?? 0,
                })}
              </AppText>
            </View>
            <View style={styles.grid}>
              <NutritionTargetCard
                label={t('tracking.summary.calories')}
                value={nutrition.caloriesKcal}
                target={targets?.caloriesKcal ?? profileTargets.energyKcal}
                unit="kcal"
                formatNumber={formatNumber}
                style={styles.card}
              />
              <NutritionTargetCard
                label={t('tracking.summary.protein')}
                value={nutrition.proteinG}
                target={targets?.proteinG ?? profileTargets.proteinG}
                unit="g"
                formatNumber={formatNumber}
                style={styles.card}
              />
              <NutritionTargetCard
                label={t('tracking.summary.carbs')}
                value={nutrition.carbsG}
                target={targets?.carbsG ?? profileTargets.carbsG}
                unit="g"
                formatNumber={formatNumber}
                style={styles.card}
              />
              <NutritionTargetCard
                label={t('tracking.summary.fat')}
                value={nutrition.fatG}
                target={targets?.fatG ?? profileTargets.fatG}
                unit="g"
                formatNumber={formatNumber}
                style={styles.card}
              />
              <NutritionTargetCard
                label={t('tracking.summary.fiber')}
                value={nutrition.fiberG}
                target={targets?.fiberG ?? profileTargets.fiberG}
                unit="g"
                formatNumber={formatNumber}
                style={styles.card}
              />
            </View>

            <View style={styles.section}>
              <AppText variant="heading4">
                {t('tracking.summary.macroTitle')}
              </AppText>
              {slices.length ? (
                <MacroDonutChart
                  slices={slices}
                  accessibilityLabel={t('tracking.summary.macroA11y', {
                    carbs: shares?.carbs ?? 0,
                    protein: shares?.protein ?? 0,
                    fat: shares?.fat ?? 0,
                  })}
                />
              ) : (
                <AppText variant="bodySmall" color={colors.text.secondary}>
                  {t('tracking.summary.macroEmpty')}
                </AppText>
              )}
            </View>

            <View style={styles.section}>
              <AppText variant="heading4">
                {t('tracking.summary.mealsTitle')}
              </AppText>
              <AppText color={colors.text.secondary}>{mealsLine}</AppText>
            </View>

            <AppText variant="bodySmall" color={colors.text.secondary}>
              {t('tracking.summary.description')}
            </AppText>

            <AppButton
              title={t('tracking.summary.editTargets')}
              onPress={() => router.push('/nutrition-profile')}
            />

            <View style={styles.note}>
              <AppText variant="bodyStrong" color={colors.text.secondary}>
                {t('tracking.summary.historyTitle')}
              </AppText>
              <AppText variant="bodySmall" color={colors.text.secondary}>
                {t('tracking.summary.historyBody')}
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
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  heading: { gap: spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: { flexGrow: 1, flexBasis: '46%' },
  section: { gap: spacing.md },
  noData: { textAlign: 'center', paddingVertical: spacing['4xl'] },
  note: {
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.md,
  },
});
