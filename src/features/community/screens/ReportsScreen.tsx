import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  AppButton,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { SelectionField } from '@/features/onboarding/components/SelectionField';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import { useReports } from '../hooks';
import { postStatusLabel } from '../status';
import type { ReportReason, ReportTarget } from '../types';

const targets: ReportTarget[] = ['recipe', 'post', 'video', 'comment', 'user'];
const reasons: Array<{ value: ReportReason; vi: string; en: string }> = [
  { value: 'spam', vi: 'Spam', en: 'Spam' },
  { value: 'harmful', vi: 'Có hại', en: 'Harmful' },
  { value: 'misinformation', vi: 'Thông tin sai', en: 'Misinformation' },
  { value: 'harassment', vi: 'Quấy rối', en: 'Harassment' },
  { value: 'copyright', vi: 'Bản quyền', en: 'Copyright' },
  { value: 'other', vi: 'Khác', en: 'Other' },
];
export function ReportsScreen() {
  const params = useLocalSearchParams<{
    targetType?: ReportTarget;
    targetId?: string;
  }>();
  const vi = useTranslation().locale === 'vi';
  const actions = useReports();
  const targetType = targets.includes(params.targetType!)
    ? params.targetType!
    : null;
  const [reason, setReason] = useState<ReportReason>('other');
  const [description, setDescription] = useState('');
  const canCreate = targetType && /^[a-f\d]{24}$/i.test(params.targetId || '');
  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
      header={
        <CustomHeader
          title={vi ? 'Báo cáo của tôi' : 'My reports'}
          showBack
          backFallbackHref="/(tabs)/profile"
        />
      }
    >
      {canCreate && !actions.create.isSuccess ? (
        <>
          <SelectionField
            label={vi ? 'Lý do' : 'Reason'}
            placeholder=""
            value={reason}
            onChange={setReason}
            options={reasons.map((entry) => ({
              value: entry.value,
              label: vi ? entry.vi : entry.en,
            }))}
          />
          <AppInput
            label={vi ? 'Mô tả' : 'Description'}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={2000}
            editable={!actions.create.isPending}
          />
          <AppButton
            title={vi ? 'Gửi báo cáo' : 'Submit report'}
            loading={actions.create.isPending}
            onPress={() =>
              actions.create.mutate({
                targetType,
                targetId: params.targetId!,
                reason,
                description,
              })
            }
          />
        </>
      ) : null}
      {actions.create.isSuccess ? (
        <AppText>{vi ? 'Đã gửi báo cáo.' : 'Report submitted.'}</AppText>
      ) : null}
      <FeatureState
        loading={actions.query.isLoading}
        error={actions.query.error || actions.create.error}
        retry={() => void actions.query.refetch()}
      />
      {actions.query.data?.data.length === 0 ? (
        <AppText>
          {vi ? 'Bạn chưa gửi báo cáo nào.' : 'No reports submitted yet.'}
        </AppText>
      ) : null}
      {actions.query.data?.data.map((report) => (
        <View
          key={report._id}
          style={{
            padding: spacing.lg,
            backgroundColor: colors.background.surface,
            gap: spacing.sm,
          }}
        >
          <AppText variant="bodyStrong">
            {
              reasons.find((entry) => entry.value === report.reason)?.[
                vi ? 'vi' : 'en'
              ]
            }
          </AppText>
          <AppText>{postStatusLabel(report.status, vi)}</AppText>
          <AppText>{report.description}</AppText>
          {report.resolution ? <AppText>{report.resolution}</AppText> : null}
        </View>
      ))}
    </ScreenWrapper>
  );
}
