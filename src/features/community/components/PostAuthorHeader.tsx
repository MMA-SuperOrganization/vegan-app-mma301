import { Image, Pressable, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { AppIcon, AppText } from '@/components';
import { colors, radius, spacing } from '@/theme';

import { formatCommentRelativeTime } from '../commentPresentation';
import type { PostAuthorSummary } from '../types';

export function PostAuthorHeader({
  author,
  createdAt,
  publishedAt,
  status,
  visibility = 'public',
  vi,
  trailing,
  onAuthorPress,
}: {
  author?: PostAuthorSummary | null;
  createdAt?: string;
  publishedAt?: string;
  status?: string;
  visibility?: 'public' | 'private';
  vi: boolean;
  trailing?: ReactNode;
  /** Opens the public author profile when provided. */
  onAuthorPress?: () => void;
}) {
  const relativeTime = formatCommentRelativeTime(
    publishedAt ?? createdAt,
    vi ? 'vi' : 'en'
  );
  const authorName =
    author?.displayName?.trim() || (vi ? 'Thành viên' : 'Member');

  const identity = (
    <>
      {author?.avatarUrl ? (
        <Image
          source={{ uri: author.avatarUrl }}
          style={styles.avatar}
          accessibilityLabel={vi ? 'Ảnh đại diện tác giả' : 'Author avatar'}
        />
      ) : (
        <View style={styles.avatarFallback}>
          <AppIcon name="user" size={20} color={colors.primary[700]} decorative />
        </View>
      )}
      <View style={styles.copy}>
        <AppText
          variant="bodyStrong"
          numberOfLines={1}
          color={onAuthorPress ? colors.primary[700] : undefined}
        >
          {authorName}
        </AppText>
        <View style={styles.meta}>
          {relativeTime ? (
            <AppText variant="caption" color={colors.text.secondary}>
              {relativeTime}
            </AppText>
          ) : null}
          {status === 'published' || visibility === 'private' ? (
            <View
              accessible
              accessibilityRole="image"
              accessibilityLabel={
                visibility === 'private'
                  ? vi
                    ? 'Bài viết riêng tư'
                    : 'Private post'
                  : vi
                    ? 'Bài viết công khai đã đăng'
                    : 'Published public post'
              }
            >
              <VisibilityIcon privatePost={visibility === 'private'} />
            </View>
          ) : null}
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {onAuthorPress ? (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={
            vi ? `Xem hồ sơ của ${authorName}` : `View ${authorName}'s profile`
          }
          onPress={onAuthorPress}
          style={({ pressed }) => [styles.identity, pressed && styles.identityPressed]}
        >
          {identity}
        </Pressable>
      ) : (
        identity
      )}
      {trailing}
    </View>
  );
}

function VisibilityIcon({ privatePost }: { privatePost: boolean }) {
  const color = colors.text.secondary;
  if (privatePost) {
    return (
      <Svg width={15} height={15} viewBox="0 0 15 15" fill="none">
        <Rect x="2.5" y="6.5" width="10" height="7" rx="1.5" stroke={color} strokeWidth="1.2" />
        <Path d="M4.5 6.5V4.75a3 3 0 0 1 6 0V6.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      </Svg>
    );
  }
  return (
    <Svg width={15} height={15} viewBox="0 0 15 15" fill="none">
      <Circle cx="7.5" cy="7.5" r="5.9" stroke={color} strokeWidth="1.1" />
      <Path d="M1.8 7.5h11.4M7.5 1.7c1.7 1.6 2.5 3.5 2.5 5.8s-.8 4.2-2.5 5.8c-1.7-1.6-2.5-3.5-2.5-5.8s.8-4.2 2.5-5.8Z" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  identity: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  identityPressed: {
    opacity: 0.72,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  avatarFallback: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.selected,
  },
  copy: { flex: 1, gap: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
