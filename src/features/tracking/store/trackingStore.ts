import { create } from 'zustand';
import { createMockTrackingData } from '../mocks/trackingMocks';
import type {
  DiaryEntry,
  NewDiaryEntry,
  NewWaterLog,
  NewWeightLog,
  TrackingData,
  WaterLog,
  WeightLog,
} from '../types';

/**
 * Single source of tracking data shared by the hub and every tracking screen.
 * Actions currently edit mock data in memory; when the API is wired they will
 * call `/diary`, `/weight-logs` and `/water-logs` and keep the same signatures.
 */
export interface TrackingState extends TrackingData {
  addDiaryEntry: (entry: NewDiaryEntry) => DiaryEntry;
  updateDiaryEntry: (id: string, changes: Partial<NewDiaryEntry>) => void;
  removeDiaryEntry: (id: string) => void;
  addWeightLog: (log: NewWeightLog) => WeightLog;
  updateWeightLog: (id: string, changes: Partial<NewWeightLog>) => void;
  removeWeightLog: (id: string) => void;
  addWaterLog: (log: NewWaterLog) => WaterLog;
  updateWaterLog: (id: string, changes: Partial<NewWaterLog>) => void;
  removeWaterLog: (id: string) => void;
  reset: () => void;
}

let localIdCounter = 0;
function createLocalId(prefix: string) {
  localIdCounter += 1;
  return `local-${prefix}-${Date.now()}-${localIdCounter}`;
}

function updateById<T extends { _id: string }>(
  items: T[],
  id: string,
  changes: Partial<Omit<T, '_id'>>
): T[] {
  return items.map((item) => (item._id === id ? { ...item, ...changes } : item));
}

export const useTrackingStore = create<TrackingState>((set) => ({
  ...createMockTrackingData(),

  addDiaryEntry: (entry) => {
    const created = { ...entry, _id: createLocalId('diary') };
    set((state) => ({ diaryEntries: [...state.diaryEntries, created] }));
    return created;
  },
  updateDiaryEntry: (id, changes) =>
    set((state) => ({ diaryEntries: updateById(state.diaryEntries, id, changes) })),
  removeDiaryEntry: (id) =>
    set((state) => ({
      diaryEntries: state.diaryEntries.filter((entry) => entry._id !== id),
    })),

  addWeightLog: (log) => {
    const created = { ...log, _id: createLocalId('weight') };
    set((state) => ({ weightLogs: [...state.weightLogs, created] }));
    return created;
  },
  updateWeightLog: (id, changes) =>
    set((state) => ({ weightLogs: updateById(state.weightLogs, id, changes) })),
  removeWeightLog: (id) =>
    set((state) => ({
      weightLogs: state.weightLogs.filter((log) => log._id !== id),
    })),

  addWaterLog: (log) => {
    const created = { ...log, _id: createLocalId('water') };
    set((state) => ({ waterLogs: [...state.waterLogs, created] }));
    return created;
  },
  updateWaterLog: (id, changes) =>
    set((state) => ({ waterLogs: updateById(state.waterLogs, id, changes) })),
  removeWaterLog: (id) =>
    set((state) => ({ waterLogs: state.waterLogs.filter((log) => log._id !== id) })),

  reset: () => set(createMockTrackingData()),
}));
