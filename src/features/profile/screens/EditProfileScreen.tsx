import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppInput,
  AppText,
  BackButton,
  ScreenWrapper,
  TimezonePickerField,
} from '@/components';
import {
  dateInputToIso,
  parseDecimal,
  validateMeasurement,
} from '@/features/onboarding/validation';
import { useSafeBack } from '@/hooks';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import { useProfileStore } from '../profileStore';
import { isValidIanaTimezone, validateProfileText } from '../validation';

export function EditProfileScreen() {
  const goBack = useSafeBack('/(tabs)/profile');
  const { t } = useTranslation();
  const data = useProfileStore((state) => state.data);
  const update = useProfileStore((state) => state.update);
  const isSaving = useProfileStore((state) => state.isSaving);
  const storeError = useProfileStore((state) => state.error);
  const [name, setName] = useState(data?.user.name ?? '');
  const [bio, setBio] = useState(data?.profile?.bio ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(
    toDateInput(data?.profile?.dateOfBirth)
  );
  const [timezone, setTimezone] = useState(
    data?.profile?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [height, setHeight] = useState(
    data?.nutritionProfile?.heightCm?.toString() ?? ''
  );
  const [weight, setWeight] = useState(
    data?.nutritionProfile?.currentWeightKg?.toString() ?? ''
  );
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const save = async () => {
    const textValidation = validateProfileText(name, bio);
    const next = {
      name: textValidation.name ? null : t('profile.nameInvalid'),
      bio: textValidation.bio ? null : t('profile.bioInvalid'),
      dateOfBirth:
        dateOfBirth.trim() && !dateInputToIso(dateOfBirth)
          ? t('profile.birthDateInvalid')
          : null,
      timezone: isValidIanaTimezone(timezone) ? null : t('profile.timezoneInvalid'),
      height: validateMeasurement(height, t('onboarding.height'), 50, 250),
      weight: validateMeasurement(weight, t('onboarding.weight'), 10, 500),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    const heightCm = parseDecimal(height);
    const currentWeightKg = parseDecimal(weight);
    if (heightCm === null || currentWeightKg === null) return;
    if (
      await update({
        displayName: name.trim(),
        bio: bio.trim(),
        dateOfBirth: dateOfBirth.trim()
          ? (dateInputToIso(dateOfBirth) ?? undefined)
          : null,
        timezone: timezone.trim(),
        heightCm,
        currentWeightKg,
      })
    )
      goBack();
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.screen}>
      <View style={styles.body}>
        <View style={styles.header}>
          <BackButton onPress={goBack} size={48} iconSize={20} />
          <View style={styles.headerCopy}>
            <AppText variant="heading2">{t('profile.edit')}</AppText>
            <AppText variant="bodySmall" color={colors.text.secondary}>
              {t('profile.editDescription')}
            </AppText>
          </View>
        </View>
        <View style={styles.fields}>
          <AppInput
            label={t('auth.displayName')}
            value={name}
            onChangeText={setName}
            error={errors.name}
          />
          <AppInput
            label={t('profile.bio')}
            value={bio}
            onChangeText={setBio}
            error={errors.bio}
          />
          <AppInput
            label={t('profile.birthDate')}
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            keyboardType="number-pad"
            placeholder="DD/MM/YYYY"
            error={errors.dateOfBirth}
          />
          <TimezonePickerField
            label={t('profile.timezone')}
            value={timezone}
            onChange={setTimezone}
            error={errors.timezone}
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
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing['3xl'],
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerCopy: { flex: 1, gap: spacing.xs },
  fields: { gap: spacing.xl },
});

function toDateInput(value?: string | null) {
  if (!value) return '';
  const match = value.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
}
