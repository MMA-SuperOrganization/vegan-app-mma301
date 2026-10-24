import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { isLocalIsoDate } from '@/features/tracking/trackingState';
import { Alert, StyleSheet, View } from 'react-native';
import {
  AppText,
  AppButton,
  CustomHeader,
  NutritionTargetCard,
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
import { colors, spacing } from '@/theme';
import { MealSection } from '../components/MealSection';
import { WeekDaySelector } from '../components/WeekDaySelector';
import { WeekNavigator } from '../components/WeekNavigator';
import { WeekPickerSheet } from '../components/WeekPickerSheet';
import { useMealPlan, useMealPlanActions } from '../hooks';
import {
  groupMealsByType,
  mealsForDate,
  nextServingCount,
  plannedNutrition,
  PLANNED_MEAL_TYPES,
  relativeWeekOffset,
  shiftWeekSelection,
  startOfWeek,
  toIsoDate,
} from '../mealPlanState';
import type { PlannedMeal } from '../types';

export function MealPlanScreen() {
  const params = useLocalSearchParams<{ planId?: string; date?: string }>();
  const router = useRouter();
  const { locale, t } = useTranslation();
  const { formatNumber, formatShortDate, mealLabel } = useTrackingFormat();
  const today = toIsoDate(new Date());
  const currentWeekStartDate = startOfWeek(new Date());
  const initialDate = isLocalIsoDate(params.date || '') ? params.date! : today;
  const [weekStartDate, setWeekStartDate] = useState(
    params.planId ? initialDate : startOfWeek(new Date(initialDate + 'T12:00:00'))
  );
  const [selectedDate, setSelectedDate] = useState(initialDate);
  useEffect(() => {
    if (!params.planId || !isLocalIsoDate(params.date || '')) return;
    setWeekStartDate(params.date!);
    setSelectedDate(params.date!);
    setConfirmActivation(false);
  }, [params.planId, params.date]);
  const [weekPickerVisible, setWeekPickerVisible] = useState(false);
  const [pickerMealType, setPickerMealType] = useState<MealType | null>(null);
  const [replacementMeal, setReplacementMeal] = useState<PlannedMeal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmActivation, setConfirmActivation] = useState(false);

  const planQuery = useMealPlan(weekStartDate, params.planId);
  const actions = useMealPlanActions(weekStartDate, params.planId);
  const targets = useTrackingTargets();
  const recipeOptions = useRecipeOptions(
    searchQuery,
    pickerMealType !== null || replacementMeal !== null
  );
  const plan = planQuery.data;
  const readOnly = Boolean(plan && !['draft', 'active'].includes(plan.status));
  const selectedMeals = mealsForDate(plan, selectedDate);
  const groupedMeals = groupMealsByType(selectedMeals);
  const visibleMealTypes = groupedMeals.snack.length
    ? [...PLANNED_MEAL_TYPES, 'snack' as const]
    : PLANNED_MEAL_TYPES;
  const nutrition = plannedNutrition(selectedMeals);
  const pending =
    actions.addMeal.isPending ||
    actions.updateMeal.isPending ||
    actions.removeMeal.isPending ||
    actions.activate.isPending ||
    actions.setStatus.isPending ||
    actions.clone.isPending;
  const saveError =
    actions.addMeal.isError ||
    actions.updateMeal.isError ||
    actions.removeMeal.isError ||
    actions.activate.isError ||
    actions.setStatus.isError ||
    actions.clone.isError;

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
    if (pending || readOnly) return;
    if (replacementMeal && plan) {
      actions.updateMeal.mutate(
        {
          planId: plan._id,
          mealId: replacementMeal.mealId,
          input: { recipeId },
        },
        {
          onSuccess: () => {
            setReplacementMeal(null);
            setSearchQuery('');
          },
        }
      );
      return;
    }
    if (!pickerMealType) return;
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
    if (!plan || pending || readOnly) return;
    const servings = nextServingCount(meal.servings, delta);
    if (servings === meal.servings) return;
    actions.updateMeal.mutate({
      planId: plan._id,
      mealId: meal.mealId,
      input: { servings },
    });
  };

  const confirmRemove = (meal: PlannedMeal) => {
    if (!plan || pending || readOnly) return;
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

  const moveToWeek = (weekDelta: number) => {
    router.setParams({ planId: undefined });
    const next = shiftWeekSelection(weekStartDate, selectedDate, weekDelta);
    setWeekStartDate(next.weekStartDate);
    setSelectedDate(next.selectedDate);
  };

  const returnToCurrentWeek = () => {
    router.setParams({ planId: undefined });
    setWeekStartDate(currentWeekStartDate);
    setSelectedDate(today);
  };

  const selectWeek = (nextWeekStartDate: string) => {
    router.setParams({ planId: undefined });
    const weekDelta = relativeWeekOffset(weekStartDate, nextWeekStartDate);
    const next = shiftWeekSelection(weekStartDate, selectedDate, weekDelta);
    setWeekStartDate(next.weekStartDate);
    setSelectedDate(next.selectedDate);
    setWeekPickerVisible(false);
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
          {params.planId && plan ? (
            <View style={{ gap: spacing.sm }}>
              <AppText variant="heading3">{plan.title}</AppText>
              <AppText>
                {plan.status === 'active'
                  ? locale === 'vi'
                    ? 'Thực đơn đang dùng'
                    : 'Active meal plan'
                  : locale === 'vi'
                    ? 'Thực đơn đã lưu'
                    : 'Saved meal plan'}
              </AppText>
              {plan.status === 'draft' ? (
                confirmActivation ? (
                  <>
                    <AppText>
                      {locale === 'vi'
                        ? 'Thực đơn đang dùng của cùng tuần sẽ được lưu trữ. Xác nhận dùng thực đơn này?'
                        : 'The current active plan for this week will be archived. Activate this plan?'}
                    </AppText>
                    <AppButton
                      title={
                        locale === 'vi'
                          ? 'Xác nhận dùng thực đơn'
                          : 'Confirm activation'
                      }
                      disabled={pending}
                      loading={actions.activate.isPending}
                      onPress={() =>
                        actions.activate.mutate(plan._id, {
                          onSuccess: () => setConfirmActivation(false),
                        })
                      }
                    />
                    <AppButton
                      title={locale === 'vi' ? 'Hủy' : 'Cancel'}
                      variant="ghost"
                      disabled={pending}
                      onPress={() => setConfirmActivation(false)}
                    />
                  </>
                ) : (
                  <AppButton
                    title={
                      locale === 'vi' ? 'Dùng thực đơn này' : 'Activate this plan'
                    }
                    disabled={pending}
                    onPress={() => setConfirmActivation(true)}
                  />
                )
              ) : null}
              {plan.status === 'active' ? (
                <AppButton
                  title={locale === 'vi' ? 'Đánh dấu hoàn thành' : 'Mark completed'}
                  variant="outline"
                  disabled={pending}
                  loading={actions.setStatus.isPending}
                  onPress={() =>
                    Alert.alert(
                      locale === 'vi'
                        ? 'Hoàn thành thực đơn?'
                        : 'Complete this plan?',
                      locale === 'vi'
                        ? 'Thực đơn sẽ chuyển sang chỉ đọc.'
                        : 'The plan will become read-only.',
                      [
                        {
                          text: locale === 'vi' ? 'Hủy' : 'Cancel',
                          style: 'cancel',
                        },
                        {
                          text: locale === 'vi' ? 'Hoàn thành' : 'Complete',
                          onPress: () =>
                            actions.setStatus.mutate({
                              id: plan._id,
                              status: 'completed',
                            }),
                        },
                      ]
                    )
                  }
                />
              ) : null}
              {['draft', 'active'].includes(plan.status) ? (
                <AppButton
                  title={locale === 'vi' ? 'Lưu trữ thực đơn' : 'Archive plan'}
                  variant="ghost"
                  disabled={pending}
                  onPress={() =>
                    actions.setStatus.mutate({ id: plan._id, status: 'archived' })
                  }
                />
              ) : null}
              <AppButton
                title={
                  locale === 'vi' ? 'Nhân bản sang tuần sau' : 'Clone to next week'
                }
                variant="outline"
                disabled={pending}
                loading={actions.clone.isPending}
                onPress={() => {
                  const targetWeek = shiftWeekSelection(
                    plan.weekStartDate,
                    plan.weekStartDate,
                    1
                  ).weekStartDate;
                  actions.clone.mutate(
                    { id: plan._id, targetWeek, title: plan.title },
                    {
                      onSuccess: (copy) =>
                        router.replace({
                          pathname: '/(tabs)/meal-plan',
                          params: { planId: copy._id, date: copy.weekStartDate },
                        }),
                    }
                  );
                }}
              />
            </View>
          ) : null}
          <WeekNavigator
            weekStartDate={weekStartDate}
            currentWeekStartDate={currentWeekStartDate}
            disabled={pending}
            onPrevious={() => moveToWeek(-1)}
            onNext={() => moveToWeek(1)}
            onToday={returnToCurrentWeek}
            onOpenPicker={() => setWeekPickerVisible(true)}
          />

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
                <AppText variant="heading4">
                  {t('mealPlan.nutritionSummary')}
                </AppText>
                <View style={styles.nutritionGrid}>
                  <NutritionTargetCard
                    label={t('mealPlan.calories')}
                    value={nutrition.caloriesKcal}
                    target={targets.energyKcal}
                    unit="kcal"
                    formatNumber={formatNumber}
                    style={styles.nutritionCard}
                  />
                  <NutritionTargetCard
                    label={t('mealPlan.protein')}
                    value={nutrition.proteinG}
                    target={targets.proteinG}
                    unit="g"
                    formatNumber={formatNumber}
                    style={styles.nutritionCard}
                  />
                  <NutritionTargetCard
                    label={t('mealPlan.carbs')}
                    value={nutrition.carbsG}
                    target={targets.carbsG}
                    unit="g"
                    formatNumber={formatNumber}
                    style={styles.nutritionCard}
                  />
                  <NutritionTargetCard
                    label={t('mealPlan.fat')}
                    value={nutrition.fatG}
                    target={targets.fatG}
                    unit="g"
                    formatNumber={formatNumber}
                    style={styles.nutritionCard}
                  />
                </View>
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
                  pending={pending || readOnly}
                  formatNumber={formatNumber}
                  onAdd={() => setPickerMealType(mealType)}
                  onReplace={(meal) => setReplacementMeal(meal)}
                  onChangeServings={changeServings}
                  onRemove={confirmRemove}
                />
              ))}
            </>
          ) : null}
        </View>
      </ScreenWrapper>

      <SearchPickerSheet
        visible={pickerMealType !== null || replacementMeal !== null}
        title={
          replacementMeal
            ? t('mealPlan.replaceDishTitle', {
                name: replacementMeal.recipeSnapshot.title,
              })
            : t('mealPlan.addDishTitle', {
                meal: pickerMealType ? mealLabel(pickerMealType) : '',
              })
        }
        searchPlaceholder={t('mealPlan.searchPlaceholder')}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        items={pickerItems}
        isLoading={recipeOptions.isLoading || pending}
        isError={recipeOptions.isError}
        onRetry={() => void recipeOptions.refetch()}
        onSelect={addRecipe}
        onClose={() => {
          if (pending) return;
          setPickerMealType(null);
          setReplacementMeal(null);
          setSearchQuery('');
        }}
      />

      <WeekPickerSheet
        visible={weekPickerVisible}
        selectedWeekStartDate={weekStartDate}
        currentWeekStartDate={currentWeekStartDate}
        onSelect={selectWeek}
        onClose={() => setWeekPickerVisible(false)}
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
  dayHeading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  calorieCard: {
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  nutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  nutritionCard: { flexGrow: 1, flexBasis: '46%' },
});
