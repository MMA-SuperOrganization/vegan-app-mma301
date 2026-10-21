import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppText, CustomHeader, ScreenWrapper } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useCommunityPosts } from '../hooks';
import { postStatusLabel } from '../status';

export function CommunityScreen() {
  const router = useRouter();
  const vi = useTranslation().locale === 'vi';
  const [mine, setMine] = useState(false);
  const posts = useCommunityPosts(mine);
  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
      header={
        <CustomHeader
          title={vi ? 'Cộng đồng' : 'Community'}
          showBack
          backFallbackHref="/(tabs)/profile"
        />
      }
    >
      <AppButton
        title={vi ? 'Viết bài' : 'Write a post'}
        onPress={() => router.push('/community/editor')}
      />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <AppButton
          title={vi ? 'Bảng tin' : 'Feed'}
          fullWidth={false}
          variant={mine ? 'outline' : 'primary'}
          onPress={() => setMine(false)}
        />
        <AppButton
          title={vi ? 'Bài của tôi' : 'My posts'}
          fullWidth={false}
          variant={mine ? 'primary' : 'outline'}
          onPress={() => setMine(true)}
        />
      </View>
      <FeatureState
        loading={posts.isLoading}
        error={posts.error}
        retry={() => void posts.refetch()}
      />
      {posts.data?.data.length === 0 ? (
        <AppText>{vi ? 'Chưa có bài viết.' : 'No posts yet.'}</AppText>
      ) : null}
      {posts.data?.data.map((post) => (
        <View
          key={post._id}
          style={{
            backgroundColor: colors.background.surface,
            borderRadius: radius.lg,
            padding: spacing.lg,
            gap: spacing.sm,
          }}
        >
          <AppText variant="heading3">{post.title}</AppText>
          <AppText numberOfLines={3}>{post.content}</AppText>
          {mine ? <AppText>{postStatusLabel(post.status, vi)}</AppText> : null}
          <AppButton
            title={vi ? 'Xem bài viết' : 'Read post'}
            variant="outline"
            onPress={() =>
              router.push({ pathname: '/community/post', params: { id: post._id } })
            }
          />
        </View>
      ))}
    </ScreenWrapper>
  );
}
