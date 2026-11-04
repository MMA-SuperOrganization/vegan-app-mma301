import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components';
import { colors, radius, spacing } from '@/theme';
import { weekDates } from '../mealPlanState';

export function WeekDaySelector({
  weekStartDate,
  selectedDate,
  locale,
  mealCounts,
  onSelect,
}: {
  weekStartDate: string;
  selectedDate: string;
  locale: 'vi' | 'en';
  mealCounts: Record<string, number>;
  onSelect: (date: string) => void;
}) {
  const dateLocale = locale === 'vi' ? 'vi-VN' : 'en-US';

  return (
    <View style={styles.list}>
      {weekDates(weekStartDate).map((date) => {
        const value = new Date(`${date}T12:00:00`);
        const selected = date === selectedDate;
        return (
          <Pressable
            key={date}
            accessibilityRole="button"
            accessibilityLabel={value.toLocaleDateString(dateLocale, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
            accessibilityState={{ selected }}
            onPress={() => onSelect(date)}
            style={({ pressed }) => [
              styles.day,
              selected && styles.selectedDay,
              pressed && styles.pressed,
            ]}
          >
            <AppText
              variant="caption"
              color={selected ? colors.text.inverse : colors.text.secondary}
            >
              {value.toLocaleDateString(dateLocale, { weekday: 'narrow' })}
            </AppText>
            <View style={[styles.number, selected && styles.selectedNumber]}>
              <AppText
                variant="bodyStrong"
                color={selected ? colors.primary[700] : colors.text.primary}
              >
                {value.getDate()}
              </AppText>
            </View>
            <View
              style={[
                styles.dot,
                mealCounts[date] > 0 && styles.dotFilled,
                selected && mealCounts[date] > 0 && styles.dotSelected,
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flexDirection: 'row', gap: spacing.xs },
  day: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.background.muted,
  },
  selectedDay: {
    backgroundColor: colors.primary[700],
  },
  number: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.surface,
  },
  selectedNumber: { borderWidth: 2, borderColor: colors.primary[300] },
  pressed: { opacity: 0.78 },
  dot: { width: 5, height: 5, borderRadius: radius.full },
  dotFilled: { backgroundColor: colors.primary[500] },
  dotSelected: { backgroundColor: colors.common.white },
});
