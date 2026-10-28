import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { AppText, BottomSheet } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { formatIngredientQuantity } from '../recipePresentation';
import type { RecipeDetail } from '../types';
import { IngredientDetails } from './IngredientDetails';

type Ingredient = NonNullable<RecipeDetail['ingredients']>[number];

export function IngredientList({
  ingredients,
  onOpen,
}: {
  ingredients?: Ingredient[];
  onOpen: (foodItemId: string) => void;
}) {
  const { locale, t } = useTranslation();
  const { height } = useWindowDimensions();
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(
    null
  );

  if (!ingredients?.length) {
    return (
      <AppText color={colors.text.secondary}>{t('recipe.noIngredients')}</AppText>
    );
  }

  return (
    <View style={styles.container}>
      <AppText variant="bodySmall" color={colors.text.secondary}>
        {t('recipe.ingredientsHint')}
      </AppText>
      <View style={styles.list}>
        {ingredients.map((item, index) => (
          <Pressable
            key={`${item.foodItemId}-${index}`}
            accessibilityRole="button"
            accessibilityLabel={t('recipe.openIngredientA11y', {
              name: item.foodNameSnapshot,
            })}
            onPress={() => setSelectedIngredient(item)}
            style={({ pressed }) => [
              styles.row,
              index < ingredients.length - 1 && styles.divider,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.copy}>
              <AppText variant="bodyStrong" numberOfLines={1}>
                {item.foodNameSnapshot}
              </AppText>
            </View>
            <AppText variant="bodyStrong" color={colors.primary[700]}>
              {formatIngredientQuantity(item.quantity, item.unit, locale)}
            </AppText>
            <AppText variant="heading4" color={colors.text.secondary}>
              ›
            </AppText>
          </Pressable>
        ))}
      </View>
      {selectedIngredient ? (
        <BottomSheet
          visible
          title={selectedIngredient.foodNameSnapshot}
          onClose={() => setSelectedIngredient(null)}
        >
          <ScrollView
            style={{ maxHeight: height * 0.6 }}
            showsVerticalScrollIndicator
          >
            <IngredientDetails
              ingredient={selectedIngredient}
              onOpen={(foodItemId) => {
                setSelectedIngredient(null);
                onOpen(foodItemId);
              }}
            />
          </ScrollView>
        </BottomSheet>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  list: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.base,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border.default },
  copy: { flex: 1, gap: 2 },
  pressed: { backgroundColor: colors.background.selected },
});
