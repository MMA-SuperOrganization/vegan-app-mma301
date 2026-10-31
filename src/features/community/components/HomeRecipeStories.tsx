import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { colors, radius, spacing } from '@/theme';
import type { ContentCardData } from '@/features/recipes/types';
import { RecipeImage } from '@/features/recipes/components/RecipeImage';

export function HomeRecipeStories({ recipes, onSelect }: { recipes: ContentCardData[]; onSelect: (recipe: ContentCardData) => void }) {
  if (!recipes.length) return null;
  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <AppText variant="heading3">Gợi ý cho bạn</AppText>
        <AppText variant="caption" color={colors.text.secondary}>Xem tất cả</AppText>
      </View>
      <FlatList
        horizontal
        data={recipes.slice(0, 8)}
        keyExtractor={(item) => item._id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
        renderItem={({ item, index }) => (
          <Pressable accessibilityRole="button" onPress={() => onSelect(item)} style={({ pressed }) => [styles.story, pressed && styles.pressed]}>
            <RecipeImage uri={item.coverImageUrl} style={styles.image} fallbackSize="large" />
            <View style={styles.ring} />
            <View style={styles.storyLabel}><AppText color={colors.common.white} numberOfLines={2} style={styles.label}>{item.title ?? 'Công thức mới'}</AppText></View>
            {index === 0 ? <View style={styles.plus}><AppText style={styles.plusText}>+</AppText></View> : null}
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
  ring: { position: 'absolute', top: 10, left: 10, width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: '#2D8CFF', backgroundColor: colors.background.surface },
  storyLabel: { position: 'absolute', left: spacing.sm, right: spacing.sm, bottom: spacing.sm },
  label: { fontSize: 13, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.45)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  plus: { position: 'absolute', left: 43, bottom: 24, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary[700], borderWidth: 3, borderColor: colors.common.white, alignItems: 'center', justifyContent: 'center' },
  plusText: { color: colors.common.white, fontSize: 24, lineHeight: 25, fontWeight: '500' },
  pressed: { opacity: 0.78 },
});
