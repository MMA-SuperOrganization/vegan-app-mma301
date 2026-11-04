import { getUserErrorMessage } from '@/services/errors';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AppText, CustomHeader, ScreenWrapper } from '@/components';
import { colors, spacing } from '@/theme';
import { useDebouncedValue } from '@/hooks';
import { useTranslation } from '@/i18n';

import { RecentSearchesSection } from '../components/RecentSearchesSection';
import { SearchBar } from '../components/SearchBar';
import { SearchSuggestionsSection } from '../components/SearchSuggestionsSection';
import { useRecentSearches, useSearchSuggestions } from '../hooks';
import { normalizeSearchQuery } from '../searchState';

export function SearchScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(normalizeSearchQuery(query), 300);
  const recent = useRecentSearches();
  const suggestions = useSearchSuggestions(debouncedQuery);

  const submit = (value = query) => {
    const q = normalizeSearchQuery(value);
    if (q)
      router.push({
        pathname: '/(discover)/search-results',
        params: { q, type: 'all' },
      });
  };

  return (
    <ScreenWrapper
      header={
        <CustomHeader
          title={t('discover.search')}
          showBack
          backFallbackHref="/(tabs)"
        />
      }
      scrollable
      contentContainerStyle={styles.screen}
    >
      <AppText color={colors.text.secondary}>{t('discover.searchSubtitle')}</AppText>

      <SearchBar
        placeholder={t('discover.searchPlaceholder')}
        value={query}
        onChangeText={setQuery}
        onSubmit={() => submit()}
      />

      {debouncedQuery ? (
        <SearchSuggestionsSection
          suggestions={suggestions.data}
          isLoading={suggestions.isLoading}
          isError={suggestions.isError}
          onSelectSuggestion={submit}
          onRetry={() => void suggestions.refetch()}
        />
      ) : null}

      <RecentSearchesSection
        recent={recent.data}
        isLoading={recent.isLoading}
        isError={recent.isError}
        errorMessage={recent.error ? getUserErrorMessage(recent.error) : undefined}
        onSelectQuery={(q) => {
          setQuery(q);
          submit(q);
        }}
        onRetry={() => void recent.refetch()}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, gap: spacing.xl },
});
