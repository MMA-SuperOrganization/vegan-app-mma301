import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Badge } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useTrackingFormat } from '../hooks/useTrackingFormat';
import { sumNutrition } from '../trackingState';
import type { DiaryEntry } from '../types';

export interface DiaryMealCardProps {
  title: string;
  entries: DiaryEntry[];
  editing: boolean;
  onPressEntry: (entry: DiaryEntry) => void;
}

export function DiaryMealCard({
  title,
  entries,
  editing,
  onPressEntry,
}: DiaryMealCardProps) {
  const { t } = useTranslation();
  const { formatNumber, unitLabel } = useTrackingFormat();
  const totalKcal = sumNutrition(entries).caloriesKcal;

  const amountLabel = (entry: DiaryEntry) =>
    entry.sourceType === 'food' && entry.quantity != null && entry.unit
      ? `${formatNumber(entry.quantity, 1)} ${unitLabel(entry.unit)}`
      : t('tracking.diary.servings', {
          count: formatNumber(entry.servings ?? 1, 1),
        });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <AppText variant="heading4">{title}</AppText>
        {entries.length > 0 ? (
          <AppText variant="bodyStrong" color={colors.primary[700]}>
            {t('tracking.diary.kcal', { kcal: formatNumber(totalKcal) })}
          </AppText>
        ) : null}
      </View>
      {entries.length === 0 ? (
        <AppText variant="bodySmall" color={colors.text.secondary}>
          {t('tracking.diary.notLogged')}
        </AppText>
      ) : (
        entries.map((entry) => (
          <Pressable
            key={entry._id}
            accessibilityRole="button"
            accessibilityLabel={t('tracking.diary.editEntryA11y', {
              name: entry.nameSnapshot,
            })}
            onPress={() => onPressEntry(entry)}
            style={({ pressed }) => [styles.entry, pressed && styles.pressed]}
          >
            <View style={styles.entryText}>
              <AppText numberOfLines={2}>{entry.nameSnapshot}</AppText>
              <AppText variant="bodySmall" color={colors.text.secondary}>
                {amountLabel(entry)} ·{' '}
                {t('tracking.diary.kcal', {
                  kcal: formatNumber(entry.nutritionSnapshot.caloriesKcal),
                })}
              </AppText>
            </View>
            {editing ? <Badge label={t('tracking.diary.edit')} /> : null}
          </Pressable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  pressed: { backgroundColor: colors.background.selected },
  entryText: { flex: 1, gap: spacing.xs },
});
