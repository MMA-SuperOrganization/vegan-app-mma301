import { StyleSheet, View } from 'react-native';
import { AppButton, AppText, LoadingSpinner } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useFoodDetail } from '../hooks';
import { formatIngredientQuantity } from '../recipePresentation';
import type { RecipeIngredientItem } from '../types';
import { RecipeImage } from './RecipeImage';

export function IngredientDetails({
  ingredient,
  onOpen,
}: {
  ingredient: RecipeIngredientItem;
  onOpen: (foodItemId: string) => void;
}) {
  const { locale, t } = useTranslation();
  const food = useFoodDetail(ingredient.foodItemId);

  return (
    <View style={styles.container}>
      <AppText variant="bodyStrong" color={colors.primary[700]}>
        {t('recipe.ingredientAmount', {
          amount: formatIngredientQuantity(
            ingredient.quantity,
            ingredient.unit,
            locale
          ),
        })}
      </AppText>
      {ingredient.note ? <AppText>{ingredient.note}</AppText> : null}
      {food.isLoading ? (
        <LoadingSpinner text={t('food.loadingDetail')} />
      ) : food.isError || !food.data ? (
        <>
          <AppText color={colors.text.secondary}>{t('food.openError')}</AppText>
          <AppButton
            title={t('common.retry')}
            variant="outline"
            onPress={() => void food.refetch()}
          />
        </>
      ) : (
        <>
          <RecipeImage
            uri={food.data.imageUrl}
            style={styles.image}
            fallbackSize="large"
          />
          {food.data.description ? (
            <AppText color={colors.text.secondary}>{food.data.description}</AppText>
          ) : null}
          <AppButton
            title={t('recipe.ingredientDetails')}
            variant="outline"
            onPress={() => onOpen(ingredient.foodItemId)}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.background.surface,
  },
  image: { width: '100%', height: 160, borderRadius: radius.md },
});
