import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, AppText, ProgressBar } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, shadows, spacing } from '@/theme';
import { useTrackingFormat } from '../hooks/useTrackingFormat';
import type { DiaryEntry } from '../types';

interface DailyDiaryCardProps {
  entries: DiaryEntry[];
  consumedKcal: number;
  targetKcal: number | null;
  onPress: () => void;
}

export function DailyDiaryCard({
  entries,
  consumedKcal,
  targetKcal,
  onPress,
}: DailyDiaryCardProps) {
  const { t } = useTranslation();
  const { formatNumber, formatTime, mealLabel } = useTrackingFormat();
  const timeline = [...entries].sort(
    (left, right) =>
      new Date(left.consumedAt).getTime() - new Date(right.consumedAt).getTime()
  );

  return (
    <View style={styles.card} testID="tracking-hub-food-diary">
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <AppIcon name="utensils" size={24} color={colors.primary[700]} decorative />
        </View>
        <View style={styles.headerText}>
          <AppText variant="heading4" color={colors.text.inverse}>
            {t('tracking.hub.timelineTitle')}
          </AppText>
          <AppText variant="bodySmall" color={colors.primary[300]}>
            {t('tracking.hub.timelineSummary', {
              count: timeline.length,
              kcal: formatNumber(consumedKcal),
            })}
          </AppText>
        </View>
      </View>

      {targetKcal ? (
        <ProgressBar
          value={consumedKcal}
          max={targetKcal}
          tone="energy"
          style={styles.progress}
          accessibilityLabel={t('tracking.hub.energyValue', {
            consumed: formatNumber(consumedKcal),
            target: formatNumber(targetKcal),
          })}
        />
      ) : null}

      <View style={styles.timeline}>
        {timeline.length === 0 ? (
          <View style={styles.emptyState}>
            <AppIcon name="clock" size={22} color={colors.primary[300]} decorative />
            <AppText color={colors.primary[100]}>{t('tracking.hub.timelineEmpty')}</AppText>
          </View>
        ) : (
          timeline.map((entry, index) => (
            <View key={entry._id} style={styles.timelineRow}>
              <AppText variant="bodyStrong" color={colors.primary[100]} style={styles.time}>
                {formatTime(entry.consumedAt)}
              </AppText>
              <View style={styles.rail}>
                <View style={styles.dot} />
                {index < timeline.length - 1 ? <View style={styles.line} /> : null}
              </View>
              <View style={styles.entryText}>
                <AppText numberOfLines={2} color={colors.text.inverse}>
                  {entry.nameSnapshot}
                </AppText>
                <AppText variant="bodySmall" color={colors.primary[300]}>
                  {mealLabel(entry.mealType)} ·{' '}
                  {t('tracking.diary.kcal', {
                    kcal: formatNumber(entry.nutritionSnapshot.caloriesKcal),
                  })}
                </AppText>
              </View>
            </View>
          ))
        )}
      </View>

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={t('tracking.hub.timelineAction')}
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
      >
        <AppText variant="bodyStrong" color={colors.primary[700]}>
          {t('tracking.hub.timelineAction')}
        </AppText>
        <AppIcon
          name="back"
          size={18}
          color={colors.primary[700]}
          style={styles.chevron}
          decorative
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...shadows.sm,
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.primary[800],
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[100],
  },
  headerText: { flex: 1, minWidth: 0, gap: spacing.xs },
  progress: { backgroundColor: colors.primary[700] },
  timeline: { gap: spacing.xs },
  timelineRow: { flexDirection: 'row', alignItems: 'stretch', minHeight: 50 },
  time: { width: 48, paddingTop: 1 },
  rail: { width: 20, alignItems: 'center' },
  dot: {
    width: 10,
    height: 10,
    marginTop: 6,
    borderRadius: radius.full,
    backgroundColor: colors.accent.orange,
  },
  line: { flex: 1, width: 2, marginVertical: 3, backgroundColor: colors.primary[700] },
  entryText: { flex: 1, minWidth: 0, paddingBottom: spacing.sm, gap: 2 },
  emptyState: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  action: {
    minHeight: 46,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.surface,
  },
  pressed: { opacity: 0.82 },
  chevron: { transform: [{ rotate: '180deg' }] },
});
