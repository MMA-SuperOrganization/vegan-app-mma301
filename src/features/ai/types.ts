import type { MealType } from '@/features/tracking/types';
export interface Conversation {
  _id: string;
  title: string;
}
export interface AiMessage {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
  runId?: string;
  aiRunId?: string;
  disclaimer?: string;
}
export interface ProposalMeal {
  slot: MealType;
  recipeId: string;
  servings: number;
  reviewKey?: string;
}
export interface MealProposal {
  proposalId: string;
  title: string;
  days: Array<{ date: string; meals: ProposalMeal[] }>;
  expiresAt: string;
  disclaimer?: string;
}
export type RecognizedIngredient =
  import('@/features/pantry/types').IngredientReviewValue;
export interface PantryProposal {
  proposalId: string;
  items: RecognizedIngredient[];
  expiresAt: string;
  disclaimer?: string;
}
export interface ConfirmedProposal {
  status: 'confirmed';
  resource: { _id: string };
}
