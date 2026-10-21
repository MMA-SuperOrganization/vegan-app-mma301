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
import { WeekPickerSheet } from '@/features/meal-plan/components/WeekPickerSheet';
import { useMealPlan } from '@/features/meal-plan/hooks';
import {
  relativeWeekOffset,
  shiftWeekSelection,
  startOfWeek,
  toIsoDate,
} from '@/features/meal-plan/mealPlanState';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { GroceryQueryState } from '../components/GroceryQueryState';
import { useGroceryActions } from '../hooks';
import { groceryDateRange } from '../groceryState';
import { addDays, formatDayMonthYear } from '@/features/tracking/trackingState';

export function GroceryGenerateScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [subtractPantry, setSubtractPantry] = useState(false);
  const today = toIsoDate(new Date());
  const currentWeekStartDate = startOfWeek(new Date());
  const [weekStartDate, setWeekStartDate] = useState(currentWeekStartDate);
  const [selectedDate, setSelectedDate] = useState(today);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [name, setName] = useState('');
  const [rangeDraft, setRangeDraft] = useState<{
    week: string;
    from: string;
    to: string;
  } | null>(null);
  const fromText =
    rangeDraft?.week === weekStartDate
      ? rangeDraft.from
      : formatDayMonthYear(weekStartDate);
  const toText =
    rangeDraft?.week === weekStartDate
      ? rangeDraft.to
      : formatDayMonthYear(addDays(weekStartDate, 6));
  const range = groceryDateRange(fromText, toText, weekStartDate);
  const planQuery = useMealPlan(weekStartDate);
  const actions = useGroceryActions();
  const plan = planQuery.data;
  const dishCount = useMemo(
    () =>
      range
        ? (plan?.days.reduce(
            (total, day) =>
              total +
              (day.date >= range.from && day.date <= range.to
                ? day.meals.length
                : 0),
            0
          ) ?? 0)
        : 0,
    [plan?.days, range?.from, range?.to]
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
    if (!plan || !range || dishCount === 0 || actions.generate.isPending) return;
    try {
      const list = await actions.generate.mutateAsync({
        planId: plan._id,
        name: name.trim() || undefined,
        range,
        subtractPantry,
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
          {!planQuery.isLoading && !planQuery.isError && !plan ? (
            <EmptyState
              title={t('grocery.generateEmptyTitle')}
              description={t('grocery.generateEmptyDescription')}
            />
          ) : null}
          {plan ? (
            <View style={styles.planCard}>
              <AppText variant="heading4">{plan.title}</AppText>
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
              <AppInput
                label={t('grocery.fromDate')}
                value={fromText}
                placeholder="DD/MM/YYYY"
                editable={!actions.generate.isPending}
                onChangeText={(from) =>
                  setRangeDraft({ week: weekStartDate, from, to: toText })
                }
              />
              <AppInput
                label={t('grocery.toDate')}
                value={toText}
                placeholder="DD/MM/YYYY"
                editable={!actions.generate.isPending}
                onChangeText={(to) =>
                  setRangeDraft({ week: weekStartDate, from: fromText, to })
                }
              />
              {!range ? (
                <AppText color={colors.status.danger}>
                  {t('grocery.dateRangeError')}
                </AppText>
              ) : null}
              <AppText color={colors.text.secondary}>
                {t('grocery.generateDishCount', { count: dishCount })}
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
            disabled={!plan || !range || dishCount === 0}
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
