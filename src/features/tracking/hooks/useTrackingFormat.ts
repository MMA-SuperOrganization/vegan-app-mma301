import { useMemo } from 'react';
import { useTranslation, type Locale, type TranslationKey } from '@/i18n';
import type { FoodUnit, MealType, NutritionValues } from '../types';

const LOCALE_TAGS: Record<Locale, string> = { vi: 'vi-VN', en: 'en-US' };

const MEAL_LABEL_KEYS: Record<MealType, TranslationKey> = {
  breakfast: 'tracking.meal.breakfast',
  lunch: 'tracking.meal.lunch',
  dinner: 'tracking.meal.dinner',
  snack: 'tracking.meal.snack',
};

const UNIT_LABEL_KEYS: Partial<Record<FoodUnit, TranslationKey>> = {
  piece: 'tracking.unit.piece',
  tbsp: 'tracking.unit.tbsp',
  tsp: 'tracking.unit.tsp',
  cup: 'tracking.unit.cup',
  serving: 'tracking.unit.serving',
};

/** Locale-aware number, date and nutrition formatting for tracking screens. */
export function useTrackingFormat() {
  const { t, locale } = useTranslation();
  return useMemo(() => {
    const localeTag = LOCALE_TAGS[locale];
    const formatNumber = (
      value: number,
      maxFractionDigits = 0,
      minFractionDigits = 0
    ) =>
      new Intl.NumberFormat(localeTag, {
        minimumFractionDigits: minFractionDigits,
        maximumFractionDigits: maxFractionDigits,
      }).format(value);
    const formatLongDate = (isoDate: string) =>
      new Intl.DateTimeFormat(localeTag, {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(`${isoDate}T00:00:00`));
    const formatShortDate = (isoDate: string) =>
      new Intl.DateTimeFormat(localeTag, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(`${isoDate}T00:00:00`));
    const relativeDay = (days: number) => {
      if (days <= 0) return t('tracking.day.today');
      if (days === 1) return t('tracking.day.yesterday');
      return t('tracking.day.daysAgo', { count: days });
    };
    const mealLabel = (mealType: MealType) => t(MEAL_LABEL_KEYS[mealType]);
    const unitLabel = (unit: FoodUnit) => {
      const key = UNIT_LABEL_KEYS[unit];
      return key ? t(key) : unit;
    };
    const nutritionLine = (values: NutritionValues) =>
      t('tracking.nutrition.line', {
        kcal: formatNumber(values.caloriesKcal),
        protein: formatNumber(values.proteinG, 1),
        carbs: formatNumber(values.carbsG, 1),
        fat: formatNumber(values.fatG, 1),
        fiber: formatNumber(values.fiberG, 1),
      });
    return {
      formatNumber,
      formatLongDate,
      formatShortDate,
      relativeDay,
      mealLabel,
      unitLabel,
      nutritionLine,
    };
  }, [locale, t]);
}
