import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppIcon, FilterChip } from '@/components';
import { useTranslation, type TranslationKey } from '@/i18n';
import { colors, interactionTokens, radius, spacing } from '@/theme';

import type { ContentType, SearchResultsFilterBarProps } from '../types';

const contentTypes: Array<{ value: ContentType | 'all'; labelKey: TranslationKey }> =
  [
    { value: 'all', labelKey: 'discover.filterAll' },
    { value: 'recipe', labelKey: 'discover.typeRecipe' },
    { value: 'post', labelKey: 'discover.typePost' },
    { value: 'food-item', labelKey: 'discover.typeFood' },
    { value: 'video', labelKey: 'discover.typeVideo' },
  ];

export function SearchResultsFilterBar({
  selectedType,
  onSelectType,
  hasActiveFilters,
  onOpenFilters,
}: SearchResultsFilterBarProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollFilters}
          contentContainerStyle={styles.filters}
        >
          {contentTypes.map((filter) => (
            <FilterChip
              key={filter.value}
              label={t(filter.labelKey)}
              selected={selectedType === filter.value}
              onPress={() => onSelectType(filter.value)}
            />
          ))}
        </ScrollView>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={hasActiveFilters ? t('filters.editActive') : t('filters.edit')}
          accessibilityState={{ selected: hasActiveFilters }}
          hitSlop={interactionTokens.iconHitSlop}
          onPress={onOpenFilters}
          style={({ pressed }) => [
            styles.filterButton,
            hasActiveFilters && styles.filterButtonActive,
            pressed && styles.pressed,
          ]}
        >
          <AppIcon
            name="filter"
            size={18}
            color={hasActiveFilters ? colors.text.inverse : colors.primary[700]}
            decorative
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  scrollFilters: { flex: 1 },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.xs,
  },
  filterButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary[300],
    borderRadius: radius.full,
    backgroundColor: colors.background.surface,
  },
  filterButtonActive: {
    borderColor: colors.primary[700],
    backgroundColor: colors.primary[700],
  },
  pressed: { opacity: 0.7 },
});
