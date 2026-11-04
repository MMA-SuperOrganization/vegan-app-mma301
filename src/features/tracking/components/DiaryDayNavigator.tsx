import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useTrackingFormat } from '../hooks/useTrackingFormat';
import { addDays } from '../trackingState';

interface DiaryDayNavigatorProps {
  date: string;
  today: string;
  onChange: (date: string) => void;
  onOpenCalendar: () => void;
}

export function DiaryDayNavigator({
  date,
  today,
  onChange,
  onOpenCalendar,
}: DiaryDayNavigatorProps) {
  const { t } = useTranslation();
  const { formatLongDate } = useTrackingFormat();
  const isToday = date === today;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onChange(addDays(date, -1))}
        accessibilityRole="button"
        accessibilityLabel={t('tracking.day.previous')}
        style={({ pressed }) => [styles.arrowButton, pressed && styles.pressed]}
      >
        <AppIcon name="back" size={20} color={colors.primary[700]} decorative />
      </Pressable>

      <Pressable
        onPress={onOpenCalendar}
        accessibilityRole="button"
        accessibilityLabel={t('tracking.day.chooseDate')}
        style={({ pressed }) => [styles.dateButton, pressed && styles.pressed]}
      >
        <AppIcon name="calendar" size={19} color={colors.primary[700]} decorative />
        <View style={styles.dateText}>
          <AppText variant="bodyStrong" numberOfLines={1} style={styles.capitalize}>
            {isToday ? t('tracking.day.today') : formatLongDate(date)}
          </AppText>
          {isToday ? (
            <AppText variant="caption" color={colors.text.secondary} numberOfLines={1}>
              {formatLongDate(date)}
            </AppText>
          ) : null}
        </View>
      </Pressable>

      <Pressable
        disabled={isToday}
        onPress={() => onChange(addDays(date, 1))}
        accessibilityRole="button"
        accessibilityLabel={t('tracking.day.next')}
        accessibilityState={{ disabled: isToday }}
        style={({ pressed }) => [
          styles.arrowButton,
          isToday && styles.disabled,
          pressed && !isToday && styles.pressed,
        ]}
      >
        <AppIcon
          name="back"
          size={20}
          color={isToday ? colors.text.disabled : colors.primary[700]}
          style={styles.nextIcon}
          decorative
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  arrowButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary[100],
  },
  dateButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
  },
  dateText: { minWidth: 0, alignItems: 'center' },
  capitalize: { textTransform: 'capitalize', textAlign: 'center' },
  nextIcon: { transform: [{ rotate: '180deg' }] },
  disabled: { backgroundColor: colors.background.muted },
  pressed: { opacity: 0.72 },
});
