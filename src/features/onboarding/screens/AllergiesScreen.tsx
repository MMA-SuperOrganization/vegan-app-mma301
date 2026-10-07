import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppText,
  EmptyState,
  LoadingSpinner,
  Toggle,
} from '@/components';
import { useSafeBack } from '@/hooks';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import { useOnboardingStore } from '../onboardingStore';
import { InfoCard } from '../components/InfoCard';
import { OnboardingScreen } from '../components/OnboardingScreen';

export function AllergiesScreen() {
  const router = useRouter();
  const goBack = useSafeBack('/(onboarding)/nutrition-profile');
  const { t } = useTranslation();
  const draft = useOnboardingStore((state) => state.draft);
  const allergens = useOnboardingStore((state) => state.allergens);
  const isLoading = useOnboardingStore((state) => state.isLoadingAllergens);
  const error = useOnboardingStore((state) => state.error);
  const loadAllergens = useOnboardingStore((state) => state.loadAllergens);
  const toggleAllergen = useOnboardingStore((state) => state.toggleAllergen);
  const selectNoAllergens = useOnboardingStore((state) => state.selectNoAllergens);
  const clearError = useOnboardingStore((state) => state.clearError);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    void loadAllergens();
  }, [loadAllergens]);

  const next = () => {
    if (!draft.allergyAnswered) {
      setValidationError(
        t('onboarding.allergyRequired')
      );
      return;
    }
    router.push('/(onboarding)/permissions');
  };

  return (
    <OnboardingScreen
      title={t('onboarding.allergyTitle')}
      subtitle={t('onboarding.allergySubtitle')}
      step={3}
      onBack={goBack}
      onPrimary={next}
      primaryLabel={t('onboarding.saveContinue')}
      error={validationError}
    >
      <View style={styles.list}>
        {isLoading ? <LoadingSpinner text={t('onboarding.loadingAllergens')} /> : null}
        {!isLoading && allergens.length
          ? allergens.map((allergen) => (
              <Toggle
                key={allergen._id}
                label={allergen.name}
                value={draft.allergenIds.includes(allergen._id)}
                onValueChange={() => {
                  toggleAllergen(allergen._id);
                  setValidationError(null);
                }}
              />
            ))
          : null}
        {!isLoading && !allergens.length && !error ? (
          <EmptyState
            title={t('onboarding.noAllergensTitle')}
            description={t('onboarding.noAllergensDescription')}
          />
        ) : null}
        {error ? (
          <View style={styles.retry}>
            <AppText
              variant="bodySmall"
              color={colors.status.danger}
              style={styles.center}
            >
              {error}
            </AppText>
            <AppButton
              title={t('common.retry')}
              variant="secondary"
              onPress={() => {
                clearError();
                void loadAllergens();
              }}
            />
          </View>
        ) : null}
        <InfoCard
          title={t('onboarding.noAllergens')}
          description={t('onboarding.noAllergensDescription2')}
        />
        <AppButton
          title={
            draft.allergyAnswered && !draft.allergenIds.length
              ? t('onboarding.noAllergensSelected')
              : t('onboarding.confirmNoAllergens')
          }
          variant="secondary"
          onPress={() => {
            selectNoAllergens();
            setValidationError(null);
          }}
        />
        <AppButton
          title={t('onboarding.allergenInfo')}
          variant="ghost"
          onPress={() =>
            Alert.alert(
              t('onboarding.allergenInfoTitle'),
              t('onboarding.allergenInfoDescription')
            )
          }
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.lg },
  retry: { gap: spacing.md },
  center: { textAlign: 'center' },
});
