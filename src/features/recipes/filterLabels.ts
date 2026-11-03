import type { Category } from './types';

const vietnameseCategories: Record<string, string> = {
  breakfast: 'Bữa sáng',
  lunch: 'Bữa trưa',
  dinner: 'Bữa tối',
  snack: 'Bữa phụ',
  dessert: 'Tráng miệng',
  vegetables: 'Rau củ',
  fruits: 'Trái cây',
  grains: 'Ngũ cốc',
  legumes: 'Các loại đậu',
  'nuts-seeds': 'Các loại hạt',
  nutrition: 'Dinh dưỡng',
  lifestyle: 'Lối sống',
};

const vietnameseAllergens: Record<string, string> = {
  peanuts: 'Đậu phộng',
  sesame: 'Mè (vừng)',
  soy: 'Đậu nành',
  'tree-nuts': 'Các loại hạt cây',
  wheat: 'Lúa mì',
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
  beverage: 'Đồ uống',
  umami: 'Vị umami',
  chili: 'Ớt',
  eggplant: 'Cà tím',
  fried: 'Món chiên',
  italian: 'Ý',
  'middle-eastern': 'Trung Đông',
  sourdough: 'Bánh mì men tự nhiên',
  'street-food': 'Món đường phố',
  summer: 'Món mùa hè',
  vegetable: 'Rau củ',
  chickpea: 'Đậu gà',
  dashi: 'Nước dùng dashi',
  flatbread: 'Bánh mì dẹt',
  garlic: 'Tỏi',
  indonesian: 'Indonesia',
  lentils: 'Đậu lăng',
  mezze: 'Món khai vị mezze',
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

/** Slug-like key for catalog names that arrive without a slug, e.g. "Nuts & Seeds". */
export const catalogSlug = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/\s*&\s*/g, '-')
    .replace(/\s+/g, '-');

/** Category label when only the English name is known (grocery groups, etc.). */
export const categoryNameLabel = (name: string, locale: 'vi' | 'en') =>
  locale === 'vi' ? (vietnameseCategories[catalogSlug(name)] ?? name) : name;

/** Allergen names come from the catalog in English; show Vietnamese when known. */
export const allergenLabel = (name: string, locale: 'vi' | 'en') =>
  locale === 'vi' ? (vietnameseAllergens[catalogSlug(name)] ?? name) : name;
