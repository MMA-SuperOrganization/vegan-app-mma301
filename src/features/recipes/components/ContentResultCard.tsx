import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components';
import { colors, radius, spacing } from '@/theme';
import type { ContentCardData } from '../types';
import { useTranslation, type TranslationKey } from '@/i18n';
import { RecipeImage } from './RecipeImage';
import { ContentSaveButton } from './ContentSaveButton';

const typeLabels = {
  recipe: 'discover.typeRecipe',
  'food-item': 'discover.typeFood',
  post: 'discover.typePost',
  video: 'discover.typeVideo',
} as const;

export function ContentResultCard({
  item,
  onPress,
}: {
  item: ContentCardData;
  onPress?: () => void;
}) {
  const { t } = useTranslation();
  const title = item.title ?? item.name ?? t('discover.untitled');
  const metadata = [
    t((item.type ? typeLabels[item.type] : 'discover.typeRecipe') as TranslationKey),
    item.totalMinutes ? t('common.minutes', { count: item.totalMinutes }) : null,
    (item.ratingCount ?? 0) > 0 && item.ratingAverage != null
      ? `${item.ratingAverage.toFixed(1)} ★`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <RecipeImage
        uri={item.coverImageUrl ?? item.imageUrl}
        style={styles.thumbnail}
      />
      <View style={styles.content}>
        <AppText variant="bodyStrong" numberOfLines={2}>
          {title}
        </AppText>
        <AppText variant="bodySmall" color={colors.primary[700]}>
          {metadata}
        </AppText>
        {item.description || item.excerpt ? (
          <AppText
            variant="bodySmall"
            color={colors.text.secondary}
            numberOfLines={2}
          >
            {item.description ?? item.excerpt}
          </AppText>
        ) : null}
      </View>
      <ContentSaveButton content={item} compact />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  thumbnail: { width: 72, height: 72, borderRadius: radius.md },
  content: { flex: 1, minWidth: 0, gap: spacing.xs, justifyContent: 'center' },
  pressed: { opacity: 0.72 },
});
