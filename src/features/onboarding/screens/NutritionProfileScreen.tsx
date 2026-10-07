import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppInput } from '@/components';
import { useSafeBack } from '@/hooks';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme';
import { getActivityOptions } from '../constants';
import { useOnboardingStore } from '../onboardingStore';
import { dateInputToIso, validateMeasurement } from '../validation';
import { InfoCard } from '../components/InfoCard';
import { OnboardingScreen } from '../components/OnboardingScreen';
import { SelectionField } from '../components/SelectionField';

export function NutritionProfileScreen() {
  const router = useRouter();
  const goBack = useSafeBack('/(onboarding)/diet-goals');
  const { t } = useTranslation();
  const activityOptions = getActivityOptions(t);
  const draft = useOnboardingStore((state) => state.draft);
  const setDraft = useOnboardingStore((state) => state.setDraft);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const next = () => {
    const nextErrors = {
      dateOfBirth: dateInputToIso(draft.dateOfBirth)
        ? null
        : t('onboarding.validation.birthDate'),
      heightCm: validateMeasurement(draft.heightCm, t('onboarding.height'), 50, 250),
      currentWeightKg: validateMeasurement(
        draft.currentWeightKg,
        t('onboarding.weight'),
        10,
        500
      ),
      activityLevel: draft.activityLevel ? null : t('onboarding.validation.activity'),
    };
    setErrors(nextErrors);
    if (!Object.values(nextErrors).some(Boolean))
      router.push('/(onboarding)/allergies');
  };

  const update =
    (key: 'dateOfBirth' | 'heightCm' | 'currentWeightKg') => (value: string) => {
      setDraft({ [key]: value });
      setErrors((current) => ({ ...current, [key]: null }));
    };

  return (
    <OnboardingScreen
      title={t('onboarding.nutritionTitle')}
      subtitle={t('onboarding.nutritionSubtitle')}
      step={2}
      onBack={goBack}
      onPrimary={next}
    >
      <View style={styles.fields}>
        <AppInput
          label={t('onboarding.birthDate')}
          placeholder="DD/MM/YYYY"
          value={draft.dateOfBirth}
          onChangeText={update('dateOfBirth')}
          keyboardType="numbers-and-punctuation"
          error={errors.dateOfBirth}
        />
        <AppInput
          label={t('onboarding.heightCm')}
          placeholder="170"
          value={draft.heightCm}
          onChangeText={update('heightCm')}
          keyboardType="decimal-pad"
          error={errors.heightCm}
        />
        <AppInput
          label={t('onboarding.weightKg')}
          placeholder="65"
          value={draft.currentWeightKg}
          onChangeText={update('currentWeightKg')}
          keyboardType="decimal-pad"
          error={errors.currentWeightKg}
        />
        <SelectionField
          label={t('onboarding.activity')}
          placeholder={t('onboarding.selectActivity')}
          value={draft.activityLevel}
          options={activityOptions}
          onChange={(activityLevel) => {
            setDraft({ activityLevel });
            setErrors((current) => ({ ...current, activityLevel: null }));
          }}
          error={errors.activityLevel}
        />
        <InfoCard
          title={t('onboarding.privateData')}
          description={t('onboarding.privateDataDescription')}
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({ fields: { gap: spacing.lg } });
