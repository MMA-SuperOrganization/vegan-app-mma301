import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  CustomHeader,
  EmptyState,
  LoadingSpinner,
  ScreenWrapper,
} from '@/components';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme';

import { SavedItemList } from '../components/SavedItemList';
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
        <SavedItemList
          items={items}
          onOpenItem={openSavedItem}
          onExplore={() => router.replace('/(discover)/explore')}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  state: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
});
