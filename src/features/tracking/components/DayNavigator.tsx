import { Pressable, StyleSheet, View } from 'react-native';
import { AppIcon, AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useTrackingFormat } from '../hooks/useTrackingFormat';
import { addDays, daysAgo, toLocalIsoDate } from '../trackingState';

export interface DayNavigatorProps {
  /** Selected local day, `YYYY-MM-DD`. */
  date: string;
  onChange: (date: string) => void;
}

/** Bare arrow with a full-size touch target. */
function ArrowButton({
  label,
  direction,
  onPress,
}: {
  label: string;
  direction: 'previous' | 'next';
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={spacing.xs}
      style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}
    >
      <AppIcon
        name="back"
        size={22}
        color={colors.primary[700]}
        style={direction === 'next' ? styles.flipped : undefined}
      />
    </Pressable>
  );
}

/** Steps through past days; the future is not selectable. */
export function DayNavigator({ date, onChange }: DayNavigatorProps) {
  const { t } = useTranslation();
  const { formatLongDate, relativeDay } = useTrackingFormat();
  const today = toLocalIsoDate(new Date());
  const isToday = date >= today;
  const age = daysAgo(`${date}T12:00:00`, new Date());

  return (
    <View style={styles.row}>
      <ArrowButton
        direction="previous"
        label={t('tracking.day.previous')}
        onPress={() => onChange(addDays(date, -1))}
      />
      <View style={styles.label} accessibilityLiveRegion="polite">
        <AppText variant="bodyStrong" color={colors.primary[700]}>
          {relativeDay(age)}
        </AppText>
        <AppText
          variant="caption"
          color={colors.text.secondary}
          style={styles.longDate}
        >
          {formatLongDate(date)}
        </AppText>
      </View>
      {isToday ? (
        <View style={styles.arrow} />
      ) : (
        <ArrowButton
          direction="next"
          label={t('tracking.day.next')}
          onPress={() => onChange(addDays(date, 1))}
        />
      )}
      {!isToday ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => onChange(today)}
          style={({ pressed }) => [styles.todayChip, pressed && styles.pressed]}
        >
          <AppText variant="caption" color={colors.primary[700]}>
            {t('tracking.day.backToToday')}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { flex: 1, alignItems: 'center' },
  longDate: { textTransform: 'capitalize' },
  arrow: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipped: { transform: [{ rotate: '180deg' }] },
  todayChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.primary[100],
  },
  pressed: { opacity: 0.6 },
});
