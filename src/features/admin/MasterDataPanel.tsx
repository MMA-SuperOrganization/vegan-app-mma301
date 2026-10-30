import { useState } from 'react';
import { View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppButton, AppInput, AppText } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { SelectionField } from '@/features/onboarding/components/SelectionField';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { adminApi, type MasterRecord } from './adminApi';
import {
  ADMIN_QUERY_KEYS,
  ADMIN_TRANSLATION_KEYS,
  MASTER_CATEGORY_TYPE_LABEL_KEYS,
  MASTER_CATEGORY_TYPES,
  MASTER_FOOD_DEFAULTS,
  MASTER_RECORD_STATUS_LABEL_KEYS,
  MasterCategoryType,
  MasterRecordStatus,
  MasterResourceType,
} from './adminConstants';

const parseNumericInput = (value: string) =>
  Number(value.replace(',', '.')) || 0;

export function MasterDataPanel() {
  const { t } = useTranslation();
  const keys = ADMIN_TRANSLATION_KEYS.MASTER;
  const client = useQueryClient();

  const categories = useQuery({
    queryKey: ADMIN_QUERY_KEYS.MASTER_CATEGORIES,
    queryFn: adminApi.categories,
  });
  const allergens = useQuery({
    queryKey: ADMIN_QUERY_KEYS.MASTER_ALLERGENS,
    queryFn: adminApi.allergens,
  });
  const foods = useQuery({
    queryKey: ADMIN_QUERY_KEYS.MASTER_FOODS,
    queryFn: adminApi.foods,
  });

  const [category, setCategory] = useState<Partial<MasterRecord>>({
    type: MasterCategoryType.RECIPE,
  });
  const [allergen, setAllergen] = useState<Partial<MasterRecord>>({});
  const [food, setFood] = useState<Partial<MasterRecord>>({
    isVegan: MASTER_FOOD_DEFAULTS.IS_VEGAN,
    isVegetarian: MASTER_FOOD_DEFAULTS.IS_VEGETARIAN,
  });
  const [serving, setServing] = useState<string>(MASTER_FOOD_DEFAULTS.SERVING_G);
  const [calories, setCalories] = useState<string>(
    MASTER_FOOD_DEFAULTS.ZERO_MACRO
  );
  const [protein, setProtein] = useState<string>(MASTER_FOOD_DEFAULTS.ZERO_MACRO);
  const [carbs, setCarbs] = useState<string>(MASTER_FOOD_DEFAULTS.ZERO_MACRO);
  const [fat, setFat] = useState<string>(MASTER_FOOD_DEFAULTS.ZERO_MACRO);
  const [fiber, setFiber] = useState<string>(MASTER_FOOD_DEFAULTS.ZERO_MACRO);

  const refresh = () =>
    client.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.MASTER_ROOT });

  const categorySave = useMutation({
    mutationFn: adminApi.saveCategory,
    onSuccess: async () => {
      setCategory({ type: MasterCategoryType.RECIPE });
      await refresh();
    },
  });
  const allergenSave = useMutation({
    mutationFn: adminApi.saveAllergen,
    onSuccess: async () => {
      setAllergen({});
      await refresh();
    },
  });
  const foodSave = useMutation({
    mutationFn: adminApi.saveFood,
    onSuccess: async () => {
      setFood({
        isVegan: MASTER_FOOD_DEFAULTS.IS_VEGAN,
        isVegetarian: MASTER_FOOD_DEFAULTS.IS_VEGETARIAN,
      });
      await refresh();
    },
  });
  const masterStatus = useMutation({
    mutationFn: ({
      type,
      id,
      status,
      record,
    }: {
      type: `${MasterResourceType}`;
      id: string;
      status: `${MasterRecordStatus}`;
      record: MasterRecord;
    }) => adminApi.setMasterStatus(type, { ...record, _id: id }, status),
    onSuccess: refresh,
  });

  const card = {
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.background.surface,
  } as const;

  const formatRecordMeta = (record: MasterRecord): string => {
    const typeLabel = record.type
      ? t(MASTER_CATEGORY_TYPE_LABEL_KEYS[record.type as MasterCategoryType])
      : undefined;
    const statusLabel = record.status
      ? t(MASTER_RECORD_STATUS_LABEL_KEYS[record.status as MasterRecordStatus])
      : undefined;
    return [typeLabel, statusLabel].filter(Boolean).join(' · ');
  };

  const renderRecordList = (
    records: MasterRecord[],
    type: `${MasterResourceType}`,
    edit: (record: MasterRecord) => void
  ) =>
    records.map((record) => {
      const isInactive = record.status === MasterRecordStatus.INACTIVE;
      return (
        <View key={record._id} style={card}>
          <AppText variant="bodyStrong">{record.name}</AppText>
          <AppText>{formatRecordMeta(record)}</AppText>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <AppButton
              title={t(keys.EDIT)}
              variant="outline"
              fullWidth={false}
              disabled={isInactive}
              onPress={() => edit(record)}
            />
            <AppButton
              title={isInactive ? t(keys.RESTORE) : t(keys.DEACTIVATE)}
              variant="ghost"
              fullWidth={false}
              disabled={masterStatus.isPending}
              onPress={() =>
                masterStatus.mutate({
                  type,
                  id: record._id,
                  record,
                  status: isInactive
                    ? MasterRecordStatus.ACTIVE
                    : MasterRecordStatus.INACTIVE,
                })
              }
            />
          </View>
        </View>
      );
    });

  return (
    <View style={{ gap: spacing.lg }}>
      <AppText variant="heading2">{t(keys.TITLE)}</AppText>
      <FeatureState
        loading={categories.isLoading || allergens.isLoading || foods.isLoading}
        error={
          categories.error ||
          allergens.error ||
          foods.error ||
          categorySave.error ||
          allergenSave.error ||
          foodSave.error ||
          masterStatus.error
        }
      />

      <AppText variant="heading3">{t(keys.CATEGORIES)}</AppText>
      <AppInput
        label={t(keys.CATEGORY_NAME)}
        value={category.name || ''}
        onChangeText={(name) => setCategory((value) => ({ ...value, name }))}
      />
      <SelectionField
        label={t(keys.TYPE)}
        placeholder={t(keys.TYPE_PLACEHOLDER)}
        value={category.type || MasterCategoryType.RECIPE}
        options={MASTER_CATEGORY_TYPES.map((value) => ({
          value,
          label: t(MASTER_CATEGORY_TYPE_LABEL_KEYS[value]),
        }))}
        onChange={(type) => setCategory((value) => ({ ...value, type }))}
      />
      <AppButton
        title={category._id ? t(keys.UPDATE_CATEGORY) : t(keys.ADD_CATEGORY)}
        disabled={!category.name?.trim() || categorySave.isPending}
        onPress={() =>
          categorySave.mutate(category as MasterRecord & { name: string })
        }
      />
      {renderRecordList(
        categories.data?.data || [],
        MasterResourceType.CATEGORIES,
        setCategory
      )}

      <AppText variant="heading3">{t(keys.ALLERGENS)}</AppText>
      <AppInput
        label={t(keys.ALLERGEN_NAME)}
        value={allergen.name || ''}
        onChangeText={(name) => setAllergen((value) => ({ ...value, name }))}
      />
      <AppButton
        title={allergen._id ? t(keys.UPDATE_ALLERGEN) : t(keys.ADD_ALLERGEN)}
        disabled={!allergen.name?.trim() || allergenSave.isPending}
        onPress={() =>
          allergenSave.mutate(allergen as MasterRecord & { name: string })
        }
      />
      {renderRecordList(
        allergens.data?.data || [],
        MasterResourceType.ALLERGENS,
        setAllergen
      )}

      <AppText variant="heading3">{t(keys.FOODS)}</AppText>
      <AppInput
        label={t(keys.FOOD_NAME)}
        value={food.name || ''}
        onChangeText={(name) => setFood((value) => ({ ...value, name }))}
      />
      <SelectionField
        label={t(keys.FOOD_CATEGORY)}
        placeholder={t(keys.CHOOSE_CATEGORY)}
        value={food.categoryId || null}
        options={(categories.data?.data || [])
          .filter((item) => item.type === MasterCategoryType.FOOD)
          .map((item) => ({ value: item._id, label: item.name }))}
        onChange={(categoryId) => setFood((value) => ({ ...value, categoryId }))}
      />
      <AppInput
        label={t(keys.DEFAULT_SERVING_G)}
        value={serving}
        onChangeText={setServing}
        keyboardType="decimal-pad"
      />
      <AppInput
        label={t(keys.KCAL_PER_100G)}
        value={calories}
        onChangeText={setCalories}
        keyboardType="decimal-pad"
      />
      <AppInput
        label={t(keys.PROTEIN_PER_100G)}
        value={protein}
        onChangeText={setProtein}
        keyboardType="decimal-pad"
      />
      <AppInput
        label={t(keys.CARBS_PER_100G)}
        value={carbs}
        onChangeText={setCarbs}
        keyboardType="decimal-pad"
      />
      <AppInput
        label={t(keys.FAT_PER_100G)}
        value={fat}
        onChangeText={setFat}
        keyboardType="decimal-pad"
      />
      <AppInput
        label={t(keys.FIBER_PER_100G)}
        value={fiber}
        onChangeText={setFiber}
        keyboardType="decimal-pad"
      />
      <AppButton
        title={food._id ? t(keys.UPDATE_FOOD) : t(keys.ADD_FOOD)}
        disabled={!food.name?.trim() || !food.categoryId || foodSave.isPending}
        onPress={() =>
          foodSave.mutate({
            ...food,
            name: food.name!.trim(),
            defaultServing: {
              amount: parseNumericInput(serving),
              unit: MASTER_FOOD_DEFAULTS.UNIT_GRAM,
              gramEquivalent: parseNumericInput(serving),
            },
            nutritionPer100g: {
              caloriesKcal: parseNumericInput(calories),
              proteinG: parseNumericInput(protein),
              carbsG: parseNumericInput(carbs),
              fatG: parseNumericInput(fat),
              fiberG: parseNumericInput(fiber),
            },
            isVegan: MASTER_FOOD_DEFAULTS.IS_VEGAN,
            isVegetarian: MASTER_FOOD_DEFAULTS.IS_VEGETARIAN,
          })
        }
      />
      {renderRecordList(
        foods.data?.data || [],
        MasterResourceType.FOOD_ITEMS,
        (record) => {
          setFood(record);
          setServing(
            String(
              record.defaultServing?.amount ||
                MASTER_FOOD_DEFAULTS.DEFAULT_SERVING_AMOUNT
            )
          );
          setCalories(String(record.nutritionPer100g?.caloriesKcal || 0));
          setProtein(String(record.nutritionPer100g?.proteinG || 0));
          setCarbs(String(record.nutritionPer100g?.carbsG || 0));
          setFat(String(record.nutritionPer100g?.fatG || 0));
          setFiber(String(record.nutritionPer100g?.fiberG || 0));
        }
      )}
    </View>
  );
}
