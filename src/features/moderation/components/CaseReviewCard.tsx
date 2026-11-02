import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppButton, AppInput, AppText } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { SelectionField } from '@/features/onboarding/components/SelectionField';
import { postStatusLabel as reportStatusLabel } from '@/features/community/status';
import { AdminStatusBadge } from '@/features/admin/AdminUi';
import type { ModerationCase } from '../moderationApi';
import { useModeration } from '../hooks';
import { ReportTargetPreview } from './ReportTargetPreview';
import { colors, radius, spacing } from '@/theme';

export function CaseReviewCard({ item, vi }: { item: ModerationCase; vi: boolean }) {
  const actions = useModeration();
  const [expanded, setExpanded] = useState(false);
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
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <AppText variant="bodyStrong">
            {targetLabel(item.targetType, vi)} · {priorityLabel(item.priority, vi)}
          </AppText>
          <AppText variant="bodySmall" color={colors.text.secondary}>
            {item.reportIds.length} {vi ? 'báo cáo liên kết' : 'linked reports'}
          </AppText>
        </View>
        <AdminStatusBadge
          label={reportStatusLabel(item.status, vi)}
          tone={
            item.status === 'open'
              ? 'warning'
              : item.status === 'reviewing'
                ? 'info'
                : 'success'
          }
        />
      </View>
      {item.resolution ? (
        <AppText numberOfLines={2} color={colors.text.secondary}>
          {item.resolution}
        </AppText>
      ) : null}
      <AppButton
        title={expanded ? (vi ? 'Thu gọn' : 'Collapse') : vi ? 'Mở hồ sơ' : 'Open case'}
        variant="outline"
        onPress={() => setExpanded((value) => !value)}
      />
      {expanded ? (
        <View style={styles.details}>
          <ReportTargetPreview
            targetType={item.targetType}
            targetId={item.targetId}
            vi={vi}
          />
          {item.actions?.length ? (
            <View style={styles.history}>
              <AppText variant="bodyStrong">{vi ? 'Lịch sử xử lý' : 'Action history'}</AppText>
              {item.actions.map((action, index) => (
                <View key={`${action.at}-${index}`} style={styles.historyRow}>
                  <AppText variant="bodySmall">{formatAction(action.type)}</AppText>
                  <AppText variant="bodySmall" color={colors.text.secondary}>
                    {action.reason} · {new Date(action.at).toLocaleString(vi ? 'vi-VN' : 'en-US')}
                  </AppText>
                </View>
              ))}
            </View>
          ) : null}
          {active ? (
            <>
              <SelectionField
                label={vi ? 'Ưu tiên' : 'Priority'}
                placeholder=""
                value={item.priority}
                options={(['low', 'normal', 'high', 'urgent'] as const).map(
                  (value) => ({ value, label: priorityLabel(value, vi) })
                )}
                onChange={(priority) => {
                  if (!busy) actions.updateCase.mutate({ id: item._id, priority });
                }}
              />
              <AppButton
                title={vi ? 'Nhận hồ sơ' : 'Assign case to me'}
                variant="outline"
                disabled={busy || item.status === 'reviewing'}
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
                <View style={styles.secondaryActions}>
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
                </View>
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
                <View style={styles.confirmation}>
                  <AppText variant="bodyStrong">
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
                </View>
              ) : null}
            </>
          ) : null}
          <FeatureState error={actions.updateCase.error || actions.visibility.error} />
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

function priorityLabel(value: ModerationCase['priority'], vi: boolean) {
  const labels: Record<ModerationCase['priority'], [string, string]> = {
    low: ['Thấp', 'Low'],
    normal: ['Bình thường', 'Normal'],
    high: ['Cao', 'High'],
    urgent: ['Khẩn cấp', 'Urgent'],
  };
  return labels[value][vi ? 0 : 1];
}

function formatAction(value: string) {
  return value.replace(/[._-]+/g, ' ').replace(/\b\w/g, (char) => char.toLocaleUpperCase());
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
  history: {
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.background.muted,
  },
  historyRow: { gap: spacing.xs },
  secondaryActions: { gap: spacing.sm },
  confirmation: {
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.background.selected,
  },
});
