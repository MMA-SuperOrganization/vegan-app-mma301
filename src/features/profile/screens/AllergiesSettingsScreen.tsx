import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppText,
  EmptyState,
  SettingsScreenLayout,
  Toggle,
  appDialog,
} from '@/components';
import { toggleAllergenSelection } from '@/features/onboarding/validation';
import { useSafeBack } from '@/hooks';
import { useTranslation } from '@/i18n';
import { allergenLabel } from '@/features/recipes/filterLabels';
import { colors, radius, spacing } from '@/theme';
import { useProfileStore } from '../profileStore';

export function AllergiesSettingsScreen() {
  const { t, locale } = useTranslation();
  const goBack = useSafeBack('/(tabs)/profile');
  const data = useProfileStore((state) => state.data);
  const update = useProfileStore((state) => state.updateAllergens);
  const reload = useProfileStore((state) => state.load);
  const userId = useProfileStore((state) => state.userId);
  const isSaving = useProfileStore((state) => state.isSaving);
  const error = useProfileStore((state) => state.error);
  const storedAllergenIds = data?.nutritionProfile?.allergenIds;
  const persistedAllergenIds = useMemo(
    () => storedAllergenIds ?? [],
    [storedAllergenIds]
  );
  const hasLocalChanges = useRef(false);
  const [selected, setSelected] = useState(persistedAllergenIds);
  useEffect(() => {
    if (!hasLocalChanges.current) setSelected(persistedAllergenIds);
  }, [persistedAllergenIds]);
  const save = async (acknowledgeMealPlanAllergenConflicts = false) => {
    const result = await update(
      selected,
      acknowledgeMealPlanAllergenConflicts
    );
    if (result.status === 'saved') {
      goBack();
      return;
    }
    if (result.status !== 'confirmation-required') return;
    const mealNames = [...new Set(result.conflicts.map((item) => item.mealName))];
    const allergenNames = [
      ...new Set(
        result.conflicts.flatMap((item) =>
          item.allergens.map((allergen) => allergen.name)
        )
      ),
    ];
    appDialog.alert(
      t('profile.allergyMealPlanConflictTitle'),
      t('profile.allergyMealPlanConflictDescription', {
        meals: mealNames.join(', ') || t('profile.allergyMealPlanUnknownMeal'),
        allergens:
          allergenNames.join(', ') || t('recipe.unknownAllergen'),
      }),
      [
        { text: t('profile.allergyKeepCurrent'), style: 'cancel' },
        {
          text: t('profile.allergySaveAnyway'),
          onPress: () => void save(true),
        },
      ]
    );
  };
  return (
    <SettingsScreenLayout
      title={t('profile.allergyTitle')}
      subtitle={t('profile.allergySubtitle')}
      onBack={goBack}
      contentContainerStyle={styles.content}
    >
      {data?.allergensLoadFailed ? (
        <EmptyState
          title={t('profile.allergyLoadError')}
          description={t('profile.allergyLoadErrorDescription')}
          actionLabel={t('common.retry')}
          onAction={() => userId && void reload(userId, true)}
        />
      ) : !data?.allergens.length ? (
        <EmptyState
          title={t('onboarding.noAllergensTitle')}
          description={t('onboarding.noAllergensDescription')}
        />
      ) : null}
      <View style={styles.list}>
        {!data?.allergensLoadFailed &&
          data?.allergens.map((allergen) => (
            <Toggle
              key={allergen._id}
              label={allergenLabel(allergen.name, locale)}
              value={selected.includes(allergen._id)}
              disabled={isSaving}
              onValueChange={() => {
                hasLocalChanges.current = true;
                setSelected((current) =>
                  toggleAllergenSelection(current, allergen._id)
                );
              }}
            />
          ))}
      </View>
      <AppButton
        title={t('onboarding.allergenInfo')}
        variant="outline"
        onPress={() =>
          appDialog.alert(
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
        disabled={!data || data.allergensLoadFailed}
        onPress={() => void save(false)}
      />
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl },
  list: { gap: spacing.md },
  note: {
    padding: spacing.xl,
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
  },
});
