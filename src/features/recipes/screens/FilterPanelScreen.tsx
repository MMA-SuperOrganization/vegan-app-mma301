import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppText,
  CustomHeader,
  EmptyState,
  FilterChip,
  LoadingSpinner,
  ScreenWrapper,
  Toggle,
} from '@/components';
import { useProfileStore } from '@/features/profile/profileStore';
import { useTranslation, type TranslationKey } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import {
  filtersForContentType,
  parseRecipeFilters,
  serializeRecipeFilters,
  toggleFilterValue,
  type RecipeFilterRouteParams,
} from '../filterState';
import { categoryFilterLabel, recipeTagLabel } from '../filterLabels';
import { useContentCategories, useRecipeTags } from '../hooks';
import type { ContentType, RecipeFilters } from '../types';

const durations = [15, 30, 60] as const;
const difficulties = ['easy', 'medium', 'hard'] as const;
const diets = ['vegan', 'vegetarian'] as const;
const sorts = ['popular', 'newest', 'rating', 'quickest'] as const;

export function FilterPanelScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const params = useLocalSearchParams<RecipeFilterRouteParams>();
  const rawType = Array.isArray(params.type) ? params.type[0] : params.type;
  const contentType: ContentType | 'all' = [
    'all',
    'recipe',
    'food-item',
    'post',
    'video',
  ].includes(rawType ?? '')
    ? (rawType as ContentType | 'all')
    : 'all';
  const [filters, setFilters] = useState<RecipeFilters>(() =>
    filtersForContentType(parseRecipeFilters(params), contentType)
  );
  const categoryType =
    contentType === 'food-item'
      ? 'food'
      : contentType === 'post'
        ? 'post'
        : contentType === 'recipe' || contentType === 'all'
          ? 'recipe'
          : undefined;
  const recipeFiltersVisible = contentType === 'recipe' || contentType === 'all';
  const categories = useContentCategories(categoryType, contentType !== 'video');
  const tags = useRecipeTags(recipeFiltersVisible);
  const profile = useProfileStore((state) => state.data);
  const allergenIds = profile?.nutritionProfile?.allergenIds ?? [];
  const allergySelectionReady =
    profile?.nutritionProfile?.allergenSelectionCompleted === true &&
    allergenIds.length > 0;
  const query = Array.isArray(params.q) ? params.q[0] : (params.q ?? '');

  const apply = () => {
    const applicableFilters = filtersForContentType(filters, contentType);
    router.replace({
      pathname: '/(discover)/search-results',
      params: {
        q: query,
        type: contentType,
        ...serializeRecipeFilters(applicableFilters),
      },
    });
  };

  return (
    <ScreenWrapper
      header={
        <CustomHeader
          title={t('filters.title')}
          showBack
          backFallbackHref={{
            pathname: '/(discover)/search-results',
            params: { q: query },
          }}
        />
      }
      scrollable
      contentContainerStyle={styles.screen}
    >
      <AppText color={colors.text.secondary}>{t('filters.subtitle')}</AppText>

      {contentType !== 'video' ? (
        <FilterSection title={t('filters.category')}>
          {categories.isLoading ? (
            <LoadingSpinner text={t('filters.loadingCategories')} />
          ) : null}
          {categories.isError ? (
            <EmptyState
              title={t('filters.categoryError')}
              actionLabel={t('common.retry')}
              onAction={() => void categories.refetch()}
            />
          ) : null}
          <Options>
            <FilterOption
              label={t('filters.any')}
              selected={!filters.categoryIds?.length}
              onPress={() =>
                setFilters((current) => ({ ...current, categoryIds: undefined }))
              }
            />
            {categories.data?.data.map((category) => (
              <FilterOption
                key={category._id}
                label={categoryFilterLabel(category, locale)}
                selected={filters.categoryIds?.includes(category._id) ?? false}
                onPress={() =>
                  setFilters((current) => ({
                    ...current,
                    categoryIds: toggleFilterValue(
                      current.categoryIds,
                      category._id
                    ),
                  }))
                }
              />
            ))}
          </Options>
        </FilterSection>
      ) : null}

      {recipeFiltersVisible ? (
        <FilterSection title={t('filters.tags')}>
          {tags.isLoading ? (
            <LoadingSpinner text={t('filters.loadingTags')} />
          ) : null}
          {tags.isError ? (
            <EmptyState
              title={t('filters.tagsError')}
              actionLabel={t('common.retry')}
              onAction={() => void tags.refetch()}
            />
          ) : null}
          <Options>
            <FilterOption
              label={t('filters.any')}
              selected={!filters.tags?.length}
              onPress={() =>
                setFilters((current) => ({ ...current, tags: undefined }))
              }
            />
            {tags.data?.map((tag) => (
              <FilterOption
                key={tag.value}
                label={`${recipeTagLabel(tag.value, locale)} · ${tag.count}`}
                selected={filters.tags?.includes(tag.value) ?? false}
                onPress={() =>
                  setFilters((current) => ({
                    ...current,
                    tags: toggleFilterValue(current.tags, tag.value),
                  }))
                }
              />
            ))}
          </Options>
        </FilterSection>
      ) : null}

      {recipeFiltersVisible ? (
        <FilterSection title={t('filters.duration')}>
          <Options>
            <FilterOption
              label={t('filters.any')}
              selected={!filters.maxTotalMinutes}
              onPress={() =>
                setFilters((current) => ({ ...current, maxTotalMinutes: undefined }))
              }
            />
            {durations.map((minutes) => (
              <FilterOption
                key={minutes}
                label={t('filters.underMinutes', { count: minutes })}
                selected={filters.maxTotalMinutes === minutes}
                onPress={() =>
                  setFilters((current) => ({ ...current, maxTotalMinutes: minutes }))
                }
              />
            ))}
          </Options>
        </FilterSection>
      ) : null}

      {recipeFiltersVisible ? (
        <FilterSection title={t('filters.difficulty')}>
          <Options>
            <FilterOption
              label={t('filters.any')}
              selected={!filters.difficulty}
              onPress={() =>
                setFilters((current) => ({ ...current, difficulty: undefined }))
              }
            />
            {difficulties.map((difficulty) => (
              <FilterOption
                key={difficulty}
                label={t(`filters.difficulty.${difficulty}` as TranslationKey)}
                selected={filters.difficulty === difficulty}
                onPress={() => setFilters((current) => ({ ...current, difficulty }))}
              />
            ))}
          </Options>
        </FilterSection>
      ) : null}

      {contentType !== 'post' && contentType !== 'video' ? (
        <FilterSection title={t('filters.diet')}>
          <Options>
            <FilterOption
              label={t('filters.any')}
              selected={!filters.dietType}
              onPress={() =>
                setFilters((current) => ({ ...current, dietType: undefined }))
              }
            />
            {diets.map((diet) => (
              <FilterOption
                key={diet}
                label={t(`filters.diet.${diet}` as TranslationKey)}
                selected={filters.dietType === diet}
                onPress={() =>
                  setFilters((current) => ({ ...current, dietType: diet }))
                }
              />
            ))}
          </Options>
        </FilterSection>
      ) : null}

      {contentType !== 'food-item' ? (
        <FilterSection title={t('filters.sort')}>
          <Options>
            {sorts.map((sort) => (
              <FilterOption
                key={sort}
                label={t(`filters.sort.${sort}` as TranslationKey)}
                selected={(filters.sort ?? 'popular') === sort}
                onPress={() => setFilters((current) => ({ ...current, sort }))}
              />
            ))}
          </Options>
        </FilterSection>
      ) : null}

      {contentType !== 'post' && contentType !== 'video' ? (
        <View style={styles.allergenBlock}>
          <Toggle
            value={Boolean(filters.avoidProfileAllergens)}
            disabled={!allergySelectionReady}
            label={t('filters.avoidAllergens')}
            onValueChange={(avoidProfileAllergens) =>
              setFilters((current) => ({ ...current, avoidProfileAllergens }))
            }
          />
          <AppText variant="caption" color={colors.text.secondary}>
            {allergySelectionReady
              ? t('filters.avoidAllergensDescription')
              : t('filters.allergensUnavailable')}
          </AppText>
        </View>
      ) : null}

      <View style={styles.actions}>
        <AppButton title={t('filters.apply')} onPress={apply} />
        <AppButton
          title={t('filters.clear')}
          variant="outline"
          onPress={() => setFilters({})}
        />
      </View>
    </ScreenWrapper>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <AppText variant="heading4" color={colors.text.secondary}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

function Options({ children }: { children: React.ReactNode }) {
  return <View style={styles.options}>{children}</View>;
}

function FilterOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return <FilterChip label={label} selected={selected} onPress={onPress} />;
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.xl },
  section: { gap: spacing.md },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  allergenBlock: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
  },
  actions: { gap: spacing.md },
});
