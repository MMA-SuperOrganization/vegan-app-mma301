import { PlaceholderTabScreen } from '@/components/navigation';
import { useTranslation } from '@/i18n';

export default function DiaryRoute() {
  const { t } = useTranslation();
  return <PlaceholderTabScreen title={t('nav.diary')} />;
}
