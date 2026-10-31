import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import type { PostCardData } from '@/features/recipes/types';
import { RecipeImage } from '@/features/recipes/components/RecipeImage';

export function HomeSocialPostCard({ post, onPress }: { post: PostCardData; onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.header}>
        <View style={styles.author}><AppText variant="bodyStrong" numberOfLines={1}>{post.title ?? t('home.communityName')}</AppText><AppText variant="caption" color={colors.text.secondary}>{t('home.communityTime')}</AppText></View>
        <AppText style={styles.more}>•••</AppText>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.body}>
        {post.excerpt || post.description ? <AppText variant="bodyLarge" style={styles.copy}>{post.excerpt ?? post.description}</AppText> : null}
        {post.coverImageUrl ? <RecipeImage uri={post.coverImageUrl} style={styles.postImage} fallbackSize="large" /> : null}
      </Pressable>
      <View style={styles.stats}><AppText variant="caption" color={colors.text.secondary}>♡ {post.reactionCount ?? 0}</AppText><AppText variant="caption" color={colors.text.secondary}>{post.commentCount ?? 0} {t('home.comments')}</AppText></View>
      <View style={styles.actions}>
        <Pressable style={styles.action}><AppIcon name="heart" size={20} color={colors.text.secondary} decorative /><AppText variant="caption">{t('home.like')}</AppText></Pressable>
        <Pressable style={styles.action} onPress={onPress}><AppIcon name="comment" size={20} color={colors.text.secondary} decorative /><AppText variant="caption">{t('home.comment')}</AppText></Pressable>
        <Pressable style={styles.action}><AppIcon name="share" size={20} color={colors.text.secondary} decorative /><AppText variant="caption">{t('home.share')}</AppText></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.background.surface, borderRadius: radius.xl, paddingTop: spacing.md, overflow: 'hidden', gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, gap: spacing.sm },
  author: { flex: 1, gap: 2 },
  more: { color: colors.text.secondary, fontWeight: '800', letterSpacing: 2 },
  body: { gap: spacing.sm },
  copy: { paddingHorizontal: spacing.md, lineHeight: 24 },
  postImage: { width: '100%', height: 250, borderRadius: 0 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingBottom: spacing.xs },
  actions: { borderTopWidth: 1, borderTopColor: colors.border.subtle, flexDirection: 'row', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  action: { flex: 1, minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
});
