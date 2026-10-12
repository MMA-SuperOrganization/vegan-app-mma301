import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
    >
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
              variant="bodySmall"
              color={selected ? colors.text.inverse : colors.text.secondary}
            >
              {value.toLocaleDateString(dateLocale, { weekday: 'short' })}
            </AppText>
            <AppText
              variant="heading4"
              color={selected ? colors.text.inverse : colors.text.primary}
            >
              {value.getDate()}
            </AppText>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm, paddingRight: spacing.xl },
  day: {
    width: 58,
    minHeight: 82,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
  },
  selectedDay: {
    backgroundColor: colors.primary[700],
    borderColor: colors.primary[700],
  },
  pressed: { opacity: 0.78 },
  dot: { width: 5, height: 5, borderRadius: radius.full },
  dotFilled: { backgroundColor: colors.primary[500] },
  dotSelected: { backgroundColor: colors.common.white },
});
