import { AiProgressStage } from './aiConstants.ts';

export { AiProgressStage };

export const AI_PROGRESS_THRESHOLDS_MS = {
  CHECKING: 2_000,
  GENERATING: 8_000,
} as const;

export function getAiProgressStage(elapsedMs: number): AiProgressStage {
  if (elapsedMs < AI_PROGRESS_THRESHOLDS_MS.CHECKING) {
    return AiProgressStage.SENDING;
  }
  if (elapsedMs < AI_PROGRESS_THRESHOLDS_MS.GENERATING) {
    return AiProgressStage.CHECKING;
  }
  return AiProgressStage.GENERATING;
}
