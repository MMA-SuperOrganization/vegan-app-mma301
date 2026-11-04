import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AppText, EmptyState, LoadingSpinner } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

import { ContentResultCard } from './ContentResultCard';
import type { SavedItem, SavedItemListProps } from '../types';

type FilterType = 'recipe' | 'post' | 'video';

const PAGE_SIZE = 10;

export function SavedItemList({ items, onOpenItem, onExplore }: SavedItemListProps) {
  const { t, locale } = useTranslation();
  const vi = locale === 'vi';
  const [filter, setFilter] = useState<FilterType>('recipe');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const recipes = useMemo(
    () => items.filter((item) => item.targetType === 'recipe'),
    [items]
  );
  const posts = useMemo(
    () => items.filter((item) => item.targetType === 'post'),
    [items]
  );
  const videos = useMemo(
    () => items.filter((item) => item.targetType === 'video'),
    [items]
  );

  const currentList = useMemo(() => {
    if (filter === 'recipe') return recipes;
    if (filter === 'post') return posts;
    return videos;
  }, [filter, recipes, posts, videos]);

  const pagedItems = useMemo(
    () => currentList.slice(0, visibleCount),
    [currentList, visibleCount]
  );

  const canLoadMore = visibleCount < currentList.length;

  const selectFilter = (next: FilterType) => {
    setFilter(next);
    setVisibleCount(PAGE_SIZE);
  };

  if (!items.length) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          title={t('saved.empty')}
          description={t('saved.emptyDescription')}
          actionLabel={t('saved.backToExplore')}
          onAction={onExplore}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={pagedItems}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={ListSeparator}
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (canLoadMore) {
          setVisibleCount((count) => count + PAGE_SIZE);
        }
      }}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.filters}>
            <FilterChip
              label={vi ? 'Công thức' : 'Recipes'}
              count={recipes.length}
              selected={filter === 'recipe'}
              onPress={() => selectFilter('recipe')}
            />
            <FilterChip
              label={vi ? 'Bài viết' : 'Posts'}
              count={posts.length}
              selected={filter === 'post'}
              onPress={() => selectFilter('post')}
            />
            {videos.length > 0 ? (
              <FilterChip
                label="Video"
                count={videos.length}
                selected={filter === 'video'}
                onPress={() => selectFilter('video')}
              />
            ) : null}
          </View>
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          title={
            filter === 'recipe'
              ? vi
                ? 'Chưa có công thức đã lưu'
                : 'No saved recipes'
              : vi
                ? 'Chưa có bài viết đã lưu'
                : 'No saved posts'
          }
          description={
            filter === 'recipe'
              ? vi
                ? 'Hãy lưu những công thức yêu thích để xem lại sau.'
                : 'Save your favorite recipes to view later.'
              : vi
                ? 'Hãy lưu những bài viết bạn quan tâm.'
                : 'Save interesting community posts.'
          }
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
      ListFooterComponent={
        canLoadMore ? (
          <View style={styles.footer}>
            <LoadingSpinner text={vi ? 'Đang tải thêm…' : 'Loading more…'} />
          </View>
        ) : null
      }
    />
  );
}

function FilterChip({
  label,
  count,
  selected,
  onPress,
}: {
  label: string;
  count: number;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}
    >
      <AppText
        variant="caption"
        color={selected ? colors.text.inverse : colors.text.secondary}
      >
        {label}
      </AppText>
      {count > 0 ? (
        <View style={[styles.chipBadge, selected && styles.chipBadgeSelected]}>
          <AppText
            variant="caption"
            color={selected ? colors.primary[700] : colors.text.inverse}
          >
            {count}
          </AppText>
        </View>
      ) : null}
    </Pressable>
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
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.background.muted,
  },
  chipSelected: {
    backgroundColor: colors.primary[700],
  },
  chipBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary[700],
  },
  chipBadgeSelected: {
    backgroundColor: colors.common.white,
  },
  pressed: {
    opacity: 0.78,
  },
  separator: {
    height: spacing.md,
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
