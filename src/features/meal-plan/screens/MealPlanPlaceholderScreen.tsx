import { useRouter } from 'expo-router';

import { GuidedPlaceholderScreen } from '@/components/navigation';
import { useTranslation } from '@/i18n';

const guideKeys = [
  'mealPlan.guide.discover',
  'mealPlan.guide.arrange',
  'mealPlan.guide.prepare',
] as const;

export function MealPlanPlaceholderScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <GuidedPlaceholderScreen
      title={t('nav.mealPlan')}
      icon="spark"
      emptyTitle={t('mealPlan.emptyTitle')}
      description={t('mealPlan.emptyDescription')}
      guideTitle={t('mealPlan.guideTitle')}
      steps={guideKeys.map((key) => t(key))}
      availabilityNote={t('mealPlan.availabilityNote')}
      actionLabel={t('mealPlan.exploreRecipes')}
      onAction={() => router.push('/(discover)/explore')}
    />
  );
}
