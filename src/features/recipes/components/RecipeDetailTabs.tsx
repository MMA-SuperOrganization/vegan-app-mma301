import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, FilterChip, Surface } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

import type { RecipeDetailTabsProps } from '../types';
import { IngredientList } from './IngredientList';

type DetailTab = 'ingredients' | 'steps';

export function RecipeDetailTabs({
  servings,
  ingredients,
  steps,
  onOpenIngredient,
}: RecipeDetailTabsProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<DetailTab>('ingredients');

  const orderedSteps = [...(steps ?? [])].sort((a, b) => a.order - b.order);

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <FilterChip
          label={t('recipe.ingredients')}
          selected={tab === 'ingredients'}
          onPress={() => setTab('ingredients')}
        />
        <FilterChip
          label={t('recipe.steps')}
          selected={tab === 'steps'}
          onPress={() => setTab('steps')}
        />
      </View>

      {tab === 'ingredients' ? (
        <Surface bordered padding="lg" radius="lg" style={styles.block}>
          <AppText variant="heading4">
            {servings
              ? t('recipe.ingredientsFor', { count: servings })
              : t('recipe.ingredients')}
          </AppText>
          <IngredientList ingredients={ingredients} onOpen={onOpenIngredient} />
        </Surface>
      ) : (
        <Surface bordered padding="lg" radius="lg" style={styles.block}>
          <AppText variant="heading4">{t('recipe.steps')}</AppText>
          {orderedSteps.length ? (
            orderedSteps.map((step, index) => (
              <View key={`${step.order}-${index}`} style={styles.step}>
                <View style={styles.stepNumber}>
                  <AppText variant="bodyStrong" color={colors.text.inverse}>
                    {index + 1}
                  </AppText>
                </View>
                <AppText style={styles.listText}>{step.instruction}</AppText>
              </View>
            ))
          ) : (
            <AppText color={colors.text.secondary}>
              {t('recipe.noStepsDescription')}
            </AppText>
          )}
        </Surface>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  block: {
    gap: spacing.md,
  },
  listText: {
    flex: 1,
    minWidth: 0,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[700],
  },
});
