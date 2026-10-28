import { AppButton, AppText, CustomHeader, ScreenWrapper } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import { useAiMonitoring } from '../hooks';

const percent = (value: number | null) =>
  value == null
    ? '—'
    : new Intl.NumberFormat(undefined, { style: 'percent' }).format(value);

export function AiMonitoringScreen() {
  const vi = useTranslation().locale === 'vi';
  const monitoring = useAiMonitoring();
  const metrics = monitoring.metrics.data;
  const retry = () => {
    void monitoring.metrics.refetch();
    void monitoring.runs.refetch();
  };
  return (
    <ScreenWrapper
      scrollable
      header={
        <CustomHeader
          title={vi ? 'Giám sát AI' : 'AI monitoring'}
          showBack
          backFallbackHref="/(tabs)/profile"
        />
      }
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
    >
      <FeatureState
        loading={monitoring.metrics.isLoading || monitoring.runs.isLoading}
        error={monitoring.metrics.error || monitoring.runs.error}
        retry={retry}
      />
      {metrics ? (
        <>
          <AppText variant="heading2">{vi ? 'Tổng quan' : 'Overview'}</AppText>
          <AppText>
            {vi ? 'Tổng lượt chạy' : 'Total runs'}: {metrics.runs.total}
          </AppText>
          <AppText>
            {vi ? 'Thành công' : 'Success rate'}: {percent(metrics.successRate)}
          </AppText>
          <AppText>
            {vi ? 'Schema hợp lệ' : 'Schema valid'}:{' '}
            {percent(metrics.schemaValidRate)}
          </AppText>
          <AppText>
            {vi ? 'Độ trễ trung bình' : 'Average latency'}:{' '}
            {metrics.averageLatencyMs == null
              ? '—'
              : `${Math.round(metrics.averageLatencyMs)} ms`}
          </AppText>
          <AppText>
            {vi ? 'Phản hồi hữu ích' : 'Helpful feedback'}:{' '}
            {percent(metrics.feedback.helpfulRate)}
          </AppText>
          <AppText>
            {vi ? 'Tổng token' : 'Total tokens'}: {metrics.usage.totalTokens}
          </AppText>
        </>
      ) : null}
      <AppText variant="heading2">
        {vi ? 'Lượt chạy gần đây' : 'Recent runs'}
      </AppText>
      {monitoring.runs.data?.data.length === 0 ? (
        <AppText>{vi ? 'Chưa có dữ liệu AI.' : 'No AI runs yet.'}</AppText>
      ) : null}
      {monitoring.runs.data?.data.map((run) => (
        <AppButton
          key={run._id}
          variant="outline"
          disabled
          title={`${run.feature} · ${run.status} · ${run.latencyMs || 0} ms`}
        />
      ))}
      <AppText color={colors.text.secondary}>
        {vi
          ? 'Trang này không hiển thị prompt, nội dung người dùng hoặc khóa dịch vụ.'
          : 'This page does not expose prompts, user content, or service credentials.'}
      </AppText>
    </ScreenWrapper>
  );
}
