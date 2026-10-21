import { apiClient, unwrapApiPageRequest, unwrapApiRequest } from '@/services/api';
import { normalizeMealPlan } from './mealPlanState';
import type { AddMealInput, MealPlan, UpdateMealInput } from './types';

const normalize = (plan: MealPlan) => normalizeMealPlan(plan);

export const mealPlanApi = {
  activate: (id: string) =>
    unwrapApiRequest<MealPlan>(() =>
      apiClient.post('/meal-plans/' + id + '/activate', {})
    ).then(normalize),
  detail: (id: string) =>
    unwrapApiRequest<MealPlan>(() => apiClient.get('/meal-plans/' + id)).then(
      normalize
    ),
  listWeek: (weekStartDate: string) =>
    unwrapApiPageRequest<MealPlan>(() =>
      apiClient.get('/meal-plans', {
        params: { page: 1, limit: 10, weekStartDate },
      })
    ).then((page) => ({ ...page, data: page.data.map(normalize) })),
  create: (weekStartDate: string) =>
    unwrapApiRequest<MealPlan>(() =>
      apiClient.post('/meal-plans', { weekStartDate, days: [] })
    ).then(normalize),
  addMeal: (planId: string, input: AddMealInput) =>
    unwrapApiRequest<MealPlan>(() =>
      apiClient.post(`/meal-plans/${planId}/meals`, input)
    ).then(normalize),
  updateMeal: (planId: string, mealId: string, input: UpdateMealInput) =>
    unwrapApiRequest<MealPlan>(() =>
      apiClient.patch(`/meal-plans/${planId}/meals/${mealId}`, input)
    ).then(normalize),
  removeMeal: (planId: string, mealId: string) =>
    unwrapApiRequest<MealPlan>(() =>
      apiClient.delete(`/meal-plans/${planId}/meals/${mealId}`)
    ).then(normalize),
};
