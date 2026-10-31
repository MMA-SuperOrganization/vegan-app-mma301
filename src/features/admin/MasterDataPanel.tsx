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

const number = (value: string) => Number(value.replace(',', '.')) || 0;
type MasterSection = 'categories' | 'allergens' | 'foods';

export function MasterDataPanel() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<MasterSection>('categories');
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
  const activeQuery =
    activeSection === 'categories'
      ? categories
      : activeSection === 'allergens'
        ? allergens
        : foods;
  const activeMutationError =
    activeSection === 'categories'
      ? categorySave.error
      : activeSection === 'allergens'
        ? allergenSave.error
        : foodSave.error;
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
    records.map((record) => (
      <View key={record._id} style={card}>
        <AppText variant="bodyStrong">{record.name}</AppText>
        <AppText>{[record.type, record.status].filter(Boolean).join(' · ')}</AppText>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <AppButton
            title={t('admin.master.edit')}
            variant="outline"
            fullWidth={false}
            disabled={record.status === 'inactive'}
            onPress={() => edit(record)}
          />
          <AppButton
            title={
              record.status === 'inactive'
                ? t('admin.master.restore')
                : t('admin.master.deactivate')
            }
            variant="ghost"
            fullWidth={false}
            disabled={masterStatus.isPending}
            onPress={() =>
              masterStatus.mutate({
                type,
                id: record._id,
                record,
                status: record.status === 'inactive' ? 'active' : 'inactive',
              })
            }
          />
        </View>
      </View>
    ));
  return (
    <View style={{ gap: spacing.lg }}>
      <AppText variant="heading2">{t('admin.master.title')}</AppText>
      <FeatureState
        loading={activeQuery.isLoading}
        error={activeQuery.error || activeMutationError || masterStatus.error}
        retry={() => void activeQuery.refetch()}
      />
      <AppText color={colors.text.secondary}>{t('admin.master.chooseSection')}</AppText>
      <View style={styles.sectionTabs}>
        {([
          ['categories', t('admin.master.categories')],
          ['allergens', t('admin.master.allergens')],
          ['foods', t('admin.master.foods')],
        ] as const).map(([section, label]) => (
          <AppButton
            key={section}
            title={label}
            variant={activeSection === section ? 'primary' : 'outline'}
            fullWidth={false}
            onPress={() => setActiveSection(section)}
          />
        ))}
      </View>
      {activeSection === 'categories' ? <>
      <AppText variant="heading3">{t('admin.master.categories')}</AppText>
      <AppInput
        label={t('admin.master.categoryName')}
        value={category.name || ''}
        onChangeText={(name) => setCategory((value) => ({ ...value, name }))}
      />
      <SelectionField
        label={t('admin.master.type')}
        placeholder=""
        value={category.type || 'recipe'}
        options={(['food', 'recipe', 'post'] as const).map((value) => ({
          value,
          label: t(MASTER_CATEGORY_TYPE_LABEL_KEYS[value]),
        }))}
        onChange={(type) => setCategory((value) => ({ ...value, type }))}
      />
      <AppButton
        title={
          category._id
            ? t('admin.master.update', { type: t('admin.master.categories') })
            : t('admin.master.add', { type: t('admin.master.categories') })
        }
        disabled={!category.name?.trim() || categorySave.isPending}
        onPress={() =>
          categorySave.mutate(category as MasterRecord & { name: string })
        }
      />
      {list(categories.data?.data || [], 'categories', setCategory)}
      </> : null}
      {activeSection === 'allergens' ? <>
      <AppText variant="heading3">{t('admin.master.allergens')}</AppText>
      <AppInput
        label={t('admin.master.allergenName')}
        value={allergen.name || ''}
        onChangeText={(name) => setAllergen((value) => ({ ...value, name }))}
      />
      <AppButton
        title={
          allergen._id
            ? t('admin.master.update', { type: t('admin.master.allergens') })
            : t('admin.master.add', { type: t('admin.master.allergens') })
        }
        disabled={!allergen.name?.trim() || allergenSave.isPending}
        onPress={() =>
          allergenSave.mutate(allergen as MasterRecord & { name: string })
        }
      />
      {list(allergens.data?.data || [], 'allergens', setAllergen)}
      </> : null}
      {activeSection === 'foods' ? <>
      <AppText variant="heading3">{t('admin.master.foods')}</AppText>
      <AppInput
        label={t('admin.master.foodName')}
        value={food.name || ''}
        onChangeText={(name) => setFood((value) => ({ ...value, name }))}
      />
      <SelectionField
        label={t('admin.master.foodCategory')}
        placeholder={t('admin.master.chooseCategory')}
        value={food.categoryId || null}
        options={(categories.data?.data || [])
          .filter((item) => item.type === MasterCategoryType.FOOD)
          .map((item) => ({ value: item._id, label: item.name }))}
        onChange={(categoryId) => setFood((value) => ({ ...value, categoryId }))}
      />
      <AppInput
        label={t('admin.master.serving')}
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
        label={t('admin.master.protein')}
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
        label={t('admin.master.fat')}
        value={fat}
        onChangeText={setFat}
        keyboardType="decimal-pad"
      />
      <AppInput
        label={t('admin.master.fiber')}
        value={fiber}
        onChangeText={setFiber}
        keyboardType="decimal-pad"
      />
      <AppButton
        title={
          food._id
            ? t('admin.master.update', { type: t('admin.master.foods') })
            : t('admin.master.add', { type: t('admin.master.foods') })
        }
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
      {list(foods.data?.data || [], 'food-items', (record) => {
        setFood(record);
        setServing(String(record.defaultServing?.amount || 100));
        setCalories(String(record.nutritionPer100g?.caloriesKcal || 0));
        setProtein(String(record.nutritionPer100g?.proteinG || 0));
        setCarbs(String(record.nutritionPer100g?.carbsG || 0));
        setFat(String(record.nutritionPer100g?.fatG || 0));
        setFiber(String(record.nutritionPer100g?.fiberG || 0));
      })}
      </> : null}
    </View>
  );
}

const styles = {
  sectionTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
} as const;
