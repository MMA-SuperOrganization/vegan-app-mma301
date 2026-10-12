import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Thumbnail } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { formatIngredientQuantity } from '../recipePresentation';
import type { RecipeDetail } from '../types';

type Ingredient = NonNullable<RecipeDetail['ingredients']>[number];

export function IngredientList({
  ingredients,
  onOpen,
}: {
  ingredients?: Ingredient[];
  onOpen: (foodItemId: string) => void;
}) {
  const { locale, t } = useTranslation();

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
            onPress={() => onOpen(item.foodItemId)}
            style={({ pressed }) => [
              styles.row,
              index < ingredients.length - 1 && styles.divider,
              pressed && styles.pressed,
            ]}
          >
            <Thumbnail kind="ingredient" size={40} radius={radius.md} />
            <View style={styles.copy}>
              <AppText variant="bodyStrong" numberOfLines={1}>
                {item.foodNameSnapshot}
              </AppText>
              {item.note ? (
                <AppText
                  variant="bodySmall"
                  color={colors.text.secondary}
                  numberOfLines={1}
                >
                  {item.note}
                </AppText>
              ) : null}
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
    minHeight: 64,
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
