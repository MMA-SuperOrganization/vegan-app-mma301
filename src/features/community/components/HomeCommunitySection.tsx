import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppText, Surface } from '@/components';
import type { PostCardData } from '@/features/recipes/types';
import { colors, spacing } from '@/theme';

export function HomeCommunitySection({
  posts,
  vi,
  onOpenPost,
  onViewAll,
  onWritePost,
}: {
  posts: PostCardData[];
  vi: boolean;
  onOpenPost: (post: PostCardData) => void;
  onViewAll: () => void;
  onWritePost: () => void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <View style={styles.headingText}>
          <AppText variant="heading2">
            {vi ? 'Từ cộng đồng' : 'From the community'}
          </AppText>
          <AppText color={colors.text.secondary}>
            {vi
              ? 'Bài viết là nơi trao đổi; công thức vẫn là nội dung trung tâm.'
              : 'Posts are for discussion; recipes remain the core content.'}
          </AppText>
        </View>
        <AppButton
          title={vi ? 'Xem tất cả' : 'View all'}
          variant="ghost"
          fullWidth={false}
          onPress={onViewAll}
        />
      </View>

      {posts.length ? (
        posts.slice(0, 3).map((post) => (
          <Pressable
            key={post._id}
            accessibilityRole="button"
            onPress={() => onOpenPost(post)}
          >
            <Surface bordered padding="lg" radius="lg" style={styles.card}>
              <AppText variant="heading4" numberOfLines={2}>
                {post.title}
              </AppText>
              {post.excerpt ? (
                <AppText color={colors.text.secondary} numberOfLines={3}>
                  {post.excerpt}
                </AppText>
              ) : null}
              <View style={styles.metadata}>
                {post.recipeId ? (
                  <AppText variant="caption" color={colors.primary[700]}>
                    {vi ? 'Có công thức liên quan' : 'Linked recipe'}
                  </AppText>
                ) : null}
                <AppText variant="caption" color={colors.text.secondary}>
                  {post.reactionCount ?? 0} {vi ? 'lượt thích' : 'reactions'} ·{' '}
                  {post.commentCount ?? 0} {vi ? 'bình luận' : 'comments'}
                </AppText>
              </View>
            </Surface>
          </Pressable>
        ))
      ) : (
        <AppText color={colors.text.secondary}>
          {vi ? 'Chưa có bài viết đã được duyệt.' : 'No approved posts yet.'}
        </AppText>
      )}

      <AppButton
        title={vi ? 'Đăng bài mới' : 'Create a post'}
        variant="outline"
        onPress={onWritePost}
      />
      <AppText variant="caption" color={colors.text.secondary}>
        {vi
          ? 'Bài mới chỉ xuất hiện sau khi quản trị viên phê duyệt.'
          : 'New posts appear only after administrator approval.'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headingText: { flex: 1, gap: spacing.xs },
  card: { gap: spacing.sm },
  metadata: { gap: spacing.xs },
});
