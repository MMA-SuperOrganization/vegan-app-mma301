export const remainingSeconds = (deadlineMs: number | null, nowMs = Date.now()) =>
  deadlineMs == null ? 0 : Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));

export const formatTimer = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
};
