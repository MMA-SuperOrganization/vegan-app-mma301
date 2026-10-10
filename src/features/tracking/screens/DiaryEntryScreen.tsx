import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  AppButton,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
} from '@/components';
import { SelectionField } from '@/features/onboarding/components/SelectionField';
import { useSafeBack } from '@/hooks';
import { useTranslation, type TranslationKey } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { SearchPickerSheet, type PickerItem } from '../components/SearchPickerSheet';
import { TrackingSheet } from '../components/TrackingSheet';
import { TrackingQueryState } from '../components/TrackingQueryState';
import { useFoodOptions, useRecipeOptions } from '../hooks/usePickerOptions';
import { useDiary, useDiaryMutations } from '../hooks/useTrackingApi';
import { useTrackingFormat } from '../hooks/useTrackingFormat';
import type { CreateDiaryInput } from '../services/trackingApi';
import {
  MEAL_TYPES,
  combineDateAndTime,
  defaultMealTypeFor,
  formatTimeOfDay,
  parseDecimal,
  parseTimeOfDay,
  quantityToGrams,
  scaleNutrition,
  toLocalIsoDate,
  toNutritionValues,
  unitsForFood,
} from '../trackingState';
import type {
  DiaryEntry,
  DiarySourceType,
  FoodItemOption,
  FoodUnit,
  MealType,
  NutritionValues,
} from '../types';

const MAX_SERVINGS = 100;

const TITLE_KEYS: Record<DiarySourceType, TranslationKey> = {
  recipe: 'tracking.entry.titleRecipe',
  food: 'tracking.entry.titleFood',
  custom: 'tracking.entry.titleCustom',
};

const SOURCE_LABEL_KEYS: Record<DiarySourceType, TranslationKey> = {
  recipe: 'tracking.entry.sourceRecipe',
  food: 'tracking.entry.sourceFood',
  custom: 'tracking.entry.sourceCustom',
};

const CUSTOM_FIELDS: Array<{ key: keyof NutritionValues; label: TranslationKey }> = [
  { key: 'caloriesKcal', label: 'tracking.entry.customKcal' },
  { key: 'proteinG', label: 'tracking.entry.customProtein' },
  { key: 'carbsG', label: 'tracking.entry.customCarbs' },
  { key: 'fatG', label: 'tracking.entry.customFat' },
  { key: 'fiberG', label: 'tracking.entry.customFiber' },
];

type CustomNutritionText = Record<keyof NutritionValues, string>;
type FieldErrors = Partial<
  Record<'source' | 'name' | 'amount' | 'time' | keyof NutritionValues, string>
>;

interface SelectedRecipe {
  id: string;
  name: string;
  perServing: NutritionValues;
}

/**
 * Unrounded nutrition per serving (recipe/custom) or per logged quantity unit
 * (food), so re-scaling an unchanged amount gives back the stored snapshot.
 */
function basisFromEntry(entry: DiaryEntry) {
  const amount =
    entry.sourceType === 'food' ? (entry.quantity ?? 1) : (entry.servings ?? 1);
  return scaleNutrition(entry.nutritionSnapshot, 1 / amount, false);
}

function textFromNumber(value: number | undefined) {
  return value == null ? '' : String(Math.round(value * 10) / 10);
}

