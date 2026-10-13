import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { AppText } from '../AppText';
import { ProgressBar } from '../ProgressBar';

export interface NutritionTargetCardProps {
  label: string;
  value: number;
  target: number | null;
  unit: string;
  formatNumber: (value: number, fractionDigits?: number) => string;
  style?: StyleProp<ViewStyle>;
}

/** Shared consumed/planned versus target presentation for meal plans and diary. */
export function NutritionTargetCard({
  label,
  value,
  target,
  unit,
  formatNumber,
  style,
}: NutritionTargetCardProps) {
  const { t } = useTranslation();
  const difference = target == null ? 0 : target - value;
  const exceeded = target != null && difference < 0;

  return (
    <View style={[styles.card, style]}>
      <AppText variant="bodyStrong">{label}</AppText>
      <AppText
        variant="heading3"
        color={exceeded ? colors.status.danger : colors.primary[700]}
      >
        {target == null
          ? t('nutrition.value', { value: formatNumber(value, 1), unit })
          : t('nutrition.valueOfTarget', {
              value: formatNumber(value, 1),
              target: formatNumber(target, 1),
              unit,
            })}
      </AppText>
      {target != null ? (
        <>
          <ProgressBar value={value} max={target} accessibilityLabel={label} />
          <AppText
            variant="caption"
            color={exceeded ? colors.status.danger : colors.text.secondary}
          >
            {exceeded
              ? t('nutrition.exceeded', {
                  value: formatNumber(Math.abs(difference), 1),
                  unit,
                })
              : t('nutrition.remaining', {
                  value: formatNumber(difference, 1),
                  unit,
                })}
          </AppText>
        </>
      ) : (
        <AppText variant="caption" color={colors.text.secondary}>
          {t('nutrition.targetMissing')}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 0,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
  },
});
