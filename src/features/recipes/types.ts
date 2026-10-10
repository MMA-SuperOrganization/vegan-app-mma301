export type ContentType = 'recipe' | 'food-item' | 'post' | 'video';
export type SavedTargetType = ContentType;

export interface ContentCardData {
  _id: string;
  slug?: string;
  title?: string;
  name?: string;
  description?: string;
  excerpt?: string;
  coverImageUrl?: string;
  imageUrl?: string;
  type?: ContentType;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  totalMinutes?: number;
  ratingAverage?: number;
  ratingCount?: number;
  allergenIds?: string[];
  nutritionPerServing?: NutritionFacts;
  nutritionPer100g?: NutritionFacts;
}

export interface NutritionFacts {
  caloriesKcal?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
  calciumMg?: number;
  ironMg?: number;
  vitaminB12Mcg?: number;
  vitaminDMcg?: number;
}

export interface FoodItem extends ContentCardData {
  name: string;
  type?: 'food-item';
  aliases?: string[];
  categoryId: string;
  defaultServing?: { amount: number; unit: string; gramEquivalent: number };
  nutritionPer100g?: NutritionFacts;
  isVegan: boolean;
  isVegetarian: boolean;
  containsEggs?: boolean;
  containsDairy?: boolean;
}

export interface FoodQuery {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  excludeAllergenIds?: string[];
  isVegan?: boolean;
  sort?: 'name' | '-name' | 'createdAt' | '-createdAt' | 'calories' | '-calories';
}

export interface RecipeDetail extends ContentCardData {
  summary?: string;
  servings?: number;
  prepMinutes?: number;
  cookMinutes?: number;
  saved?: boolean;
  ingredients?: Array<{
    foodItemId: string;
    foodNameSnapshot: string;
    quantity: number;
    unit: string;
    note?: string;
    allergenIds?: string[];
  }>;
  steps?: Array<{
    order: number;
    instruction: string;
    timerSeconds?: number;
  }>;
  isSaved?: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PageResult<T> {
  data: T[];
  meta?: PaginationMeta;
}

export type RecipeDifficulty = 'easy' | 'medium' | 'hard';
export type RecipeDietType = 'vegan' | 'vegetarian';
export type RecipeSort = 'newest' | 'popular' | 'rating' | 'quickest';

export interface RecipeFilters {
  category?: string;
  difficulty?: RecipeDifficulty;
  maxTotalMinutes?: number;
  dietType?: RecipeDietType;
  sort?: RecipeSort;
  avoidProfileAllergens?: boolean;
}

export interface RecipeQuery extends RecipeFilters {
  page?: number;
  limit?: number;
  q?: string;
  type?: ContentType | 'all';
  excludeAllergenIds?: string[];
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  type: 'food' | 'recipe' | 'post';
}

export interface AllergenSummary {
  _id: string;
  name: string;
  slug: string;
}

export interface RecentSearch {
  _id: string;
  query: string;
  type: ContentType | 'all';
  searchedAt: string;
}

export interface SearchSuggestion {
  id: string;
  type: ContentType;
  text: string;
  slug?: string;
}

export interface SavedItem {
  _id: string;
  targetType: SavedTargetType;
  targetId: string;
  target: ContentCardData | null;
  unavailable?: boolean;
}

export interface HomeFeed {
  featured: {
    recipes: ContentCardData[];
    videos: ContentCardData[];
    posts: ContentCardData[];
  };
  personalized: {
    recipes: ContentCardData[];
  } | null;
}
