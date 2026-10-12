import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AppText, EmptyState } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';

import { ContentResultCard } from './ContentResultCard';
import type { UserRecommendationsSectionProps } from '../types';

export function UserRecommendationsSection({
  userName,
  recipes,
  cardWidth,
  onSelectRecipe,
  onViewAll,
  hasRecommendations,
  isLoading = false,
  isError = false,
  onResetFilter,
}: UserRecommendationsSectionProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <AppText variant="heading3">
          {t('home.forUser', { name: userName })}
        </AppText>
        <Pressable onPress={onViewAll} hitSlop={8}>
          <AppText variant="bodyStrong" color={colors.primary[700]}>
            {t('home.viewAll')}
          </AppText>
        </Pressable>
      </View>

      {recipes.length ? (
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
      ) : !isLoading && !isError && hasRecommendations ? (
        <EmptyState
          title={t('home.noFilteredRecipes')}
          description={t('home.noFilteredRecipesDescription')}
          actionLabel={t('home.filterAll')}
          onAction={onResetFilter}
        />
      ) : null}
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
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  separator: {
    width: spacing.md,
  },
});
