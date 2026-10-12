import { useCallback, useState } from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';

import { AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';

import { FeaturedRecipeCard } from './FeaturedRecipeCard';
import type { FeaturedRecipesSectionProps } from '../types';

export function FeaturedRecipesSection({
  recipes,
  cardWidth,
  snapInterval,
  onSelectRecipe,
}: FeaturedRecipesSectionProps) {
  const { t } = useTranslation();
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const onFeaturedScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / snapInterval);
      setFeaturedIndex(idx);
    },
    [snapInterval]
  );

  if (!recipes.length) {
    return null;
  }

  return (
    <View style={styles.section}>
      <AppText variant="heading3">{t('home.featuredToday')}</AppText>
      <FlatList
        horizontal
        data={recipes}
        keyExtractor={(item) => item._id}
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        onScroll={onFeaturedScroll}
        scrollEventThrottle={16}
        ItemSeparatorComponent={ListSeparator}
        renderItem={({ item }) => (
          <FeaturedRecipeCard
            item={item}
            style={{ width: cardWidth }}
            onPress={() => onSelectRecipe(item)}
          />
        )}
      />
      {recipes.length > 1 ? (
        <View style={styles.dots}>
          {recipes.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === featuredIndex && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border.default,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary[700],
  },
  separator: {
    width: spacing.md,
  },
});
