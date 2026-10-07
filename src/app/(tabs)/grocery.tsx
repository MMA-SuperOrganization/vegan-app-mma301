import { PlaceholderTabScreen } from '@/components/navigation';
import { useTranslation } from '@/i18n';

export default function GroceryRoute() {
  const { t } = useTranslation();
  return <PlaceholderTabScreen title={t('nav.grocery')} />;
}