export function DiaryEntryScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { t } = useTranslation();
  const { formatNumber, formatShortDate, mealLabel, unitLabel, nutritionLine } =
    useTrackingFormat();
  const goBack = useSafeBack('/(tracking)/food-diary');
  const date = toLocalIsoDate(new Date());
  const diary = useDiary(date);
  const entry = id ? diary.data?.data.find((item) => item._id === id) : undefined;
  const { createDiary, updateDiary, removeDiary } = useDiaryMutations();
  const isEditing = Boolean(entry);

  const [now] = useState(() => new Date());
  const entryDate = entry?.date ?? toLocalIsoDate(now);
  const [sourceType, setSourceType] = useState<DiarySourceType>(
    entry?.sourceType ?? 'recipe'
  );
  const [mealType, setMealType] = useState<MealType>(
    entry?.mealType ?? defaultMealTypeFor(now)
  );
  const [timeText, setTimeText] = useState(
    formatTimeOfDay(entry?.consumedAt ?? now)
  );
  const [servingsText, setServingsText] = useState(
    textFromNumber(entry?.servings ?? 1)
  );
  const [quantityText, setQuantityText] = useState(textFromNumber(entry?.quantity));
  const [unit, setUnit] = useState<FoodUnit>(entry?.unit ?? 'g');
  const [recipe, setRecipe] = useState<SelectedRecipe | null>(
    entry?.sourceType === 'recipe'
      ? {
          id: entry.recipeId ?? entry._id,
          name: entry.nameSnapshot,
          perServing: basisFromEntry(entry),
        }
      : null
  );
  const [food, setFood] = useState<FoodItemOption | null>(null);
  const [customName, setCustomName] = useState(
    entry?.sourceType === 'custom' ? entry.nameSnapshot : ''
  );
  const [customText, setCustomText] = useState<CustomNutritionText>(() => {
    const basis = entry?.sourceType === 'custom' ? basisFromEntry(entry) : null;
    return {
      caloriesKcal: textFromNumber(basis?.caloriesKcal),
      proteinG: textFromNumber(basis?.proteinG),
      carbsG: textFromNumber(basis?.carbsG),
      fatG: textFromNumber(basis?.fatG),
      fiberG: textFromNumber(basis?.fiberG),
    };
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [sourceSheetOpen, setSourceSheetOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (!entry) return;
    const basis = basisFromEntry(entry);
    setSourceType(entry.sourceType);
    setMealType(entry.mealType);
    setTimeText(formatTimeOfDay(entry.consumedAt));
    setServingsText(textFromNumber(entry.servings ?? 1));
    setQuantityText(textFromNumber(entry.quantity));
    setUnit(entry.unit ?? 'g');
    setRecipe(
      entry.sourceType === 'recipe'
        ? {
            id: entry.recipeId ?? entry._id,
            name: entry.nameSnapshot,
            perServing: basis,
          }
        : null
    );
    setCustomName(entry.sourceType === 'custom' ? entry.nameSnapshot : '');
    setCustomText({
      caloriesKcal: textFromNumber(basis.caloriesKcal),
      proteinG: textFromNumber(basis.proteinG),
      carbsG: textFromNumber(basis.carbsG),
      fatG: textFromNumber(basis.fatG),
      fiberG: textFromNumber(basis.fiberG),
    });
  }, [entry]);

  const recipeOptions = useRecipeOptions(
    pickerQuery,
    pickerOpen && sourceType === 'recipe'
  );
  const foodOptions = useFoodOptions(
    pickerQuery,
    pickerOpen && sourceType === 'food'
  );

  if (id && (diary.isLoading || diary.isError)) {
    return (
      <ScreenWrapper
        edges={['top', 'left', 'right', 'bottom']}
        keyboardAvoiding={false}
      >
        <CustomHeader title={t('tracking.entry.titleRecipe')} showBack />
        <TrackingQueryState
          loading={diary.isLoading}
          error={diary.isError}
          onRetry={() => void diary.refetch()}
        />
      </ScreenWrapper>
    );
  }

  if (id && !entry) {
    return (
      <ScreenWrapper
        edges={['top', 'left', 'right', 'bottom']}
        keyboardAvoiding={false}
      >
        <CustomHeader title={t('tracking.entry.titleRecipe')} showBack />
        <View style={styles.missing}>
          <AppText color={colors.text.secondary}>
            {t('tracking.entry.notFound')}
          </AppText>
          <AppButton title={t('common.back')} variant="outline" onPress={goBack} />
        </View>
      </ScreenWrapper>
    );
  }

  const servings = parseDecimal(servingsText);
  const quantity = parseDecimal(quantityText);
  const editingFood = isEditing && entry?.sourceType === 'food';

  const customBasis = (): NutritionValues | null => {
    const values = CUSTOM_FIELDS.map(({ key }) =>
      key === 'caloriesKcal' || customText[key].trim()
        ? parseDecimal(customText[key])
        : 0
    );
    if (values.some((value) => value === null)) return null;
    const [caloriesKcal, proteinG, carbsG, fatG, fiberG] = values as number[];
    return { caloriesKcal, proteinG, carbsG, fatG, fiberG };
  };

  const previewNutrition = (): NutritionValues | null => {
    if (entry) {
      // Editing only changes the amount; rescale the stored snapshot.
      const amount = entry.sourceType === 'food' ? quantity : servings;
      return amount ? scaleNutrition(basisFromEntry(entry), amount) : null;
    }
    if (sourceType === 'recipe') {
      return recipe && servings ? scaleNutrition(recipe.perServing, servings) : null;
    }
    if (sourceType === 'food') {
      if (!quantity || !food) return null;
      const grams = quantityToGrams(quantity, unit, food.defaultServing);
      return grams === null
        ? null
        : scaleNutrition(toNutritionValues(food.nutritionPer100g), grams / 100);
    }
    const basis = customBasis();
    return basis && servings ? scaleNutrition(basis, servings) : null;
  };
  const nutrition = previewNutrition();

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (sourceType === 'recipe' && !recipe)
      next.source = t('tracking.entry.errorRecipe');
    if (sourceType === 'food' && !food && !editingFood) {
      next.source = t('tracking.entry.errorFood');
    }
    if (sourceType === 'custom') {
      if (!customName.trim()) next.name = t('tracking.entry.errorName');
      CUSTOM_FIELDS.forEach(({ key }) => {
        const text = customText[key];
        if ((key === 'caloriesKcal' || text.trim()) && parseDecimal(text) === null) {
          next[key] = t('tracking.entry.errorNumber');
        }
      });
    }
    if (sourceType === 'food') {
      if (!quantity || quantity <= 0)
        next.amount = t('tracking.entry.errorQuantity');
      else if (!nutrition) next.amount = t('tracking.entry.errorUnit');
    } else if (!servings || servings <= 0 || servings > MAX_SERVINGS) {
      next.amount = t('tracking.entry.errorServings', { max: MAX_SERVINGS });
    }
    if (!parseTimeOfDay(timeText)) next.time = t('tracking.entry.errorTime');
    return next;
  };

  const save = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    const time = parseTimeOfDay(timeText);
    if (Object.keys(nextErrors).length > 0 || !nutrition || !time) return;
    const consumedAt = combineDateAndTime(entryDate, time);

    try {
      if (entry) {
        await updateDiary.mutateAsync({
          id: entry._id,
          input: {
            ...(entry.sourceType === 'food'
              ? { quantity: quantity ?? undefined }
              : { servings: servings ?? undefined }),
            consumedAt,
          },
        });
      } else {
        const base = {
          date: entryDate,
          mealType,
          consumedAt,
        };
        let created: CreateDiaryInput;
        if (sourceType === 'recipe' && recipe) {
          created = {
            ...base,
            sourceType,
            recipeId: recipe.id,
            servings: servings ?? 1,
          };
        } else if (sourceType === 'food' && food) {
          created = {
            ...base,
            sourceType,
            foodItemId: food._id,
            quantity: quantity ?? 0,
            unit,
          };
        } else {
          created = {
            ...base,
            sourceType: 'custom',
            nameSnapshot: customName.trim(),
            servings: servings ?? 1,
            nutritionSnapshot: nutrition,
          };
        }
        await createDiary.mutateAsync(created);
      }
      goBack();
    } catch {
      // React Query exposes the request error below the form.
    }
  };

  const confirmDelete = async () => {
    if (!entry) return;
    try {
      await removeDiary.mutateAsync(entry._id);
      setConfirmDeleteOpen(false);
      goBack();
    } catch {
      // Keep the confirmation open so the user can retry.
    }
  };

  const chooseSource = (next: DiarySourceType) => {
    setSourceType(next);
    setErrors({});
    setSourceSheetOpen(false);
  };

  const openPicker = () => {
    setPickerQuery('');
    setPickerOpen(true);
  };

  const recipeItems: PickerItem[] = (recipeOptions.data?.data ?? []).map((item) => ({
    id: item._id,
    title: item.title ?? item.name ?? '',
    subtitle:
      item.nutritionPerServing?.caloriesKcal != null
        ? t('tracking.entry.kcalPerServing', {
            kcal: formatNumber(item.nutritionPerServing.caloriesKcal),
          })
        : undefined,
    imageUrl: item.coverImageUrl ?? item.imageUrl,
  }));
  const foodItems: PickerItem[] = (foodOptions.data?.data ?? []).map((item) => ({
    id: item._id,
    title: item.name,
    subtitle: t('tracking.entry.kcalPer100g', {
      kcal: formatNumber(item.nutritionPer100g.caloriesKcal ?? 0),
    }),
    imageUrl: item.imageUrl,
  }));
  const activeOptions = sourceType === 'recipe' ? recipeOptions : foodOptions;

  const selectPickerItem = (itemId: string) => {
    if (sourceType === 'recipe') {
      const picked = recipeOptions.data?.data.find((item) => item._id === itemId);
      if (picked) {
        setRecipe({
          id: picked._id,
          name: picked.title ?? picked.name ?? '',
          perServing: toNutritionValues(picked.nutritionPerServing),
        });
      }
    } else {
      const picked = foodOptions.data?.data.find((item) => item._id === itemId);
      if (picked) {
        setFood(picked);
        setUnit(picked.defaultServing?.unit ?? 'g');
        setQuantityText(textFromNumber(picked.defaultServing?.amount ?? 100));
      }
    }
    setErrors((current) => ({ ...current, source: undefined }));
    setPickerOpen(false);
  };

  const selectedName =
    sourceType === 'recipe'
      ? (recipe?.name ?? '')
      : editingFood
        ? (entry?.nameSnapshot ?? '')
        : (food?.name ?? '');
  const unitOptions = (food ? unitsForFood(food) : [unit]).map((value) => ({
    value,
    label: unitLabel(value),
  }));

  return (
    <ScreenWrapper
      scrollable
      edges={['top', 'left', 'right', 'bottom']}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.screen}
    >
      <CustomHeader
        title={t(TITLE_KEYS[sourceType])}
        showBack
        backFallbackHref="/(tracking)/food-diary"
      />
      <View style={styles.content}>
        <AppText variant="bodySmall" color={colors.text.secondary}>
          {t('tracking.entry.snapshotHint')}
        </AppText>

        {sourceType === 'custom' ? (
          <AppInput
            label={t('tracking.entry.customName')}
            value={customName}
            onChangeText={setCustomName}
            placeholder={t('tracking.entry.customNamePlaceholder')}
            error={errors.name}
            disabled={isEditing}
            autoCapitalize="sentences"
          />
        ) : (
          <AppInput
            type="select"
            label={
              sourceType === 'recipe'
                ? t('tracking.entry.recipeLabel')
                : t('tracking.entry.foodLabel')
            }
            value={selectedName}
            placeholder={
              sourceType === 'recipe'
                ? t('tracking.entry.recipePlaceholder')
                : t('tracking.entry.foodPlaceholder')
            }
            onChangeText={() => undefined}
            onSelect={isEditing ? undefined : openPicker}
            disabled={isEditing}
            error={errors.source}
          />
        )}

        {sourceType === 'food' ? (
          <View style={styles.row}>
            <View style={styles.flex}>
              <AppInput
                label={t('tracking.entry.quantityLabel')}
                value={quantityText}
                onChangeText={setQuantityText}
                keyboardType="decimal-pad"
                error={errors.amount}
              />
            </View>
            <View style={styles.flex}>
              {editingFood || !food ? (
                <AppInput
                  label={t('tracking.entry.unitLabel')}
                  value={unitLabel(unit)}
                  onChangeText={() => undefined}
                  disabled
                />
              ) : (
                <SelectionField
                  label={t('tracking.entry.unitLabel')}
                  placeholder={t('tracking.entry.unitLabel')}
                  value={unit}
                  options={unitOptions}
                  onChange={setUnit}
                />
              )}
            </View>
          </View>
        ) : (
          <AppInput
            label={t('tracking.entry.servingsLabel')}
            value={servingsText}
            onChangeText={setServingsText}
            keyboardType="decimal-pad"
            error={errors.amount}
          />
        )}

        {sourceType === 'custom'
          ? CUSTOM_FIELDS.map(({ key, label }) => (
              <AppInput
                key={key}
                label={t(label)}
                value={customText[key]}
                onChangeText={(value) =>
                  setCustomText((current) => ({ ...current, [key]: value }))
                }
                keyboardType="decimal-pad"
                error={errors[key]}
                disabled={isEditing}
              />
            ))
          : null}

        {isEditing ? (
          <AppInput
            label={t('tracking.entry.mealLabel')}
            value={mealLabel(mealType)}
            onChangeText={() => undefined}
            disabled
          />
        ) : (
          <SelectionField
            label={t('tracking.entry.mealLabel')}
            placeholder={t('tracking.entry.mealLabel')}
            value={mealType}
            options={MEAL_TYPES.map((value) => ({ value, label: mealLabel(value) }))}
            onChange={setMealType}
          />
        )}

        <AppInput
          label={t('tracking.entry.timeLabel', { date: formatShortDate(entryDate) })}
          value={timeText}
          onChangeText={setTimeText}
          placeholder="12:00"
          keyboardType="numbers-and-punctuation"
          error={errors.time}
        />

        <View style={styles.nutritionCard}>
          <AppText variant="heading4">{t('tracking.entry.nutritionTitle')}</AppText>
          <AppText variant="bodySmall" color={colors.text.secondary}>
            {nutrition
              ? nutritionLine(nutrition)
              : t('tracking.entry.nutritionEmpty')}
          </AppText>
        </View>

        {isEditing ? (
          <AppText variant="bodySmall" color={colors.text.secondary}>
            {t('tracking.entry.editLimits')}
          </AppText>
        ) : (
          <AppButton
            title={t('tracking.entry.switchSource')}
            variant="outline"
            onPress={() => setSourceSheetOpen(true)}
          />
        )}

        {createDiary.error || updateDiary.error || removeDiary.error ? (
          <AppText color={colors.status.danger}>
            {t('tracking.data.saveError')}
          </AppText>
        ) : null}
        <AppButton
          title={t('tracking.entry.save')}
          onPress={() => void save()}
          loading={createDiary.isPending || updateDiary.isPending}
        />
        {isEditing ? (
          <AppButton
            title={t('tracking.entry.delete')}
            variant="danger"
            onPress={() => setConfirmDeleteOpen(true)}
          />
        ) : null}
      </View>

      <SearchPickerSheet
        visible={pickerOpen}
        title={
          sourceType === 'recipe'
            ? t('tracking.entry.recipeLabel')
            : t('tracking.entry.foodLabel')
        }
        searchPlaceholder={
          sourceType === 'recipe'
            ? t('tracking.picker.searchRecipe')
            : t('tracking.picker.searchFood')
        }
        query={pickerQuery}
        onQueryChange={setPickerQuery}
        items={sourceType === 'recipe' ? recipeItems : foodItems}
        isLoading={activeOptions.isLoading}
        isError={activeOptions.isError}
        onRetry={() => void activeOptions.refetch()}
        onSelect={selectPickerItem}
        onClose={() => setPickerOpen(false)}
      />

      <TrackingSheet
        visible={sourceSheetOpen}
        title={t('tracking.entry.switchSource')}
        onClose={() => setSourceSheetOpen(false)}
      >
        <View style={styles.options}>
          {(Object.keys(SOURCE_LABEL_KEYS) as DiarySourceType[]).map((value) => (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityLabel={t(SOURCE_LABEL_KEYS[value])}
              accessibilityState={{ checked: value === sourceType }}
              onPress={() => chooseSource(value)}
              style={[styles.option, value === sourceType && styles.optionSelected]}
            >
              <AppText variant={value === sourceType ? 'bodyStrong' : 'bodyDefault'}>
                {t(SOURCE_LABEL_KEYS[value])}
              </AppText>
            </Pressable>
          ))}
        </View>
      </TrackingSheet>

      <TrackingSheet
        visible={confirmDeleteOpen}
        title={t('tracking.entry.deleteConfirmTitle')}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <AppText color={colors.text.secondary}>
          {t('tracking.entry.deleteConfirmBody', {
            name: entry?.nameSnapshot ?? '',
          })}
        </AppText>
        <AppButton
          title={t('tracking.entry.delete')}
          variant="danger"
          loading={removeDiary.isPending}
          onPress={() => void confirmDelete()}
        />
      </TrackingSheet>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: spacing['4xl'] },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
  nutritionCard: {
    backgroundColor: colors.background.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  options: { gap: spacing.sm },
  option: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
  },
  optionSelected: { backgroundColor: colors.background.selected },
});
