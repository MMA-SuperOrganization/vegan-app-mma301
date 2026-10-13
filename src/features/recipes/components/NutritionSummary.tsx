import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components';
import { useTranslation, type TranslationKey } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { formatNutritionValue } from '../recipePresentation';
import type { NutritionFacts } from '../types';

const nutrients: Array<{
  key: keyof NutritionFacts;
  label: TranslationKey;
  unit: string;
}> = [
  { key: 'caloriesKcal', label: 'food.calories', unit: 'kcal' },
  { key: 'proteinG', label: 'recipe.protein', unit: 'g' },
  { key: 'carbsG', label: 'recipe.carbs', unit: 'g' },
  { key: 'fatG', label: 'recipe.fat', unit: 'g' },
  { key: 'fiberG', label: 'recipe.fiber', unit: 'g' },
];

export function NutritionSummary({ nutrition }: { nutrition?: NutritionFacts }) {
  const { locale, t } = useTranslation();
  const available = nutrients.filter(({ key }) => nutrition?.[key] != null);

  if (!available.length) {
    return <AppText color={colors.text.secondary}>{t('recipe.noNutrition')}</AppText>;
  }

  return (
    <View style={styles.grid}>
      {available.map(({ key, label, unit }) => (
        <View key={key} style={styles.metric}>
          <AppText variant="bodySmall" color={colors.text.secondary}>
            {t(label)}
          </AppText>
          <View style={styles.valueRow}>
            <AppText variant="heading3" color={colors.primary[700]}>
              {formatNutritionValue(nutrition![key]!, locale)}
            </AppText>
            <AppText variant="bodySmall" color={colors.text.secondary}>
              {unit}
            </AppText>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metric: {
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: 120,
    padding: spacing.md,
    gap: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.background.selected,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
});
