import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import { aiApi } from './aiApi';
export function useSavedMealPlans() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: ['account', userId, 'meal-plans', 'all'],
    queryFn: aiApi.savedMealPlans,
    enabled: Boolean(userId),
  });
}

export function useAiChat(conversationId?: string) {
  const userId = useAuthStore((state) => state.user?.id);
  const client = useQueryClient();
  const root = ['account', userId, 'ai'] as const;
  const conversations = useQuery({
    queryKey: [...root, 'conversations'],
    queryFn: aiApi.conversations,
    enabled: Boolean(userId),
  });
  const messages = useQuery({
    queryKey: [...root, 'messages', conversationId],
    queryFn: () => aiApi.messages(conversationId!),
    enabled: Boolean(userId && conversationId),
  });
  const refresh = () => client.invalidateQueries({ queryKey: root });
  const create = useMutation({
    mutationFn: aiApi.createConversation,
    onSuccess: refresh,
  });
  const send = useMutation({
    mutationFn: ({
      content,
      useProfile,
      mediaId,
      targetConversationId,
    }: {
      content: string;
      useProfile: boolean;
      mediaId?: string;
      targetConversationId?: string;
    }) =>
      aiApi.send(
        targetConversationId ?? conversationId!,
        content,
        useProfile,
        mediaId
      ),
    onSettled: refresh,
  });
  const feedback = useMutation({
    mutationFn: ({ runId, helpful }: { runId: string; helpful: boolean }) =>
      aiApi.feedback(runId, helpful ? 'helpful' : 'not_helpful'),
  });
  return { conversations, messages, create, send, feedback };
}

export function useMealProposal() {
  const userId = useAuthStore((state) => state.user?.id);
  const client = useQueryClient();
  return {
    generate: useMutation({
      mutationFn: (input: {
        startDate: string;
        days: number;
        preferences: string;
        useProfile: boolean;
      }) =>
        aiApi.proposeMeals(
          input.startDate,
          input.days,
          input.preferences,
          input.useProfile
        ),
    }),
    confirm: useMutation({
      mutationFn: aiApi.confirmMeals,
      onSuccess: () =>
        client.invalidateQueries({ queryKey: ['account', userId, 'meal-plans'] }),
    }),
  };
}

export function useIngredientRecognition() {
  const userId = useAuthStore((state) => state.user?.id);
  const client = useQueryClient();
  return {
    recognize: useMutation({ mutationFn: aiApi.recognize }),
    confirm: useMutation({
      mutationFn: ({
        proposalId,
        items,
      }: {
        proposalId: string;
        items: Parameters<typeof aiApi.confirmPantry>[1];
      }) => aiApi.confirmPantry(proposalId, items),
      onSuccess: () =>
        client.invalidateQueries({ queryKey: ['account', userId, 'pantry'] }),
    }),
  };
}

export function useVideoSummary() {
  return useMutation({
    mutationFn: ({ mediaId, transcript }: { mediaId: string; transcript: string }) =>
      aiApi.summarizeVideo(mediaId, transcript),
  });
}

export function useAiMonitoring() {
  const userId = useAuthStore((state) => state.user?.id);
  return {
    runs: useQuery({
      queryKey: ['account', userId, 'admin', 'ai-runs'],
      queryFn: aiApi.adminRuns,
      enabled: Boolean(userId),
    }),
    metrics: useQuery({
      queryKey: ['account', userId, 'admin', 'ai-metrics'],
      queryFn: aiApi.adminMetrics,
      enabled: Boolean(userId),
    }),
  };
}
