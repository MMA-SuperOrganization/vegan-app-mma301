import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import {
  AppText,
  CustomHeader,
  ProgressBar,
  SearchPickerSheet,
  ScreenWrapper,
  type PickerItem,
} from '@/components';
import { TrackingQueryState } from '@/features/tracking/components/TrackingQueryState';
import { useRecipeOptions } from '@/features/tracking/hooks/usePickerOptions';
import { useTrackingFormat } from '@/features/tracking/hooks/useTrackingFormat';
import { useTrackingTargets } from '@/features/tracking/hooks/useTrackingApi';
import type { MealType } from '@/features/tracking/types';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { MealSection } from '../components/MealSection';
import { WeekDaySelector } from '../components/WeekDaySelector';
import { useMealPlan, useMealPlanActions } from '../hooks';
import {
  groupMealsByType,
  addCalendarDays,
  mealsForDate,
  nextServingCount,
  plannedCalories,
  PLANNED_MEAL_TYPES,
  startOfWeek,
  toIsoDate,
} from '../mealPlanState';
import type { PlannedMeal } from '../types';

export function MealPlanScreen() {
  const { locale, t } = useTranslation();
  const { formatNumber, formatShortDate, mealLabel } = useTrackingFormat();
  const today = toIsoDate(new Date());
  const weekStartDate = startOfWeek(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [pickerMealType, setPickerMealType] = useState<MealType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const planQuery = useMealPlan(weekStartDate);
  const actions = useMealPlanActions(weekStartDate);
  const targets = useTrackingTargets();
  const recipeOptions = useRecipeOptions(searchQuery, pickerMealType !== null);
  const plan = planQuery.data;
  const selectedMeals = mealsForDate(plan, selectedDate);
  const groupedMeals = groupMealsByType(selectedMeals);
  const visibleMealTypes = groupedMeals.snack.length
    ? [...PLANNED_MEAL_TYPES, 'snack' as const]
    : PLANNED_MEAL_TYPES;
  const totalCalories = plannedCalories(selectedMeals);
  const calorieTarget = targets.energyKcal;
  const pending =
    actions.addMeal.isPending ||
    actions.updateMeal.isPending ||
    actions.removeMeal.isPending;
  const saveError =
    actions.addMeal.isError ||
    actions.updateMeal.isError ||
    actions.removeMeal.isError;

  const mealCounts = useMemo(
    () =>
      Object.fromEntries(
        (plan?.days ?? []).map((day) => [day.date, day.meals.length])
      ),
    [plan?.days]
  );

  const pickerItems: PickerItem[] = (recipeOptions.data?.data ?? []).map(
    (recipe) => ({
      id: recipe._id,
      title: recipe.title ?? t('mealPlan.unnamedRecipe'),
      subtitle: recipe.nutritionPerServing?.caloriesKcal
        ? t('mealPlan.recipeCalories', {
            kcal: formatNumber(recipe.nutritionPerServing.caloriesKcal),
          })
        : undefined,
      imageUrl: recipe.coverImageUrl,
    })
  );

  const addRecipe = (recipeId: string) => {
    if (!pickerMealType || pending) return;
    actions.addMeal.mutate(
      {
        planId: plan?._id,
        input: { date: selectedDate, type: pickerMealType, recipeId, servings: 1 },
      },
      {
        onSuccess: () => {
          setPickerMealType(null);
          setSearchQuery('');
        },
      }
    );
  };

  const changeServings = (meal: PlannedMeal, delta: number) => {
    if (!plan) return;
    const servings = nextServingCount(meal.servings, delta);
    if (servings === meal.servings) return;
    actions.updateMeal.mutate({
      planId: plan._id,
      mealId: meal.mealId,
      input: { servings },
    });
  };

  const confirmRemove = (meal: PlannedMeal) => {
    if (!plan) return;
    Alert.alert(
      t('mealPlan.removeConfirmTitle'),
      t('mealPlan.removeConfirmBody', { name: meal.recipeSnapshot.title }),
      [
        { text: t('mealPlan.cancel'), style: 'cancel' },
        {
          text: t('mealPlan.removeDish'),
          style: 'destructive',
          onPress: () =>
            actions.removeMeal.mutate({ planId: plan._id, mealId: meal.mealId }),
        },
      ]
    );
  };

  return (
    <>
      <ScreenWrapper
        scrollable
        keyboardAvoiding={false}
        contentContainerStyle={styles.screen}
        header={<CustomHeader title={t('mealPlan.title')} showBack={false} />}
      >
        <View style={styles.content}>
          <View style={styles.intro}>
            <AppText variant="heading3">{t('mealPlan.weekTitle')}</AppText>
            <AppText variant="bodySmall" color={colors.text.secondary}>
              {t('mealPlan.weekRange', {
                start: formatShortDate(weekStartDate),
                end: formatShortDate(addCalendarDays(weekStartDate, 6)),
              })}
            </AppText>
          </View>

          <WeekDaySelector
            weekStartDate={weekStartDate}
            selectedDate={selectedDate}
            locale={locale}
            mealCounts={mealCounts}
            onSelect={setSelectedDate}
          />

          <TrackingQueryState
            loading={planQuery.isLoading}
            error={planQuery.isError}
            onRetry={() => void planQuery.refetch()}
          />

          {!planQuery.isLoading && !planQuery.isError ? (
            <>
              <View style={styles.dayHeading}>
                <AppText variant="heading3">{formatShortDate(selectedDate)}</AppText>
                <AppText variant="bodySmall" color={colors.text.secondary}>
                  {t('mealPlan.dishCount', { count: selectedMeals.length })}
                </AppText>
              </View>

              <View style={styles.calorieCard}>
                <View style={styles.calorieHeader}>
                  <View style={styles.calorieCopy}>
                    <AppText variant="heading4">
                      {t('mealPlan.calorieProgress')}
                    </AppText>
                    <AppText variant="bodySmall" color={colors.text.secondary}>
                      {calorieTarget
                        ? t('mealPlan.calorieValue', {
                            current: formatNumber(totalCalories),
                            target: formatNumber(calorieTarget),
                          })
                        : t('mealPlan.calorieValueNoTarget', {
                            current: formatNumber(totalCalories),
                          })}
                    </AppText>
                  </View>
                  {calorieTarget ? (
                    <AppText variant="bodyStrong" color={colors.primary[700]}>
                      {formatNumber((totalCalories / calorieTarget) * 100)}%
                    </AppText>
                  ) : null}
                </View>
                {calorieTarget ? (
                  <ProgressBar
                    value={totalCalories}
                    max={calorieTarget}
                    accessibilityLabel={t('mealPlan.calorieProgress')}
                  />
                ) : null}
              </View>

              {saveError ? (
                <AppText color={colors.status.danger}>
                  {t('mealPlan.saveError')}
                </AppText>
              ) : null}

              {visibleMealTypes.map((mealType) => (
                <MealSection
                  key={mealType}
                  title={mealLabel(mealType)}
                  meals={groupedMeals[mealType]}
                  pending={pending}
                  formatNumber={formatNumber}
                  onAdd={() => setPickerMealType(mealType)}
                  onChangeServings={changeServings}
                  onRemove={confirmRemove}
                />
              ))}
            </>
          ) : null}
        </View>
      </ScreenWrapper>

      <SearchPickerSheet
        visible={pickerMealType !== null}
        title={t('mealPlan.addDishTitle', {
          meal: pickerMealType ? mealLabel(pickerMealType) : '',
        })}
        searchPlaceholder={t('mealPlan.searchPlaceholder')}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        items={pickerItems}
        isLoading={recipeOptions.isLoading || actions.addMeal.isPending}
        isError={recipeOptions.isError}
        onRetry={() => void recipeOptions.refetch()}
        onSelect={addRecipe}
        onClose={() => {
          if (actions.addMeal.isPending) return;
          setPickerMealType(null);
          setSearchQuery('');
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: spacing['4xl'] },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  intro: { gap: spacing.xs },
  dayHeading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  calorieCard: {
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.background.selected,
  },
  calorieHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  calorieCopy: { flex: 1, gap: spacing.xs },
});
