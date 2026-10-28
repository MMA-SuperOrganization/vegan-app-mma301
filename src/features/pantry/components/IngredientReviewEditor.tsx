import { useState } from 'react';
import { View } from 'react-native';
import { AppButton, AppInput, AppText, SearchPickerSheet } from '@/components';
import { usePantryFoodOptions } from '@/features/pantry/hooks';
import { SelectionField } from '@/features/onboarding/components/SelectionField';
import { parseDecimal } from '@/features/tracking/trackingState';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme';
import type { IngredientReviewValue } from '../types';

const units = [
  'g',
  'kg',
  'ml',
  'l',
  'piece',
  'tbsp',
  'tsp',
  'cup',
  'serving',
] as const;
export function IngredientReviewEditor({
  ingredient,
  onChange,
  onRemove,
  disabled,
}: {
  ingredient: IngredientReviewValue;
  onChange: (value: IngredientReviewValue) => void;
  onRemove: () => void;
  disabled: boolean;
}) {
  const { t, locale } = useTranslation();
  const vi = locale === 'vi';
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [quantity, setQuantity] = useState(String(ingredient.quantity));
  const options = usePantryFoodOptions(search, open);
  const foods = options.data?.pages.flatMap((page) => page.data) ?? [];
  return (
    <View style={{ gap: spacing.sm }}>
      <AppText variant="bodyStrong">{ingredient.name}</AppText>
      <AppButton
        title={
          ingredient.foodItemId
            ? vi
              ? 'Đổi thực phẩm'
              : 'Change food'
            : vi
              ? 'Chọn thực phẩm phù hợp'
              : 'Resolve food item'
        }
        variant="outline"
        disabled={disabled}
        onPress={() => setOpen(true)}
      />
      <AppInput
        label={vi ? 'Số lượng' : 'Quantity'}
        value={quantity}
        editable={!disabled}
        keyboardType="decimal-pad"
        onChangeText={(value) => {
          setQuantity(value);
          onChange({ ...ingredient, quantity: parseDecimal(value) ?? 0 });
        }}
      />
      <SelectionField
        label={vi ? 'Đơn vị' : 'Unit'}
        placeholder=""
        value={ingredient.unit}
        options={units.map((value) => ({
          value,
          label: t(`grocery.unit.${value}`),
        }))}
        onChange={(unit) => {
          if (!disabled) onChange({ ...ingredient, unit });
        }}
      />
      <AppInput
        label={
          vi ? 'Hạn dùng (YYYY-MM-DD, tùy chọn)' : 'Expiry (YYYY-MM-DD, optional)'
        }
        value={ingredient.expiryDate || ''}
        editable={!disabled}
        onChangeText={(expiryDate) =>
          onChange({ ...ingredient, expiryDate: expiryDate || undefined })
        }
      />
      <AppButton
        title={vi ? 'Bỏ nguyên liệu' : 'Remove ingredient'}
        variant="ghost"
        disabled={disabled}
        onPress={onRemove}
      />
      <SearchPickerSheet
        visible={open}
        title={vi ? 'Chọn thực phẩm' : 'Choose food'}
        searchPlaceholder={vi ? 'Tìm thực phẩm' : 'Search food'}
        query={search}
        onQueryChange={setSearch}
        items={foods.map((food) => ({
          id: food._id,
          title: food.name,
          imageUrl: food.imageUrl,
        }))}
        isLoading={options.isLoading}
        isError={options.isError}
        onRetry={() => void options.refetch()}
        onClose={() => setOpen(false)}
        onSelect={(foodItemId) => {
          onChange({
            ...ingredient,
            foodItemId,
            name:
              foods.find((food) => food._id === foodItemId)?.name || ingredient.name,
          });
          setOpen(false);
        }}
        hasMore={options.hasNextPage}
        loadingMore={options.isFetchingNextPage}
        onLoadMore={() => void options.fetchNextPage()}
      />
    </View>
  );
}
