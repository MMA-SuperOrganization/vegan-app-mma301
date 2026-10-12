import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, EmptyState, LoadingSpinner } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

import type { SearchSuggestionsSectionProps } from '../types';

export function SearchSuggestionsSection({
  suggestions,
  isLoading = false,
  isError = false,
  onSelectSuggestion,
  onRetry,
}: SearchSuggestionsSectionProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <AppText variant="heading4">{t('discover.suggestions')}</AppText>
      {isLoading ? (
        <LoadingSpinner text={t('discover.loadingSuggestions')} />
      ) : null}
      {isError ? (
        <EmptyState
          title={t('discover.suggestionError')}
          actionLabel={t('common.retry')}
          onAction={onRetry}
        />
      ) : null}
      {suggestions?.map((item) => (
        <Pressable
          key={`${item.type}-${item.id}`}
          onPress={() => onSelectSuggestion(item.text)}
          style={styles.item}
        >
          <AppText variant="bodyStrong">{item.text}</AppText>
          <AppText variant="caption" color={colors.text.secondary}>
            {item.type}
          </AppText>
        </Pressable>
      ))}
      {!isLoading && !isError && !suggestions?.length ? (
        <AppText color={colors.text.secondary}>
          {t('discover.noSuggestions')}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  item: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
    gap: spacing.xs,
  },
});
