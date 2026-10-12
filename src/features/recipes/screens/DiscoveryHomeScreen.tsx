import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  AppIcon,
  AppText,
  EmptyState,
  FilterChip,
  LoadingSpinner,
  ScreenWrapper,
} from '@/components';
import { useProfileStore } from '@/features/profile/profileStore';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

import { ContentResultCard } from '../components/ContentResultCard';
import { FeaturedRecipeCard } from '../components/FeaturedRecipeCard';
import { useHomeFeed } from '../hooks';
import type { ContentCardData } from '../types';

type HomeFilter = 'all' | 'protein' | 'easy';

export function DiscoveryHomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const profile = useProfileStore((state) => state.data);
  const home = useHomeFeed();
  const [filter, setFilter] = useState<HomeFilter>('all');
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const firstName =
    profile?.user.name.trim().split(/\s+/).at(-1) || t('common.youLower');
  const cardWidth = Math.min(width - spacing.xl * 2 - spacing.md - 32, 320);
  const snapInterval = cardWidth + spacing.md;
  const featured = home.data?.featured.recipes ?? [];
  const recommendations = home.data?.personalized?.recipes?.length
    ? home.data.personalized.recipes
    : featured;
  const filteredRecipes = useMemo(
    () =>
      recommendations.filter((recipe) => {
        if (filter === 'protein')
          return (recipe.nutritionPerServing?.proteinG ?? 0) >= 10;
        if (filter === 'easy') return recipe.difficulty === 'easy';
        return true;
      }),
    [filter, recommendations]
  );

  const onFeaturedScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / snapInterval);
      setFeaturedIndex(idx);
    },
    [snapInterval]
  );

  const openRecipe = (recipe: ContentCardData) =>
    router.push({
      pathname: '/(discover)/recipe/[id]',
      params: { id: recipe.slug ?? recipe._id },
    });

  return (
    <ScreenWrapper
      scrollable
      keyboardAvoiding={false}
      edges={['top', 'left', 'right']}
      contentContainerStyle={styles.screen}
    >
      <View style={styles.hero}>
        <AppText variant="heading1">
          {t('home.greeting', { name: firstName })}
        </AppText>
        <AppText variant="bodyLarge" color={colors.text.secondary}>
          {t('home.question')}
        </AppText>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/(discover)/search')}
        style={({ pressed }) => [styles.search, pressed && styles.pressed]}
      >
        <AppText style={styles.searchPlaceholder} color={colors.text.secondary}>
          {t('home.searchPlaceholder')}
        </AppText>
        <View style={styles.searchButton}>
          <AppIcon name="search" size={20} color="#FFFFFF" decorative />
        </View>
      </Pressable>

      <View style={styles.filters}>
        {(
          [
            ['all', t('home.filterAll')],
            ['protein', t('home.filterProtein')],
            ['easy', t('home.filterEasy')],
          ] as const
        ).map(([value, label]) => (
          <FilterChip
            key={value}
            label={label}
            selected={filter === value}
            onPress={() => setFilter(value)}
          />
        ))}
      </View>

      {home.isLoading ? (
        <LoadingSpinner text={t('home.loadingSuggestions')} />
      ) : null}
      {home.isError ? (
        <EmptyState
          title={t('home.suggestionError')}
          description={home.error.message}
          actionLabel={t('common.retry')}
          onAction={() => void home.refetch()}
        />
      ) : null}
      {!home.isLoading && !home.isError && !recommendations.length ? (
        <EmptyState
          title={t('home.noSuggestions')}
          description={t('home.noSuggestionsDescription')}
          actionLabel={t('home.explore')}
          onAction={() => router.push('/(discover)/explore')}
        />
      ) : null}

      {featured.length ? (
        <View style={styles.section}>
          <AppText variant="heading3">{t('home.featuredToday')}</AppText>
          <FlatList
            horizontal
            data={featured}
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
                onPress={() => openRecipe(item)}
              />
            )}
          />
          {featured.length > 1 ? (
            <View style={styles.dots}>
              {featured.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === featuredIndex && styles.dotActive]}
                />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <AppText variant="heading3">
            {t('home.forUser', { name: firstName })}
          </AppText>
          <Pressable onPress={() => router.push('/(discover)/explore')}>
            <AppText variant="bodyStrong" color={colors.primary[700]}>
              {t('home.viewAll')}
            </AppText>
          </Pressable>
        </View>
        {filteredRecipes.length ? (
          <FlatList
            horizontal
            data={filteredRecipes}
            keyExtractor={(item) => item._id}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={ListSeparator}
            renderItem={({ item }) => (
              <ContentResultCard
                item={{ ...item, type: 'recipe' }}
                style={{ width: cardWidth }}
                onPress={() => openRecipe(item)}
              />
            )}
          />
        ) : !home.isLoading && !home.isError && recommendations.length ? (
          <EmptyState
            title={t('home.noFilteredRecipes')}
            description={t('home.noFilteredRecipesDescription')}
            actionLabel={t('home.filterAll')}
            onAction={() => setFilter('all')}
          />
        ) : null}
      </View>
    </ScreenWrapper>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.xl },
  hero: { gap: spacing.xs, paddingTop: spacing.md },
  search: {
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
    borderRadius: radius.xl,
    paddingLeft: spacing.lg,
    paddingRight: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchPlaceholder: {
    fontSize: 15,
  },
  searchButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary[700],
    justifyContent: 'center',
    alignItems: 'center',
  },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  section: { gap: spacing.md },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  separator: { width: spacing.md },
  pressed: { opacity: 0.72 },
});
