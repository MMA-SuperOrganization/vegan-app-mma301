import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
} from '@/components';
import { parseDecimal, validateMeasurement } from '@/features/onboarding/validation';
import { useSafeBack } from '@/hooks';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useProfileStore } from '../profileStore';

export function NutritionProfileScreen() {
  const { t } = useTranslation();
  const goBack = useSafeBack('/(tabs)/profile');
  const nutrition = useProfileStore((state) => state.data?.nutritionProfile);
  const save = useProfileStore((state) => state.updateNutritionTargets);
  const recalculate = useProfileStore((state) => state.recalculateNutrition);
  const isSaving = useProfileStore((state) => state.isSaving);
  const error = useProfileStore((state) => state.error);
  const [height, setHeight] = useState(nutrition?.heightCm?.toString() ?? '');
  const [weight, setWeight] = useState(nutrition?.currentWeightKg?.toString() ?? '');
  const [calories, setCalories] = useState(
    nutrition?.dailyCalorieTarget?.toString() ?? ''
  );
  const [validation, setValidation] = useState<string | null>(null);

  const submit = async () => {
    const heightError = validateMeasurement(height, t('onboarding.height'), 50, 250);
    const weightError = validateMeasurement(weight, t('onboarding.weight'), 10, 500);
    const parsedCalories = calories.trim() ? parseDecimal(calories) : null;
    const caloriesError =
      parsedCalories !== null && (parsedCalories < 500 || parsedCalories > 10000)
        ? t('profile.nutritionCaloriesRange')
        : null;
    setValidation(heightError ?? weightError ?? caloriesError);
    if (heightError || weightError || caloriesError) return;
    const heightCm = parseDecimal(height);
    const currentWeightKg = parseDecimal(weight);
    if (heightCm === null || currentWeightKg === null) return;
    await save({
      heightCm,
      currentWeightKg,
      ...(parsedCalories !== null ? { dailyCalorieTarget: parsedCalories } : {}),
    });
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.screen}>
      <CustomHeader title={t('profile.nutritionTitle')} showBack onBack={goBack} />
      <AppText color={colors.text.secondary}>
        {t('profile.nutritionSubtitle')}
      </AppText>
      <View style={styles.summary}>
        <AppText variant="heading3">
          {nutrition?.bmi != null
            ? `BMI ${nutrition.bmi}`
            : t('profile.bmiUnavailable')}
        </AppText>
        <AppText color={colors.text.secondary}>
          {nutrition?.bmiCategory ?? t('profile.bmiEstimate')}
        </AppText>
      </View>
      <View style={styles.fields}>
        <AppInput
          label={t('onboarding.heightCm')}
          value={height}
          onChangeText={setHeight}
          keyboardType="decimal-pad"
        />
        <AppInput
          label={t('onboarding.weightKg')}
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
        />
        <AppInput
          label={t('profile.dailyCalories')}
          value={calories}
          onChangeText={setCalories}
          keyboardType="number-pad"
        />
      </View>
      {validation || error ? (
        <AppText color={colors.status.danger}>{validation ?? error}</AppText>
      ) : null}
      <AppButton
        title={t('profile.saveNutrition')}
        loading={isSaving}
        onPress={() => void submit()}
      />
      <AppButton
        title={t('profile.recalculate')}
        variant="outline"
        disabled={isSaving || !nutrition}
        onPress={() => void recalculate()}
      />
      <View style={styles.note}>
        <AppText variant="bodyStrong">{t('profile.estimateTitle')}</AppText>
        <AppText color={colors.text.secondary}>
          {t('profile.estimateDescription')}
        </AppText>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, gap: spacing.lg },
  summary: {
    padding: spacing.xl,
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
  },
  fields: { gap: spacing.lg },
  note: {
    padding: spacing.xl,
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
  },
});
