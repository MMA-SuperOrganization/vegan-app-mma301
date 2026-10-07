export type ContentType = 'recipe' | 'food-item' | 'post' | 'video';

export interface ContentCardData {
  _id: string;
  slug?: string;
  title?: string;
  name?: string;
  description?: string;
  excerpt?: string;
  type?: ContentType;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  totalMinutes?: number;
  ratingAverage?: number;
  nutritionPerServing?: { caloriesKcal?: number; proteinG?: number };
}

export interface RecipeDetail extends ContentCardData {
  summary?: string;
  servings?: number;
  prepMinutes?: number;
  cookMinutes?: number;
  ingredients?: Array<{
    foodItemId: string;
    foodNameSnapshot: string;
    quantity: number;
    unit: string;
    note?: string;
  }>;
  steps?: Array<{
    order: number;
    instruction: string;
    timerSeconds?: number;
  }>;
  isSaved?: boolean;
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
  targetType: 'recipe' | 'post' | 'video';
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
