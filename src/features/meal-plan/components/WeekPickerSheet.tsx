import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText, BottomSheet } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import {
  addCalendarDays,
  monthStart,
  weekDates,
  weeksIntersectingMonth,
} from '../mealPlanState';
import { WheelPicker } from './WheelPicker';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 101 }, (_, index) => currentYear - 50 + index);

const yearOptions = years.map((year) => ({
  value: year,
  label: String(year),
}));

export function WeekPickerSheet({
  visible,
  selectedWeekStartDate,
  currentWeekStartDate,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selectedWeekStartDate: string;
  currentWeekStartDate: string;
  onSelect: (weekStartDate: string) => void;
  onClose: () => void;
}) {
  const { locale, t } = useTranslation();
  const [visibleMonth, setVisibleMonth] = useState(() =>
    monthStart(selectedWeekStartDate)
  );
  const localeTag = locale === 'vi' ? 'vi-VN' : 'en-US';
  const visibleYear = Number(visibleMonth.slice(0, 4));
  const visibleMonthIndex = Number(visibleMonth.slice(5, 7)) - 1;

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        value: index,
        label: new Intl.DateTimeFormat(localeTag, { month: 'long' }).format(
          new Date(2020, index, 1, 12)
        ),
      })),
    [localeTag]
  );
  const monthLabel = new Intl.DateTimeFormat(localeTag, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${visibleMonth}T12:00:00`));
  const rangeFormatter = new Intl.DateTimeFormat(localeTag, {
    day: '2-digit',
    month: '2-digit',
  });
  const dayFormatter = new Intl.DateTimeFormat(localeTag, { weekday: 'short' });
  const formatDate = (date: string) =>
    rangeFormatter.format(new Date(`${date}T12:00:00`));

  useEffect(() => {
    if (visible) setVisibleMonth(monthStart(selectedWeekStartDate));
  }, [selectedWeekStartDate, visible]);

  const selectYear = (year: number) => {
    setVisibleMonth(
      `${year}-${String(visibleMonthIndex + 1).padStart(2, '0')}-01`
    );
  };
  const selectMonth = (monthIndex: number) => {
    setVisibleMonth(`${visibleYear}-${String(monthIndex + 1).padStart(2, '0')}-01`);
  };

  return (
    <BottomSheet
      visible={visible}
      title={t('mealPlan.weekPicker.title')}
      onClose={onClose}
      tall
    >
      <AppText variant="bodySmall" color={colors.text.secondary}>
        {t('mealPlan.weekPicker.description')}
      </AppText>

      <View style={styles.wheelGroup}>
        <WheelPicker
          label={t('mealPlan.weekPicker.year')}
          options={yearOptions}
          selectedValue={visibleYear}
          onSelect={selectYear}
        />
        <WheelPicker
          label={t('mealPlan.weekPicker.month')}
          options={monthOptions}
          selectedValue={visibleMonthIndex}
          onSelect={selectMonth}
        />
      </View>

      <View style={styles.weekSection}>
        <AppText variant="heading4">
          {t('mealPlan.weekPicker.weeksInMonth', { month: monthLabel })}
        </AppText>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.weekList}
        >
          {weeksIntersectingMonth(visibleMonth).map((weekStartDate) => {
            const selected = weekStartDate === selectedWeekStartDate;
            const current = weekStartDate === currentWeekStartDate;
            const range = t('mealPlan.weekRange', {
              start: formatDate(weekStartDate),
              end: formatDate(addCalendarDays(weekStartDate, 6)),
            });
            return (
              <Pressable
                key={weekStartDate}
                accessibilityRole="button"
                accessibilityLabel={t('mealPlan.weekPicker.optionA11y', { range })}
                accessibilityState={{ selected }}
                onPress={() => onSelect(weekStartDate)}
                style={({ pressed }) => [
                  styles.weekOption,
                  current && styles.currentWeek,
                  selected && styles.selectedWeek,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.weekHeading}>
                  <AppText
                    variant="bodyStrong"
                    color={selected ? colors.text.inverse : colors.text.primary}
                    style={styles.weekTitle}
                  >
                    {t('mealPlan.weekPicker.option', { range })}
                  </AppText>
                  {current ? (
                    <AppText
                      variant="bodySmall"
                      color={selected ? colors.text.inverse : colors.primary[700]}
                    >
                      {t('mealPlan.week.current')}
                    </AppText>
                  ) : null}
                  {selected ? (
                    <AppText variant="heading4" color={colors.text.inverse}>
                      ✓
                    </AppText>
                  ) : null}
                </View>
                <View style={styles.days}>
                  {weekDates(weekStartDate).map((date) => {
                    const value = new Date(`${date}T12:00:00`);
                    const outsideMonth = date.slice(5, 7) !== visibleMonth.slice(5, 7);
                    return (
                      <View
                        key={date}
                        style={[
                          styles.day,
                          selected && styles.selectedDay,
                          outsideMonth && styles.outsideDay,
                        ]}
                      >
                        <AppText
                          variant="bodySmall"
                          color={
                            selected ? colors.text.inverse : colors.text.secondary
                          }
                          numberOfLines={1}
                        >
                          {dayFormatter.format(value)}
                        </AppText>
                        <AppText
                          variant="bodyStrong"
                          color={selected ? colors.text.inverse : colors.text.primary}
                        >
                          {value.getDate()}
                        </AppText>
                      </View>
                    );
                  })}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  wheelGroup: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  weekSection: { flex: 1, gap: spacing.sm },
  weekList: { gap: spacing.sm, paddingBottom: spacing.md },
  weekOption: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    backgroundColor: colors.background.base,
  },
  currentWeek: { borderColor: colors.primary[300] },
  selectedWeek: {
    borderColor: colors.primary[700],
    backgroundColor: colors.primary[700],
  },
  weekHeading: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  weekTitle: { flex: 1 },
  days: { flexDirection: 'row', gap: 3 },
  day: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.background.selected,
  },
  selectedDay: { backgroundColor: 'rgba(255,255,255,0.12)' },
  outsideDay: { opacity: 0.45 },
  pressed: { opacity: 0.7 },
});
