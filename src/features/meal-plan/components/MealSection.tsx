import { Pressable, StyleSheet, View } from 'react-native';
import { AppButton, AppIcon, AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import type { PlannedMeal } from '../types';

export function MealSection({
  title,
  meals,
  pending,
  formatNumber,
  onAdd,
  onReplace,
  onChangeServings,
  onToggleCompleted,
  onRemove,
}: {
  title: string;
  meals: PlannedMeal[];
  pending: boolean;
  formatNumber: (value: number, fractionDigits?: number) => string;
  onAdd: () => void;
  onReplace: (meal: PlannedMeal) => void;
  onChangeServings: (meal: PlannedMeal, delta: number) => void;
  onToggleCompleted: (meal: PlannedMeal) => void;
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
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: meal.completed, disabled: pending }}
              accessibilityLabel={t(
                meal.completed
                  ? 'mealPlan.removeFromDiaryA11y'
                  : 'mealPlan.logToDiaryA11y',
                { name: meal.recipeSnapshot.title }
              )}
              disabled={pending}
              onPress={() => onToggleCompleted(meal)}
              style={({ pressed }) => [
                styles.diaryButton,
                meal.completed && styles.diaryButtonCompleted,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.diaryIcon,
                  meal.completed && styles.diaryIconCompleted,
                ]}
              >
                <AppIcon
                  name="check"
                  size={16}
                  color={
                    meal.completed ? colors.background.surface : colors.primary[700]
                  }
                  decorative
                />
              </View>
              <AppText
                variant="bodySmall"
                color={colors.primary[700]}
                style={styles.diaryLabel}
              >
                {t(
                  meal.completed ? 'mealPlan.loggedToDiary' : 'mealPlan.logToDiary'
                )}
              </AppText>
            </Pressable>
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('mealPlan.replaceDishA11y', {
                  name: meal.recipeSnapshot.title,
                })}
                disabled={pending || meal.completed}
                onPress={() => onReplace(meal)}
                style={({ pressed }) => [
                  styles.textButton,
                  pressed && styles.pressed,
                ]}
              >
                <AppText variant="bodySmall" color={colors.primary[700]}>
                  {t('mealPlan.replaceDish')}
                </AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('mealPlan.decreaseServingA11y', {
                  name: meal.recipeSnapshot.title,
                })}
                disabled={pending || meal.completed || meal.servings <= 1}
                onPress={() => onChangeServings(meal, -1)}
                style={({ pressed }) => [
                  styles.stepButton,
                  pressed && styles.pressed,
                ]}
              >
                <AppText variant="bodyStrong">−</AppText>
              </Pressable>
              <AppText style={styles.servings}>
                {t('mealPlan.servingsShort', {
                  count: formatNumber(meal.servings, 0),
                })}
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('mealPlan.increaseServingA11y', {
                  name: meal.recipeSnapshot.title,
                })}
                disabled={pending || meal.completed || meal.servings >= 100}
                onPress={() => onChangeServings(meal, 1)}
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
                  styles.textButton,
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
  diaryButton: {
    minHeight: 42,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.xs,
    paddingRight: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary[300],
    backgroundColor: colors.background.surface,
  },
  diaryButtonCompleted: {
    borderColor: colors.primary[300],
    backgroundColor: colors.background.selected,
  },
  diaryIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.selected,
  },
  diaryIconCompleted: { backgroundColor: colors.primary[700] },
  diaryLabel: { fontWeight: '600' },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.selected,
  },
  servings: { minWidth: 68, textAlign: 'center' },
  textButton: { padding: spacing.sm },
  pressed: { opacity: 0.65 },
});
