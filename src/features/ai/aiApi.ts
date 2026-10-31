import { apiClient, unwrapApiPageRequest, unwrapApiRequest } from '@/services/api';
import { collectPages } from '@/services/api/collectPages';
import type { MealPlan } from '@/features/meal-plan/types';
import { AiFeedbackRating } from './aiConstants';
import { mealConfirmationInput } from './proposalState';
import type {
  AiMessage,
  Conversation,
  MealProposal,
  PantryProposal,
  RecognizedIngredient,
  ConfirmedProposal,
  VideoSummary,
  AiRun,
  AiMetrics,
} from './types';

// AI generation can legitimately take longer than the default API timeout.
// Keep this above the backend's maximum provider deadline so the client receives
// the real controlled error instead of abandoning a request that may still persist.
export const AI_GENERATION_TIMEOUT_MS = 130_000;

const aiGenerationRequest = { timeout: AI_GENERATION_TIMEOUT_MS } as const;

export const aiApi = {
  savedMealPlans: () =>
    collectPages((page) =>
      unwrapApiPageRequest<MealPlan>(() =>
        apiClient.get('/meal-plans', { params: { page, limit: 100 } })
      )
    ),
  conversations: () =>
    collectPages((page) =>
      unwrapApiPageRequest<Conversation>(() =>
        apiClient.get('/ai/conversations', { params: { page, limit: 100 } })
      )
    ),
  createConversation: (title: string) =>
    unwrapApiRequest<Conversation>(() =>
      apiClient.post('/ai/conversations', { title })
    ),
  messages: (id: string) =>
    collectPages((page) =>
      unwrapApiPageRequest<AiMessage>(() =>
        apiClient.get(`/ai/conversations/${id}/messages`, {
          params: { page, limit: 100 },
        })
      )
    ),
  send: (id: string, content: string, useProfile: boolean, mediaId?: string) =>
    unwrapApiRequest<AiMessage>(() =>
      apiClient.post(
        `/ai/conversations/${id}/messages`,
        { content, useProfile, ...(mediaId ? { mediaId } : {}) },
        aiGenerationRequest
      )
    ),
  proposeMeals: (
    startDate: string,
    days: number,
    preferences: string,
    useProfile: boolean
  ) =>
    unwrapApiRequest<MealProposal>(() =>
      apiClient.post(
        '/ai/meal-plan-proposals',
        { startDate, days, preferences, useProfile },
        aiGenerationRequest
      )
    ),
  confirmMeals: (proposal: MealProposal) =>
    unwrapApiRequest<ConfirmedProposal>(() =>
      apiClient.post(
        `/ai/meal-plan-proposals/${proposal.proposalId}/confirm`,
        mealConfirmationInput(proposal)
      )
    ),
  recognize: (mediaId: string) =>
    unwrapApiRequest<PantryProposal>(() =>
      apiClient.post('/ai/ingredient-recognition', { mediaId }, aiGenerationRequest)
    ),
  confirmPantry: (proposalId: string, items: RecognizedIngredient[]) =>
    unwrapApiRequest<ConfirmedProposal>(() =>
      apiClient.post(`/ai/pantry-proposals/${proposalId}/confirm`, {
        items: items.map(({ foodItemId, quantity, unit, expiryDate }) => ({
          foodItemId,
          quantity,
          unit,
          ...(expiryDate ? { expiryDate } : {}),
        })),
      })
    ),
  feedback: (runId: string, rating: `${AiFeedbackRating}`) =>
    unwrapApiRequest(() => apiClient.put(`/ai/runs/${runId}/feedback`, { rating })),
  summarizeVideo: (mediaId: string, transcript: string) =>
    unwrapApiRequest<VideoSummary>(() =>
      apiClient.post(
        '/ai/video-summaries',
        { mediaId, transcript },
        aiGenerationRequest
      )
    ),
  adminRuns: () =>
    collectPages((page) =>
      unwrapApiPageRequest<AiRun>(() =>
        apiClient.get('/admin/ai/runs', { params: { page, limit: 100 } })
      )
    ),
  adminMetrics: () =>
    unwrapApiRequest<AiMetrics>(() => apiClient.get('/admin/ai/metrics')),
};
