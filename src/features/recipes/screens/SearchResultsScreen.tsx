import { getUserErrorMessage } from '@/services/errors';
import { contentHref } from '../contentNavigation';
import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';

import {
  AppButton,
  CustomHeader,
  EmptyState,
  FilterChip,
  LoadingSpinner,
  ScreenWrapper,
} from '@/components';
import { useProfileStore } from '@/features/profile/profileStore';
import { useDebouncedValue } from '@/hooks';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme';

import { ContentResultCard } from '../components/ContentResultCard';
import { SearchBar } from '../components/SearchBar';
import { SearchResultsFilterBar } from '../components/SearchResultsFilterBar';
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
import type { ContentCardData, ContentType } from '../types';

const parseType = (value?: string): ContentType | 'all' =>
  ['all', 'recipe', 'food-item', 'post', 'video'].includes(value ?? '')
    ? (value as ContentType | 'all')
    : 'all';

const mixedTypeOrder: ContentType[] = ['recipe', 'post', 'food-item', 'video'];

function mixContentTypes(items: ContentCardData[]) {
  const buckets = new Map(
    mixedTypeOrder.map((contentType) => [
      contentType,
      items.filter((item) => (item.type ?? 'recipe') === contentType),
    ])
  );
  const mixed: ContentCardData[] = [];
  let index = 0;

  while (mixed.length < items.length) {
    for (const contentType of mixedTypeOrder) {
      const item = buckets.get(contentType)?.[index];
      if (item) mixed.push(item);
    }
    index += 1;
  }

  return mixed;
}

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
  const [type, setType] = useState<ContentType | 'all'>(initialType);
  const debouncedQuery = useDebouncedValue(normalizeSearchQuery(query), 350);
  const filters = useMemo(() => parseRecipeFilters(params), [params]);
  const allergenIds =
    useProfileStore((state) => state.data?.nutritionProfile?.allergenIds) ?? [];
  const apiFilters = useMemo(
    () => buildRecipeQuery(filtersForContentType(filters, type), allergenIds),
    [allergenIds, filters, type]
  );
  const results = useSearchResults(submitted, type, apiFilters);
  const content =
    results.data?.pages.flatMap((page) =>
      type === 'all' ? mixContentTypes(page.data) : page.data
    ) ?? [];

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

  const openItem = (item: ContentCardData) => {
    router.push(contentHref(item));
  };

  return (
    <ScreenWrapper
      header={
        <CustomHeader
          title={t('discover.resultsTitle')}
          showBack
          backFallbackHref="/(discover)/search"
        />
      }
    >
      <FlatList
        data={content}
        keyExtractor={(item) => `${item.type ?? 'recipe'}-${item._id}`}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.list, !content.length && styles.growList]}
        ItemSeparatorComponent={ListSeparator}
        ListHeaderComponent={
          <View style={styles.header}>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              onSubmit={submit}
              placeholder={t('discover.searchPlaceholder')}
            />
            <SearchResultsFilterBar
              selectedType={type}
              onSelectType={(newType) => {
                setType(newType);
                router.replace({
                  pathname: '/(discover)/search-results',
                  params: { q: submitted, type: newType },
                });
              }}
              hasActiveFilters={hasActiveRecipeFilters(filters)}
              onOpenFilters={openFilters}
            />
          </View>
        }
        ListEmptyComponent={
          results.isLoading ? (
            <LoadingSpinner text={t('discover.searching')} />
          ) : results.isError ? (
            <EmptyState
              title={t('discover.searchError')}
              description={getUserErrorMessage(results.error)}
              actionLabel={t('common.retry')}
              onAction={() => void results.refetch()}
            />
          ) : (
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
          )
        }
        ListFooterComponent={
          results.hasNextPage ? (
            <View style={styles.footer}>
              <AppButton
                title={t('discover.loadMore')}
                variant="outline"
                loading={results.isFetchingNextPage}
                onPress={() => void results.fetchNextPage()}
              />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <ContentResultCard item={item} onPress={() => openItem(item)} />
        )}
      />
    </ScreenWrapper>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  list: { padding: spacing.xl, paddingBottom: spacing['4xl'] },
  growList: { flexGrow: 1 },
  header: { gap: spacing.lg, marginBottom: spacing.xl },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  separator: { height: spacing.md },
  footer: { paddingTop: spacing.xl },
});
