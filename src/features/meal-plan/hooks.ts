import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import { mealPlanApi } from './mealPlanApi';
import { selectEditablePlan } from './mealPlanState';
import type { AddMealInput, MealPlan, UpdateMealInput } from './types';

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

export function useMealPlanActions(weekStartDate: string, planId?: string) {
  const client = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const weekKey = [
    ...mealPlanKeys.week(userId, weekStartDate),
    planId ?? 'selected',
  ];
  const storePlan = (plan: MealPlan) => {
    client.setQueryData(weekKey, plan);
    void client.invalidateQueries({ queryKey: mealPlanKeys.root(userId) });
  };

  const addMeal = useMutation({
    mutationFn: async ({
      planId,
      input,
    }: {
      planId?: string;
      input: AddMealInput;
    }) => {
      let targetPlanId = planId;
      if (!targetPlanId) {
        const createdPlan = await mealPlanApi.create(weekStartDate);
        targetPlanId = createdPlan._id;
        // Keep the newly created plan even if adding its first meal fails, so a retry
        // never creates duplicate drafts for the same week.
        client.setQueryData(weekKey, createdPlan);
      }
      return mealPlanApi.addMeal(targetPlanId, input);
    },
    onSuccess: storePlan,
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
    }) => mealPlanApi.updateMeal(planId, mealId, input),
    onSuccess: storePlan,
  });
  const removeMeal = useMutation({
    mutationFn: ({ planId, mealId }: { planId: string; mealId: string }) =>
      mealPlanApi.removeMeal(planId, mealId),
    onSuccess: storePlan,
  });

  const activate = useMutation({
    mutationFn: mealPlanApi.activate,
    onSuccess: storePlan,
  });
  return { addMeal, updateMeal, removeMeal, activate };
}
