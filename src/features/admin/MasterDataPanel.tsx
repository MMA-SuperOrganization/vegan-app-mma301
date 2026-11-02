import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppButton, AppInput, AppText } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { SelectionField } from '@/features/onboarding/components/SelectionField';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { adminApi, type MasterRecord } from './adminApi';
import {
  AdminEmptyState,
  AdminFilterChips,
  AdminPageIntro,
  AdminSectionHeader,
  AdminSegmentedTabs,
  AdminStatusBadge,
  AdminSurface,
} from './AdminUi';
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

const parseNumericInput = (value: string) => Number(value.replace(',', '.')) || 0;
type MasterSection = 'categories' | 'allergens' | 'foods';
type RecordFilter = 'all' | 'active' | 'inactive';

export function MasterDataPanel() {
  const { t, locale } = useTranslation();
  const vi = locale === 'vi';
  const keys = ADMIN_TRANSLATION_KEYS.MASTER;
  const [activeSection, setActiveSection] = useState<MasterSection>('categories');
  const [filter, setFilter] = useState<RecordFilter>('active');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
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
  const [serving, setServing] = useState(MASTER_FOOD_DEFAULTS.SERVING_G);
  const [calories, setCalories] = useState(MASTER_FOOD_DEFAULTS.ZERO_MACRO);
  const [protein, setProtein] = useState(MASTER_FOOD_DEFAULTS.ZERO_MACRO);
  const [carbs, setCarbs] = useState(MASTER_FOOD_DEFAULTS.ZERO_MACRO);
  const [fat, setFat] = useState(MASTER_FOOD_DEFAULTS.ZERO_MACRO);
  const [fiber, setFiber] = useState(MASTER_FOOD_DEFAULTS.ZERO_MACRO);

  const refresh = () =>
    client.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.MASTER_ROOT });
  const closeForm = () => {
    setCategory({ type: MasterCategoryType.RECIPE });
    setAllergen({});
    setFood({
      isVegan: MASTER_FOOD_DEFAULTS.IS_VEGAN,
      isVegetarian: MASTER_FOOD_DEFAULTS.IS_VEGETARIAN,
    });
    setServing(MASTER_FOOD_DEFAULTS.SERVING_G);
    setCalories(MASTER_FOOD_DEFAULTS.ZERO_MACRO);
    setProtein(MASTER_FOOD_DEFAULTS.ZERO_MACRO);
    setCarbs(MASTER_FOOD_DEFAULTS.ZERO_MACRO);
    setFat(MASTER_FOOD_DEFAULTS.ZERO_MACRO);
    setFiber(MASTER_FOOD_DEFAULTS.ZERO_MACRO);
    setFormOpen(false);
  };

  const categorySave = useMutation({
    mutationFn: adminApi.saveCategory,
    onSuccess: async () => {
      closeForm();
      await refresh();
    },
  });
  const allergenSave = useMutation({
    mutationFn: adminApi.saveAllergen,
    onSuccess: async () => {
      closeForm();
      await refresh();
    },
  });
  const foodSave = useMutation({
    mutationFn: adminApi.saveFood,
    onSuccess: async () => {
      closeForm();
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
  const records = activeQuery.data?.data ?? [];
  const counts = {
    all: records.length,
    active: records.filter((record) => record.status !== 'inactive').length,
    inactive: records.filter((record) => record.status === 'inactive').length,
  };
  const needle = search.trim().toLocaleLowerCase();
  const visibleRecords = records.filter((record) => {
    const matchesStatus =
      filter === 'all' ||
      (filter === 'active'
        ? record.status !== MasterRecordStatus.INACTIVE
        : record.status === MasterRecordStatus.INACTIVE);
    return matchesStatus && (!needle || record.name.toLocaleLowerCase().includes(needle));
  });

  const sectionLabel =
    activeSection === 'categories'
      ? t('admin.master.categories')
      : activeSection === 'allergens'
        ? t('admin.master.allergens')
        : t('admin.master.foods');

  const selectSection = (section: MasterSection) => {
    closeForm();
    setActiveSection(section);
    setFilter('active');
    setSearch('');
  };

  const editRecord = (record: MasterRecord) => {
    if (activeSection === 'categories') setCategory(record);
    else if (activeSection === 'allergens') setAllergen(record);
    else {
      setFood(record);
      setServing(String(record.defaultServing?.amount || 100));
      setCalories(String(record.nutritionPer100g?.caloriesKcal || 0));
      setProtein(String(record.nutritionPer100g?.proteinG || 0));
      setCarbs(String(record.nutritionPer100g?.carbsG || 0));
      setFat(String(record.nutritionPer100g?.fatG || 0));
      setFiber(String(record.nutritionPer100g?.fiberG || 0));
    }
    setFormOpen(true);
  };

  return (
    <View style={styles.root}>
      <AdminPageIntro
        eyebrow={vi ? 'Danh mục dùng chung' : 'Shared catalog'}
        title={t('admin.master.title')}
        description={
          vi
            ? 'Quản lý từng nhóm dữ liệu riêng, lọc bản ghi đang dùng và chỉ mở biểu mẫu khi cần.'
            : 'Manage each data group separately, filter active records, and open forms only when needed.'
        }
      />
      <AdminSegmentedTabs
        value={activeSection}
        onChange={selectSection}
        options={[
          {
            value: 'categories',
            label: t('admin.master.categories'),
            count: categories.data?.data.length,
          },
          {
            value: 'allergens',
            label: t('admin.master.allergens'),
            count: allergens.data?.data.length,
          },
          {
            value: 'foods',
            label: t('admin.master.foods'),
            count: foods.data?.data.length,
          },
        ]}
      />
      <FeatureState
        loading={activeQuery.isLoading}
        error={activeQuery.error || activeMutationError || masterStatus.error}
        retry={() => void activeQuery.refetch()}
      />

      {!activeQuery.isLoading && !activeQuery.error ? (
        <>
          <AdminSectionHeader
            title={sectionLabel}
            description={`${visibleRecords.length} ${vi ? 'bản ghi phù hợp' : 'matching records'}`}
            action={
              <AppButton
                title={formOpen ? (vi ? 'Đóng' : 'Close') : vi ? 'Thêm mới' : 'Add new'}
                variant={formOpen ? 'ghost' : 'outline'}
                fullWidth={false}
                onPress={() => (formOpen ? closeForm() : setFormOpen(true))}
              />
            }
          />
          <AppInput
            type="search"
            label={vi ? `Tìm ${sectionLabel.toLocaleLowerCase()}` : `Search ${sectionLabel.toLocaleLowerCase()}`}
            value={search}
            onChangeText={setSearch}
          />
          <AdminFilterChips
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'active', label: vi ? 'Đang dùng' : 'Active', count: counts.active },
              { value: 'inactive', label: vi ? 'Ngưng dùng' : 'Inactive', count: counts.inactive },
              { value: 'all', label: vi ? 'Tất cả' : 'All', count: counts.all },
            ]}
          />
        </>
      ) : null}

      {formOpen ? (
        <AdminSurface style={styles.form}>
          <AdminSectionHeader
            title={
              activeSection === 'categories' && category._id
                ? t('admin.master.update', { type: sectionLabel })
                : activeSection === 'allergens' && allergen._id
                  ? t('admin.master.update', { type: sectionLabel })
                  : activeSection === 'foods' && food._id
                    ? t('admin.master.update', { type: sectionLabel })
                    : t('admin.master.add', { type: sectionLabel })
            }
            description={
              vi ? 'Nhập thông tin rồi lưu thay đổi' : 'Enter the information and save your changes'
            }
          />
          {activeSection === 'categories' ? (
            <>
              <AppInput
                label={t('admin.master.categoryName')}
                value={category.name || ''}
                onChangeText={(name) => setCategory((value) => ({ ...value, name }))}
              />
              <SelectionField
                label={t('admin.master.type')}
                placeholder=""
                value={category.type || MasterCategoryType.RECIPE}
                options={MASTER_CATEGORY_TYPES.map((value) => ({
                  value,
                  label: t(MASTER_CATEGORY_TYPE_LABEL_KEYS[value]),
                }))}
                onChange={(type) => setCategory((value) => ({ ...value, type }))}
              />
              <AppButton
                title={
                  category._id
                    ? t('admin.master.update', { type: sectionLabel })
                    : t('admin.master.add', { type: sectionLabel })
                }
                loading={categorySave.isPending}
                disabled={!category.name?.trim() || categorySave.isPending}
                onPress={() =>
                  categorySave.mutate(category as MasterRecord & { name: string })
                }
              />
            </>
          ) : null}
          {activeSection === 'allergens' ? (
            <>
              <AppInput
                label={t('admin.master.allergenName')}
                value={allergen.name || ''}
                onChangeText={(name) => setAllergen((value) => ({ ...value, name }))}
              />
              <AppButton
                title={
                  allergen._id
                    ? t('admin.master.update', { type: sectionLabel })
                    : t('admin.master.add', { type: sectionLabel })
                }
                loading={allergenSave.isPending}
                disabled={!allergen.name?.trim() || allergenSave.isPending}
                onPress={() =>
                  allergenSave.mutate(allergen as MasterRecord & { name: string })
                }
              />
            </>
          ) : null}
          {activeSection === 'foods' ? (
            <>
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
                onChange={(categoryId) =>
                  setFood((value) => ({ ...value, categoryId }))
                }
              />
              <AppInput
                label={t('admin.master.serving')}
                value={serving}
                onChangeText={setServing}
                keyboardType="decimal-pad"
              />
              <View style={styles.nutritionGroup}>
                <AppText variant="bodyStrong">
                  {vi ? 'Dinh dưỡng trên 100g' : 'Nutrition per 100g'}
                </AppText>
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
              </View>
              <AppButton
                title={
                  food._id
                    ? t('admin.master.update', { type: sectionLabel })
                    : t('admin.master.add', { type: sectionLabel })
                }
                loading={foodSave.isPending}
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
            </>
          ) : null}
        </AdminSurface>
      ) : null}

      {activeQuery.data && visibleRecords.length === 0 ? (
        <AdminEmptyState
          icon="pantry"
          title={vi ? 'Không có bản ghi phù hợp' : 'No matching records'}
          description={
            vi
              ? 'Thử đổi bộ lọc, từ khóa hoặc thêm một bản ghi mới.'
              : 'Try another filter, keyword, or add a new record.'
          }
        />
      ) : null}
      <View style={styles.list}>
        {visibleRecords.map((record) => (
          <AdminSurface key={record._id}>
            <View style={styles.recordHeader}>
              <View style={styles.recordText}>
                <AppText variant="bodyStrong">{record.name}</AppText>
                {record.type ? (
                  <AppText variant="bodySmall" color={colors.text.secondary}>
                    {t(MASTER_CATEGORY_TYPE_LABEL_KEYS[record.type as MasterCategoryType])}
                  </AppText>
                ) : null}
              </View>
              <AdminStatusBadge
                label={t(
                  MASTER_RECORD_STATUS_LABEL_KEYS[
                    record.status === MasterRecordStatus.INACTIVE
                      ? MasterRecordStatus.INACTIVE
                      : MasterRecordStatus.ACTIVE
                  ]
                )}
                tone={record.status === MasterRecordStatus.INACTIVE ? 'neutral' : 'success'}
              />
            </View>
            {activeSection === 'foods' && record.nutritionPer100g ? (
              <AppText variant="bodySmall" color={colors.text.secondary}>
                {record.nutritionPer100g.caloriesKcal || 0} kcal · {record.nutritionPer100g.proteinG || 0}g {vi ? 'đạm' : 'protein'}
              </AppText>
            ) : null}
            <View style={styles.actions}>
              <AppButton
                title={t('admin.master.edit')}
                variant="outline"
                fullWidth={false}
                disabled={record.status === MasterRecordStatus.INACTIVE}
                onPress={() => editRecord(record)}
              />
              <AppButton
                title={
                  record.status === MasterRecordStatus.INACTIVE
                    ? t('admin.master.restore')
                    : t('admin.master.deactivate')
                }
                variant="ghost"
                fullWidth={false}
                disabled={masterStatus.isPending}
                onPress={() =>
                  masterStatus.mutate({
                    type:
                      activeSection === 'foods'
                        ? MasterResourceType.FOOD_ITEMS
                        : activeSection === 'categories'
                          ? MasterResourceType.CATEGORIES
                          : MasterResourceType.ALLERGENS,
                    id: record._id,
                    record,
                    status:
                      record.status === MasterRecordStatus.INACTIVE
                        ? MasterRecordStatus.ACTIVE
                        : MasterRecordStatus.INACTIVE,
                  })
                }
              />
            </View>
          </AdminSurface>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  form: { backgroundColor: colors.background.elevated },
  nutritionGroup: {
    padding: spacing.md,
    gap: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background.muted,
  },
  list: { gap: spacing.md },
  recordHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  recordText: { flex: 1, minWidth: 0, gap: spacing.xs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
