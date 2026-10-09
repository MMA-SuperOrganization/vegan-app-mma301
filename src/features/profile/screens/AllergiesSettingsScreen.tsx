import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppText,
  CustomHeader,
  EmptyState,
  ScreenWrapper,
  Toggle,
} from '@/components';
import { toggleAllergenSelection } from '@/features/onboarding/validation';
import { useSafeBack } from '@/hooks';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useProfileStore } from '../profileStore';

export function AllergiesSettingsScreen() {
  const { t } = useTranslation();
  const goBack = useSafeBack('/(tabs)/profile');
  const data = useProfileStore((state) => state.data);
  const update = useProfileStore((state) => state.updateAllergens);
  const isSaving = useProfileStore((state) => state.isSaving);
  const error = useProfileStore((state) => state.error);
  const [selected, setSelected] = useState(
    data?.nutritionProfile?.allergenIds ?? []
  );
  const save = async () => {
    if (await update(selected)) goBack();
  };
  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.screen}>
      <CustomHeader title={t('profile.allergyTitle')} showBack onBack={goBack} />
      <AppText color={colors.text.secondary}>{t('profile.allergySubtitle')}</AppText>
      {!data?.allergens.length ? (
        <EmptyState
          title={t('onboarding.noAllergensTitle')}
          description={t('onboarding.noAllergensDescription')}
        />
      ) : null}
      <View style={styles.list}>
        {data?.allergens.map((allergen) => (
          <Toggle
            key={allergen._id}
            label={allergen.name}
            value={selected.includes(allergen._id)}
            disabled={isSaving}
            onValueChange={() =>
              setSelected((current) =>
                toggleAllergenSelection(current, allergen._id)
              )
            }
          />
        ))}
      </View>
      <AppButton
        title={t('onboarding.allergenInfo')}
        variant="outline"
        onPress={() =>
          Alert.alert(
            t('onboarding.allergenInfoTitle'),
            t('onboarding.allergenInfoDescription')
          )
        }
      />
      <View style={styles.note}>
        <AppText variant="bodyStrong">{t('profile.allergyWarningTitle')}</AppText>
        <AppText color={colors.text.secondary}>
          {t('profile.allergyWarningDescription')}
        </AppText>
      </View>
      {error ? <AppText color={colors.status.danger}>{error}</AppText> : null}
      <AppButton
        title={t('profile.saveAllergies')}
        loading={isSaving}
        onPress={() => void save()}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: spacing.xl, gap: spacing.xl },
  list: { gap: spacing.md },
  note: {
    padding: spacing.xl,
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
  },
});
