import type { Category } from './types';

const vietnameseCategories: Record<string, string> = {
  breakfast: 'Bữa sáng',
  lunch: 'Bữa trưa',
  dinner: 'Bữa tối',
  snack: 'Bữa phụ',
  dessert: 'Tráng miệng',
};

const vietnameseTags: Record<string, string> = {
  'gluten-free': 'Không gluten',
  'dairy-free': 'Không sữa',
  quick: 'Nấu nhanh',
  condiment: 'Gia vị & sốt',
  fermented: 'Lên men',
  japanese: 'Nhật Bản',
  mexican: 'Mexico',
  french: 'Pháp',
  lebanese: 'Lebanon',
  levantine: 'Levant',
  rice: 'Món cơm',
  bread: 'Bánh mì',
};

const titleCase = (value: string) =>
  value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const categoryFilterLabel = (category: Category, locale: 'vi' | 'en') =>
  locale === 'vi'
    ? (vietnameseCategories[category.slug] ?? category.name)
    : category.name;

export const recipeTagLabel = (tag: string, locale: 'vi' | 'en') =>
  locale === 'vi' ? (vietnameseTags[tag] ?? titleCase(tag)) : titleCase(tag);
