import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { useTranslation, type TranslationKey } from '@/i18n';
import { colors, radius, shadows, spacing } from '@/theme';

import type { ContentCardData } from '../types';
import { ContentSaveButton } from './ContentSaveButton';
import { RecipeImage } from './RecipeImage';

export function ExploreRecipeCard({
  recipe,
  onPress,
}: {
  recipe: ContentCardData;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const calories = recipe.nutritionPerServing?.caloriesKcal;
  const difficulty = recipe.difficulty
    ? t(`filters.difficulty.${recipe.difficulty}` as TranslationKey)
    : null;
  const metadata = [
    recipe.totalMinutes ? t('common.minutes', { count: recipe.totalMinutes }) : null,
    Number.isFinite(calories) ? `${Math.round(calories!)} kcal` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={recipe.title ?? t('discover.untitled')}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.imageWrap}>
        <RecipeImage
          uri={recipe.coverImageUrl}
          style={styles.image}
          fallbackSize="large"
        />
        <View style={styles.saveButton}>
          <ContentSaveButton content={{ ...recipe, type: 'recipe' }} compact />
        </View>
        {difficulty ? (
          <View style={styles.difficultyBadge}>
            <AppText variant="caption" color={colors.primary[800]}>
              {difficulty}
            </AppText>
          </View>
        ) : null}
      </View>
      <View style={styles.copy}>
        <AppText variant="bodyStrong" numberOfLines={2} style={styles.title}>
          {recipe.title ?? t('discover.untitled')}
        </AppText>
        {metadata ? (
          <AppText variant="caption" color={colors.text.secondary} numberOfLines={1}>
            {metadata}
          </AppText>
        ) : null}
        {(recipe.ratingCount ?? 0) > 0 && recipe.ratingAverage != null ? (
          <AppText variant="caption" color={colors.status.warning}>
            ★ {recipe.ratingAverage.toFixed(1)}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
    ...shadows.sm,
  },
  imageWrap: { position: 'relative' },
  image: { width: '100%', aspectRatio: 1.08, borderRadius: 0 },
  saveButton: { position: 'absolute', top: spacing.sm, right: spacing.sm },
  difficultyBadge: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.primary[100],
  },
  copy: { minHeight: 96, padding: spacing.md, gap: spacing.xs },
  title: { minHeight: 40 },
  pressed: { opacity: 0.84, transform: [{ scale: 0.985 }] },
});
