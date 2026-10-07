import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppInput, AppText, EmptyState, LoadingSpinner, ScreenWrapper } from '@/components';
import { colors, radius, spacing } from '@/theme';
import { ContentResultCard } from '../components/ContentResultCard';
import { RecipeHeader } from '../components/RecipeHeader';
import { useSearchResults } from '../hooks';
import type { ContentType } from '../types';
import { useTranslation, type TranslationKey } from '@/i18n';

const filters: Array<{ value: ContentType | 'all'; labelKey: TranslationKey }> = [
  { value: 'all', labelKey: 'discover.filterAll' }, { value: 'recipe', labelKey: 'discover.typeRecipe' },
  { value: 'food-item', labelKey: 'discover.typeFood' }, { value: 'post', labelKey: 'discover.typePost' },
  { value: 'video', labelKey: 'discover.typeVideo' },
];

export function SearchResultsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ q?: string }>();
  const initialQuery = Array.isArray(params.q) ? params.q[0] : params.q ?? '';
  const [query, setQuery] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(initialQuery);
  const [type, setType] = useState<ContentType | 'all'>('all');
  const results = useSearchResults(submitted, type);

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.screen}>
      <RecipeHeader
        title={t('discover.resultsTitle')}
        subtitle={t('discover.resultsSubtitle')}
        backFallbackHref="/(discover)/search"
      />
      <AppInput type="search" value={query} onChangeText={setQuery} returnKeyType="search" onSubmitEditing={() => setSubmitted(query.trim())} />
      <View style={styles.filters}>
        {filters.map((filter) => (
          <Pressable key={filter.value} onPress={() => setType(filter.value)} style={[styles.filter, type === filter.value && styles.activeFilter]}>
            <AppText variant="chipLabel" color={type === filter.value ? colors.text.inverse : colors.primary[700]}>{t(filter.labelKey)}</AppText>
          </Pressable>
        ))}
      </View>
      {results.isLoading ? <LoadingSpinner text={t('discover.searching')} /> : null}
      {results.isError ? <EmptyState title={t('discover.searchError')} description={results.error.message} actionLabel={t('common.retry')} onAction={() => void results.refetch()} /> : null}
      {!results.isLoading && !results.isError && !results.data?.length ? <EmptyState title={t('discover.noResults')} description={t('discover.noResultsDescription')} /> : null}
      <View style={styles.list}>
        {results.data?.map((item) => (
          <ContentResultCard key={`${item.type}-${item._id}`} item={item} onPress={item.type === 'recipe' || !item.type ? () => router.push({ pathname: '/(discover)/recipe/[id]', params: { id: item.slug ?? item._id } }) : undefined} />
        ))}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, gap: spacing.xl },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filter: { borderWidth: 1, borderColor: colors.primary[700], borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  activeFilter: { backgroundColor: colors.primary[700] },
  list: { gap: spacing.md },
});
