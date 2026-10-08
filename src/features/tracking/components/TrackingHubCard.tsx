import { Pressable, StyleSheet, View } from 'react-native';
import { AppIcon, AppText, ProgressBar } from '@/components';
import { colors, radius, spacing } from '@/theme';

export type TrackingHubTone = 'energy' | 'weight' | 'water';

export interface TrackingHubCardProps {
  tone: TrackingHubTone;
  unit: string;
  title: string;
  value: string;
  detail?: string;
  progress?: { value: number; max: number };
  onPress: () => void;
  testID?: string;
}

const BADGE_COLORS: Record<TrackingHubTone, { background: string; text: string }> = {
  energy: { background: colors.primary[100], text: colors.primary[700] },
  weight: { background: colors.primary[800], text: colors.text.inverse },
  water: { background: colors.status.info, text: colors.text.inverse },
};

export function TrackingHubCard({
  tone,
  unit,
  title,
  value,
  detail,
  progress,
  onPress,
  testID,
}: TrackingHubCardProps) {
  const badge = BADGE_COLORS[tone];
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[title, value, detail].filter(Boolean).join(', ')}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <View style={[styles.badge, { backgroundColor: badge.background }]}>
          <AppText variant="bodyStrong" color={badge.text}>
            {unit}
          </AppText>
        </View>
        <View style={styles.text}>
          <AppText variant="heading4">{title}</AppText>
          <AppText variant="bodyStrong" color={colors.primary[700]}>
            {value}
          </AppText>
          {detail ? (
            <AppText variant="bodySmall" color={colors.text.secondary}>
              {detail}
            </AppText>
          ) : null}
        </View>
        <AppIcon
          name="back"
          size={20}
          color={colors.text.secondary}
          style={styles.chevron}
        />
      </View>
      {progress ? (
        <ProgressBar
          value={progress.value}
          max={progress.max}
          tone={tone === 'water' ? 'water' : 'energy'}
          accessibilityLabel={`${title}: ${value}`}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.md,
  },
  pressed: { opacity: 0.85 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  badge: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: spacing.xs },
  chevron: { transform: [{ rotate: '180deg' }] },
});
