import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { addCalendarDays, relativeWeekOffset } from '../mealPlanState';

export function WeekNavigator({
  weekStartDate,
  currentWeekStartDate,
  showTodayButton,
  disabled,
  onPrevious,
  onNext,
  onToday,
  onOpenPicker,
}: {
  weekStartDate: string;
  currentWeekStartDate: string;
  showTodayButton?: boolean;
  disabled: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onOpenPicker: () => void;
}) {
  const { locale, t } = useTranslation();
  const localeTag = locale === 'vi' ? 'vi-VN' : 'en-US';
  const offset = relativeWeekOffset(currentWeekStartDate, weekStartDate);
  const shouldShowToday = showTodayButton ?? offset !== 0;
  const rangeFormatter = new Intl.DateTimeFormat(localeTag, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formatDate = (date: string) =>
    rangeFormatter.format(new Date(`${date}T12:00:00`));
  const title =
    offset === 0
      ? t('mealPlan.week.current')
      : offset === -1
        ? t('mealPlan.week.previous')
        : offset === 1
          ? t('mealPlan.week.next')
          : t('mealPlan.week.other', { start: formatDate(weekStartDate) });

  return (
    <View style={styles.container}>
      <View style={styles.navigationRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('mealPlan.previousWeekA11y')}
          disabled={disabled}
          onPress={onPrevious}
          style={({ pressed }) => [
            styles.arrowButton,
            pressed && styles.pressed,
            disabled && styles.disabled,
          ]}
        >
          <AppText variant="heading3" color={colors.primary[700]}>
            ‹
          </AppText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('mealPlan.chooseWeekA11y')}
          disabled={disabled}
          onPress={onOpenPicker}
          style={({ pressed }) => [
            styles.weekCopy,
            pressed && styles.weekCopyPressed,
            disabled && styles.disabled,
          ]}
        >
          <AppText variant="heading3" style={styles.centerText}>
            {title}
          </AppText>
          <AppText
            variant="bodySmall"
            color={colors.text.secondary}
            style={styles.centerText}
          >
            {t('mealPlan.weekRange', {
              start: formatDate(weekStartDate),
              end: formatDate(addCalendarDays(weekStartDate, 6)),
            })}
          </AppText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('mealPlan.nextWeekA11y')}
          disabled={disabled}
          onPress={onNext}
          style={({ pressed }) => [
            styles.arrowButton,
            pressed && styles.pressed,
            disabled && styles.disabled,
          ]}
        >
          <AppText variant="heading3" color={colors.primary[700]}>
            ›
          </AppText>
        </Pressable>
      </View>

      {shouldShowToday ? (
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={onToday}
          style={({ pressed }) => [
            styles.todayButton,
            pressed && styles.pressed,
            disabled && styles.disabled,
          ]}
        >
          <AppText
            variant="bodyStrong"
            color={colors.primary[700]}
            numberOfLines={1}
            style={styles.todayButtonText}
          >
            {t('mealPlan.backToToday')}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  arrowButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.selected,
  },
  weekCopy: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  weekCopyPressed: {
    backgroundColor: colors.background.selected,
  },
  centerText: { textAlign: 'center' },
  todayButton: {
    alignSelf: 'center',
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.primary[100],
  },
  todayButtonText: {
    textAlign: 'center',
  },
  pressed: { opacity: 0.68 },
  disabled: { opacity: 0.45 },
});
