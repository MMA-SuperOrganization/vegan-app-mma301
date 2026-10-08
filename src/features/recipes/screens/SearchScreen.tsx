import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  AppInput,
  AppText,
  EmptyState,
  LoadingSpinner,
  ScreenWrapper,
} from '@/components';
import { colors, radius, spacing } from '@/theme';
import { useDebouncedValue } from '@/hooks';
import { useTranslation } from '@/i18n';
import { useRecentSearches, useSearchSuggestions } from '../hooks';
import { RecipeHeader } from '../components/RecipeHeader';

export function SearchScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const recent = useRecentSearches();
  const suggestions = useSearchSuggestions(debouncedQuery);
  const submit = (value = query) => {
    const q = value.trim();
    if (q) router.push({ pathname: '/(discover)/search-results', params: { q } });
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.screen}>
      <RecipeHeader
        title={t('discover.search')}
        subtitle={t('discover.searchSubtitle')}
      />
      <AppInput
        type="search"
        label={t('discover.search')}
        placeholder={t('discover.searchPlaceholder')}
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
        onSubmitEditing={() => submit()}
      />
      {debouncedQuery ? (
        <View style={styles.section}>
          <AppText variant="heading4">{t('discover.suggestions')}</AppText>
          {suggestions.isLoading ? (
            <LoadingSpinner text={t('discover.loadingSuggestions')} />
          ) : null}
          {suggestions.isError ? (
            <EmptyState
              title={t('discover.suggestionError')}
              actionLabel={t('common.retry')}
              onAction={() => void suggestions.refetch()}
            />
          ) : null}
          {suggestions.data?.map((item) => (
            <Pressable
              key={`${item.type}-${item.id}`}
              onPress={() => submit(item.text)}
              style={styles.recent}
            >
              <AppText variant="bodyStrong">{item.text}</AppText>
              <AppText variant="caption" color={colors.text.secondary}>
                {item.type}
              </AppText>
            </Pressable>
          ))}
          {!suggestions.isLoading &&
          !suggestions.isError &&
          !suggestions.data?.length ? (
            <AppText color={colors.text.secondary}>
              {t('discover.noSuggestions')}
            </AppText>
          ) : null}
        </View>
      ) : null}
      <View style={styles.section}>
        <AppText variant="heading4">{t('discover.recent')}</AppText>
        {recent.isLoading ? (
          <LoadingSpinner text={t('discover.loadingHistory')} />
        ) : null}
        {recent.isError ? (
          <EmptyState
            title={t('discover.historyError')}
            description={t('discover.historyErrorDescription')}
            actionLabel={t('common.retry')}
            onAction={() => void recent.refetch()}
          />
        ) : null}
        {recent.data?.map((item) => (
          <Pressable
            key={item._id}
            onPress={() => {
              setQuery(item.query);
              submit(item.query);
            }}
            style={styles.recent}
          >
            <AppText variant="bodyStrong">{item.query}</AppText>
            <AppText variant="caption" color={colors.text.secondary}>
              {t('discover.historyLabel')}
            </AppText>
          </Pressable>
        ))}
        {!recent.isLoading && !recent.isError && !recent.data?.length ? (
          <AppText color={colors.text.secondary}>{t('discover.noHistory')}</AppText>
        ) : null}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, gap: spacing.xl },
  section: { gap: spacing.md },
  recent: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
    gap: spacing.xs,
  },
});
