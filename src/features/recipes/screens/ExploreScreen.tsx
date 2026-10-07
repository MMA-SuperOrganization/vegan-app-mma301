import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppButton, AppText, EmptyState, LoadingSpinner, ScreenWrapper } from '@/components';
import { colors, spacing } from '@/theme';
import { useTranslation } from '@/i18n';
import { ContentResultCard } from '../components/ContentResultCard';
import { useExploreRecipes } from '../hooks';

export function ExploreScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const recipes = useExploreRecipes();
  return (
    <ScreenWrapper scrollable keyboardAvoiding={false} contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <AppText variant="heading1">{t('discover.exploreTitle')}</AppText>
          <AppText color={colors.text.secondary}>{t('discover.exploreSubtitle')}</AppText>
        </View>
        <AppButton title={t('discover.search')} variant="outline" fullWidth={false} onPress={() => router.push('/(discover)/search')} />
      </View>
      {recipes.isLoading ? <LoadingSpinner text={t('discover.loadingRecipes')} /> : null}
      {recipes.isError ? <EmptyState title={t('discover.loadError')} description={recipes.error.message} actionLabel={t('common.retry')} onAction={() => void recipes.refetch()} /> : null}
      {!recipes.isLoading && !recipes.isError && !recipes.data?.length ? <EmptyState title={t('discover.noRecipes')} description={t('discover.noRecipesDescription')} /> : null}
      <View style={styles.list}>
        {recipes.data?.map((item) => (
          <ContentResultCard key={item._id} item={{ ...item, type: 'recipe' }} onPress={() => router.push({ pathname: '/(discover)/recipe/[id]', params: { id: item.slug ?? item._id } })} />
        ))}
      </View>
      <AppButton title={t('discover.savedContent')} variant="outline" onPress={() => router.push('/(discover)/saved')} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, gap: spacing.xl },
  header: { gap: spacing.lg },
  heading: { gap: spacing.xs },
  list: { gap: spacing.md },
});
