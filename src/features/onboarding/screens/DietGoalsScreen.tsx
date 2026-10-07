import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useAuthStore } from '@/features/auth';
import { spacing } from '@/theme';
import { useTranslation } from '@/i18n';
import { getDietOptions, getGoalOptions } from '../constants';
import { useOnboardingStore } from '../onboardingStore';
import { InfoCard } from '../components/InfoCard';
import { OnboardingScreen } from '../components/OnboardingScreen';
import { SelectionField } from '../components/SelectionField';

export function DietGoalsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const dietOptions = getDietOptions(t);
  const goalOptions = getGoalOptions(t);
  const logout = useAuthStore((state) => state.logout);
  const draft = useOnboardingStore((state) => state.draft);
  const setDraft = useOnboardingStore((state) => state.setDraft);
  const [errors, setErrors] = useState({
    diet: null as string | null,
    goal: null as string | null,
  });

  const next = () => {
    const nextErrors = {
      diet: draft.dietType ? null : t('onboarding.validation.diet'),
      goal: draft.goal ? null : t('onboarding.validation.goal'),
    };
    setErrors(nextErrors);
    if (!nextErrors.diet && !nextErrors.goal)
      router.push('/(onboarding)/nutrition-profile');
  };

  return (
    <OnboardingScreen
      title={t('onboarding.dietTitle')}
      subtitle={t('onboarding.dietSubtitle')}
      step={1}
      onBack={async () => {
        await logout();
        router.replace('/(auth)/welcome');
      }}
      onPrimary={next}
    >
      <View style={styles.fields}>
        <SelectionField
          label={t('onboarding.dietType')}
          placeholder={t('onboarding.selectDiet')}
          value={draft.dietType}
          options={dietOptions}
          onChange={(dietType) => {
            setDraft({ dietType });
            setErrors((current) => ({ ...current, diet: null }));
          }}
          error={errors.diet}
        />
        <InfoCard
          title={t('onboarding.dietType')}
          description={t('onboarding.dietInfo')}
        />
        <SelectionField
          label={t('onboarding.goal')}
          placeholder={t('onboarding.selectGoal')}
          value={draft.goal}
          options={goalOptions}
          onChange={(goal) => {
            setDraft({ goal });
            setErrors((current) => ({ ...current, goal: null }));
          }}
          error={errors.goal}
        />
        <InfoCard
          title={t('onboarding.referenceInfo')}
          description={t('onboarding.referenceDescription')}
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({ fields: { gap: spacing.xl } });
