import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppInput,
  AppText,
  EmptyState,
  LoadingSpinner,
  ScreenWrapper,
} from '@/components';
import { useProfileStore } from '@/features/profile/profileStore';
import { useTranslation, type TranslationKey } from '@/i18n';
import { useDebouncedValue } from '@/hooks';
import { colors, radius, spacing } from '@/theme';
import { ContentResultCard } from '../components/ContentResultCard';
import { RecipeHeader } from '../components/RecipeHeader';
import {
  buildRecipeQuery,
  filtersForContentType,
  hasActiveRecipeFilters,
  parseRecipeFilters,
  serializeRecipeFilters,
  type RecipeFilterRouteParams,
} from '../filterState';
import { useSearchResults } from '../hooks';
import { normalizeSearchQuery } from '../searchState';
import type { ContentType } from '../types';

const contentTypes: Array<{ value: ContentType | 'all'; labelKey: TranslationKey }> =
  [
    { value: 'all', labelKey: 'discover.filterAll' },
    { value: 'recipe', labelKey: 'discover.typeRecipe' },
    { value: 'food-item', labelKey: 'discover.typeFood' },
    { value: 'post', labelKey: 'discover.typePost' },
    { value: 'video', labelKey: 'discover.typeVideo' },
  ];

const parseType = (value?: string): ContentType | 'all' =>
  ['all', 'recipe', 'food-item', 'post', 'video'].includes(value ?? '')
    ? (value as ContentType | 'all')
    : 'all';

export function SearchResultsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<RecipeFilterRouteParams>();
  const initialQuery = Array.isArray(params.q) ? params.q[0] : (params.q ?? '');
  const initialType = parseType(
    Array.isArray(params.type) ? params.type[0] : params.type
  );
  const [query, setQuery] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(initialQuery);
  const debouncedQuery = useDebouncedValue(normalizeSearchQuery(query), 350);
  const [type, setType] = useState<ContentType | 'all'>(initialType);
  const filters = useMemo(() => parseRecipeFilters(params), [params]);
  const allergenIds =
    useProfileStore((state) => state.data?.nutritionProfile?.allergenIds) ?? [];
  const apiFilters = useMemo(
    () => buildRecipeQuery(filtersForContentType(filters, type), allergenIds),
    [allergenIds, filters, type]
  );
  const results = useSearchResults(submitted, type, apiFilters);
  const content = results.data?.pages.flatMap((page) => page.data) ?? [];

  useEffect(() => {
    setSubmitted(debouncedQuery);
  }, [debouncedQuery]);

  const submit = () => {
    const next = normalizeSearchQuery(query);
    if (!next) return;
    setSubmitted(next);
    router.setParams({ q: next });
  };

  const openFilters = () =>
    router.push({
      pathname: '/(discover)/filters',
      params: { q: submitted, type, ...serializeRecipeFilters(filters) },
    });

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.screen}>
      <RecipeHeader
        title={t('discover.resultsTitle')}
        subtitle={t('discover.resultsSubtitle')}
        backFallbackHref="/(discover)/search"
      />
      <AppInput
        type="search"
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
        onSubmitEditing={submit}
      />
      <View style={styles.filters}>
        {contentTypes.map((filter) => (
          <Pressable
            key={filter.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: type === filter.value }}
            onPress={() => {
              setType(filter.value);
              router.replace({
                pathname: '/(discover)/search-results',
                params: { q: submitted, type: filter.value },
              });
            }}
            style={[styles.filter, type === filter.value && styles.activeFilter]}
          >
            <AppText
              variant="chipLabel"
              color={
                type === filter.value ? colors.text.inverse : colors.primary[700]
              }
            >
              {t(filter.labelKey)}
            </AppText>
          </Pressable>
        ))}
      </View>
      <AppButton
        title={
          hasActiveRecipeFilters(filters)
            ? t('filters.editActive')
            : t('filters.edit')
        }
        variant="outline"
        onPress={openFilters}
      />

      {results.isLoading ? <LoadingSpinner text={t('discover.searching')} /> : null}
      {results.isError ? (
        <EmptyState
          title={t('discover.searchError')}
          description={results.error.message}
          actionLabel={t('common.retry')}
          onAction={() => void results.refetch()}
        />
      ) : null}
      {!results.isLoading && !results.isError && !content.length ? (
        <EmptyState
          title={t('discover.noResults')}
          description={t('discover.noResultsDescription')}
          actionLabel={
            hasActiveRecipeFilters(filters) ? t('filters.clear') : undefined
          }
          onAction={
            hasActiveRecipeFilters(filters)
              ? () =>
                  router.replace({
                    pathname: '/(discover)/search-results',
                    params: { q: submitted },
                  })
              : undefined
          }
        />
      ) : null}
      <View style={styles.list}>
        {content.map((item) => (
          <ContentResultCard
            key={`${item.type}-${item._id}`}
            item={item}
            onPress={
              item.type === 'recipe' || !item.type
                ? () =>
                    router.push({
                      pathname: '/(discover)/recipe/[id]',
                      params: { id: item.slug ?? item._id },
                    })
                : item.type === 'food-item'
                  ? () =>
                      router.push({
                        pathname: '/(discover)/food/[id]',
                        params: { id: item._id },
                      })
                  : undefined
            }
          />
        ))}
      </View>
      {results.hasNextPage ? (
        <AppButton
          title={t('discover.loadMore')}
          variant="outline"
          loading={results.isFetchingNextPage}
          onPress={() => void results.fetchNextPage()}
        />
      ) : null}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.xl },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filter: {
    borderWidth: 1,
    borderColor: colors.primary[700],
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  activeFilter: { backgroundColor: colors.primary[700] },
  list: { gap: spacing.md },
});
