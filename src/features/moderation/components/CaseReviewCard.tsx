import { useState } from 'react';
import { View } from 'react-native';
import { AppButton, AppInput, AppText } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { SelectionField } from '@/features/onboarding/components/SelectionField';
import { postStatusLabel as reportStatusLabel } from '@/features/community/status';
import type { ModerationCase } from '../moderationApi';
import { useModeration } from '../hooks';
import { ReportTargetPreview } from './ReportTargetPreview';
import { colors, radius, spacing } from '@/theme';
export function CaseReviewCard({ item, vi }: { item: ModerationCase; vi: boolean }) {
  const actions = useModeration();
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState<
    'hide' | 'restore' | 'resolved' | 'dismissed' | null
  >(null);
  const busy = actions.updateCase.isPending || actions.visibility.isPending;
  const active = ['open', 'reviewing'].includes(item.status);
  const commit = () => {
    if (!confirm || !reason.trim()) return;
    const done = () => {
      setConfirm(null);
      setReason('');
    };
    if (confirm === 'hide' || confirm === 'restore')
      actions.visibility.mutate(
        { item, hide: confirm === 'hide', reason: reason.trim() },
        { onSuccess: done }
      );
    else
      actions.updateCase.mutate(
        { id: item._id, status: confirm, resolution: reason.trim() },
        { onSuccess: done }
      );
  };
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
        {item.targetType} · {reportStatusLabel(item.status, vi)}
      </AppText>
      <ReportTargetPreview targetType={item.targetType} targetId={item.targetId} vi={vi} />
      <AppText>
        {vi ? 'Báo cáo liên kết' : 'Linked reports'}: {item.reportIds.length}
      </AppText>
      <AppText>{item.resolution}</AppText>
      {item.actions?.map((action, index) => (
        <AppText key={index}>
          {action.type} · {action.reason} ·{' '}
          {new Date(action.at).toLocaleString(vi ? 'vi-VN' : 'en-US')}
        </AppText>
      ))}
      {active ? (
        <>
          <SelectionField
            label={vi ? 'Ưu tiên' : 'Priority'}
            placeholder=""
            value={item.priority}
            options={(['low', 'normal', 'high', 'urgent'] as const).map(
              (value, index) => ({
                value,
                label: (vi
                  ? ['Thấp', 'Bình thường', 'Cao', 'Khẩn cấp']
                  : ['Low', 'Normal', 'High', 'Urgent'])[index],
              })
            )}
            onChange={(priority) => {
              if (!busy) actions.updateCase.mutate({ id: item._id, priority });
            }}
          />
          <AppButton
            title={vi ? 'Nhận hồ sơ' : 'Assign case to me'}
            variant="outline"
            disabled={busy}
            onPress={() =>
              actions.updateCase.mutate({ id: item._id, status: 'reviewing' })
            }
          />
          <AppInput
            label={vi ? 'Lý do / kết quả xử lý' : 'Reason / resolution'}
            value={reason}
            onChangeText={setReason}
            editable={!busy}
            maxLength={2000}
            multiline
          />
          {item.targetType !== 'user' ? (
            <>
              <AppButton
                title={vi ? 'Ẩn nội dung' : 'Hide content'}
                disabled={busy || !reason.trim()}
                variant="outline"
                onPress={() => setConfirm('hide')}
              />
              <AppButton
                title={vi ? 'Khôi phục nội dung' : 'Restore content'}
                disabled={busy || !reason.trim()}
                variant="outline"
                onPress={() => setConfirm('restore')}
              />
            </>
          ) : null}
          <AppButton
            title={vi ? 'Đóng: đã giải quyết' : 'Close: resolved'}
            disabled={busy || !reason.trim()}
            onPress={() => setConfirm('resolved')}
          />
          <AppButton
            title={vi ? 'Đóng: bác bỏ' : 'Close: dismissed'}
            disabled={busy || !reason.trim()}
            variant="ghost"
            onPress={() => setConfirm('dismissed')}
          />
          {confirm ? (
            <>
              <AppText>
                {vi
                  ? 'Xác nhận thao tác với lý do đã nhập?'
                  : 'Confirm this action with the entered reason?'}
              </AppText>
              <AppButton
                title={vi ? 'Xác nhận' : 'Confirm'}
                disabled={busy}
                loading={busy}
                onPress={commit}
              />
              <AppButton
                title={vi ? 'Hủy' : 'Cancel'}
                variant="ghost"
                disabled={busy}
                onPress={() => setConfirm(null)}
              />
            </>
          ) : null}
        </>
      ) : null}
      <FeatureState error={actions.updateCase.error || actions.visibility.error} />
    </View>
  );
}
