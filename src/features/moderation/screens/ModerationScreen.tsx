import { useState } from 'react';
import { AppButton, AppText, CustomHeader, ScreenWrapper } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme';
import { useModeration } from '../hooks';
import { ReviewCard } from '../components/ReviewCard';
import { ReportReviewCard } from '../components/ReportReviewCard';
import { CaseReviewCard } from '../components/CaseReviewCard';
export function ModerationScreen({ showBack = true }: { showBack?: boolean }) {
  const { locale, t } = useTranslation();
  const vi = locale === 'vi';
  const actions = useModeration();
  const [tab, setTab] = useState<'pending' | 'reports' | 'cases'>('pending');
  const query = actions[tab];
  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
      header={
        <CustomHeader
          title={t('admin.moderation.title')}
          showBack={showBack}
          backFallbackHref="/admin"
        />
      }
    >
      {(['pending', 'reports', 'cases'] as const).map((value, index) => (
        <AppButton
          key={value}
          variant={tab === value ? 'primary' : 'outline'}
          title={
            [t('admin.moderation.pending'), t('admin.moderation.reports'), t('admin.moderation.cases')][index]
          }
          onPress={() => setTab(value)}
        />
      ))}
      <FeatureState
        loading={query.isLoading}
        error={query.error}
        retry={() => void query.refetch()}
      />
      {query.data?.data.length === 0 ? (
        <AppText>{t('admin.moderation.empty')}</AppText>
      ) : null}
      {tab === 'pending'
        ? actions.pending.data?.data.map((item) => (
            <ReviewCard key={item._id} target={item} vi={vi} />
          ))
        : tab === 'reports'
          ? actions.reports.data?.data.map((item) => (
              <ReportReviewCard key={item._id} report={item} vi={vi} />
            ))
          : actions.cases.data?.data.map((item) => (
              <CaseReviewCard key={item._id} item={item} vi={vi} />
            ))}
    </ScreenWrapper>
  );
}
