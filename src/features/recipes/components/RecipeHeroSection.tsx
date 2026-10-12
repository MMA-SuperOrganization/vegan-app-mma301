import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

import { RecipeImage } from './RecipeImage';
import type { RecipeHeroSectionProps } from '../types';

export function RecipeHeroSection({
  title,
  coverImageUrl,
  summary,
  description,
  servings,
  prepMinutes,
  cookMinutes,
  difficulty,
}: RecipeHeroSectionProps) {
  const { t } = useTranslation();

  const metaText = [
    servings ? t('recipe.servings', { count: servings }) : null,
    prepMinutes != null ? t('recipe.prepMinutes', { count: prepMinutes }) : null,
    cookMinutes != null ? t('recipe.cookMinutes', { count: cookMinutes }) : null,
    difficulty,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.container}>
      <RecipeImage
        uri={coverImageUrl}
        style={styles.cover}
        fallbackSize="large"
      />
      <View style={styles.intro}>
        <AppText variant="heading1">{title}</AppText>
        <AppText color={colors.text.secondary}>
          {summary || description || t('recipe.noDescription')}
        </AppText>
        {metaText ? (
          <AppText variant="bodyStrong" color={colors.primary[700]}>
            {metaText}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  cover: {
    width: '100%',
    height: 240,
    borderRadius: radius.xl,
  },
  intro: {
    gap: spacing.sm,
  },
});
