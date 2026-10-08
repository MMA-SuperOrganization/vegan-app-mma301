import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppText, EmptyState, LoadingSpinner, ScreenWrapper } from '@/components';
import { spacing } from '@/theme';
import { useTranslation } from '@/i18n';
import { ContentResultCard } from '../components/ContentResultCard';
import { RecipeHeader } from '../components/RecipeHeader';
import { useSavedItems } from '../hooks';

export function SavedLibraryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const saved = useSavedItems();
  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.screen}>
      <RecipeHeader
        title={t('discover.savedContent')}
        subtitle={t('saved.subtitle')}
        backFallbackHref="/(discover)/explore"
      />
      {saved.isLoading ? <LoadingSpinner text={t('saved.loading')} /> : null}
      {saved.isError ? (
        <EmptyState
          title={t('saved.loadError')}
          description={saved.error.message}
          actionLabel={t('common.retry')}
          onAction={() => void saved.refetch()}
        />
      ) : null}
      {!saved.isLoading && !saved.isError && !saved.data?.data.length ? (
        <EmptyState
          title={t('saved.empty')}
          description={t('saved.emptyDescription')}
          actionLabel={t('saved.backToExplore')}
          onAction={() => router.replace('/(discover)/explore')}
        />
      ) : null}
      <View style={styles.list}>
        {saved.data?.data.map((item) =>
          item.target ? (
            <ContentResultCard
              key={item._id}
              item={{ ...item.target, type: item.targetType }}
              onPress={
                item.targetType === 'recipe'
                  ? () =>
                      router.push({
                        pathname: '/(discover)/recipe/[id]',
                        params: { id: item.target?.slug ?? item.targetId },
                      })
                  : undefined
              }
            />
          ) : (
            <EmptyState key={item._id} title={t('saved.unavailable')} />
          )
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, gap: spacing.xl },
  list: { gap: spacing.md },
});
