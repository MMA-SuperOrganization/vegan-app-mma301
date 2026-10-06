export function contentWidthForViewport(
  width: number,
  maxWidth: number,
  gutter: number
) {
  const availableWidth = Math.max(0, width - Math.max(0, gutter) * 2);
  const limit = Number.isFinite(maxWidth) ? Math.max(0, maxWidth) : availableWidth;
  return {
    contentWidth: Math.min(availableWidth, limit),
    compact: availableWidth < limit,
    wide: availableWidth >= limit,
  };
}
