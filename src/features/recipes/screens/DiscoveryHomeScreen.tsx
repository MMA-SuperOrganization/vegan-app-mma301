import { getUserErrorMessage } from '@/services/errors';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
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
import { HomeCommunitySection } from '@/features/community/components/HomeCommunitySection';

import { FeaturedRecipesSection } from '../components/FeaturedRecipesSection';
import { QuickRecipesSection } from '../components/QuickRecipesSection';
import { UserRecommendationsSection } from '../components/UserRecommendationsSection';
import { useHomeFeed } from '../hooks';
import type { ContentCardData } from '../types';

type HomeFilter = 'all' | 'protein' | 'easy';

export function DiscoveryHomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { t, locale } = useTranslation();
  const profile = useProfileStore((state) => state.data);
  const home = useHomeFeed();
  const [filter, setFilter] = useState<HomeFilter>('all');
  const firstName =
    profile?.user.name.trim().split(/\s+/).at(-1) || t('common.youLower');
  const cardWidth = Math.min(width - spacing.xl * 2 - spacing.md - 32, 320);
  const snapInterval = cardWidth + spacing.md;
  const featured = home.data?.featured.recipes ?? [];
  const communityPosts = home.data?.featured.posts ?? [];
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
  const quickRecipes = useMemo(
    () =>
      recommendations.filter(
        (recipe) => recipe.totalMinutes != null && recipe.totalMinutes <= 30
      ),
    [recommendations]
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
        <AppText color={colors.text.secondary}>
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
          description={getUserErrorMessage(home.error)}
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

      <FeaturedRecipesSection
        recipes={featured}
        cardWidth={cardWidth}
        snapInterval={snapInterval}
        onSelectRecipe={openRecipe}
      />

      <UserRecommendationsSection
        userName={firstName}
        recipes={filteredRecipes}
        cardWidth={cardWidth}
        onSelectRecipe={openRecipe}
        onViewAll={() => router.push('/(discover)/explore')}
        hasRecommendations={Boolean(recommendations.length)}
        isLoading={home.isLoading}
        isError={home.isError}
        onResetFilter={() => setFilter('all')}
      />

      <QuickRecipesSection
        recipes={quickRecipes}
        cardWidth={cardWidth}
        onSelectRecipe={openRecipe}
      />

      <HomeCommunitySection
        posts={communityPosts}
        vi={locale === 'vi'}
        onOpenPost={(post) =>
          router.push({ pathname: '/community/post', params: { id: post._id } })
        }
        onViewAll={() => router.push('/community')}
        onWritePost={() => router.push('/community/editor')}
      />
    </ScreenWrapper>
  );
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
    paddingRight: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  pressed: { opacity: 0.72 },
});
