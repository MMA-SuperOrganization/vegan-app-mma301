import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, AppText, LoadingSpinner } from '@/components';
import { useTranslation, type TranslationKey } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

import type { RecentSearch, SearchSuggestion } from '../types';

const typeLabels = {
  recipe: 'discover.typeRecipe',
  'food-item': 'discover.typeFood',
  post: 'discover.typePost',
  video: 'discover.typeVideo',
} satisfies Record<SearchSuggestion['type'], TranslationKey>;

interface HomeInlineSearchPanelProps {
  query: string;
  suggestions?: SearchSuggestion[];
  recent?: RecentSearch[];
  isLoadingSuggestions: boolean;
  isLoadingRecent: boolean;
  suggestionsFailed: boolean;
  recentFailed: boolean;
  onSelectQuery: (query: string) => void;
  onRetrySuggestions: () => void;
  onRetryRecent: () => void;
}

export function HomeInlineSearchPanel({
  query,
  suggestions,
  recent,
  isLoadingSuggestions,
  isLoadingRecent,
  suggestionsFailed,
  recentFailed,
  onSelectQuery,
  onRetrySuggestions,
  onRetryRecent,
}: HomeInlineSearchPanelProps) {
  const { t } = useTranslation();
  const visibleSuggestions = suggestions?.slice(0, 5) ?? [];
  const visibleRecent = recent?.slice(0, 5) ?? [];
  const loading = query ? isLoadingSuggestions : isLoadingRecent;
  const failed = query ? suggestionsFailed : recentFailed;
  const rows = query
    ? visibleSuggestions.map((item) => ({
        key: `${item.type}-${item.id}`,
        query: item.text,
        label: t(typeLabels[item.type]),
        icon: 'search' as const,
      }))
    : visibleRecent.map((item) => ({
        key: item._id,
        query: item.query,
        label: t('discover.historyLabel'),
        icon: 'history' as const,
      }));

  return (
    <View style={styles.panel}>
      <View style={styles.headingRow}>
        <AppText variant="heading5">
          {t(query ? 'discover.suggestions' : 'discover.recent')}
        </AppText>
        {failed ? (
          <Pressable
            accessibilityRole="button"
            onPress={query ? onRetrySuggestions : onRetryRecent}
          >
            <AppText variant="caption" color={colors.primary[700]}>
              {t('common.retry')}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      {loading ? (
        <LoadingSpinner
          text={t(query ? 'discover.loadingSuggestions' : 'discover.loadingHistory')}
        />
      ) : null}

      {!loading && !failed && rows.length ? (
        <View style={styles.rows}>
          {rows.map((row) => (
            <Pressable
              key={row.key}
              accessibilityRole="button"
              onPress={() => onSelectQuery(row.query)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <View style={styles.rowIcon}>
                <AppIcon
                  name={row.icon}
                  size={16}
                  color={colors.primary[700]}
                  decorative
                />
              </View>
              <AppText variant="bodySmall" numberOfLines={1} style={styles.rowText}>
                {row.query}
              </AppText>
              <AppText variant="caption" color={colors.text.secondary}>
                {row.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      ) : null}

      {!loading && !failed && !rows.length ? (
        <AppText variant="bodySmall" color={colors.text.secondary}>
          {t(query ? 'discover.noSuggestions' : 'home.inlineSearchHint')}
        </AppText>
      ) : null}

      {query ? (
        <View style={styles.resultsHeading}>
          <AppIcon name="explore" size={18} color={colors.primary[700]} decorative />
          <AppText variant="heading5">{t('discover.resultsTitle')}</AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rows: { gap: spacing.xs },
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.background.base,
  },
  rowIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary[50],
  },
  rowText: { flex: 1 },
  resultsHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  pressed: { opacity: 0.72 },
});
