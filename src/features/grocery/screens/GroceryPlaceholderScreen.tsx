import { useRouter } from 'expo-router';

import { GuidedPlaceholderScreen } from '@/components/navigation';
import { useTranslation } from '@/i18n';

const guideKeys = [
  'grocery.guide.choose',
  'grocery.guide.collect',
  'grocery.guide.check',
] as const;

export function GroceryPlaceholderScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <GuidedPlaceholderScreen
      title={t('nav.grocery')}
      icon="pantry"
      emptyTitle={t('grocery.emptyTitle')}
      description={t('grocery.emptyDescription')}
      guideTitle={t('grocery.guideTitle')}
      steps={guideKeys.map((key) => t(key))}
      availabilityNote={t('grocery.availabilityNote')}
      actionLabel={t('grocery.exploreRecipes')}
      onAction={() => router.push('/(discover)/explore')}
    />
  );
}
