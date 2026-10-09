import { TrackingComingSoonScreen } from '@/features/tracking';
import { useTranslation } from '@/i18n';

export default function WaterRoute() {
  const { t } = useTranslation();
  return <TrackingComingSoonScreen title={t('tracking.water.title')} />;
}
