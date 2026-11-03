import { Image, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';

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
}: {
  author?: PostAuthorSummary | null;
  createdAt?: string;
  publishedAt?: string;
  status?: string;
  visibility?: 'public' | 'private';
  vi: boolean;
  trailing?: ReactNode;
}) {
  const relativeTime = formatCommentRelativeTime(
    publishedAt ?? createdAt,
    vi ? 'vi' : 'en'
  );
  const authorName =
    author?.displayName?.trim() || (vi ? 'Thành viên' : 'Member');

  return (
    <View style={styles.container}>
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
        <AppText variant="bodyStrong" numberOfLines={1}>
          {authorName}
        </AppText>
        <View style={styles.meta}>
          {relativeTime ? (
            <AppText variant="caption" color={colors.text.secondary}>
              {relativeTime}
            </AppText>
          ) : null}
          {status === 'published' ? (
            <View style={styles.published}>
              <View style={styles.publishedDot} />
              <AppText variant="caption" color={colors.status.success}>
                {vi ? 'Đã đăng' : 'Published'}
              </AppText>
            </View>
          ) : null}
          <AppIcon
            name={visibility === 'private' ? 'eye-off' : 'eye'}
            size={13}
            color={colors.text.secondary}
            decorative
          />
        </View>
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  published: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  publishedDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.status.success,
  },
});
