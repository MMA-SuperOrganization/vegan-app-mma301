import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  AppButton,
  AppInput,
  AppText,
  CustomHeader,
  EmptyState,
  ScreenWrapper,
  Toggle,
} from '@/components';
import { WeekNavigator } from '@/features/meal-plan/components/WeekNavigator';
import { WeekDaySelector } from '@/features/meal-plan/components/WeekDaySelector';
import { WeekPickerSheet } from '@/features/meal-plan/components/WeekPickerSheet';
import { useWeekMealPlans } from '@/features/meal-plan/hooks';
import { selectEditablePlan } from '@/features/meal-plan/mealPlanState';
import { SelectionField } from '@/features/onboarding/components/SelectionField';
import {
  relativeWeekOffset,
  shiftWeekSelection,
  startOfWeek,
  toIsoDate,
} from '@/features/meal-plan/mealPlanState';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing, webLayout } from '@/theme';
import { GroceryQueryState } from '../components/GroceryQueryState';
import { GroceryGenerationScopeSelector } from '../components/GroceryGenerationScopeSelector';
import { useGroceryActions } from '../hooks';
import type { GroceryGenerationInput, GroceryGenerationScope } from '../types';

export function GroceryGenerateScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [scope, setScope] = useState<GroceryGenerationScope>('day');
  const [subtractPantry, setSubtractPantry] = useState(false);
  const today = toIsoDate(new Date());
  const currentWeekStartDate = startOfWeek(new Date());
  const [weekStartDate, setWeekStartDate] = useState(currentWeekStartDate);
  const [selectedDate, setSelectedDate] = useState(today);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [name, setName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<{
    week: string;
    id: string;
  } | null>(null);
  const planQuery = useWeekMealPlans(weekStartDate);
  const actions = useGroceryActions();
  const plans = planQuery.data?.data ?? [];
  const plan =
    (selectedPlan?.week === weekStartDate
      ? plans.find((candidate) => candidate._id === selectedPlan.id)
      : null) ??
    selectEditablePlan(plans) ??
    plans[0] ??
    null;
  const mealCounts = useMemo(
    () =>
      Object.fromEntries(
        (plan?.days ?? []).map((day) => [day.date, day.meals.length])
      ),
    [plan?.days]
  );
  const dishCount = useMemo(
    () =>
      scope === 'day'
        ? (mealCounts[selectedDate] ?? 0)
        : Object.values(mealCounts).reduce((total, count) => total + count, 0),
    [mealCounts, scope, selectedDate]
  );

  const moveToWeek = (weekDelta: number) => {
    const next = shiftWeekSelection(weekStartDate, selectedDate, weekDelta);
    setWeekStartDate(next.weekStartDate);
    setSelectedDate(next.selectedDate);
  };

  const selectWeek = (nextWeekStartDate: string) => {
    const weekDelta = relativeWeekOffset(weekStartDate, nextWeekStartDate);
    const next = shiftWeekSelection(weekStartDate, selectedDate, weekDelta);
    setWeekStartDate(next.weekStartDate);
    setSelectedDate(next.selectedDate);
    setPickerVisible(false);
  };

  const generate = async () => {
    if (!plan || dishCount === 0 || actions.generate.isPending) return;
    const commonInput = {
      ...(name.trim() ? { name: name.trim() } : {}),
      subtractPantry,
    };
    const input: GroceryGenerationInput =
      scope === 'day'
        ? { ...commonInput, scope, date: selectedDate }
        : { ...commonInput, scope };
    try {
      const list = await actions.generate.mutateAsync({
        planId: plan._id,
        input,
      });
      router.replace({ pathname: '/(grocery)/[id]', params: { id: list._id } });
    } catch {
      // Mutation state renders the retryable error below.
    }
  };

  return (
    <>
      <ScreenWrapper
        scrollable
        webMaxWidth={webLayout.formMaxWidth}
        contentContainerStyle={styles.screen}
        header={
          <CustomHeader
            title={t('grocery.generateTitle')}
            showBack
            backFallbackHref="/(tabs)/grocery"
          />
        }
      >
        <View style={styles.content}>
          <AppText color={colors.text.secondary}>
            {t('grocery.generateDescription')}
          </AppText>
          <GroceryGenerationScopeSelector
            value={scope}
            disabled={actions.generate.isPending}
            onChange={setScope}
          />
          <WeekNavigator
            weekStartDate={weekStartDate}
            currentWeekStartDate={currentWeekStartDate}
            disabled={actions.generate.isPending}
            onPrevious={() => moveToWeek(-1)}
            onNext={() => moveToWeek(1)}
            onToday={() => {
              setWeekStartDate(currentWeekStartDate);
              setSelectedDate(today);
            }}
            onOpenPicker={() => setPickerVisible(true)}
          />
          <GroceryQueryState
            loading={planQuery.isLoading}
            error={planQuery.isError}
            onRetry={() => void planQuery.refetch()}
          />
          {plans.length ? (
            <SelectionField
              label={locale === 'vi' ? 'Chọn thực đơn' : 'Choose meal plan'}
              placeholder=""
              value={plan?._id ?? null}
              options={plans.map((candidate) => ({
                value: candidate._id,
                label:
                  candidate.title +
                  ' · ' +
                  (locale === 'vi'
                    ? {
                        draft: 'Bản nháp',
                        active: 'Đang dùng',
                        archived: 'Đã lưu trữ',
                        completed: 'Đã hoàn tất',
                      }[candidate.status]
                    : candidate.status),
              }))}
              onChange={(id) => {
                if (!actions.generate.isPending)
                  setSelectedPlan({ week: weekStartDate, id });
              }}
            />
          ) : null}
          {!planQuery.isLoading && !planQuery.isError && !plan ? (
            <EmptyState
              title={t('grocery.generateEmptyTitle')}
              description={t('grocery.generateEmptyDescription')}
            />
          ) : null}
          {plan ? (
            <View style={styles.planCard}>
              <AppText variant="heading4">{plan.title}</AppText>
              {scope === 'day' ? (
                <>
                  <AppText variant="bodyStrong">
                    {t('grocery.generateChooseDay')}
                  </AppText>
                  <WeekDaySelector
                    weekStartDate={weekStartDate}
                    selectedDate={selectedDate}
                    locale={locale}
                    mealCounts={mealCounts}
                    onSelect={setSelectedDate}
                  />
                </>
              ) : null}
              <Toggle
                label={
                  locale === 'vi'
                    ? 'Trừ nguyên liệu đang có trong kho'
                    : 'Subtract ingredients available in pantry'
                }
                value={subtractPantry}
                onValueChange={setSubtractPantry}
                disabled={actions.generate.isPending}
              />
              <AppText color={colors.text.secondary}>
                {t(
                  scope === 'day'
                    ? 'grocery.generateDayDishCount'
                    : 'grocery.generateWeekDishCount',
                  { count: dishCount }
                )}
              </AppText>
              {dishCount > 0 ? (
                <AppInput
                  label={t('grocery.generateName')}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('grocery.generateNamePlaceholder')}
                  maxLength={200}
                />
              ) : (
                <AppText color={colors.text.secondary}>
                  {t('grocery.generateNoMeals')}
                </AppText>
              )}
            </View>
          ) : null}
          {actions.generate.isError ? (
            <AppText color={colors.status.danger}>
              {t('grocery.generateError')}
            </AppText>
          ) : null}
        </View>
        <View style={styles.footer}>
          <AppButton
            title={t('grocery.generateAction')}
            loading={actions.generate.isPending}
            disabled={!plan || dishCount === 0}
            onPress={() => void generate()}
          />
        </View>
      </ScreenWrapper>
      <WeekPickerSheet
        visible={pickerVisible}
        selectedWeekStartDate={weekStartDate}
        currentWeekStartDate={currentWeekStartDate}
        onSelect={selectWeek}
        onClose={() => setPickerVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, paddingBottom: spacing['4xl'] },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  planCard: {
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
});
