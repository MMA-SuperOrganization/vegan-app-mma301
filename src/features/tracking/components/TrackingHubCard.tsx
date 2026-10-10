import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, AppText, ProgressBar } from '@/components';
import { colors, radius, shadows, spacing } from '@/theme';

export type TrackingHubTone = 'energy' | 'weight' | 'water';

export interface TrackingHubCardProps {
  tone: TrackingHubTone;
  variant?: 'featured' | 'compact';
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
  variant = 'featured',
  unit,
  title,
  value,
  detail,
  progress,
  onPress,
  testID,
}: TrackingHubCardProps) {
  const badge = BADGE_COLORS[tone];
  const compact = variant === 'compact';
  const featured = variant === 'featured';
  const valueColor = featured ? colors.primary[100] : colors.primary[700];
  const detailColor = featured ? colors.primary[300] : colors.text.secondary;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[title, value, detail].filter(Boolean).join(', ')}
      style={({ pressed }) => [
        styles.card,
        featured ? styles.featuredCard : styles.compactCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.row, compact && styles.compactTopRow]}>
        <View
          style={[
            styles.badge,
            compact && styles.compactBadge,
            { backgroundColor: badge.background },
          ]}
        >
          <AppText variant="bodyStrong" color={badge.text}>
            {unit}
          </AppText>
        </View>

        {featured ? (
          <View style={styles.featuredContent}>
            <AppText variant="heading4" color={colors.text.inverse}>
              {title}
            </AppText>
            <AppText variant="bodyStrong" color={valueColor}>
              {value}
            </AppText>
            {detail ? (
              <AppText variant="bodySmall" color={detailColor}>
                {detail}
              </AppText>
            ) : null}
          </View>
        ) : null}

        <View style={[styles.chevronButton, featured && styles.featuredChevron]}>
          <AppIcon
            name="back"
            size={18}
            color={colors.primary[700]}
            style={styles.chevron}
            decorative
          />
        </View>
      </View>

      {compact ? (
        <View style={styles.compactContent}>
          <AppText variant="bodyStrong" numberOfLines={2}>
            {title}
          </AppText>
          <AppText variant="heading4" color={valueColor} numberOfLines={2}>
            {value}
          </AppText>
          {detail ? (
            <AppText
              variant="caption"
              color={detailColor}
              numberOfLines={3}
              style={styles.compactDetail}
            >
              {detail}
            </AppText>
          ) : null}
        </View>
      ) : null}

      {progress ? (
        <ProgressBar
          value={progress.value}
          max={progress.max}
          tone={tone === 'water' ? 'water' : 'energy'}
          style={featured ? styles.featuredProgress : undefined}
          accessibilityLabel={`${title}: ${value}`}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    ...shadows.sm,
    borderRadius: radius.xl,
    gap: spacing.md,
  },
  featuredCard: {
    padding: spacing.xl,
    backgroundColor: colors.primary[800],
  },
  compactCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 188,
    padding: spacing.lg,
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  pressed: { opacity: 0.82 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  compactTopRow: { justifyContent: 'space-between' },
  badge: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactBadge: { width: 44, height: 44, borderRadius: radius.md },
  featuredContent: { flex: 1, gap: spacing.xs },
  compactContent: { flex: 1, gap: spacing.xs },
  compactDetail: { flexGrow: 1 },
  chevronButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.selected,
  },
  featuredChevron: { backgroundColor: colors.background.surface },
  chevron: { transform: [{ rotate: '180deg' }] },
  featuredProgress: { backgroundColor: colors.primary[700] },
});
