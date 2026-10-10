import {
  apiClient,
  unwrapApiPageRequest,
  unwrapApiRequest,
  type PaginationMeta,
} from '@/services/api';
import type {
  DiaryEntry,
  FoodUnit,
  MealType,
  NutritionValues,
  WaterLog,
  WeightLog,
} from '../types';
import { normalizeDiaryEntry } from '../trackingState';

export interface DateRangeQuery {
  date?: string;
  from?: string;
  to?: string;
  timezone: string;
  page?: number;
  limit?: number;
}

export interface DiarySummary {
  from: string;
  to: string;
  entryCount: number;
  nutrition: NutritionValues;
  dailyTargets: Record<keyof NutritionValues, number | null>;
}

export interface WeightTrend {
  from: string;
  to: string;
  count: number;
  startWeightKg: number | null;
  endWeightKg: number | null;
  changeKg: number | null;
}

export interface WaterMeta extends PaginationMeta {
  from: string;
  to: string;
  timezone: string;
  totalMl: number;
  count: number;
  days: Array<{ date: string; amountMl: number; count: number }>;
}

export type CreateDiaryInput =
  | {
      date: string;
      mealType: MealType;
      consumedAt: string;
      sourceType: 'recipe';
      recipeId: string;
      servings: number;
    }
  | {
      date: string;
      mealType: MealType;
      consumedAt: string;
      sourceType: 'food';
      foodItemId: string;
      quantity: number;
      unit: FoodUnit;
    }
  | {
      date: string;
      mealType: MealType;
      consumedAt: string;
      sourceType: 'custom';
      nameSnapshot: string;
      servings: number;
      nutritionSnapshot: NutritionValues;
    };

export type UpdateDiaryInput = Partial<
  Pick<DiaryEntry, 'servings' | 'quantity' | 'unit' | 'note' | 'consumedAt'>
>;
export type SaveWeightInput = Pick<WeightLog, 'weightKg' | 'recordedAt' | 'note'>;
export type SaveWaterInput = Pick<WaterLog, 'amountMl' | 'recordedAt' | 'note'>;

export const trackingApi = {
  diary: {
    list: async (query: DateRangeQuery) => {
      const page = await unwrapApiPageRequest<DiaryEntry>(() =>
        apiClient.get('/diary', { params: query })
      );
      return { ...page, data: page.data.map(normalizeDiaryEntry) };
    },
    summary: (query: DateRangeQuery) =>
      unwrapApiRequest<DiarySummary>(() =>
        apiClient.get('/diary/summary', { params: query })
      ),
    create: (input: CreateDiaryInput) =>
      unwrapApiRequest<DiaryEntry>(() => apiClient.post('/diary', input)).then(
        normalizeDiaryEntry
      ),
    update: (id: string, input: UpdateDiaryInput) =>
      unwrapApiRequest<DiaryEntry>(() =>
        apiClient.patch(`/diary/${id}`, input)
      ).then(normalizeDiaryEntry),
    remove: (id: string) =>
      unwrapApiRequest<{ id: string; deleted: true }>(() =>
        apiClient.delete(`/diary/${id}`)
      ),
  },
  weight: {
    list: (query: DateRangeQuery) =>
      unwrapApiPageRequest<WeightLog>(() =>
        apiClient.get('/weight-logs', { params: query })
      ),
    trend: (query: DateRangeQuery) =>
      unwrapApiRequest<WeightTrend>(() =>
        apiClient.get('/weight-logs/trend', { params: query })
      ),
    create: (input: SaveWeightInput) =>
      unwrapApiRequest<WeightLog>(() => apiClient.post('/weight-logs', input)),
    update: (id: string, input: SaveWeightInput) =>
      unwrapApiRequest<WeightLog>(() =>
        apiClient.patch(`/weight-logs/${id}`, input)
      ),
    remove: (id: string) =>
      unwrapApiRequest<{ id: string; deleted: true }>(() =>
        apiClient.delete(`/weight-logs/${id}`)
      ),
  },
  water: {
    list: (query: DateRangeQuery) =>
      unwrapApiPageRequest<WaterLog, WaterMeta>(() =>
        apiClient.get('/water-logs', { params: query })
      ),
    create: (input: SaveWaterInput) =>
      unwrapApiRequest<WaterLog>(() => apiClient.post('/water-logs', input)),
    update: (id: string, input: SaveWaterInput) =>
      unwrapApiRequest<WaterLog>(() => apiClient.patch(`/water-logs/${id}`, input)),
    remove: (id: string) =>
      unwrapApiRequest<{ id: string; deleted: true }>(() =>
        apiClient.delete(`/water-logs/${id}`)
      ),
  },
};
