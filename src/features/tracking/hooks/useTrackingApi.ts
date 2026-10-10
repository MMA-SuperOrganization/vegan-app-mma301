import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import { useProfileStore } from '@/features/profile';
import { toLocalIsoDate } from '../trackingState';
import {
  trackingApi,
  type SaveWaterInput,
  type SaveWeightInput,
  type UpdateDiaryInput,
} from '../services/trackingApi';

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const today = () => toLocalIsoDate(new Date());
const monthAgo = () => {
  const value = new Date();
  value.setDate(value.getDate() - 29);
  return toLocalIsoDate(value);
};

const keys = {
  root: (userId?: string) => ['account', userId, 'tracking'] as const,
  diary: (userId: string | undefined, date: string) =>
    [...keys.root(userId), 'diary', date] as const,
  summary: (userId: string | undefined, date: string) =>
    [...keys.root(userId), 'summary', date] as const,
  weight: (userId?: string) => [...keys.root(userId), 'weight'] as const,
  trend: (userId?: string) => [...keys.root(userId), 'weight-trend'] as const,
  water: (userId: string | undefined, date: string) =>
    [...keys.root(userId), 'water', date] as const,
};

export function useDiary(date = today()) {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: keys.diary(userId, date),
    queryFn: () => trackingApi.diary.list({ date, timezone, limit: 100 }),
    enabled: Boolean(userId),
  });
}

export function useDiarySummary(date = today()) {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: keys.summary(userId, date),
    queryFn: () => trackingApi.diary.summary({ date, timezone }),
    enabled: Boolean(userId),
  });
}

export function useWeightLogs() {
  const userId = useAuthStore((state) => state.user?.id);
  const query = { from: monthAgo(), to: today(), timezone, limit: 100 };
  return useQuery({
    queryKey: keys.weight(userId),
    queryFn: () => trackingApi.weight.list(query),
    enabled: Boolean(userId),
  });
}

export function useWeightTrend() {
  const userId = useAuthStore((state) => state.user?.id);
  const query = { from: monthAgo(), to: today(), timezone, limit: 100 };
  return useQuery({
    queryKey: keys.trend(userId),
    queryFn: () => trackingApi.weight.trend(query),
    enabled: Boolean(userId),
  });
}

export function useWater(date = today()) {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: keys.water(userId, date),
    queryFn: () => trackingApi.water.list({ date, timezone, limit: 100 }),
    enabled: Boolean(userId),
  });
}

export function useTrackingTargets() {
  const nutrition = useProfileStore((state) => state.data?.nutritionProfile);
  return {
    energyKcal: nutrition?.dailyCalorieTarget ?? null,
    proteinG: nutrition?.proteinTargetG ?? null,
    carbsG: nutrition?.carbTargetG ?? null,
    fatG: nutrition?.fatTargetG ?? null,
    fiberG: nutrition?.fiberTargetG ?? null,
    waterMl: nutrition?.waterTargetMl ?? null,
    weightKg: null,
  };
}

export function useDiaryMutations() {
  const client = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const refreshDiary = () =>
    client.invalidateQueries({ queryKey: [...keys.root(userId)] });
  return {
    createDiary: useMutation({
      mutationFn: trackingApi.diary.create,
      onSuccess: refreshDiary,
    }),
    updateDiary: useMutation({
      mutationFn: ({ id, input }: { id: string; input: UpdateDiaryInput }) =>
        trackingApi.diary.update(id, input),
      onSuccess: refreshDiary,
    }),
    removeDiary: useMutation({
      mutationFn: trackingApi.diary.remove,
      onSuccess: refreshDiary,
    }),
  };
}

export function useWeightMutations() {
  const client = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const refreshWeight = () =>
    client.invalidateQueries({ queryKey: keys.root(userId) });
  return {
    createWeight: useMutation({
      mutationFn: trackingApi.weight.create,
      onSuccess: refreshWeight,
    }),
    updateWeight: useMutation({
      mutationFn: ({ id, input }: { id: string; input: SaveWeightInput }) =>
        trackingApi.weight.update(id, input),
      onSuccess: refreshWeight,
    }),
    removeWeight: useMutation({
      mutationFn: trackingApi.weight.remove,
      onSuccess: refreshWeight,
    }),
  };
}

export function useWaterMutations() {
  const client = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const refreshWater = () =>
    client.invalidateQueries({ queryKey: [...keys.root(userId), 'water'] });
  return {
    createWater: useMutation({
      mutationFn: trackingApi.water.create,
      onSuccess: refreshWater,
    }),
    updateWater: useMutation({
      mutationFn: ({ id, input }: { id: string; input: SaveWaterInput }) =>
        trackingApi.water.update(id, input),
      onSuccess: refreshWater,
    }),
    removeWater: useMutation({
      mutationFn: trackingApi.water.remove,
      onSuccess: refreshWater,
    }),
  };
}
