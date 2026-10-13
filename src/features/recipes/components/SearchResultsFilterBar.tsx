import { StyleSheet, View } from 'react-native';

import { AppButton, FilterChip } from '@/components';
import { useTranslation, type TranslationKey } from '@/i18n';
import { spacing } from '@/theme';

import type { ContentType, SearchResultsFilterBarProps } from '../types';

const contentTypes: Array<{ value: ContentType | 'all'; labelKey: TranslationKey }> = [
  { value: 'all', labelKey: 'discover.filterAll' },
  { value: 'recipe', labelKey: 'discover.typeRecipe' },
  { value: 'food-item', labelKey: 'discover.typeFood' },
  { value: 'post', labelKey: 'discover.typePost' },
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
      <View style={styles.filters}>
        {contentTypes.map((filter) => (
          <FilterChip
            key={filter.value}
            label={t(filter.labelKey)}
            selected={selectedType === filter.value}
            onPress={() => onSelectType(filter.value)}
          />
        ))}
      </View>
      <AppButton
        title={hasActiveFilters ? t('filters.editActive') : t('filters.edit')}
        variant="outline"
        onPress={onOpenFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
