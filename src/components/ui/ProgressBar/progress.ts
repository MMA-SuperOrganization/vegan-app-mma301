/** A finite normalized ratio: invalid/nonpositive max is an empty track. */
export function progressRatio(value: number, max: number): number {
  if (!Number.isFinite(max) || max <= 0 || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value / max));
}
