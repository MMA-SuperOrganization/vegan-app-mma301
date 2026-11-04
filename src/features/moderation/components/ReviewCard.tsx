import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppButton, AppText } from '@/components';
import { AdminStatusBadge } from '@/features/admin/AdminUi';
import { mediaApi } from '@/features/media/mediaApi';
import { RecipeImage } from '@/features/recipes/components/RecipeImage';
import { colors, radius, spacing } from '@/theme';
import type { RecipeReviewItem } from '../moderationApi';

export function ReviewCard({ target, vi }: { target: RecipeReviewItem; vi: boolean }) {
  const router = useRouter();
  const cover = useQuery({
    queryKey: ['moderation', 'recipe-card-media', target.coverMediaId],
    queryFn: () => mediaApi.asset(target.coverMediaId!),
    enabled: !target.coverImageUrl && !!target.coverMediaId,
    staleTime: 60_000,
  });
  const totalMinutes = target.totalMinutes ?? target.totalTimeMinutes;
  const summary = target.description ?? target.excerpt;
  const details = [
    target.difficulty ? difficultyLabel(target.difficulty, vi) : null,
    totalMinutes != null ? `${totalMinutes} ${vi ? 'phút' : 'min'}` : null,
    target.createdAt ? formatDate(target.createdAt, vi) : null,
  ].filter(Boolean);

  return (
    <View style={styles.card}>
      <View style={styles.preview}>
        <RecipeImage
          uri={target.coverImageUrl ?? cover.data?.downloadUrl}
          style={styles.cover}
        />
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <AppText variant="heading4" numberOfLines={2} style={styles.title}>
              {target.title}
            </AppText>
            <AdminStatusBadge
              label={vi ? 'Chờ duyệt' : 'Pending'}
              tone="warning"
            />
          </View>
          {summary ? (
            <AppText
              variant="bodySmall"
              color={colors.text.secondary}
              numberOfLines={2}
            >
              {summary}
            </AppText>
          ) : null}
          {details.length ? (
            <AppText variant="bodySmall" color={colors.text.secondary}>
              {details.join(' · ')}
            </AppText>
          ) : null}
          {target.tags?.length ? (
            <AppText
              variant="caption"
              color={colors.primary[700]}
              numberOfLines={1}
            >
              {target.tags.slice(0, 3).map((tag) => `#${tag}`).join('  ')}
            </AppText>
          ) : null}
        </View>
      </View>
      <AppButton
        title={vi ? 'Xem công thức' : 'View recipe'}
        variant="outline"
        onPress={() =>
          router.push({
            pathname: '/moderation/recipe/[id]',
            params: { id: target._id, title: target.title },
          })
        }
      />
    </View>
  );
}

function difficultyLabel(value: NonNullable<RecipeReviewItem['difficulty']>, vi: boolean) {
  const labels = {
    easy: vi ? 'Dễ' : 'Easy',
    medium: vi ? 'Trung bình' : 'Medium',
    hard: vi ? 'Khó' : 'Hard',
  };
  return labels[value];
}

function formatDate(value: string, vi: boolean) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(vi ? 'vi-VN' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
  },
  preview: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  cover: { width: 104, height: 104, borderRadius: radius.lg },
  content: { flex: 1, minWidth: 0, gap: spacing.xs },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: { flex: 1, minWidth: 0 },
});
