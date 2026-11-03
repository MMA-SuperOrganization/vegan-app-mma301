import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import {
  AppButton,
  AppInput,
  AppText,
  DateInputField,
  SettingsScreenLayout,
  TimezonePickerField,
  appDialog,
} from '@/components';
import { dateInputToIso, parseDecimal } from '@/features/onboarding/validation';
import { useSafeBack } from '@/hooks';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import { useProfileStore } from '../profileStore';
import {
  isValidIanaTimezone,
  validateOptionalMeasurement,
  validateOptionalUsername,
  validateProfileText,
} from '../validation';
import { SelectionField } from '@/features/onboarding/components/SelectionField';
import type { PersonalProfile } from '../types';
import { mediaApi } from '@/features/media/mediaApi';
import { FeatureState } from '@/components/feedback/FeatureState';
import { ProfileUpdateStatus } from '../components/ProfileUpdateStatus';

export function EditProfileScreen() {
  const goBack = useSafeBack('/(tabs)/profile');
  const { t } = useTranslation();
  const data = useProfileStore((state) => state.data);
  const update = useProfileStore((state) => state.update);
  const isSaving = useProfileStore((state) => state.isSaving);
  const storeError = useProfileStore((state) => state.error);
  // Also mark the field itself, since it sits far above the save button.
  const usernameTaken = storeError === t('profile.error.usernameTaken');
  const [name, setName] = useState(data?.user.name ?? '');
  const [username, setUsername] = useState(data?.profile?.username ?? '');
  const [city, setCity] = useState(data?.profile?.city ?? '');
  const [country, setCountry] = useState(data?.profile?.country ?? '');
  const [gender, setGender] = useState<NonNullable<PersonalProfile['gender']>>(
    data?.profile?.gender ?? 'prefer_not_to_say'
  );
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
  const [avatar, setAvatar] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const avatarUpload = useMutation({
    mutationFn: (asset: ImagePicker.ImagePickerAsset) =>
      mediaApi.uploadImage(asset, 'avatar'),
  });
  const chooseAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0]);
      avatarUpload.reset();
    }
  };

  const save = async () => {
    const textValidation = validateProfileText(name, bio);
    const next = {
      name: textValidation.name ? null : t('profile.nameInvalid'),
      bio: textValidation.bio ? null : t('profile.bioInvalid'),
      username: validateOptionalUsername(username)
        ? null
        : t('profile.usernameInvalid'),
      city: city.trim().length <= 100 ? null : t('profile.locationInvalid'),
      country: country.trim().length <= 100 ? null : t('profile.locationInvalid'),
      dateOfBirth:
        dateOfBirth.trim() && !dateInputToIso(dateOfBirth)
          ? t('profile.birthDateInvalid')
          : null,
      timezone: isValidIanaTimezone(timezone) ? null : t('profile.timezoneInvalid'),
      height: validateOptionalMeasurement(height, 50, 250)
        ? null
        : t('onboarding.validation.range', {
            label: t('onboarding.height'),
            min: 50,
            max: 250,
          }),
      weight: validateOptionalMeasurement(weight, 10, 500)
        ? null
        : t('onboarding.validation.range', {
            label: t('onboarding.weight'),
            min: 10,
            max: 500,
          }),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    const heightCm = parseDecimal(height);
    const currentWeightKg = parseDecimal(weight);
    try {
      const avatarMediaId = avatar
        ? avatarUpload.data || (await avatarUpload.mutateAsync(avatar))
        : undefined;
      if (
        await update({
          displayName: name.trim(),
          avatarMediaId,
          username: optionalText(username),
          city: optionalText(city),
          country: optionalText(country),
          gender,
          bio: optionalText(bio),
          dateOfBirth: dateOfBirth.trim()
            ? (dateInputToIso(dateOfBirth) ?? undefined)
            : undefined,
          timezone: timezone.trim(),
          heightCm: heightCm ?? undefined,
          currentWeightKg: currentWeightKg ?? undefined,
        })
      ) {
        appDialog.alert(
          t('profile.saveSuccessTitle'),
          t('profile.saveSuccessMessage')
        );
        goBack();
      }
    } catch {
      // Upload error is rendered with the form.
    }
  };

  return (
    <SettingsScreenLayout
      title={t('profile.edit')}
      subtitle={t('profile.editDescription')}
      onBack={goBack}
      contentContainerStyle={styles.content}
    >
      <View style={styles.fields}>
        <ProfileUpdateStatus
          status={data?.user.status}
          updatedAt={data?.profile?.updatedAt}
        />
        <View style={styles.avatarRow}>
          {avatar?.uri || data?.user.avatarUrl ? (
            <Image
              source={{ uri: avatar?.uri || data?.user.avatarUrl }}
              style={styles.avatar}
              accessibilityLabel={t('profile.edit')}
            />
          ) : null}
          <AppButton
            title={t('profile.edit') + ' avatar'}
            variant="outline"
            disabled={isSaving || avatarUpload.isPending}
            onPress={() => void chooseAvatar()}
          />
        </View>
        <AppInput
          label={t('auth.displayName')}
          value={name}
          onChangeText={setName}
          error={errors.name}
        />
        <AppInput
          label={t('profile.username')}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.username || (usernameTaken ? storeError : null)}
        />
        <AppInput
          label={t('profile.city')}
          value={city}
          onChangeText={setCity}
          error={errors.city}
        />
        <AppInput
          label={t('profile.country')}
          value={country}
          onChangeText={setCountry}
          error={errors.country}
        />
        <AppInput
          label={t('profile.bio')}
          value={bio}
          onChangeText={setBio}
          error={errors.bio}
        />
        <DateInputField
          label={t('profile.birthDate')}
          value={dateOfBirth}
          onChange={setDateOfBirth}
          error={errors.dateOfBirth}
        />
        <SelectionField
          label={t('profile.gender')}
          placeholder={t('profile.gender')}
          value={gender}
          onChange={setGender}
          options={(
            ['female', 'male', 'non_binary', 'other', 'prefer_not_to_say'] as const
          ).map((value) => ({ value, label: t(`profile.gender.${value}`) }))}
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
        <FeatureState error={avatarUpload.error} />
      </View>
      <AppButton
        title={t('profile.save')}
        loading={isSaving || avatarUpload.isPending}
        disabled={isSaving || avatarUpload.isPending}
        onPress={() => void save()}
      />
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing['3xl'],
    justifyContent: 'space-between',
  },
  fields: { gap: spacing.xl },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  avatar: { width: 88, height: 88, borderRadius: 44 },
});

function toDateInput(value?: string | null) {
  if (!value) return '';
  const match = value.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
}

function optionalText(value: string) {
  return value.trim() || undefined;
}
