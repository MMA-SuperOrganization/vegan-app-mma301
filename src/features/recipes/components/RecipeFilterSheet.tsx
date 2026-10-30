import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  AppButton,
  AppText,
  BottomSheet,
  EmptyState,
  FilterChip,
  LoadingSpinner,
  Toggle,
} from '@/components';
import { useProfileStore } from '@/features/profile/profileStore';
import { useTranslation, type TranslationKey } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

import { filtersForContentType } from '../filterState';
import { useContentCategories } from '../hooks';
import type { ContentType, RecipeFilters } from '../types';

const durations = [15, 30, 60] as const;
const difficulties = ['easy', 'medium', 'hard'] as const;
const diets = ['vegan', 'vegetarian'] as const;
const sorts = ['popular', 'newest', 'rating', 'quickest'] as const;

export interface RecipeFilterSheetProps {
  visible: boolean;
  contentType: ContentType | 'all';
  initialFilters: RecipeFilters;
  onClose: () => void;
  onApply: (filters: RecipeFilters) => void;
}

export function RecipeFilterSheet({
  visible,
  contentType,
  initialFilters,
  onClose,
  onApply,
}: RecipeFilterSheetProps) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<RecipeFilters>(initialFilters);
  const categories = useContentCategories(
    contentType === 'food-item'
      ? 'food'
      : contentType === 'recipe'
        ? 'recipe'
        : undefined
  );
  const profile = useProfileStore((state) => state.data);
  const allergenIds = profile?.nutritionProfile?.allergenIds ?? [];
  const allergySelectionReady =
    profile?.nutritionProfile?.allergenSelectionCompleted === true &&
    allergenIds.length > 0;

  useEffect(() => {
    if (visible) setFilters(initialFilters);
  }, [initialFilters, visible]);

  const update = (next: Partial<RecipeFilters>) =>
    setFilters((current) => ({ ...current, ...next }));

  return (
    <BottomSheet
      visible={visible}
      title={t('filters.title')}
      onClose={onClose}
      tall
      showFooterClose={false}
    >
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <AppText color={colors.text.secondary}>{t('filters.subtitle')}</AppText>

        <FilterSection title={t('filters.category')}>
          {categories.isLoading ? (
            <LoadingSpinner text={t('filters.loadingCategories')} />
          ) : null}
          {categories.isError ? (
            <EmptyState
              title={t('filters.categoryError')}
              actionLabel={t('common.retry')}
              onAction={() => void categories.refetch()}
            />
          ) : null}
          <Options>
            <FilterOption
              label={t('filters.any')}
              selected={!filters.category}
              onPress={() => update({ category: undefined })}
            />
            {categories.data?.data.map((category) => (
              <FilterOption
                key={category._id}
                label={category.name}
                selected={filters.category === category._id}
                onPress={() => update({ category: category._id })}
              />
            ))}
          </Options>
        </FilterSection>

        {contentType !== 'food-item' ? (
          <FilterSection title={t('filters.duration')}>
            <Options>
              <FilterOption
                label={t('filters.any')}
                selected={!filters.maxTotalMinutes}
                onPress={() => update({ maxTotalMinutes: undefined })}
              />
              {durations.map((minutes) => (
                <FilterOption
                  key={minutes}
                  label={t('filters.underMinutes', { count: minutes })}
                  selected={filters.maxTotalMinutes === minutes}
                  onPress={() => update({ maxTotalMinutes: minutes })}
                />
              ))}
            </Options>
          </FilterSection>
        ) : null}

        {contentType !== 'food-item' ? (
          <FilterSection title={t('filters.difficulty')}>
            <Options>
              <FilterOption
                label={t('filters.any')}
                selected={!filters.difficulty}
                onPress={() => update({ difficulty: undefined })}
              />
              {difficulties.map((difficulty) => (
                <FilterOption
                  key={difficulty}
                  label={t(`filters.difficulty.${difficulty}` as TranslationKey)}
                  selected={filters.difficulty === difficulty}
                  onPress={() => update({ difficulty })}
                />
              ))}
            </Options>
          </FilterSection>
        ) : null}

        <FilterSection title={t('filters.diet')}>
          <Options>
            <FilterOption
              label={t('filters.any')}
              selected={!filters.dietType}
              onPress={() => update({ dietType: undefined })}
            />
            {diets.map((diet) => (
              <FilterOption
                key={diet}
                label={t(`filters.diet.${diet}` as TranslationKey)}
                selected={filters.dietType === diet}
                onPress={() => update({ dietType: diet })}
              />
            ))}
          </Options>
        </FilterSection>

        {contentType !== 'food-item' ? (
          <FilterSection title={t('filters.sort')}>
            <Options>
              {sorts.map((sort) => (
                <FilterOption
                  key={sort}
                  label={t(`filters.sort.${sort}` as TranslationKey)}
                  selected={(filters.sort ?? 'popular') === sort}
                  onPress={() => update({ sort })}
                />
              ))}
            </Options>
          </FilterSection>
        ) : null}

        <View style={styles.allergenBlock}>
          <Toggle
            value={Boolean(filters.avoidProfileAllergens)}
            disabled={!allergySelectionReady}
            label={t('filters.avoidAllergens')}
            onValueChange={(avoidProfileAllergens) =>
              update({ avoidProfileAllergens })
            }
          />
          <AppText variant="caption" color={colors.text.secondary}>
            {allergySelectionReady
              ? t('filters.avoidAllergensDescription')
              : t('filters.allergensUnavailable')}
          </AppText>
        </View>

      </ScrollView>
      <View style={styles.actions}>
        <View style={styles.actionCell}>
          <AppButton
            title={t('filters.apply')}
            onPress={() => onApply(filtersForContentType(filters, contentType))}
          />
        </View>
        <View style={styles.actionCell}>
          <AppButton
            title={t('filters.clear')}
            variant="outline"
            onPress={() => setFilters({})}
          />
        </View>
      </View>
    </BottomSheet>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <AppText variant="heading4" color={colors.text.secondary}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

function Options({ children }: { children: React.ReactNode }) {
  return <View style={styles.options}>{children}</View>;
}

function FilterOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return <FilterChip label={label} selected={selected} onPress={onPress} />;
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingBottom: spacing.md, gap: spacing.xl },
  section: { gap: spacing.md },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  allergenBlock: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  actionCell: { flex: 1 },
});
