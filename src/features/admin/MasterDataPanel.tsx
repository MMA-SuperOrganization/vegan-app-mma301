import { useState } from 'react';
import { View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppButton, AppInput, AppText } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { SelectionField } from '@/features/onboarding/components/SelectionField';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { adminApi, type MasterRecord } from './adminApi';

const number = (value: string) => Number(value.replace(',', '.')) || 0;

export function MasterDataPanel() {
  const vi = useTranslation().locale === 'vi';
  const client = useQueryClient();
  const categories = useQuery({
    queryKey: ['admin', 'master', 'categories'],
    queryFn: adminApi.categories,
  });
  const allergens = useQuery({
    queryKey: ['admin', 'master', 'allergens'],
    queryFn: adminApi.allergens,
  });
  const foods = useQuery({
    queryKey: ['admin', 'master', 'foods'],
    queryFn: adminApi.foods,
  });
  const [category, setCategory] = useState<Partial<MasterRecord>>({
    type: 'recipe',
  });
  const [allergen, setAllergen] = useState<Partial<MasterRecord>>({});
  const [food, setFood] = useState<Partial<MasterRecord>>({
    isVegan: true,
    isVegetarian: true,
  });
  const [serving, setServing] = useState('100');
  const [calories, setCalories] = useState('0');
  const [protein, setProtein] = useState('0');
  const [carbs, setCarbs] = useState('0');
  const [fat, setFat] = useState('0');
  const [fiber, setFiber] = useState('0');
  const refresh = () => client.invalidateQueries({ queryKey: ['admin', 'master'] });
  const categorySave = useMutation({
    mutationFn: adminApi.saveCategory,
    onSuccess: async () => {
      setCategory({ type: 'recipe' });
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
      setFood({ isVegan: true, isVegetarian: true });
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
      type: Parameters<typeof adminApi.setMasterStatus>[0];
      id: string;
      status: 'active' | 'inactive';
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
  const list = (
    records: MasterRecord[],
    type: 'categories' | 'allergens' | 'food-items',
    edit: (record: MasterRecord) => void
  ) =>
    records.map((record) => (
      <View key={record._id} style={card}>
        <AppText variant="bodyStrong">{record.name}</AppText>
        <AppText>{[record.type, record.status].filter(Boolean).join(' · ')}</AppText>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <AppButton
            title={vi ? 'Sửa' : 'Edit'}
            variant="outline"
            fullWidth={false}
            disabled={record.status === 'inactive'}
            onPress={() => edit(record)}
          />
          <AppButton
            title={
              record.status === 'inactive'
                ? vi
                  ? 'Khôi phục'
                  : 'Restore'
                : vi
                  ? 'Ngưng dùng'
                  : 'Deactivate'
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
      <AppText variant="heading2">{vi ? 'Dữ liệu nền' : 'Master data'}</AppText>
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
      <AppText variant="heading3">{vi ? 'Danh mục' : 'Categories'}</AppText>
      <AppInput
        label={vi ? 'Tên danh mục' : 'Category name'}
        value={category.name || ''}
        onChangeText={(name) => setCategory((value) => ({ ...value, name }))}
      />
      <SelectionField
        label={vi ? 'Loại' : 'Type'}
        placeholder=""
        value={category.type || 'recipe'}
        options={(['food', 'recipe', 'post'] as const).map((value) => ({
          value,
          label: value,
        }))}
        onChange={(type) => setCategory((value) => ({ ...value, type }))}
      />
      <AppButton
        title={
          category._id
            ? vi
              ? 'Cập nhật danh mục'
              : 'Update category'
            : vi
              ? 'Thêm danh mục'
              : 'Add category'
        }
        disabled={!category.name?.trim() || categorySave.isPending}
        onPress={() =>
          categorySave.mutate(category as MasterRecord & { name: string })
        }
      />
      {list(categories.data?.data || [], 'categories', setCategory)}

      <AppText variant="heading3">{vi ? 'Dị nguyên' : 'Allergens'}</AppText>
      <AppInput
        label={vi ? 'Tên dị nguyên' : 'Allergen name'}
        value={allergen.name || ''}
        onChangeText={(name) => setAllergen((value) => ({ ...value, name }))}
      />
      <AppButton
        title={
          allergen._id
            ? vi
              ? 'Cập nhật dị nguyên'
              : 'Update allergen'
            : vi
              ? 'Thêm dị nguyên'
              : 'Add allergen'
        }
        disabled={!allergen.name?.trim() || allergenSave.isPending}
        onPress={() =>
          allergenSave.mutate(allergen as MasterRecord & { name: string })
        }
      />
      {list(allergens.data?.data || [], 'allergens', setAllergen)}

      <AppText variant="heading3">{vi ? 'Thực phẩm' : 'Foods'}</AppText>
      <AppInput
        label={vi ? 'Tên thực phẩm' : 'Food name'}
        value={food.name || ''}
        onChangeText={(name) => setFood((value) => ({ ...value, name }))}
      />
      <SelectionField
        label={vi ? 'Danh mục thực phẩm' : 'Food category'}
        placeholder={vi ? 'Chọn danh mục' : 'Choose category'}
        value={food.categoryId || null}
        options={(categories.data?.data || [])
          .filter((item) => item.type === 'food')
          .map((item) => ({ value: item._id, label: item.name }))}
        onChange={(categoryId) => setFood((value) => ({ ...value, categoryId }))}
      />
      <AppInput
        label={vi ? 'Khẩu phần mặc định (g)' : 'Default serving (g)'}
        value={serving}
        onChangeText={setServing}
        keyboardType="decimal-pad"
      />
      <AppInput
        label="kcal / 100g"
        value={calories}
        onChangeText={setCalories}
        keyboardType="decimal-pad"
      />
      <AppInput
        label={vi ? 'Đạm / 100g' : 'Protein / 100g'}
        value={protein}
        onChangeText={setProtein}
        keyboardType="decimal-pad"
      />
      <AppInput
        label="Carbs / 100g"
        value={carbs}
        onChangeText={setCarbs}
        keyboardType="decimal-pad"
      />
      <AppInput
        label={vi ? 'Béo / 100g' : 'Fat / 100g'}
        value={fat}
        onChangeText={setFat}
        keyboardType="decimal-pad"
      />
      <AppInput
        label={vi ? 'Xơ / 100g' : 'Fiber / 100g'}
        value={fiber}
        onChangeText={setFiber}
        keyboardType="decimal-pad"
      />
      <AppButton
        title={
          food._id
            ? vi
              ? 'Cập nhật thực phẩm'
              : 'Update food'
            : vi
              ? 'Thêm thực phẩm'
              : 'Add food'
        }
        disabled={!food.name?.trim() || !food.categoryId || foodSave.isPending}
        onPress={() =>
          foodSave.mutate({
            ...food,
            name: food.name!.trim(),
            defaultServing: {
              amount: number(serving),
              unit: 'g',
              gramEquivalent: number(serving),
            },
            nutritionPer100g: {
              caloriesKcal: number(calories),
              proteinG: number(protein),
              carbsG: number(carbs),
              fatG: number(fat),
              fiberG: number(fiber),
            },
            isVegan: true,
            isVegetarian: true,
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
    </View>
  );
}
