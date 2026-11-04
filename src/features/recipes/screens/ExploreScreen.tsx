import { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  AppIcon,
  AppText,
  CustomHeader,
  EmptyState,
  LoadingSpinner,
  ScreenWrapper,
} from '@/components';
import { useTranslation, type TranslationKey } from '@/i18n';
import { getUserErrorMessage } from '@/services/errors';
import { colors, radius, spacing, webLayout } from '@/theme';

import { ExploreRecipeCard } from '../components/ExploreRecipeCard';
import { useExploreRecipes, useRecipeCategories } from '../hooks';
import type { RecipeSort } from '../types';

const sorts: RecipeSort[] = ['popular', 'newest', 'quickest'];

export function ExploreScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [category, setCategory] = useState<string>();
  const [sort, setSort] = useState<RecipeSort>('popular');
  const { width } = useWindowDimensions();
  const columnCount =
    Platform.OS !== 'web'
      ? 2
      : width >= webLayout.wideBreakpoint
        ? 4
        : width >= webLayout.desktopBreakpoint
          ? 3
          : 2;
  const filters = useMemo(() => ({ category, sort, limit: 12 }), [category, sort]);
  const recipes = useExploreRecipes(filters);
  const categories = useRecipeCategories();
  const content = recipes.data?.pages.flatMap((page) => page.data) ?? [];
  const total = recipes.data?.pages[0]?.meta?.total;

  return (
    <ScreenWrapper
      webMaxWidth={webLayout.catalogMaxWidth}
      keyboardAvoiding={false}
      header={
        <CustomHeader
          title={t('discover.exploreTitle')}
          showBack
          backFallbackHref="/(tabs)"
          rightAction={{
            icon: 'heart',
            accessibilityLabel: t('discover.savedContent'),
            onPress: () => router.push('/(discover)/saved'),
          }}
        />
      }
    >
      <FlatList
        key={`recipe-grid-${columnCount}`}
        data={content}
        numColumns={columnCount}
        keyExtractor={(recipe) => recipe._id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.screen}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshing={recipes.isRefetching && !recipes.isFetchingNextPage}
        onRefresh={() => void recipes.refetch()}
        onEndReachedThreshold={0.45}
        onEndReached={() => {
          if (recipes.hasNextPage && !recipes.isFetchingNextPage) {
            void recipes.fetchNextPage();
          }
        }}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={styles.hero}>
              <View style={styles.heroCopy}>
                <AppText variant="heading2" color={colors.primary[800]}>
                  {t('discover.recipeLibraryTitle')}
                </AppText>
                <AppText color={colors.text.secondary}>
                  {t('discover.recipeLibraryDescription')}
                </AppText>
              </View>
              <View style={styles.heroMark}>
                <AppIcon
                  name="spark"
                  size={28}
                  color={colors.primary[700]}
                  decorative
                />
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('discover.search')}
              onPress={() => router.push('/(discover)/search')}
              style={({ pressed }) => [styles.search, pressed && styles.pressed]}
            >
              <AppIcon
                name="search"
                size={21}
                color={colors.primary[700]}
                decorative
              />
              <AppText color={colors.text.secondary} style={styles.searchText}>
                {t('discover.searchPlaceholder')}
              </AppText>
              <View style={styles.searchAction}>
                <AppText variant="bodyStrong" color={colors.text.inverse}>
                  ›
                </AppText>
              </View>
            </Pressable>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              <OptionChip
                label={t('filters.any')}
                selected={!category}
                onPress={() => setCategory(undefined)}
              />
              {categories.data?.data.map((item) => (
                <OptionChip
                  key={item._id}
                  label={item.name}
                  selected={category === item._id}
                  onPress={() => setCategory(item._id)}
                />
              ))}
            </ScrollView>

            <View style={styles.libraryHeading}>
              <View>
                <AppText variant="heading3">
                  {t('discover.recipeLibraryTitle')}
                </AppText>
                {typeof total === 'number' ? (
                  <AppText variant="caption" color={colors.text.secondary}>
                    {total} {t('discover.typeRecipe').toLocaleLowerCase()}
                  </AppText>
                ) : null}
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sorts}
              >
                {sorts.map((value) => (
                  <SortChip
                    key={value}
                    label={t(`filters.sort.${value}` as TranslationKey)}
                    selected={sort === value}
                    onPress={() => setSort(value)}
                  />
                ))}
              </ScrollView>
            </View>

            {categories.isError ? (
              <AppText variant="caption" color={colors.status.danger}>
                {t('filters.categoryError')}
              </AppText>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          recipes.isLoading ? (
            <LoadingSpinner text={t('discover.loadingRecipes')} />
          ) : recipes.isError ? (
            <EmptyState
              title={t('discover.loadError')}
              description={getUserErrorMessage(recipes.error)}
              actionLabel={t('common.retry')}
              onAction={() => void recipes.refetch()}
            />
          ) : (
            <EmptyState
              title={t('discover.noRecipes')}
              description={t('discover.noRecipesDescription')}
            />
          )
        }
        renderItem={({ item }) => (
          <View
            style={
              Platform.OS === 'web' ? styles.webCardCell : styles.cardCell
            }
          >
            <ExploreRecipeCard
              recipe={item}
              onPress={() =>
                router.push({
                  pathname: '/(discover)/recipe/[id]',
                  params: { id: item.slug ?? item._id },
                })
              }
            />
          </View>
        )}
        ListFooterComponent={
          recipes.isFetchingNextPage ? (
            <View style={styles.footer}>
              <LoadingSpinner text={t('discover.loadingRecipes')} />
            </View>
          ) : null
        }
      />
    </ScreenWrapper>
  );
}

function OptionChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <AppText
        variant="bodySmall"
        color={selected ? colors.text.inverse : colors.text.primary}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function SortChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.sortChip, selected && styles.sortChipSelected]}
    >
      <AppText
        variant="caption"
        color={selected ? colors.primary[700] : colors.text.secondary}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  headerContent: { gap: spacing.lg, paddingBottom: spacing.lg },
  hero: {
    minHeight: 132,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.background.selected,
    overflow: 'hidden',
  },
  heroCopy: { flex: 1, gap: spacing.sm },
  heroMark: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.surface,
  },
  search: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
  },
  searchText: { flex: 1 },
  searchAction: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary[700],
  },
  chips: { gap: spacing.sm, paddingRight: spacing.lg },
  chip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
  },
  chipSelected: {
    borderColor: colors.primary[700],
    backgroundColor: colors.primary[700],
  },
  libraryHeading: { gap: spacing.md },
  sorts: { gap: spacing.sm },
  sortChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.background.muted,
  },
  sortChipSelected: { backgroundColor: colors.background.selected },
  row: { gap: spacing.md, marginBottom: spacing.md },
  cardCell: { flex: 1, maxWidth: '48%' },
  webCardCell: { flex: 1, minWidth: 0 },
  footer: { paddingVertical: spacing.xl },
  pressed: { opacity: 0.76 },
});
