import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppButton,
  AppIcon,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
  Surface,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { SelectionField } from '@/features/onboarding/components/SelectionField';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { InfoRow, ReportDivider, SectionLabel } from '../components/ReportInfo';
import { useReports } from '../hooks';
import {
  reportReasons,
  reportTargetLabels,
  reportTargets,
} from '../reportOptions';
import { formatReportCode } from '../reportPresentation';
import type { ReportReason, ReportTarget } from '../types';

export function ReportFormScreen() {
  const params = useLocalSearchParams<{
    targetType?: ReportTarget;
    targetId?: string;
    targetPreview?: string;
  }>();
  const router = useRouter();
  const vi = useTranslation().locale === 'vi';
  const locale = vi ? 'vi' : 'en';
  const actions = useReports();
  const [reason, setReason] = useState<ReportReason>('other');
  const [description, setDescription] = useState('');

  const targetType = reportTargets.includes(params.targetType!)
    ? params.targetType!
    : null;
  if (!targetType || !/^[a-f\d]{24}$/i.test(params.targetId || '')) {
    return <Redirect href="/community/reports" />;
  }

  const targetLabel = reportTargetLabels[targetType][locale];
  const reasonLabel =
    reportReasons.find((entry) => entry.value === reason)?.[locale] ?? reason;
  const goBack = () =>
    router.canGoBack() ? router.back() : router.replace('/(tabs)');

  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={styles.content}
      header={
        <CustomHeader
          title={vi ? 'Gửi báo cáo' : 'Submit a report'}
          showBack
          backFallbackHref="/(tabs)"
        />
      }
    >
      {actions.create.isSuccess ? (
        <>
          <Surface bordered padding="xl" radius="md" style={styles.confirm}>
            <View style={styles.confirmIcon}>
              <AppIcon
                name="check"
                size={28}
                color={colors.common.white}
                decorative
              />
            </View>
            <AppText variant="heading3" style={styles.centerText}>
              {vi ? 'Đã tiếp nhận báo cáo' : 'Report received'}
            </AppText>
            <AppText
              variant="caption"
              color={colors.text.secondary}
              style={styles.centerText}
            >
              {vi
                ? 'Báo cáo của bạn đã được gửi tới đội ngũ quản trị và sẽ được xem xét trong thời gian sớm nhất.'
                : 'Your report has been sent to the moderation team and will be reviewed shortly.'}
            </AppText>
            <ReportDivider />
            <View style={styles.summary}>
              {actions.create.data?._id ? (
                <InfoRow
                  label={vi ? 'Mã báo cáo' : 'Report ID'}
                  value={'#' + formatReportCode(actions.create.data._id)}
                />
              ) : null}
              <InfoRow label={vi ? 'Đối tượng' : 'Target'} value={targetLabel} />
              <InfoRow label={vi ? 'Lý do' : 'Reason'} value={reasonLabel} />
            </View>
          </Surface>
          <AppButton
            title={vi ? 'Xem báo cáo của tôi' : 'View my reports'}
            onPress={() => router.replace('/community/reports')}
          />
          <AppButton
            title={vi ? 'Quay lại' : 'Go back'}
            variant="ghost"
            onPress={goBack}
          />
        </>
      ) : (
        <Surface bordered padding="lg" radius="md" style={styles.form}>
          <View style={styles.formHeader}>
            <AppText variant="heading3">
              {vi ? 'Gửi báo cáo' : 'Submit a report'}
            </AppText>
            <ReportDivider />
            <InfoRow label={vi ? 'Đối tượng' : 'Target'} value={targetLabel} />
            {params.targetPreview ? (
              <View style={styles.preview}>
                <SectionLabel>
                  {vi ? 'Nội dung bị báo cáo' : 'Reported content'}
                </SectionLabel>
                <AppText numberOfLines={3}>{params.targetPreview}</AppText>
              </View>
            ) : null}
          </View>
          <SelectionField
            label={vi ? 'Lý do' : 'Reason'}
            placeholder=""
            value={reason}
            onChange={setReason}
            options={reportReasons.map((entry) => ({
              value: entry.value,
              label: entry[locale],
            }))}
          />
          <AppInput
            label={vi ? 'Mô tả chi tiết' : 'Detailed description'}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={2000}
            editable={!actions.create.isPending}
          />
          <FeatureState error={actions.create.error} />
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
        </Surface>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, gap: spacing.lg },
  form: { gap: spacing.md },
  formHeader: { gap: spacing.sm },
  preview: {
    gap: spacing.xs,
    paddingLeft: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.border.strong,
  },
  confirm: { alignItems: 'center', gap: spacing.md },
  confirmIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.status.success,
  },
  centerText: { textAlign: 'center' },
  summary: { alignSelf: 'stretch', gap: spacing.sm },
});
