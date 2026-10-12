import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';

import {
  CustomHeader,
  EmptyState,
  LoadingSpinner,
  ScreenWrapper,
} from '@/components';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme';

import { ContentResultCard } from '../components/ContentResultCard';
import { useSavedItems } from '../hooks';
import type { SavedItem } from '../types';

export function SavedLibraryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const saved = useSavedItems();
  const items = saved.data?.data ?? [];

  const openSavedItem = (item: SavedItem) => {
    if (item.targetType === 'recipe') {
      router.push({
        pathname: '/(discover)/recipe/[id]',
        params: { id: item.target?.slug ?? item.targetId },
      });
    } else if (item.targetType === 'food-item') {
      router.push({
        pathname: '/(discover)/food/[id]',
        params: { id: item.targetId },
      });
    }
  };

  return (
    <ScreenWrapper
      header={
        <CustomHeader
          title={t('discover.savedContent')}
          showBack
          backFallbackHref="/(discover)/explore"
        />
      }
      keyboardAvoiding={false}
    >
      {saved.isLoading ? (
        <View style={styles.state}>
          <LoadingSpinner text={t('saved.loading')} />
        </View>
      ) : saved.isError ? (
        <View style={styles.state}>
          <EmptyState
            title={t('saved.loadError')}
            description={saved.error.message}
            actionLabel={t('common.retry')}
            onAction={() => void saved.refetch()}
          />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.list,
            !items.length && styles.emptyList,
          ]}
          ItemSeparatorComponent={ListSeparator}
          ListEmptyComponent={
            <EmptyState
              title={t('saved.empty')}
              description={t('saved.emptyDescription')}
              actionLabel={t('saved.backToExplore')}
              onAction={() => router.replace('/(discover)/explore')}
            />
          }
          renderItem={({ item }) =>
            item.target ? (
              <ContentResultCard
                item={{ ...item.target, type: item.targetType }}
                onPress={
                  item.targetType === 'recipe' || item.targetType === 'food-item'
                    ? () => openSavedItem(item)
                    : undefined
                }
              />
            ) : (
              <EmptyState title={t('saved.unavailable')} />
            )
          }
        />
      )}
    </ScreenWrapper>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  state: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  list: { padding: spacing.xl, paddingBottom: spacing['4xl'] },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  separator: { height: spacing.md },
});
