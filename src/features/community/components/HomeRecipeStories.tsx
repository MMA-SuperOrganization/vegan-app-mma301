import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import type { ContentCardData } from '@/features/recipes/types';
import { RecipeImage } from '@/features/recipes/components/RecipeImage';

export function HomeRecipeStories({ recipes, onSelect }: { recipes: ContentCardData[]; onSelect: (recipe: ContentCardData) => void }) {
  const { t } = useTranslation();
  if (!recipes.length) return null;
  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <AppText variant="heading3">{t('home.socialStories')}</AppText>
        <AppText variant="caption" color={colors.text.secondary}>{t('home.viewAll')}</AppText>
      </View>
      <FlatList
        horizontal
        data={recipes.slice(0, 8)}
        keyExtractor={(item) => item._id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" onPress={() => onSelect(item)} style={({ pressed }) => [styles.story, pressed && styles.pressed]}>
            <RecipeImage uri={item.coverImageUrl} style={styles.image} fallbackSize="large" />
            <View style={styles.storyLabel}><AppText color={colors.common.white} numberOfLines={2} style={styles.label}>{item.title ?? t('recipe.defaultTitle')}</AppText></View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  list: { paddingRight: spacing.xl },
  story: { width: 116, height: 172, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.background.selected, position: 'relative' },
  image: { width: '100%', height: '100%', borderRadius: 0 },
  storyLabel: { position: 'absolute', left: spacing.sm, right: spacing.sm, bottom: spacing.sm },
  label: { fontSize: 13, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.45)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  pressed: { opacity: 0.78 },
});
