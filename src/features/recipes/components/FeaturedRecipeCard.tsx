import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

import type { ContentCardData } from '../types';
import { RecipeImage } from './RecipeImage';

export function FeaturedRecipeCard({
  item,
  onPress,
}: {
  item: ContentCardData;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const metadata = [
    item.totalMinutes ? t('common.minutes', { count: item.totalMinutes }) : null,
    item.nutritionPerServing?.caloriesKcal != null
      ? `${Math.round(item.nutritionPerServing.caloriesKcal)} kcal`
      : null,
    (item.ratingCount ?? 0) > 0 && item.ratingAverage != null
      ? `${item.ratingAverage.toFixed(1)} ★`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <RecipeImage
        uri={item.coverImageUrl}
        style={styles.image}
        fallbackSize="large"
      />
      <View style={styles.content}>
        <AppText variant="overline" color={colors.text.inverse}>
          {t('home.featuredToday')}
        </AppText>
        <AppText variant="heading2" color={colors.text.inverse} numberOfLines={2}>
          {item.title ?? t('discover.untitled')}
        </AppText>
        {metadata ? (
          <AppText variant="caption" color={colors.primary[100]}>
            {metadata}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: radius.xl,
    backgroundColor: colors.primary[800],
  },
  image: { width: '100%', height: 176, borderRadius: 0 },
  content: { padding: spacing.lg, gap: spacing.xs },
  pressed: { opacity: 0.82 },
});
