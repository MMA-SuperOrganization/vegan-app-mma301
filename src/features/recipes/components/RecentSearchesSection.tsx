import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, EmptyState, LoadingSpinner } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

import type { RecentSearchesSectionProps } from '../types';

export function RecentSearchesSection({
  recent,
  isLoading = false,
  isError = false,
  errorMessage,
  onSelectQuery,
  onRetry,
}: RecentSearchesSectionProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <AppText variant="heading4">{t('discover.recent')}</AppText>
      {isLoading ? (
        <LoadingSpinner text={t('discover.loadingHistory')} />
      ) : null}
      {isError ? (
        <EmptyState
          title={t('discover.historyError')}
          description={errorMessage}
          actionLabel={t('common.retry')}
          onAction={onRetry}
        />
      ) : null}
      {recent?.map((item) => (
        <Pressable
          key={item._id}
          onPress={() => onSelectQuery(item.query)}
          style={styles.item}
        >
          <AppText variant="bodyStrong">{item.query}</AppText>
          <AppText variant="caption" color={colors.text.secondary}>
            {t('discover.historyLabel')}
          </AppText>
        </Pressable>
      ))}
      {!isLoading && !isError && !recent?.length ? (
        <AppText color={colors.text.secondary}>
          {t('discover.noHistory')}
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
