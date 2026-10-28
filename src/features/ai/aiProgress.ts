export type AiProgressStage = 'sending' | 'checking' | 'generating';

export function getAiProgressStage(elapsedMs: number): AiProgressStage {
  if (elapsedMs < 2_000) return 'sending';
  if (elapsedMs < 8_000) return 'checking';
  return 'generating';
}
