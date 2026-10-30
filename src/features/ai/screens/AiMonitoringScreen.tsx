import { AppButton, AppText, CustomHeader, ScreenWrapper } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import { AI_ROUTES, AI_TRANSLATION_KEYS } from '../aiConstants';
import { useAiMonitoring } from '../hooks';

const percent = (value: number | null) =>
  value == null
    ? '—'
    : new Intl.NumberFormat(undefined, { style: 'percent' }).format(value);

export function AiMonitoringScreen() {
  const { t } = useTranslation();
  const keys = AI_TRANSLATION_KEYS.MONITORING;
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
          title={t(keys.TITLE)}
          showBack
          backFallbackHref={AI_ROUTES.BACK_FALLBACK}
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
          <AppText variant="heading2">{t(keys.OVERVIEW_TITLE)}</AppText>
          <AppText>
            {t(keys.TOTAL_RUNS)}: {metrics.runs.total}
          </AppText>
          <AppText>
            {t(keys.SUCCESS_RATE)}: {percent(metrics.successRate)}
          </AppText>
          <AppText>
            {t(keys.SCHEMA_VALID)}: {percent(metrics.schemaValidRate)}
          </AppText>
          <AppText>
            {t(keys.AVERAGE_LATENCY)}:{' '}
            {metrics.averageLatencyMs == null
              ? '—'
              : `${Math.round(metrics.averageLatencyMs)} ms`}
          </AppText>
          <AppText>
            {t(keys.HELPFUL_FEEDBACK)}: {percent(metrics.feedback.helpfulRate)}
          </AppText>
          <AppText>
            {t(keys.TOTAL_TOKENS)}: {metrics.usage.totalTokens}
          </AppText>
        </>
      ) : null}
      <AppText variant="heading2">{t(keys.RECENT_RUNS_TITLE)}</AppText>
      {monitoring.runs.data?.data.length === 0 ? (
        <AppText>{t(keys.EMPTY_RUNS)}</AppText>
      ) : null}
      {monitoring.runs.data?.data.map((run) => (
        <AppButton
          key={run._id}
          variant="outline"
          disabled
          title={`${run.feature} · ${run.status} · ${run.latencyMs || 0} ms`}
        />
      ))}
      <AppText color={colors.text.secondary}>{t(keys.PRIVACY_NOTICE)}</AppText>
    </ScreenWrapper>
  );
}
