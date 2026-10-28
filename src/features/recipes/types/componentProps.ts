import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import type {
  ContentCardData,
  ContentType,
  RecentSearch,
  SavedItem,
  SearchSuggestion,
} from '../types';

// ==================== SEARCH BAR ====================
export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

// ==================== HOME SECTIONS ====================
export interface FeaturedRecipesSectionProps {
  recipes: ContentCardData[];
  cardWidth: number;
  snapInterval: number;
  onSelectRecipe: (recipe: ContentCardData) => void;
}

export interface UserRecommendationsSectionProps {
  userName: string;
  recipes: ContentCardData[];
  cardWidth: number;
  onSelectRecipe: (recipe: ContentCardData) => void;
  onViewAll: () => void;
  hasRecommendations: boolean;
  isLoading?: boolean;
  isError?: boolean;
  onResetFilter?: () => void;
}

export interface QuickRecipesSectionProps {
  recipes: ContentCardData[];
  cardWidth: number;
  onSelectRecipe: (recipe: ContentCardData) => void;
}

// ==================== RECIPE DETAIL SECTIONS ====================
export interface RecipeHeroSectionProps {
  title?: string;
  coverImageUrl?: string;
  summary?: string;
  description?: string;
  servings?: number;
  prepMinutes?: number;
  cookMinutes?: number;
  difficulty?: string | null;
}

export interface RecipeMacroCardsProps {
  caloriesKcal?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
}

export interface RecipeIngredientItem {
  foodItemId: string;
  foodNameSnapshot: string;
  quantity: number;
  unit: string;
  note?: string;
}

export interface RecipeDetailStepItem {
  order: number;
  instruction: string;
  timerSeconds?: number;
}

export interface RecipeDetailTabsProps {
  servings?: number;
  ingredients?: RecipeIngredientItem[];
  steps?: RecipeDetailStepItem[];
  onOpenIngredient: (foodItemId: string) => void;
}

// ==================== SEARCH & RESULTS ====================
export interface SearchSuggestionsSectionProps {
  suggestions?: SearchSuggestion[];
  isLoading?: boolean;
  isError?: boolean;
  onSelectSuggestion: (text: string) => void;
  onRetry?: () => void;
}

export interface RecentSearchesSectionProps {
  recent?: RecentSearch[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onSelectQuery: (query: string) => void;
  onRetry?: () => void;
}

export interface SearchResultsFilterBarProps {
  selectedType: ContentType | 'all';
  onSelectType: (type: ContentType | 'all') => void;
  hasActiveFilters: boolean;
  onOpenFilters: () => void;
}

// ==================== SAVED ITEMS ====================
export interface SavedItemListProps {
  items: SavedItem[];
  onOpenItem: (item: SavedItem) => void;
  onExplore: () => void;
}
