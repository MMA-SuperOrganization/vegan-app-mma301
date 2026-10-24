import { apiClient, unwrapApiPageRequest, unwrapApiRequest } from '@/services/api';
import { collectPages } from '@/services/api/collectPages';
import type { MealPlan } from '@/features/meal-plan/types';
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
  send: (id: string, content: string, useProfile: boolean) =>
    unwrapApiRequest<AiMessage>(() =>
      apiClient.post(`/ai/conversations/${id}/messages`, { content, useProfile })
    ),
  proposeMeals: (
    startDate: string,
    days: number,
    preferences: string,
    useProfile: boolean
  ) =>
    unwrapApiRequest<MealProposal>(() =>
      apiClient.post('/ai/meal-plan-proposals', {
        startDate,
        days,
        preferences,
        useProfile,
      })
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
      apiClient.post('/ai/ingredient-recognition', { mediaId })
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
  feedback: (runId: string, rating: 'helpful' | 'not_helpful') =>
    unwrapApiRequest(() => apiClient.put(`/ai/runs/${runId}/feedback`, { rating })),
  summarizeVideo: (mediaId: string, transcript: string) =>
    unwrapApiRequest<VideoSummary>(() =>
      apiClient.post('/ai/video-summaries', { mediaId, transcript })
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
