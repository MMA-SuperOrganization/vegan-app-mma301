import { useState } from 'react';
import { View } from 'react-native';
import { AppButton, AppInput, AppText } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { postStatusLabel as reportStatusLabel } from '@/features/community/status';
import type { UserReport } from '@/features/community/types';
import { useModeration } from '../hooks';
import { colors, radius, spacing } from '@/theme';
export function ReportReviewCard({
  report,
  vi,
}: {
  report: UserReport;
  vi: boolean;
}) {
  const actions = useModeration();
  const [resolution, setResolution] = useState('');
  const [close, setClose] = useState<'resolved' | 'dismissed' | null>(null);
  const busy = actions.report.isPending || actions.createCase.isPending;
  const active = ['open', 'reviewing'].includes(report.status);
  return (
    <View
      style={{
        padding: spacing.lg,
        gap: spacing.sm,
        borderRadius: radius.lg,
        backgroundColor: colors.background.surface,
      }}
    >
      <AppText variant="bodyStrong">
        {report.targetType} · {report.reason}
      </AppText>
      <AppText selectable>{report.targetId}</AppText>
      <AppText>{report.description}</AppText>
      <AppText>{reportStatusLabel(report.status, vi)}</AppText>
      <AppText>{report.resolution}</AppText>
      {active ? (
        <>
          <AppButton
            title={vi ? 'Nhận xử lý' : 'Assign to me'}
            variant="outline"
            disabled={busy}
            onPress={() => actions.report.mutate({ report, status: 'reviewing' })}
          />
          <AppButton
            title={
              vi
                ? 'Tạo hoặc gộp vào hồ sơ kiểm duyệt'
                : 'Create or merge moderation case'
            }
            variant="outline"
            disabled={busy}
            onPress={() => actions.createCase.mutate(report)}
          />
          <AppInput
            label={vi ? 'Kết quả xử lý' : 'Resolution'}
            value={resolution}
            onChangeText={setResolution}
            maxLength={2000}
            editable={!busy}
          />
          <AppButton
            title={vi ? 'Đã giải quyết' : 'Resolve'}
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
            <>
              <AppText>
                {vi
                  ? 'Xác nhận đóng báo cáo với kết quả trên?'
                  : 'Close the report with this resolution?'}
              </AppText>
              <AppButton
                title={vi ? 'Xác nhận' : 'Confirm'}
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
            </>
          ) : null}
        </>
      ) : null}
      <FeatureState error={actions.report.error || actions.createCase.error} />
    </View>
  );
}
