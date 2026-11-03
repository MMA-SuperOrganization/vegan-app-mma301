import { Pressable, StyleSheet, View } from 'react-native';
import { AppIcon, AppText } from '@/components';
import type { MealPlanDay } from '@/features/meal-plan/types';
import { useTrackingFormat } from '@/features/tracking/hooks/useTrackingFormat';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import type { GroceryGenerationScope } from '../types';

export function GroceryMealPreview({
  days,
  scope,
  selectedDate,
  onOpenRecipe,
}: {
  days: MealPlanDay[];
  scope: GroceryGenerationScope;
  selectedDate: string;
  onOpenRecipe: (recipeId: string) => void;
}) {
  const { t } = useTranslation();
  const { formatNumber, formatShortDate, mealLabel } = useTrackingFormat();
  const visibleDays = days.filter(
    (day) => day.meals.length > 0 && (scope === 'week' || day.date === selectedDate)
  );
  const mealCount = visibleDays.reduce((total, day) => total + day.meals.length, 0);

  if (mealCount === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <AppIcon
            name="utensils"
            size={20}
            color={colors.primary[700]}
            decorative
          />
          <AppText variant="bodyStrong">{t('grocery.generatePreviewTitle')}</AppText>
        </View>
        <View style={styles.countBadge}>
          <AppText variant="bodySmall" color={colors.primary[700]}>
            {mealCount}
          </AppText>
        </View>
      </View>

      {visibleDays.map((day, dayIndex) => (
        <View key={day.date} style={[styles.day, dayIndex > 0 && styles.dayDivider]}>
          <AppText variant="bodySmall" color={colors.text.secondary}>
            {formatShortDate(day.date)}
          </AppText>
          {day.meals.map((meal, mealIndex) => (
            <Pressable
              key={meal.mealId}
              accessibilityRole="button"
              accessibilityLabel={t('grocery.generateOpenRecipeA11y', {
                name: meal.recipeSnapshot.title,
              })}
              onPress={() => onOpenRecipe(meal.recipeId)}
              style={({ pressed }) => [
                styles.meal,
                mealIndex > 0 && styles.mealDivider,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.mealCopy}>
                <AppText variant="bodyStrong" numberOfLines={2}>
                  {meal.recipeSnapshot.title}
                </AppText>
                <AppText variant="bodySmall" color={colors.text.secondary}>
                  {mealLabel(meal.type)} ·{' '}
                  {t('mealPlan.servingsShort', {
                    count: formatNumber(meal.servings, 0),
                  })}
                </AppText>
              </View>
              <AppText color={colors.primary[700]}>›</AppText>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary[300],
    borderRadius: radius.lg,
    backgroundColor: colors.background.selected,
  },
  header: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  countBadge: {
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.surface,
  },
  day: { gap: spacing.xs },
  dayDivider: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.primary[300],
  },
  meal: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  mealDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  mealCopy: { flex: 1, gap: spacing.xs },
  pressed: { opacity: 0.7 },
});
