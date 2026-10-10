import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppButton, AppText, CustomHeader, ScreenWrapper } from '@/components';
import { SelectionField } from '@/features/onboarding/components/SelectionField';
import {
  getActivityOptions,
  getDietOptions,
  getGoalOptions,
} from '@/features/onboarding/constants';
import type {
  ActivityLevel,
  DietType,
  NutritionGoal,
} from '@/features/onboarding/types';
import { useSafeBack } from '@/hooks';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useProfileStore } from '../profileStore';

export function DietaryPreferencesScreen() {
  const { t } = useTranslation();
  const goBack = useSafeBack('/(tabs)/profile');
  const data = useProfileStore((state) => state.data);
  const update = useProfileStore((state) => state.updateDietaryPreferences);
  const isSaving = useProfileStore((state) => state.isSaving);
  const error = useProfileStore((state) => state.error);
  const [dietType, setDietType] = useState<DietType | null>(
    data?.profile?.dietType ?? null
  );
  const [goal, setGoal] = useState<NutritionGoal | null>(
    data?.nutritionProfile?.goal ?? null
  );
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(
    data?.nutritionProfile?.activityLevel ?? null
  );
  const [validation, setValidation] = useState(false);

  const submit = async () => {
    if (!dietType || !goal || !activityLevel) {
      setValidation(true);
      return;
    }
    if (await update({ dietType, goal, activityLevel })) goBack();
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.screen}>
      <CustomHeader title={t('profile.dietaryTitle')} showBack onBack={goBack} />
      <AppText color={colors.text.secondary}>{t('profile.dietarySubtitle')}</AppText>
      <View style={styles.fields}>
        <SelectionField
          label={t('onboarding.dietType')}
          placeholder={t('onboarding.selectDiet')}
          value={dietType}
          options={getDietOptions(t)}
          onChange={setDietType}
          error={validation && !dietType ? t('onboarding.validation.diet') : null}
        />
        <SelectionField
          label={t('onboarding.goal')}
          placeholder={t('onboarding.selectGoal')}
          value={goal}
          options={getGoalOptions(t)}
          onChange={setGoal}
          error={validation && !goal ? t('onboarding.validation.goal') : null}
        />
        <SelectionField
          label={t('onboarding.activity')}
          placeholder={t('onboarding.selectActivity')}
          value={activityLevel}
          options={getActivityOptions(t)}
          onChange={setActivityLevel}
          error={
            validation && !activityLevel ? t('onboarding.validation.activity') : null
          }
        />
      </View>
      {error ? <AppText color={colors.status.danger}>{error}</AppText> : null}
      <View style={styles.note}>
        <AppText variant="bodyStrong">{t('profile.preferenceGroups')}</AppText>
        <AppText color={colors.text.secondary}>
          {t('profile.preferenceGroupsDescription')}
        </AppText>
      </View>
      <AppButton
        title={t('profile.savePreferences')}
        loading={isSaving}
        onPress={() => void submit()}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: spacing.xl, gap: spacing.lg },
  fields: { gap: spacing.lg },
  note: {
    padding: spacing.xl,
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
  },
});
