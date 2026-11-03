import {
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import type { ApiPage } from '@/services/api';
import { aiApi } from './aiApi';
import { AiFeedbackRating, AiMessageRole } from './aiConstants';
import { appendAiMessages } from './aiMessageCache';
import type { AiMessage } from './types';

interface SendAiMessageVariables {
  content: string;
  mediaId?: string;
  targetConversationId: string;
}

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
  const conversationsKey = [...root, 'conversations'] as const;
  const createMutationKey = [...root, 'create-conversation'] as const;
  const sendMutationKey = [...root, 'send-message'] as const;
  const messagesKey = (targetConversationId: string | undefined) =>
    [...root, 'messages', targetConversationId] as const;
  const conversations = useQuery({
    queryKey: conversationsKey,
    queryFn: aiApi.conversations,
    enabled: Boolean(userId),
  });
  const messages = useQuery({
    queryKey: messagesKey(conversationId),
    queryFn: () => aiApi.messages(conversationId!),
    enabled: Boolean(userId && conversationId),
  });
  const refreshConversations = () =>
    client.invalidateQueries({ queryKey: conversationsKey });
  const pendingConversationCreations = useMutationState({
    filters: {
      mutationKey: createMutationKey,
      status: 'pending',
      exact: true,
    },
  });
  const pendingSendVariables = useMutationState({
    filters: {
      mutationKey: sendMutationKey,
      status: 'pending',
      exact: true,
    },
    select: (mutation) =>
      mutation.state.variables as SendAiMessageVariables | undefined,
  });
  const isSending = Boolean(
    conversationId &&
      pendingSendVariables.some(
        (variables) => variables?.targetConversationId === conversationId
      )
  );
  const isCreating = pendingConversationCreations.length > 0;
  const hasPendingWork = isCreating || pendingSendVariables.length > 0;
  const create = useMutation({
    mutationKey: createMutationKey,
    mutationFn: aiApi.createConversation,
    onSuccess: refreshConversations,
  });
  const send = useMutation({
    mutationKey: sendMutationKey,
    mutationFn: ({
      content,
      mediaId,
      targetConversationId,
    }: SendAiMessageVariables) =>
      aiApi.send(targetConversationId, content, mediaId),
    onMutate: async (variables) => {
      const { targetConversationId } = variables;

      const queryKey = messagesKey(targetConversationId);
      await client.cancelQueries({ queryKey, exact: true });
      const previous = client.getQueryData<ApiPage<AiMessage>>(queryKey);
      const optimisticUserMessage: AiMessage = {
        _id: `optimistic-user-${targetConversationId}-${Date.now()}`,
        role: AiMessageRole.USER,
        content: variables.content,
        createdAt: new Date().toISOString(),
        ...(variables.mediaId ? { mediaId: variables.mediaId } : {}),
      };

      client.setQueryData<ApiPage<AiMessage>>(queryKey, (current) =>
        appendAiMessages(current, [optimisticUserMessage])
      );
      return { previous, queryKey };
    },
    onSuccess: (assistantMessage, _variables, context) => {
      if (!context) return;
      client.setQueryData<ApiPage<AiMessage>>(context.queryKey, (current) =>
        appendAiMessages(current, [assistantMessage])
      );
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      if (context.previous) {
        client.setQueryData(context.queryKey, context.previous);
      } else {
        client.removeQueries({ queryKey: context.queryKey, exact: true });
      }
    },
    onSettled: refreshConversations,
  });
  const feedback = useMutation({
    mutationFn: ({ runId, helpful }: { runId: string; helpful: boolean }) =>
      aiApi.feedback(
        runId,
        helpful ? AiFeedbackRating.HELPFUL : AiFeedbackRating.NOT_HELPFUL
      ),
  });
  return {
    conversations,
    messages,
    create,
    isCreating,
    send,
    isSending,
    hasPendingWork,
    feedback,
  };
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
        signal?: AbortSignal;
      }) =>
        aiApi.proposeMeals(
          input.startDate,
          input.days,
          input.preferences,
          input.useProfile,
          input.signal
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
    recognize: useMutation({
      mutationFn: ({
        mediaId,
        signal,
      }: {
        mediaId: string;
        signal?: AbortSignal;
      }) => aiApi.recognize(mediaId, signal),
    }),
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
