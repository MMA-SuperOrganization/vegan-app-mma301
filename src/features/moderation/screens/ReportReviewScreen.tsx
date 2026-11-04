import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppButton,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
  Surface,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { AdminStatusBadge } from '@/features/admin/AdminUi';
import { postStatusLabel as reportStatusLabel } from '@/features/community/status';
import { useTranslation } from '@/i18n';
import { colors, spacing, webLayout } from '@/theme';
import { reasonLabel, targetLabel } from '../components/ReportReviewCard';
import { ReportTargetPreview } from '../components/ReportTargetPreview';
import { useModeration } from '../hooks';

export function ReportReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const vi = useTranslation().locale === 'vi';
  const actions = useModeration();
  const report = actions.reports.data?.data.find((item) => item._id === id);
  const [resolution, setResolution] = useState('');
  const [close, setClose] = useState<'resolved' | 'dismissed' | null>(null);
  const busy = actions.report.isPending;
  const active = report ? ['open', 'reviewing'].includes(report.status) : false;

  const finish = () => {
    if (!report || !close) return;
    actions.report.mutate(
      { report, status: close, resolution: resolution.trim() },
      { onSuccess: () => router.back() }
    );
  };

  return (
    <ScreenWrapper
      scrollable
      webMaxWidth={webLayout.catalogMaxWidth}
      contentContainerStyle={styles.screen}
      header={
        <CustomHeader
          title={vi ? 'Chi tiết báo cáo' : 'Report details'}
          showBack
          backFallbackHref="/admin/moderation"
        />
      }
    >
      <FeatureState
        loading={actions.reports.isLoading}
        error={actions.reports.error}
        retry={() => void actions.reports.refetch()}
      />

      {!actions.reports.isLoading && !actions.reports.error && !report ? (
        <Surface bordered padding="lg" radius="xl" style={styles.section}>
          <AppText variant="heading3">
            {vi ? 'Không tìm thấy báo cáo' : 'Report not found'}
          </AppText>
          <AppText color={colors.text.secondary}>
            {vi
              ? 'Báo cáo có thể đã bị xóa hoặc không còn trong danh sách.'
              : 'This report may have been deleted or is no longer in the queue.'}
          </AppText>
          <AppButton
            title={vi ? 'Quay lại danh sách' : 'Back to moderation'}
            onPress={() => router.replace('/admin/moderation')}
          />
        </Surface>
      ) : null}

      {report ? (
        <>
          <Surface bordered padding="lg" radius="xl" style={styles.section}>
            <View style={styles.headerRow}>
              <View style={styles.heading}>
                <AppText variant="heading2">
                  {targetLabel(report.targetType, vi)} · {reasonLabel(report.reason, vi)}
                </AppText>
                <AppText variant="bodySmall" color={colors.text.secondary} selectable>
                  {vi ? 'Mã báo cáo' : 'Report ID'}: {report._id}
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
              <View style={styles.description}>
                <AppText variant="caption" color={colors.text.secondary}>
                  {vi ? 'Mô tả từ người báo cáo' : 'Reporter description'}
                </AppText>
                <AppText selectable>{report.description}</AppText>
              </View>
            ) : null}
            {report.assignedAdminId ? (
              <AppText variant="bodySmall" color={colors.text.secondary} selectable>
                {vi ? 'Quản trị viên xử lý' : 'Assigned admin'}: {report.assignedAdminId}
              </AppText>
            ) : null}
          </Surface>

          <Surface bordered padding="lg" radius="xl" style={styles.section}>
            <AppText variant="heading3">{vi ? 'Nội dung bị báo cáo' : 'Reported content'}</AppText>
            <ReportTargetPreview
              targetType={report.targetType}
              targetId={report.targetId}
              vi={vi}
            />
          </Surface>

          {report.resolution ? (
            <Surface bordered padding="lg" radius="xl" style={styles.section}>
              <AppText variant="heading3">{vi ? 'Kết quả xử lý' : 'Resolution'}</AppText>
              <AppText selectable>{report.resolution}</AppText>
            </Surface>
          ) : null}

          {active ? (
            <Surface bordered padding="lg" radius="xl" style={styles.section}>
              <AppText variant="heading3">{vi ? 'Xử lý báo cáo' : 'Handle report'}</AppText>
              <AppButton
                title={vi ? 'Nhận xử lý' : 'Assign to me'}
                variant="outline"
                disabled={busy || report.status === 'reviewing'}
                onPress={() => actions.report.mutate({ report, status: 'reviewing' })}
              />
              <AppInput
                label={vi ? 'Kết quả xử lý' : 'Resolution'}
                value={resolution}
                onChangeText={setResolution}
                maxLength={2000}
                editable={!busy}
                multiline
              />
              <View style={styles.actions}>
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
              </View>
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
                    onPress={finish}
                  />
                  <AppButton
                    title={vi ? 'Hủy' : 'Cancel'}
                    variant="ghost"
                    disabled={busy}
                    onPress={() => setClose(null)}
                  />
                </View>
              ) : null}
              <FeatureState error={actions.report.error} />
            </Surface>
          ) : null}
        </>
      ) : null}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.lg },
  section: { gap: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  heading: { flex: 1, minWidth: 0, gap: spacing.xs },
  description: { padding: spacing.md, gap: spacing.xs, backgroundColor: colors.background.muted, borderRadius: 8 },
  actions: { gap: spacing.sm },
  confirmation: { padding: spacing.md, gap: spacing.sm, backgroundColor: colors.background.selected, borderRadius: 8 },
});
