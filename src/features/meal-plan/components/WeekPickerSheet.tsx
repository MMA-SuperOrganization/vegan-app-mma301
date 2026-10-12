import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText, BottomSheet } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import {
  addCalendarDays,
  monthStart,
  weekDates,
  weeksIntersectingMonth,
} from '../mealPlanState';

const YEAR_ITEM_WIDTH = 84;
const MONTH_ITEM_WIDTH = 96;
const ITEM_GAP = spacing.sm;
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 101 }, (_, index) => currentYear - 50 + index);

type MonthOption = {
  index: number;
  label: string;
};

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
  const yearList = useRef<FlatList<number>>(null);
  const monthList = useRef<FlatList<MonthOption>>(null);
  const localeTag = locale === 'vi' ? 'vi-VN' : 'en-US';
  const visibleYear = Number(visibleMonth.slice(0, 4));
  const visibleMonthIndex = Number(visibleMonth.slice(5, 7)) - 1;

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        index,
        label: new Intl.DateTimeFormat(localeTag, { month: 'short' }).format(
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

  useEffect(() => {
    if (!visible) return;
    const frame = requestAnimationFrame(() => {
      const yearIndex = years.indexOf(visibleYear);
      if (yearIndex >= 0) {
        yearList.current?.scrollToIndex({ index: yearIndex, viewPosition: 0.5 });
      }
      monthList.current?.scrollToIndex({
        index: visibleMonthIndex,
        viewPosition: 0.5,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [visible, visibleMonthIndex, visibleYear]);

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

      <PickerRow label={t('mealPlan.weekPicker.year')}>
        <FlatList
          ref={yearList}
          horizontal
          data={years}
          keyExtractor={(year) => String(year)}
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: YEAR_ITEM_WIDTH + ITEM_GAP,
            offset: (YEAR_ITEM_WIDTH + ITEM_GAP) * index,
            index,
          })}
          ItemSeparatorComponent={ItemSeparator}
          renderItem={({ item }) => (
            <PickerChip
              label={String(item)}
              selected={item === visibleYear}
              width={YEAR_ITEM_WIDTH}
              onPress={() => selectYear(item)}
            />
          )}
        />
      </PickerRow>

      <PickerRow label={t('mealPlan.weekPicker.month')}>
        <FlatList
          ref={monthList}
          horizontal
          data={monthOptions}
          keyExtractor={({ index }) => String(index)}
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: MONTH_ITEM_WIDTH + ITEM_GAP,
            offset: (MONTH_ITEM_WIDTH + ITEM_GAP) * index,
            index,
          })}
          ItemSeparatorComponent={ItemSeparator}
          renderItem={({ item }) => (
            <PickerChip
              label={item.label}
              selected={item.index === visibleMonthIndex}
              width={MONTH_ITEM_WIDTH}
              onPress={() => selectMonth(item.index)}
            />
          )}
        />
      </PickerRow>

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

function PickerRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.pickerRow}>
      <AppText variant="bodyStrong">{label}</AppText>
      {children}
    </View>
  );
}

function PickerChip({
  label,
  selected,
  width,
  onPress,
}: {
  label: string;
  selected: boolean;
  width: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pickerChip,
        { width },
        selected && styles.selectedChip,
        pressed && styles.pressed,
      ]}
    >
      <AppText
        variant="bodyStrong"
        color={selected ? colors.text.inverse : colors.text.primary}
        numberOfLines={1}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function ItemSeparator() {
  return <View style={styles.itemSeparator} />;
}

const styles = StyleSheet.create({
  pickerRow: { gap: spacing.sm },
  pickerChip: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.full,
    backgroundColor: colors.background.base,
  },
  selectedChip: {
    borderColor: colors.primary[700],
    backgroundColor: colors.primary[700],
  },
  itemSeparator: { width: ITEM_GAP },
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
