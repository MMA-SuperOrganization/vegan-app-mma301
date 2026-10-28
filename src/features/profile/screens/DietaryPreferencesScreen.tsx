import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppText,
  SearchPickerSheet,
  SettingsScreenLayout,
} from '@/components';
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
import { usePantryFoodOptions } from '@/features/pantry/hooks';

type FoodGroup = 'preferred' | 'disliked' | 'excluded';

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
  const [preferredFoodItemIds, setPreferredFoodItemIds] = useState(
    data?.profile?.preferredFoodItemIds ?? []
  );
  const [dislikedFoodItemIds, setDislikedFoodItemIds] = useState(
    data?.profile?.dislikedFoodItemIds ?? []
  );
  const [excludedFoodItemIds, setExcludedFoodItemIds] = useState(
    data?.profile?.excludedFoodItemIds ?? []
  );
  const [foodNames, setFoodNames] = useState<Record<string, string>>({});
  const [activeGroup, setActiveGroup] = useState<FoodGroup | null>(null);
  const [search, setSearch] = useState('');
  const foodOptions = usePantryFoodOptions(search, activeGroup !== null);
  const foods = foodOptions.data?.pages.flatMap((page) => page.data) ?? [];

  const submit = async () => {
    if (!dietType || !goal || !activityLevel) {
      setValidation(true);
      return;
    }
    if (
      await update({
        dietType,
        goal,
        activityLevel,
        preferredFoodItemIds,
        dislikedFoodItemIds,
        excludedFoodItemIds,
      })
    )
      goBack();
  };

  const groups: Array<{
    key: FoodGroup;
    title: string;
    values: string[];
    setValues: (values: string[]) => void;
  }> = [
    {
      key: 'preferred',
      title: t('profile.preferredFoods'),
      values: preferredFoodItemIds,
      setValues: setPreferredFoodItemIds,
    },
    {
      key: 'disliked',
      title: t('profile.dislikedFoods'),
      values: dislikedFoodItemIds,
      setValues: setDislikedFoodItemIds,
    },
    {
      key: 'excluded',
      title: t('profile.excludedFoods'),
      values: excludedFoodItemIds,
      setValues: setExcludedFoodItemIds,
    },
  ];

  return (
    <SettingsScreenLayout
      title={t('profile.dietaryTitle')}
      subtitle={t('profile.dietarySubtitle')}
      onBack={goBack}
    >
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
        {groups.map((group) => (
          <View key={group.key} style={styles.foodGroup}>
            <AppText variant="bodyStrong">{group.title}</AppText>
            {group.values.length ? (
              group.values.map((foodItemId) => (
                <AppButton
                  key={foodItemId}
                  title={`${foodNames[foodItemId] ?? foodItemId.slice(-8)}  ×`}
                  variant="ghost"
                  onPress={() =>
                    group.setValues(
                      group.values.filter((value) => value !== foodItemId)
                    )
                  }
                />
              ))
            ) : (
              <AppText color={colors.text.secondary}>
                {t('profile.noFoodsSelected')}
              </AppText>
            )}
            <AppButton
              title={t('profile.addFood')}
              variant="outline"
              onPress={() => {
                setSearch('');
                setActiveGroup(group.key);
              }}
            />
          </View>
        ))}
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
      <SearchPickerSheet
        visible={activeGroup !== null}
        title={t('profile.chooseFood')}
        searchPlaceholder={t('profile.searchFood')}
        query={search}
        onQueryChange={setSearch}
        items={foods.map((food) => ({
          id: food._id,
          title: food.name,
          imageUrl: food.imageUrl,
        }))}
        isLoading={foodOptions.isLoading}
        isError={foodOptions.isError}
        onRetry={() => void foodOptions.refetch()}
        onClose={() => setActiveGroup(null)}
        onSelect={(foodItemId) => {
          const group = groups.find((item) => item.key === activeGroup);
          if (group && !group.values.includes(foodItemId))
            group.setValues([...group.values, foodItemId]);
          const food = foods.find((item) => item._id === foodItemId);
          if (food)
            setFoodNames((current) => ({ ...current, [foodItemId]: food.name }));
          setActiveGroup(null);
        }}
        hasMore={foodOptions.hasNextPage}
        loadingMore={foodOptions.isFetchingNextPage}
        onLoadMore={() => void foodOptions.fetchNextPage()}
      />
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  fields: { gap: spacing.lg },
  foodGroup: { gap: spacing.sm },
  note: {
    padding: spacing.xl,
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
  },
});
