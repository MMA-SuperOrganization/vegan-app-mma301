import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, AppText } from '@/components';
import { colors, radius, shadows, spacing, type AssetName } from '@/theme';

interface TrackingQuickMetricCardProps {
  icon: AssetName;
  iconColor: string;
  iconBackground: string;
  title: string;
  value: string;
  onPress: () => void;
  testID?: string;
}

export function TrackingQuickMetricCard({
  icon,
  iconColor,
  iconBackground,
  title,
  value,
  onPress,
  testID,
}: TrackingQuickMetricCardProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${value}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBackground }]}>
        <AppIcon name={icon} size={21} color={iconColor} decorative />
      </View>
      <View style={styles.text}>
        <AppText variant="bodySmall" color={colors.text.secondary} numberOfLines={1}>
          {title}
        </AppText>
        <AppText variant="bodyStrong" color={colors.primary[800]} numberOfLines={2}>
          {value}
        </AppText>
      </View>
      <AppIcon
        name="back"
        size={16}
        color={colors.text.secondary}
        style={styles.chevron}
        decorative
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    ...shadows.sm,
    flex: 1,
    minWidth: 0,
    minHeight: 92,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
  },
  pressed: { opacity: 0.82 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, minWidth: 0, gap: 2 },
  chevron: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    transform: [{ rotate: '180deg' }],
  },
});
