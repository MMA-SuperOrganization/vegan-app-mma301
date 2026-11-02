import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppButton, AppInput, AppText } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { postStatusLabel as reportStatusLabel } from '@/features/community/status';
import type { UserReport } from '@/features/community/types';
import { AdminStatusBadge } from '@/features/admin/AdminUi';
import { useModeration } from '../hooks';
import { ReportTargetPreview } from './ReportTargetPreview';
import { colors, radius, spacing } from '@/theme';

export function ReportReviewCard({
  report,
  vi,
}: {
  report: UserReport;
  vi: boolean;
}) {
  const actions = useModeration();
  const [expanded, setExpanded] = useState(false);
  const [resolution, setResolution] = useState('');
  const [close, setClose] = useState<'resolved' | 'dismissed' | null>(null);
  const busy = actions.report.isPending || actions.createCase.isPending;
  const active = ['open', 'reviewing'].includes(report.status);

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
        title={expanded ? (vi ? 'Thu gọn' : 'Collapse') : vi ? 'Mở báo cáo' : 'Open report'}
        variant="outline"
        onPress={() => setExpanded((value) => !value)}
      />
      {expanded ? (
        <View style={styles.details}>
          <ReportTargetPreview
            targetType={report.targetType}
            targetId={report.targetId}
            vi={vi}
          />
          {report.resolution ? (
            <View style={styles.resolution}>
              <AppText variant="bodySmall" color={colors.text.secondary}>
                {vi ? 'Kết quả xử lý' : 'Resolution'}
              </AppText>
              <AppText>{report.resolution}</AppText>
            </View>
          ) : null}
          {active ? (
            <>
              <View style={styles.secondaryActions}>
                <AppButton
                  title={vi ? 'Nhận xử lý' : 'Assign to me'}
                  variant="outline"
                  disabled={busy || report.status === 'reviewing'}
                  onPress={() => actions.report.mutate({ report, status: 'reviewing' })}
                />
                <AppButton
                  title={vi ? 'Tạo / gộp hồ sơ' : 'Create / merge case'}
                  variant="outline"
                  disabled={busy}
                  onPress={() => actions.createCase.mutate(report)}
                />
              </View>
              <AppInput
                label={vi ? 'Kết quả xử lý' : 'Resolution'}
                value={resolution}
                onChangeText={setResolution}
                maxLength={2000}
                editable={!busy}
                multiline
              />
              <AppButton
                title={vi ? 'Đánh dấu đã giải quyết' : 'Resolve'}
                disabled={busy || !resolution.trim()}
                onPress={() => setClose('resolved')}
              />
              <AppButton
                title={vi ? 'Bác bỏ báo cáo' : 'Dismiss report'}
                variant="ghost"
                disabled={busy || !resolution.trim()}
                onPress={() => setClose('dismissed')}
              />
              {close ? (
                <View style={styles.confirmation}>
                  <AppText variant="bodyStrong">
                    {vi
                      ? 'Xác nhận đóng báo cáo với kết quả trên?'
                      : 'Close the report with this resolution?'}
                  </AppText>
                  <AppButton
                    title={vi ? 'Xác nhận' : 'Confirm'}
                    loading={busy}
                    disabled={busy}
                    onPress={() =>
                      actions.report.mutate(
                        { report, status: close, resolution: resolution.trim() },
                        { onSuccess: () => setClose(null) }
                      )
                    }
                  />
                  <AppButton
                    title={vi ? 'Hủy' : 'Cancel'}
                    variant="ghost"
                    disabled={busy}
                    onPress={() => setClose(null)}
                  />
                </View>
              ) : null}
            </>
          ) : null}
          <FeatureState error={actions.report.error || actions.createCase.error} />
        </View>
      ) : null}
    </View>
  );
}

function targetLabel(value: string, vi: boolean) {
  const labels: Record<string, [string, string]> = {
    recipe: ['Công thức', 'Recipe'],
    post: ['Bài viết', 'Post'],
    video: ['Video', 'Video'],
    comment: ['Bình luận', 'Comment'],
    user: ['Tài khoản', 'User'],
  };
  return labels[value]?.[vi ? 0 : 1] ?? value;
}

function reasonLabel(value: string, vi: boolean) {
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
  details: { gap: spacing.md },
  resolution: {
    padding: spacing.md,
    gap: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.background.muted,
  },
  secondaryActions: { gap: spacing.sm },
  confirmation: {
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.background.selected,
  },
});
