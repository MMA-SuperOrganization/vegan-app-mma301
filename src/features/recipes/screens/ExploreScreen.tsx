import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppText,
  EmptyState,
  LoadingSpinner,
  ScreenWrapper,
} from '@/components';
import { colors, radius, spacing } from '@/theme';
import { useTranslation } from '@/i18n';
import { ContentResultCard } from '../components/ContentResultCard';
import { useExploreRecipes, useHomeFeed } from '../hooks';
import type { ContentType } from '../types';

const FILTERS: Array<{
  type: Exclude<ContentType, 'food-item'>;
  label: 'discover.typeRecipe' | 'discover.typePost' | 'discover.typeVideo';
}> = [
  { type: 'recipe', label: 'discover.typeRecipe' },
  { type: 'post', label: 'discover.typePost' },
  { type: 'video', label: 'discover.typeVideo' },
];

export function ExploreScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [type, setType] = useState<'recipe' | 'post' | 'video'>('recipe');
  const recipes = useExploreRecipes();
  const home = useHomeFeed();
  const content =
    type === 'recipe'
      ? (recipes.data ?? [])
      : type === 'post'
        ? (home.data?.featured.posts ?? [])
        : (home.data?.featured.videos ?? []);
  const isLoading = type === 'recipe' ? recipes.isLoading : home.isLoading;
  const error = type === 'recipe' ? recipes.error : home.error;
  const retry = type === 'recipe' ? recipes.refetch : home.refetch;
  return (
    <ScreenWrapper
      scrollable
      keyboardAvoiding={false}
      contentContainerStyle={styles.screen}
    >
      <View style={styles.header}>
        <View style={styles.heading}>
          <AppText variant="heading1">{t('discover.exploreTitle')}</AppText>
          <AppText color={colors.text.secondary}>
            {t('discover.exploreSubtitle')}
          </AppText>
        </View>
        <AppButton
          title={t('discover.search')}
          variant="outline"
          fullWidth={false}
          onPress={() => router.push('/(discover)/search')}
        />
      </View>
      <View style={styles.filters}>
        {FILTERS.map((filter) => (
          <Pressable
            key={filter.type}
            accessibilityRole="button"
            accessibilityState={{ selected: type === filter.type }}
            onPress={() => setType(filter.type)}
            style={[styles.filter, type === filter.type && styles.activeFilter]}
          >
            <AppText
              variant="chipLabel"
              color={
                type === filter.type ? colors.text.inverse : colors.text.primary
              }
            >
              {t(filter.label)}
            </AppText>
          </Pressable>
        ))}
      </View>
      {isLoading ? <LoadingSpinner text={t('discover.loadingRecipes')} /> : null}
      {error ? (
        <EmptyState
          title={t('discover.loadError')}
          description={error.message}
          actionLabel={t('common.retry')}
          onAction={() => void retry()}
        />
      ) : null}
      {!isLoading && !error && !content.length ? (
        <EmptyState
          title={t('discover.noContent')}
          description={t('discover.noContentDescription')}
        />
      ) : null}
      <View style={styles.list}>
        {content.map((item) => (
          <ContentResultCard
            key={item._id}
            item={{ ...item, type }}
            onPress={
              type === 'recipe'
                ? () =>
                    router.push({
                      pathname: '/(discover)/recipe/[id]',
                      params: { id: item.slug ?? item._id },
                    })
                : undefined
            }
          />
        ))}
      </View>
      <AppButton
        title={t('discover.savedContent')}
        variant="outline"
        onPress={() => router.push('/(discover)/saved')}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, gap: spacing.xl },
  header: { gap: spacing.lg },
  heading: { gap: spacing.xs },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filter: {
    minHeight: 38,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
  },
  activeFilter: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500],
  },
  list: { gap: spacing.md },
});
