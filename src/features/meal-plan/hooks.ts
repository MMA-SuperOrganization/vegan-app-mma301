import { useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import { mealPlanApi } from './mealPlanApi';
import {
  addPlannedMeal,
  removePlannedMeal,
  selectEditablePlan,
  updatePlannedMeal,
} from './mealPlanState';
import type { AddMealInput, MealPlan, PlannedMeal, UpdateMealInput } from './types';

const mealPlanKeys = {
  root: (userId?: string) => ['account', userId, 'meal-plans'] as const,
  week: (userId: string | undefined, weekStartDate: string) =>
    [...mealPlanKeys.root(userId), 'week', weekStartDate] as const,
};

export function useMealPlan(weekStartDate: string, planId?: string) {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: [...mealPlanKeys.week(userId, weekStartDate), planId ?? 'selected'],
    queryFn: async () =>
      planId
        ? mealPlanApi.detail(planId)
        : selectEditablePlan((await mealPlanApi.listWeek(weekStartDate)).data),
    enabled: Boolean(userId),
  });
}

export function useWeekMealPlans(weekStartDate: string) {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: [...mealPlanKeys.root(userId), 'options', weekStartDate],
    queryFn: () => mealPlanApi.listWeek(weekStartDate),
    enabled: Boolean(userId),
  });
}

export function useMealPlanActions(weekStartDate: string, planId?: string) {
  const client = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const writeQueue = useRef<Promise<unknown>>(Promise.resolve());
  const latestOptimisticWrite = useRef(0);
  const weekKey = [
    ...mealPlanKeys.week(userId, weekStartDate),
    planId ?? 'selected',
  ];
  const storePlan = (plan: MealPlan) => {
    client.setQueryData(weekKey, plan);
    void client.invalidateQueries({
      queryKey: mealPlanKeys.root(userId),
      refetchType: 'none',
    });
  };
  const enqueueWrite = <T>(write: () => Promise<T>) => {
    const result = writeQueue.current.then(write, write);
    writeQueue.current = result.then(
      () => undefined,
      () => undefined
    );
    return result;
  };
  const beginOptimisticWrite = async (update: (plan: MealPlan) => MealPlan) => {
    const sequence = ++latestOptimisticWrite.current;
    await client.cancelQueries({ queryKey: weekKey });
    const previous = client.getQueryData<MealPlan | null>(weekKey);
    if (previous) client.setQueryData(weekKey, update(previous));
    return { previous, sequence };
  };
  const rollbackLatest = (
    context: { previous?: MealPlan | null; sequence: number } | undefined
  ) => {
    if (context?.sequence !== latestOptimisticWrite.current) return;
    client.setQueryData(weekKey, context.previous);
  };
  const reconcileLatest = (
    plan: MealPlan,
    context: { sequence: number } | undefined
  ) => {
    if (context?.sequence === latestOptimisticWrite.current) storePlan(plan);
  };

  const addMeal = useMutation({
    mutationFn: async ({
      planId,
      input,
    }: {
      planId?: string;
      input: AddMealInput;
      optimisticMeal?: PlannedMeal;
    }) => {
      let targetPlanId = planId;
      if (!targetPlanId) {
        const createdPlan = await mealPlanApi.create(weekStartDate);
        targetPlanId = createdPlan._id;
        // Keep the newly created plan even if adding its first meal fails, so a retry
        // never creates duplicate drafts for the same week.
        client.setQueryData(weekKey, createdPlan);
      }
      return enqueueWrite(() => mealPlanApi.addMeal(targetPlanId, input));
    },
    onMutate: ({ planId: targetPlanId, input, optimisticMeal }) =>
      beginOptimisticWrite((plan) =>
        targetPlanId && optimisticMeal
          ? addPlannedMeal(plan, input.date, optimisticMeal)
          : plan
      ),
    onError: (_error, _variables, context) => rollbackLatest(context),
    onSuccess: (plan, _variables, context) => reconcileLatest(plan, context),
  });
  const updateMeal = useMutation({
    mutationFn: ({
      planId,
      mealId,
      input,
    }: {
      planId: string;
      mealId: string;
      input: UpdateMealInput;
      optimisticMeal?: PlannedMeal;
    }) => enqueueWrite(() => mealPlanApi.updateMeal(planId, mealId, input)),
    onMutate: ({ mealId, input, optimisticMeal }) =>
      beginOptimisticWrite((plan) =>
        updatePlannedMeal(plan, mealId, input, optimisticMeal)
      ),
    onError: (_error, _variables, context) => rollbackLatest(context),
    onSuccess: (plan, variables, context) => {
      reconcileLatest(plan, context);
      if (typeof variables.input.completed === 'boolean') {
        void client.invalidateQueries({
          queryKey: ['account', userId, 'tracking'],
        });
      }
    },
  });
  const removeMeal = useMutation({
    mutationFn: ({ planId, mealId }: { planId: string; mealId: string }) =>
      enqueueWrite(() => mealPlanApi.removeMeal(planId, mealId)),
    onMutate: ({ mealId }) =>
      beginOptimisticWrite((plan) => removePlannedMeal(plan, mealId)),
    onError: (_error, _variables, context) => rollbackLatest(context),
    onSuccess: (plan, _variables, context) => {
      reconcileLatest(plan, context);
      void client.invalidateQueries({
        queryKey: ['account', userId, 'tracking'],
      });
    },
  });

  const activate = useMutation({
    mutationFn: mealPlanApi.activate,
    onSuccess: storePlan,
  });
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'completed' | 'archived' }) =>
      mealPlanApi.setStatus(id, status),
    onSuccess: storePlan,
  });
  const clone = useMutation({
    mutationFn: ({
      id,
      targetWeek,
      title,
    }: {
      id: string;
      targetWeek: string;
      title?: string;
    }) => mealPlanApi.clone(id, targetWeek, title),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: mealPlanKeys.root(userId) }),
  });
  return { addMeal, updateMeal, removeMeal, activate, setStatus, clone };
}
