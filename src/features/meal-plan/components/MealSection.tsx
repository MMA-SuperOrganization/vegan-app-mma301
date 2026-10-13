import { Pressable, StyleSheet, View } from 'react-native';
import { AppButton, AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import type { PlannedMeal } from '../types';

export function MealSection({
  title,
  meals,
  pending,
  formatNumber,
  onAdd,
  onChangeServings,
  onRemove,
}: {
  title: string;
  meals: PlannedMeal[];
  pending: boolean;
  formatNumber: (value: number, fractionDigits?: number) => string;
  onAdd: () => void;
  onChangeServings: (meal: PlannedMeal, delta: number) => void;
  onRemove: (meal: PlannedMeal) => void;
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <AppText variant="heading4">{title}</AppText>
        <AppButton
          title={t('mealPlan.addDish')}
          variant="ghost"
          fullWidth={false}
          disabled={pending}
          onPress={onAdd}
          style={styles.addButton}
        />
      </View>

      {meals.length === 0 ? (
        <AppText variant="bodySmall" color={colors.text.secondary}>
          {t('mealPlan.emptyMeal')}
        </AppText>
      ) : (
        meals.map((meal, index) => (
          <View key={meal.mealId} style={[styles.meal, index > 0 && styles.divider]}>
            <View style={styles.mealCopy}>
              <AppText variant="bodyStrong" numberOfLines={2}>
                {meal.recipeSnapshot.title}
              </AppText>
              <AppText variant="bodySmall" color={colors.text.secondary}>
                {t('mealPlan.mealCalories', {
                  kcal: formatNumber(
                    (meal.recipeSnapshot.nutritionPerServing.caloriesKcal ?? 0) *
                      meal.servings
                  ),
                })}
              </AppText>
            </View>
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('mealPlan.decreaseServingA11y', {
                  name: meal.recipeSnapshot.title,
                })}
                disabled={pending || meal.servings <= 0.5}
                onPress={() => onChangeServings(meal, -0.5)}
                style={({ pressed }) => [
                  styles.stepButton,
                  pressed && styles.pressed,
                ]}
              >
                <AppText variant="bodyStrong">−</AppText>
              </Pressable>
              <AppText style={styles.servings}>
                {t('mealPlan.servingsShort', {
                  count: formatNumber(meal.servings, 1),
                })}
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('mealPlan.increaseServingA11y', {
                  name: meal.recipeSnapshot.title,
                })}
                disabled={pending || meal.servings >= 100}
                onPress={() => onChangeServings(meal, 0.5)}
                style={({ pressed }) => [
                  styles.stepButton,
                  pressed && styles.pressed,
                ]}
              >
                <AppText variant="bodyStrong">+</AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('mealPlan.removeDishA11y', {
                  name: meal.recipeSnapshot.title,
                })}
                disabled={pending}
                onPress={() => onRemove(meal)}
                style={({ pressed }) => [
                  styles.removeButton,
                  pressed && styles.pressed,
                ]}
              >
                <AppText variant="bodySmall" color={colors.status.danger}>
                  {t('mealPlan.removeDish')}
                </AppText>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  addButton: { minHeight: 40, minWidth: 0, paddingHorizontal: spacing.sm },
  meal: { gap: spacing.sm },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    paddingTop: spacing.md,
  },
  mealCopy: { gap: spacing.xs },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.selected,
  },
  servings: { minWidth: 68, textAlign: 'center' },
  removeButton: { marginLeft: 'auto', padding: spacing.sm },
  pressed: { opacity: 0.65 },
});
