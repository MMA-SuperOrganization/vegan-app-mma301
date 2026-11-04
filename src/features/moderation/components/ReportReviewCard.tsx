import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppText } from '@/components';
import { postStatusLabel as reportStatusLabel } from '@/features/community/status';
import type { UserReport } from '@/features/community/types';
import { AdminStatusBadge } from '@/features/admin/AdminUi';
import { colors, radius, spacing } from '@/theme';

export function ReportReviewCard({ report, vi }: { report: UserReport; vi: boolean }) {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <AppText variant="bodyStrong">
            {targetLabel(report.targetType, vi)} · {reasonLabel(report.reason, vi)}
          </AppText>
          <AppText variant="bodySmall" color={colors.text.secondary}>
            {vi ? 'Mã báo cáo' : 'Report ID'}: {shortId(report._id)}
          </AppText>
        </View>
        <AdminStatusBadge
          label={reportStatusLabel(report.status, vi)}
          tone={
            report.status === 'open'
              ? 'warning'
              : report.status === 'reviewing'
                ? 'info'
                : 'success'
          }
        />
      </View>
      {report.description ? (
        <AppText numberOfLines={2} color={colors.text.secondary}>
          {report.description}
        </AppText>
      ) : null}
      <AppButton
        title={vi ? 'Mở báo cáo' : 'Open report'}
        variant="outline"
        onPress={() =>
          router.push({ pathname: '/moderation/report/[id]', params: { id: report._id } })
        }
      />
    </View>
  );
}

export function targetLabel(value: string, vi: boolean) {
  const labels: Record<string, [string, string]> = {
    recipe: ['Công thức', 'Recipe'],
    post: ['Bài viết', 'Post'],
    video: ['Video', 'Video'],
    comment: ['Bình luận', 'Comment'],
    user: ['Tài khoản', 'User'],
  };
  return labels[value]?.[vi ? 0 : 1] ?? value;
}

export function reasonLabel(value: string, vi: boolean) {
  const labels: Record<string, [string, string]> = {
    spam: ['Spam', 'Spam'],
    harmful: ['Có hại', 'Harmful'],
    misinformation: ['Sai thông tin', 'Misinformation'],
    harassment: ['Quấy rối', 'Harassment'],
    copyright: ['Bản quyền', 'Copyright'],
    other: ['Khác', 'Other'],
  };
  return labels[value]?.[vi ? 0 : 1] ?? value;
}

function shortId(value: string) {
  return value.length > 12 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
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
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  heading: { flex: 1, minWidth: 0, gap: spacing.xs },
});
