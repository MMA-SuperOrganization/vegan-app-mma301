import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useTrackingFormat } from '../hooks/useTrackingFormat';
import { toLocalIsoDate, weekDays } from '../trackingState';

export interface WeekStripProps {
  /** Selected local day, `YYYY-MM-DD`. */
  date: string;
  onChange: (date: string) => void;
}

/** The selected day's week as tappable day pills; future days are disabled. */
export function WeekStrip({ date, onChange }: WeekStripProps) {
  const { locale } = useTranslation();
  const { formatLongDate, formatMonthYear } = useTrackingFormat();
  const today = toLocalIsoDate(new Date());
  const localeTag = locale === 'vi' ? 'vi-VN' : 'en-US';

  return (
    <View style={styles.container}>
      <AppText
        variant="bodyStrong"
        color={colors.text.secondary}
        style={styles.month}
      >
        {formatMonthYear(date)}
      </AppText>
      <View style={styles.row}>
        {weekDays(date).map((day) => {
          const value = new Date(`${day}T12:00:00`);
          const selected = day === date;
          const future = day > today;
          return (
            <Pressable
              key={day}
              accessibilityRole="button"
              accessibilityLabel={formatLongDate(day)}
              accessibilityState={{ selected, disabled: future }}
              disabled={future}
              onPress={() => onChange(day)}
              style={({ pressed }) => [
                styles.day,
                selected && styles.selectedDay,
                future && styles.futureDay,
                pressed && styles.pressed,
              ]}
            >
              <AppText
                variant="caption"
                color={selected ? colors.text.inverse : colors.text.secondary}
              >
                {value.toLocaleDateString(localeTag, { weekday: 'narrow' })}
              </AppText>
              <View
                style={[
                  styles.number,
                  selected && styles.selectedNumber,
                  day === today && !selected && styles.todayNumber,
                ]}
              >
                <AppText
                  variant="bodyStrong"
                  color={selected ? colors.primary[700] : colors.text.primary}
                >
                  {value.getDate()}
                </AppText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  month: { textTransform: 'capitalize' },
  row: { flexDirection: 'row', gap: spacing.xs },
  day: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.background.muted,
  },
  selectedDay: { backgroundColor: colors.primary[700] },
  futureDay: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
  number: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.surface,
  },
  selectedNumber: { borderWidth: 2, borderColor: colors.primary[300] },
  todayNumber: { borderWidth: 1.5, borderColor: colors.primary[700] },
});
