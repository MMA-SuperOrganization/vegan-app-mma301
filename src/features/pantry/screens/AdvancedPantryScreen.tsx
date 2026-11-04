import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  AppButton,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
  Toggle,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { IngredientReviewEditor } from '@/features/pantry/components/IngredientReviewEditor';
import type { IngredientReviewValue as RecognizedIngredient } from '../types';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useAdvancedPantry } from '../advancedHooks';
import { parsePantryExpiry } from '../pantryState';

const newKey = () =>
  'pantry-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
export function AdvancedPantryScreen() {
  const vi = useTranslation().locale === 'vi';
  const router = useRouter();
  const [daysText, setDaysText] = useState('7');
  const days =
    /^\d+$/.test(daysText) && Number(daysText) <= 90 ? Number(daysText) : null;
  const actions = useAdvancedPantry(days ?? 7);
  const [rows, setRows] = useState<Array<RecognizedIngredient & { key: string }>>(
    []
  );
  const [requestKey, setRequestKey] = useState(newKey);
  const [saved, setSaved] = useState(false);
  const [thresholdText, setThresholdText] = useState('100');
  useEffect(() => {
    if (actions.automation.data)
      setThresholdText(String(actions.automation.data.restockThresholdGrams));
  }, [actions.automation.data]);
  const busy = actions.bulk.isPending;
  const changeRows = (next: typeof rows) => {
    setRows(next);
    setRequestKey(newKey());
    setSaved(false);
    actions.bulk.reset();
  };
  const valid =
    rows.length > 0 &&
    rows.every(
      (row) =>
        row.foodItemId &&
        row.quantity > 0 &&
        row.quantity <= 1000000 &&
        parsePantryExpiry(row.expiryDate || '') !== undefined
    );
  const save = () => {
    if (!valid || busy) return;
    actions.bulk.mutate(
      {
        key: requestKey,
        items: rows.map((row) => ({
          foodItemId: row.foodItemId!,
          quantity: row.quantity,
          unit: row.unit,
          expiresAt: parsePantryExpiry(row.expiryDate || ''),
        })),
      },
      {
        onSuccess: () => {
          setRows([]);
          setRequestKey(newKey());
          setSaved(true);
        },
      }
    );
  };
  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
      header={
        <CustomHeader
          title={vi ? 'Kho nâng cao' : 'Advanced pantry'}
          showBack
          backFallbackHref="/pantry"
        />
      }
    >
      <AppText variant="heading3">
        {vi ? 'Tự động hóa kho bếp' : 'Kitchen automation'}
      </AppText>
      <FeatureState
        loading={actions.automation.isLoading}
        error={actions.automation.error || actions.saveAutomation.error}
        retry={() => void actions.automation.refetch()}
      />
      {actions.automation.data ? (
        <View style={{ gap: spacing.md }}>
          <Toggle
            label={
              vi
                ? 'Tự trừ nguyên liệu khi hoàn thành bữa ăn'
                : 'Auto-deduct ingredients when a meal is completed'
            }
            value={actions.automation.data.autoDeductOnMealCompletion}
            onValueChange={(autoDeductOnMealCompletion) =>
              actions.saveAutomation.mutate({ autoDeductOnMealCompletion })
            }
          />
          <Toggle
            label={vi ? 'Theo dõi hạn sử dụng' : 'Track expiry dates'}
            value={actions.automation.data.expiryTrackingEnabled}
            onValueChange={(expiryTrackingEnabled) =>
              actions.saveAutomation.mutate({ expiryTrackingEnabled })
            }
          />
          <Toggle
            label={vi ? 'Gợi ý mua bổ sung' : 'Restock suggestions'}
            value={actions.automation.data.restockSuggestionsEnabled}
            onValueChange={(restockSuggestionsEnabled) =>
              actions.saveAutomation.mutate({ restockSuggestionsEnabled })
            }
          />
          <AppInput
            label={vi ? 'Ngưỡng tồn kho (g)' : 'Low-stock threshold (g)'}
            value={thresholdText}
            onChangeText={setThresholdText}
            keyboardType="number-pad"
          />
          <AppButton
            title={vi ? 'Lưu ngưỡng tồn kho' : 'Save stock threshold'}
            variant="outline"
            disabled={
              !/^\d+(?:\.\d+)?$/.test(thresholdText) ||
              Number(thresholdText) > 100000
            }
            loading={actions.saveAutomation.isPending}
            onPress={() =>
              actions.saveAutomation.mutate({
                restockThresholdGrams: Number(thresholdText),
              })
            }
          />
        </View>
      ) : null}
      <AppText variant="heading3">
        {vi ? 'Cần mua bổ sung' : 'Restock suggestions'}
      </AppText>
      <FeatureState
        loading={actions.restock.isLoading}
        error={actions.restock.error}
        retry={() => void actions.restock.refetch()}
      />
      {actions.restock.data?.data.map((item) => (
        <View key={item.foodItemId}>
          <AppText variant="bodyStrong">{item.foodNameSnapshot}</AppText>
          <AppText color={colors.text.secondary}>
            {vi ? 'Còn' : 'Available'} {Math.round(item.availableGrams)} g ·{' '}
            {vi ? 'Gợi ý mua' : 'Suggested'}{' '}
            {Math.round(item.suggestedQuantityGrams)} g
          </AppText>
        </View>
      ))}
      <AppText variant="heading3">
        {vi ? 'Thêm nhiều nguyên liệu' : 'Add multiple ingredients'}
      </AppText>
      {rows.map((row, index) => (
        <View
          key={row.key}
          style={{
            padding: spacing.md,
            borderRadius: radius.lg,
            backgroundColor: colors.background.surface,
          }}
        >
          <IngredientReviewEditor
            ingredient={row}
            disabled={busy}
            onRemove={() => changeRows(rows.filter((_, at) => at !== index))}
            onChange={(next) =>
              changeRows(
                rows.map((previous, at) =>
                  at === index ? { ...next, key: row.key } : previous
                )
              )
            }
          />
        </View>
      ))}
      <AppButton
        title={vi ? 'Thêm dòng nguyên liệu' : 'Add ingredient row'}
        disabled={busy || rows.length >= 100}
        variant="outline"
        onPress={() =>
          changeRows([
            ...rows,
            {
              key: newKey(),
              name: vi ? 'Chọn thực phẩm' : 'Choose food',
              quantity: 1,
              unit: 'g',
            },
          ])
        }
      />
      {rows.length ? (
        <>
          <AppText>
            {vi
              ? 'Chọn thực phẩm, số lượng hợp lệ và hạn dùng YYYY-MM-DD (nếu có) cho từng dòng.'
              : 'Resolve each food, enter a positive quantity and optional YYYY-MM-DD expiry.'}
          </AppText>
          <AppButton
            title={vi ? 'Lưu tất cả vào kho' : 'Save all to pantry'}
            disabled={!valid || busy}
            loading={busy}
            onPress={save}
          />
        </>
      ) : null}
      {saved ? (
        <AppText accessibilityRole="alert">
          {vi ? 'Đã lưu nguyên liệu vào kho.' : 'Ingredients saved to pantry.'}
        </AppText>
      ) : null}
      <FeatureState error={actions.bulk.error} />
      <AppText variant="heading3">{vi ? 'Hạn sử dụng' : 'Expiry dates'}</AppText>
      <AppInput
        label={vi ? 'Trong bao nhiêu ngày (0–90)' : 'Days ahead (0–90)'}
        value={daysText}
        onChangeText={setDaysText}
        keyboardType="number-pad"
        error={
          days === null
            ? vi
              ? 'Nhập số nguyên từ 0 đến 90.'
              : 'Enter a whole number from 0 to 90.'
            : null
        }
      />
      <FeatureState
        loading={actions.expiring.isLoading}
        error={actions.expiring.error}
        retry={() => void actions.expiring.refetch()}
      />
      {days !== null
        ? actions.expiring.data?.data.map((item) => (
            <View key={item.itemId}>
              <AppText>
                {item.foodNameSnapshot} ·{' '}
                {new Date(item.expiresAt!).toLocaleDateString(
                  vi ? 'vi-VN' : 'en-US'
                )}
              </AppText>
              <AppButton
                title={vi ? 'Sửa nguyên liệu' : 'Edit ingredient'}
                variant="ghost"
                onPress={() =>
                  router.push({
                    pathname: '/pantry/item',
                    params: { itemId: item.itemId },
                  })
                }
              />
            </View>
          ))
        : null}
      {actions.expiring.data?.data.length === 0 ? (
        <AppText>
          {vi
            ? 'Không có nguyên liệu sắp hết hạn trong khoảng này.'
            : 'No expiring ingredients in this range.'}
        </AppText>
      ) : null}
      <AppText variant="heading3">
        {vi ? 'Nấu gì từ kho?' : 'Cook from your pantry'}
      </AppText>
      <AppText>
        {vi
          ? 'Tỷ lệ theo nguyên liệu bắt buộc; số lượng đủ được hiển thị riêng. Công thức được lọc theo hồ sơ ăn uống và dị ứng.'
          : 'Matches use required ingredients; sufficient quantities are counted separately. Recipes respect dietary and allergy settings.'}
      </AppText>
      <FeatureState
        loading={actions.suggestions.isLoading}
        error={actions.suggestions.error}
        retry={() => void actions.suggestions.refetch()}
      />
      {actions.suggestions.data?.data.length === 0 ? (
        <AppText>
          {vi ? 'Chưa có công thức phù hợp.' : 'No suitable recipes yet.'}
        </AppText>
      ) : null}
      {actions.suggestions.data?.data.map((suggestion) => (
        <View
          key={suggestion.recipe._id}
          style={{
            padding: spacing.md,
            gap: spacing.sm,
            borderRadius: radius.lg,
            backgroundColor: colors.background.surface,
          }}
        >
          <AppText variant="heading4">{suggestion.recipe.title}</AppText>
          <AppText>
            {vi ? 'Khớp' : 'Matched'} {Math.round(suggestion.matchRatio * 100)}% ·{' '}
            {vi ? 'Đủ lượng' : 'Sufficient'} {suggestion.sufficientCount} ·{' '}
            {vi ? 'Còn thiếu' : 'Missing'} {suggestion.missingIngredients.length}
          </AppText>
          <AppButton
            title={vi ? 'Xem công thức' : 'View recipe'}
            variant="outline"
            onPress={() =>
              router.push({
                pathname: '/(discover)/recipe/[id]',
                params: { id: suggestion.recipe._id },
              })
            }
          />
        </View>
      ))}
    </ScreenWrapper>
  );
}
