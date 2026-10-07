import { PlaceholderTabScreen } from '@/components/navigation';
import { useTranslation } from '@/i18n';

export default function MealPlanRoute() {
  const { t } = useTranslation();
  return <PlaceholderTabScreen title={t('nav.mealPlan')} />;
}
