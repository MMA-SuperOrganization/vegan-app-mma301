import { FlatList, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme';

import { ContentResultCard } from './ContentResultCard';
import type { SavedItemListProps } from '../types';

export function SavedItemList({ items, onOpenItem, onExplore }: SavedItemListProps) {
  const { t } = useTranslation();

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item._id}
      contentContainerStyle={[styles.list, !items.length && styles.emptyList]}
      ItemSeparatorComponent={ListSeparator}
      ListEmptyComponent={
        <EmptyState
          title={t('saved.empty')}
          description={t('saved.emptyDescription')}
          actionLabel={t('saved.backToExplore')}
          onAction={onExplore}
        />
      }
      renderItem={({ item }) =>
        item.target ? (
          <ContentResultCard
            item={{ ...item.target, type: item.targetType }}
            onPress={() => onOpenItem(item)}
          />
        ) : (
          <EmptyState title={t('saved.unavailable')} />
        )
      }
    />
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  separator: {
    height: spacing.md,
  },
});
