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
import { colors, spacing } from '@/theme';
import { useProfileStore } from '../profileStore';

export function EditProfileScreen() {
  const goBack = useSafeBack('/(tabs)/profile');
  const { t } = useTranslation();
  const data = useProfileStore((state) => state.data);
  const update = useProfileStore((state) => state.update);
  const isSaving = useProfileStore((state) => state.isSaving);
  const storeError = useProfileStore((state) => state.error);
  const [name, setName] = useState(data?.user.name ?? '');
  const [height, setHeight] = useState(
    data?.nutritionProfile?.heightCm?.toString() ?? ''
  );
  const [weight, setWeight] = useState(
    data?.nutritionProfile?.currentWeightKg?.toString() ?? ''
  );
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const save = async () => {
    const next = {
      name: name.trim() ? null : t('auth.validation.nameRequired'),
      height: validateMeasurement(height, t('onboarding.height'), 50, 250),
      weight: validateMeasurement(weight, t('onboarding.weight'), 10, 500),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    const heightCm = parseDecimal(height);
    const currentWeightKg = parseDecimal(weight);
    if (heightCm === null || currentWeightKg === null) return;
    if (await update({ displayName: name, heightCm, currentWeightKg })) goBack();
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <CustomHeader
          title={t('profile.edit')}
          showBack
          onBack={goBack}
          backFallbackHref="/(tabs)/profile"
        />
        <AppText color={colors.text.secondary}>
          {t('profile.editDescription')}
        </AppText>
      </View>
      <View style={styles.fields}>
        <AppInput
          label={t('auth.displayName')}
          value={name}
          onChangeText={setName}
          error={errors.name}
        />
        <AppInput
          label={t('onboarding.heightCm')}
          value={height}
          onChangeText={setHeight}
          keyboardType="decimal-pad"
          error={errors.height}
        />
        <AppInput
          label={t('onboarding.weightKg')}
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          error={errors.weight}
        />
        {storeError ? (
          <AppText color={colors.status.danger}>{storeError}</AppText>
        ) : null}
      </View>
      <AppButton
        title={t('profile.save')}
        loading={isSaving}
        onPress={() => void save()}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    padding: spacing.xl,
    gap: spacing['3xl'],
    justifyContent: 'space-between',
  },
  header: { gap: spacing.lg },
  fields: { gap: spacing.xl },
});
