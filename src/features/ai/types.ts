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
export interface VideoSummary {
  summary: string;
  keyPoints: string[];
  chapters?: Array<{ title: string; startSeconds: number; endSeconds: number }>;
  runId: string;
  disclaimer?: string;
}
export interface AiRun {
  _id: string;
  feature: 'chat' | 'meal_plan' | 'ingredient_recognition' | 'video_summary';
  provider?: string;
  model?: string;
  status: 'pending' | 'completed' | 'failed' | 'blocked';
  latencyMs: number;
  errorCode?: string;
  createdAt: string;
}
export interface AiMetrics {
  runs: {
    total: number;
    completed: number;
    failed: number;
    blocked: number;
    pending: number;
  };
  successRate: number | null;
  schemaValidRate: number | null;
  averageLatencyMs: number | null;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCost: number;
  };
  feedback: {
    count: number;
    helpful: number;
    helpfulRate: number | null;
    coverageRate: number | null;
  };
}
