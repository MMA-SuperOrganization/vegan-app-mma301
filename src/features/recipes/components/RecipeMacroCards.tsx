import { StyleSheet, View } from 'react-native';

import { AppText, Surface } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';

import type { RecipeMacroCardsProps } from '../types';

export function RecipeMacroCards({
  caloriesKcal,
  proteinG,
  carbsG,
  fatG,
}: RecipeMacroCardsProps) {
  const { t } = useTranslation();

  const nutritionItems = [
    {
      label: 'kcal',
      value: caloriesKcal != null ? Math.round(caloriesKcal).toString() : '—',
    },
    {
      label: t('recipe.protein'),
      value: proteinG != null ? `${proteinG}g` : '—',
    },
    {
      label: t('recipe.carbs'),
      value: carbsG != null ? `${carbsG}g` : '—',
    },
    {
      label: t('recipe.fat'),
      value: fatG != null ? `${fatG}g` : '—',
    },
  ];

  return (
    <View style={styles.macros}>
      {nutritionItems.map((item) => (
        <Surface
          key={item.label}
          bordered
          padding="md"
          radius="lg"
          style={styles.macro}
        >
          <AppText variant="heading4" color={colors.primary[700]}>
            {item.value}
          </AppText>
          <AppText variant="caption" color={colors.text.secondary}>
            {item.label}
          </AppText>
        </Surface>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  macros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  macro: {
    flexGrow: 1,
    flexBasis: '46%',
    gap: spacing.xs,
  },
});
