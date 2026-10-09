import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Badge } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

export interface LogHistoryItemProps {
  unit: string;
  title: string;
  value: string;
  onPress: () => void;
}

/** History row shared by weight and water tracking. */
export function LogHistoryItem({
  unit,
  title,
  value,
  onPress,
}: LogHistoryItemProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('tracking.history.openA11y', { title, value })}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.unit}>
        <AppText variant="bodyStrong" color={colors.primary[700]}>
          {unit}
        </AppText>
      </View>
      <View style={styles.text}>
        <AppText variant="bodyStrong">{title}</AppText>
        <AppText variant="bodySmall" color={colors.text.secondary}>
          {value}
        </AppText>
        <Badge
          label={t('tracking.history.details')}
          variant="neutral"
          style={styles.badge}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
  },
  pressed: { backgroundColor: colors.background.selected },
  unit: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[100],
  },
  text: { flex: 1, gap: spacing.xs, alignItems: 'flex-start' },
  badge: { marginTop: spacing.xs },
});
