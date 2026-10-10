import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, EmptyState, LoadingSpinner, ScreenWrapper } from '@/components';
import {
  ContentResultCard,
  FeaturedRecipeCard,
  useHomeFeed,
} from '@/features/recipes';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useProfileStore } from '../profileStore';

export function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const profile = useProfileStore((state) => state.data);
  const home = useHomeFeed();
  const [filter, setFilter] = useState<'all' | 'protein' | 'easy'>('all');
  const firstName =
    profile?.user.name.trim().split(/\s+/).at(-1) || t('common.youLower');
  const recommendations = home.data?.personalized?.recipes?.length
    ? home.data.personalized.recipes
    : (home.data?.featured.recipes ?? []);
  const filteredRecipes = recommendations.filter((recipe) => {
    if (filter === 'protein')
      return (recipe.nutritionPerServing?.proteinG ?? 0) >= 10;
    if (filter === 'easy') return recipe.difficulty === 'easy';
    return true;
  });
  const featuredRecipe = filteredRecipes[0];
  const listRecipes = filteredRecipes.slice(1, 4);
  const openRecipe = (recipe: (typeof recommendations)[number]) =>
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
        <AppText color={colors.primary[700]}>⌕</AppText>
      </Pressable>

      <View style={styles.filters}>
        {(
          [
            ['all', t('home.filterAll')],
            ['protein', t('home.filterProtein')],
            ['easy', t('home.filterEasy')],
          ] as const
        ).map(([value, label]) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === value }}
            onPress={() => setFilter(value)}
            style={[styles.filter, filter === value && styles.activeFilter]}
          >
            <AppText
              variant="chipLabel"
              color={filter === value ? colors.text.inverse : colors.text.primary}
            >
              {label}
            </AppText>
          </Pressable>
        ))}
      </View>

      <View style={styles.recommendations}>
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
        {!home.isLoading && !home.isError && recommendations.length === 0 ? (
          <EmptyState
            title={t('home.noSuggestions')}
            description={t('home.noSuggestionsDescription')}
            actionLabel={t('home.explore')}
            onAction={() => router.push('/(discover)/explore')}
          />
        ) : null}
        {!home.isLoading &&
        !home.isError &&
        recommendations.length > 0 &&
        !featuredRecipe ? (
          <EmptyState
            title={t('home.noFilteredRecipes')}
            description={t('home.noFilteredRecipesDescription')}
            actionLabel={t('home.filterAll')}
            onAction={() => setFilter('all')}
          />
        ) : null}
        {featuredRecipe ? (
          <FeaturedRecipeCard
            item={featuredRecipe}
            onPress={() => openRecipe(featuredRecipe)}
          />
        ) : null}
        {listRecipes.length ? (
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
        ) : null}
        {listRecipes.map((item) => (
          <ContentResultCard
            key={item._id}
            item={{ ...item, type: 'recipe' }}
            onPress={() => openRecipe(item)}
          />
        ))}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.lg },
  hero: { gap: spacing.xs, paddingTop: spacing.md },
  search: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filter: {
    minHeight: 38,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
  },
  activeFilter: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500],
  },
  recommendations: { gap: spacing.md },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  pressed: { opacity: 0.72 },
});
