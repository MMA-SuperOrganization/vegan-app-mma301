export function roundToOneDecimal(value: number) {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

export function formatNutritionValue(value: number, locale: 'vi' | 'en') {
  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(roundToOneDecimal(value));
}

export function formatIngredientQuantity(
  quantity: number,
  unit: string,
  locale: 'vi' | 'en'
) {
  const value = new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    maximumFractionDigits: 1,
  }).format(quantity);
  return `${value} ${unit}`;
}
