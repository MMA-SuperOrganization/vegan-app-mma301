import { TrackingComingSoonScreen } from '@/features/tracking';
import { useTranslation } from '@/i18n';

export default function NutritionSummaryRoute() {
  const { t } = useTranslation();
  return <TrackingComingSoonScreen title={t('tracking.summary.title')} />;
}
