import { View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter, type Href } from 'expo-router';
import { AppButton, AppText } from '@/components';
import { communityApi } from '@/features/community/communityApi';
import type { ReportTarget } from '@/features/community/types';
import { profileApi } from '@/features/profile/profileApi';
import { recipeApi } from '@/features/recipes/recipeApi';
import { colors, radius, spacing } from '@/theme';

interface TargetSummary {
  title: string;
  body?: string;
  href: Href;
}

const typeLabel: Record<ReportTarget, { vi: string; en: string }> = {
  post: { vi: 'Bài viết', en: 'Post' },
  recipe: { vi: 'Công thức', en: 'Recipe' },
  video: { vi: 'Video', en: 'Video' },
  user: { vi: 'Người dùng', en: 'User' },
  comment: { vi: 'Bình luận', en: 'Comment' },
};

async function loadTarget(
  type: ReportTarget,
  id: string
): Promise<TargetSummary | null> {
  switch (type) {
    case 'post': {
      const post = await communityApi.post(id);
      return {
        title: post.title,
        body: post.content,
        href: { pathname: '/community/post', params: { id } },
      };
    }
    case 'recipe': {
      const recipe = await recipeApi.detail(id);
      return {
        title: recipe.title || id,
        body: recipe.description,
        href: { pathname: '/(discover)/recipe/[id]', params: { id } },
      };
    }
    case 'video': {
      const video = await communityApi.video(id);
      return {
        title: video.title,
        body: video.description,
        href: { pathname: '/community/video', params: { id } },
      };
    }
    case 'user': {
      const profile = await profileApi.publicProfile(id);
      return {
        title: profile.displayName || profile.username || id,
        body: [profile.username ? '@' + profile.username : '', profile.bio]
          .filter(Boolean)
          .join(' · '),
        href: { pathname: '/users/[id]', params: { id } },
      };
    }
    default:
      // The API has no admin endpoint to read a single comment yet.
      return null;
  }
}

/** Shows what a report or moderation case points at instead of a bare ID. */
export function ReportTargetPreview({
  targetType,
  targetId,
  vi,
}: {
  targetType: ReportTarget;
  targetId: string;
  vi: boolean;
}) {
  const router = useRouter();
  const target = useQuery({
    queryKey: ['moderation', 'target', targetType, targetId],
    queryFn: () => loadTarget(targetType, targetId),
    retry: false,
    staleTime: 60_000,
  });
  const label = typeLabel[targetType] ?? { vi: targetType, en: targetType };
  const summary = target.data;
  return (
    <View
      style={{
        gap: spacing.xs,
        padding: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.background.muted,
      }}
    >
      <AppText variant="caption" color={colors.text.secondary}>
        {vi ? label.vi : label.en}
      </AppText>
      {target.isLoading ? (
        <AppText color={colors.text.secondary}>
          {vi ? 'Đang tải nội dung…' : 'Loading content…'}
        </AppText>
      ) : summary ? (
        <>
          <AppText variant="bodyStrong" numberOfLines={2}>
            {summary.title}
          </AppText>
          {summary.body ? (
            <AppText color={colors.text.secondary} numberOfLines={3}>
              {summary.body}
            </AppText>
          ) : null}
        </>
      ) : (
        <AppText color={colors.text.secondary}>
          {targetType === 'comment'
            ? vi
              ? 'Chưa xem được nội dung bình luận.'
              : 'Comment content is not available yet.'
            : vi
              ? 'Không tải được nội dung (có thể đã bị ẩn hoặc xóa).'
              : 'Could not load content (it may be hidden or deleted).'}
        </AppText>
      )}
      <AppText variant="caption" color={colors.text.secondary} selectable>
        ID: {targetId}
      </AppText>
      {summary ? (
        <AppButton
          title={vi ? 'Xem nội dung' : 'View content'}
          variant="ghost"
          fullWidth={false}
          onPress={() => router.push(summary.href)}
        />
      ) : null}
    </View>
  );
}
