// Explicit .ts extension so node:test can load this file directly.
import { DAY_MS, toLocalIsoDate } from '../trackingState.ts';
import type { TrackingData } from '../types';

function atTime(day: Date, hours: number, minutes = 0) {
  const date = new Date(day);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

/** Mock data matching the Figma tracking screens until the API is wired. */
export function createMockTrackingData(now = new Date()): TrackingData {
  const today = toLocalIsoDate(now);
  const daysAgo = (days: number) => new Date(now.getTime() - days * DAY_MS);

  return {
    diaryEntries: [
      {
        _id: 'mock-diary-1',
        date: today,
        mealType: 'breakfast',
        sourceType: 'recipe',
        recipeId: 'mock-recipe-overnight-oats',
        nameSnapshot: 'Overnight oats',
        servings: 1,
        nutritionSnapshot: {
          caloriesKcal: 380,
          proteinG: 15,
          carbsG: 50,
          fatG: 11,
          fiberG: 6,
        },
        consumedAt: atTime(now, 7, 30),
      },
      {
        _id: 'mock-diary-2',
        date: today,
        mealType: 'lunch',
        sourceType: 'recipe',
        recipeId: 'mock-recipe-brown-rice-tofu',
        nameSnapshot: 'Cơm gạo lứt đậu hũ',
        servings: 1,
        nutritionSnapshot: {
          caloriesKcal: 420,
          proteinG: 24,
          carbsG: 56,
          fatG: 11,
          fiberG: 8,
        },
        consumedAt: atTime(now, 12),
      },
    ],
    weightLogs: [
      { _id: 'mock-weight-1', weightKg: 66.1, recordedAt: atTime(daysAgo(30), 7) },
      { _id: 'mock-weight-2', weightKg: 65.4, recordedAt: atTime(daysAgo(7), 7) },
      {
        _id: 'mock-weight-3',
        weightKg: 65,
        recordedAt: atTime(now, 7),
        note: 'Đo buổi sáng',
      },
    ],
    waterLogs: [
      { _id: 'mock-water-1', amountMl: 250, recordedAt: atTime(now, 8) },
      { _id: 'mock-water-2', amountMl: 500, recordedAt: atTime(now, 10, 30) },
      { _id: 'mock-water-3', amountMl: 500, recordedAt: atTime(now, 13) },
    ],
    targets: {
      energyKcal: 2000,
      proteinG: 70,
      carbsG: 250,
      fatG: 55,
      fiberG: 30,
      waterMl: 2000,
      weightKg: 65,
    },
  };
}
