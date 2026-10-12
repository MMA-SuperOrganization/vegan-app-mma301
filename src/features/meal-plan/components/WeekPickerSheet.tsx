import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText, BottomSheet } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import {
  addCalendarDays,
  monthStart,
  shiftMonth,
  weeksIntersectingMonth,
} from '../mealPlanState';

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

  useEffect(() => {
    if (visible) setVisibleMonth(monthStart(selectedWeekStartDate));
  }, [selectedWeekStartDate, visible]);

  const monthLabel = new Intl.DateTimeFormat(localeTag, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${visibleMonth}T12:00:00`));
  const dateFormatter = new Intl.DateTimeFormat(localeTag, {
    day: '2-digit',
    month: '2-digit',
  });
  const formatDate = (date: string) =>
    dateFormatter.format(new Date(`${date}T12:00:00`));

  return (
    <BottomSheet
      visible={visible}
      title={t('mealPlan.weekPicker.title')}
      onClose={onClose}
      tall
    >
      <View style={styles.monthNavigation}>
        <MonthButton
          label="‹"
          accessibilityLabel={t('mealPlan.weekPicker.previousMonthA11y')}
          onPress={() => setVisibleMonth((value) => shiftMonth(value, -1))}
        />
        <AppText variant="heading4" style={styles.monthTitle}>
          {monthLabel}
        </AppText>
        <MonthButton
          label="›"
          accessibilityLabel={t('mealPlan.weekPicker.nextMonthA11y')}
          onPress={() => setVisibleMonth((value) => shiftMonth(value, 1))}
        />
      </View>

      <AppText variant="bodySmall" color={colors.text.secondary}>
        {t('mealPlan.weekPicker.description')}
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
              <View style={styles.weekOptionCopy}>
                <AppText
                  variant="bodyStrong"
                  color={selected ? colors.text.inverse : colors.text.primary}
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
              </View>
              <AppText
                variant="heading4"
                color={selected ? colors.text.inverse : colors.primary[700]}
              >
                {selected ? '✓' : '›'}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

function MonthButton({
  label,
  accessibilityLabel,
  onPress,
}: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.monthButton, pressed && styles.pressed]}
    >
      <AppText variant="heading3" color={colors.primary[700]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  monthTitle: { flex: 1, textAlign: 'center', textTransform: 'capitalize' },
  monthButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.selected,
  },
  weekList: { gap: spacing.sm, paddingBottom: spacing.md },
  weekOption: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
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
  weekOptionCopy: { flex: 1, gap: spacing.xs },
  pressed: { opacity: 0.7 },
});
