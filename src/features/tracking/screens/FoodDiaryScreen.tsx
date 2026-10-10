import { useMemo, useState } from 'react';
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
  const [editing, setEditing] = useState(false);

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
    >
      <CustomHeader
        title={t('tracking.foodDiary.title')}
        showBack
        backFallbackHref="/(tabs)/diary"
      />
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

            <View style={styles.card}>
              <AppText variant="heading4">{t('tracking.diary.energyTitle')}</AppText>
              <AppText color={colors.text.secondary}>
                {targetKcal
                  ? t('tracking.hub.energyValue', {
                      consumed: formatNumber(consumedKcal),
                      target: formatNumber(targetKcal),
                    })
                  : t('tracking.hub.energyValueNoTarget', {
                      consumed: formatNumber(consumedKcal),
                    })}
              </AppText>
              {targetKcal ? (
                <ProgressBar
                  value={consumedKcal}
                  max={targetKcal}
                  accessibilityLabel={t('tracking.diary.energyTitle')}
                />
              ) : null}
            </View>

            {editing ? (
              <AppText variant="bodySmall" color={colors.primary[700]}>
                {t('tracking.diary.editHint')}
              </AppText>
            ) : null}

            {mealTypes.map((mealType) => (
              <DiaryMealCard
                key={mealType}
                title={mealLabel(mealType)}
                entries={byMeal[mealType]}
                editing={editing}
                onPressEntry={openEntry}
              />
            ))}

            <AppButton
              title={
                editing
                  ? t('tracking.diary.doneEditing')
                  : t('tracking.diary.editEntries')
              }
              variant="outline"
              disabled={!editing && todayEntries.length === 0}
              onPress={() => setEditing((value) => !value)}
            />
            <AppButton
              title={t('tracking.diary.viewSummary')}
              variant="outline"
              onPress={() => router.push('/(tracking)/nutrition-summary')}
            />

            <View style={styles.card}>
              <AppText variant="heading4">
                {t('tracking.diary.planVsActualTitle')}
              </AppText>
              <AppText variant="bodySmall" color={colors.text.secondary}>
                {t('tracking.diary.planVsActualBody')}
              </AppText>
            </View>

            <AppButton
              title={t('tracking.diary.addEntry')}
              onPress={() => router.push('/(tracking)/diary-entry')}
            />
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
});
