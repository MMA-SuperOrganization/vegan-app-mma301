import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { amountOverTarget } from '../trackingState';

interface GoalThresholdAlertsProps {
  calories?: { consumed: number; target: number | null };
  water?: { consumed: number; target: number | null };
  formatNumber: (value: number, fractionDigits?: number) => string;
}

/** Visible and screen-reader alerts for daily limits configured in the profile. */
export function GoalThresholdAlerts({
  calories,
  water,
  formatNumber,
}: GoalThresholdAlertsProps) {
  const { t } = useTranslation();
  const calorieExcess = calories
    ? amountOverTarget(calories.consumed, calories.target)
    : null;
  const waterExcess = water ? amountOverTarget(water.consumed, water.target) : null;
  if (calorieExcess == null && waterExcess == null) return null;

  return (
    <View accessibilityRole="alert" style={styles.alert}>
      <AppText variant="bodyStrong" color={colors.status.danger}>
        {t('tracking.goalAlert.title')}
      </AppText>
      {calorieExcess != null ? (
        <AppText variant="bodySmall" color={colors.status.danger}>
          {t('tracking.goalAlert.calories', {
            amount: formatNumber(calorieExcess, 1),
          })}
        </AppText>
      ) : null}
      {waterExcess != null ? (
        <AppText variant="bodySmall" color={colors.status.danger}>
          {t('tracking.goalAlert.water', {
            amount: formatNumber(waterExcess),
          })}
        </AppText>
      ) : null}
      <AppText variant="caption" color={colors.text.secondary}>
        {t('tracking.goalAlert.note')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    padding: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.status.danger,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
  },
});
