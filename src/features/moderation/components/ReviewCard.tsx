import { useState } from 'react';
import { Linking, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { AppButton, AppInput, AppText } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { moderationApi, type PendingContent } from '../moderationApi';
import { useModeration } from '../hooks';
import { colors, radius, spacing } from '@/theme';
export function ReviewCard({ target, vi }: { target: PendingContent; vi: boolean }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState<'publish' | 'reject' | null>(null);
  const content = useQuery({
    queryKey: ['moderation-content', target.type, target._id],
    queryFn: () => moderationApi.content(target),
    enabled: open,
  });
  const actions = useModeration();
  const busy = actions.review.isPending;
  return (
    <View
      style={{
        padding: spacing.lg,
        gap: spacing.sm,
        borderRadius: radius.lg,
        backgroundColor: colors.background.surface,
      }}
    >
      <AppText variant="heading4">{target.title}</AppText>
      <AppText>{target.type}</AppText>
      <AppButton
        title={vi ? 'Xem nội dung để duyệt' : 'Review content'}
        variant="outline"
        onPress={() => setOpen(!open)}
        disabled={busy}
      />
      {open ? (
        <>
          <FeatureState
            loading={content.isLoading}
            error={content.error}
            retry={() => void content.refetch()}
          />
          <AppText selectable>{content.data?.content}</AppText>
          <AppInput
            label={vi ? 'Lý do từ chối' : 'Rejection reason'}
            value={reason}
            onChangeText={setReason}
            maxLength={2000}
            editable={!busy}
          />
          {content.data?.description ? (
            <AppText selectable>{content.data.description}</AppText>
          ) : null}
          {content.data?.summary ? (
            <AppText selectable>{content.data.summary}</AppText>
          ) : null}
          {content.data?.transcript ? (
            <AppText selectable>{content.data.transcript}</AppText>
          ) : null}
          {content.data?.ingredients?.map((ingredient, index) => (
            <AppText key={index}>
              {ingredient.foodNameSnapshot} · {ingredient.quantity} {ingredient.unit}
            </AppText>
          ))}
          {content.data?.steps?.map((step) => (
            <AppText key={step.order}>
              {step.order}. {step.instruction}
            </AppText>
          ))}
          {content.data?.playback?.downloadUrl || content.data?.playback?.url ? (
            <AppButton
              title={vi ? 'Xem video' : 'Watch video'}
              variant="outline"
              onPress={() => {
                const url =
                  content.data?.playback?.downloadUrl || content.data?.playback?.url;
                if (url && /^https?:\/\//.test(url)) void Linking.openURL(url);
              }}
            />
          ) : null}
          <AppButton
            title={vi ? 'Xuất bản' : 'Publish'}
            disabled={!content.data || busy}
            onPress={() => setConfirm('publish')}
          />
          <AppButton
            title={vi ? 'Từ chối' : 'Reject'}
            variant="outline"
            disabled={!content.data || !reason.trim() || busy}
            onPress={() => setConfirm('reject')}
          />
          {confirm ? (
            <>
              <AppText>
                {vi
                  ? 'Xác nhận thao tác kiểm duyệt?'
                  : 'Confirm this moderation action?'}
              </AppText>
              <AppButton
                title={vi ? 'Xác nhận' : 'Confirm'}
                loading={busy}
                disabled={busy}
                onPress={() =>
                  actions.review.mutate(
                    {
                      target,
                      version: content.data!.version,
                      reject: confirm === 'reject',
                      reason: reason.trim(),
                    },
                    {
                      onSuccess: () => setConfirm(null),
                      onError: () => void content.refetch(),
                    }
                  )
                }
              />
              <AppButton
                title={vi ? 'Hủy' : 'Cancel'}
                variant="ghost"
                disabled={busy}
                onPress={() => setConfirm(null)}
              />
            </>
          ) : null}
          <FeatureState error={actions.review.error} />
        </>
      ) : null}
    </View>
  );
}
