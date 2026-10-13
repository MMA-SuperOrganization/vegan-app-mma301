import { FlatList, StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme';

import { ContentResultCard } from './ContentResultCard';
import type { QuickRecipesSectionProps } from '../types';

export function QuickRecipesSection({
  recipes,
  cardWidth,
  onSelectRecipe,
}: QuickRecipesSectionProps) {
  const { t } = useTranslation();

  if (!recipes.length) {
    return null;
  }

  return (
    <View style={styles.section}>
      <AppText variant="heading3">{t('home.quickUnderThirty')}</AppText>
      <FlatList
        horizontal
        data={recipes}
        keyExtractor={(item) => item._id}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={ListSeparator}
        renderItem={({ item }) => (
          <ContentResultCard
            item={{ ...item, type: 'recipe' }}
            style={{ width: cardWidth }}
            onPress={() => onSelectRecipe(item)}
          />
        )}
      />
    </View>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  separator: {
    width: spacing.md,
  },
});
