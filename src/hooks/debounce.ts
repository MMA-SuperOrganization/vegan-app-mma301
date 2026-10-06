/** Shared timer ownership for the hook. No API or storage side effects. */
export function scheduleDebounced<T>(
  value: T,
  delay: number,
  publish: (value: T) => void
) {
  const timer = setTimeout(
    () => publish(value),
    Number.isFinite(delay) ? Math.max(0, delay) : 0
  );
  return () => clearTimeout(timer);
}
