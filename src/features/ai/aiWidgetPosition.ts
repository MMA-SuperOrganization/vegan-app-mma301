export type AiWidgetPosition = {
  x: number;
  y: number;
};

export type AiWidgetBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

type WindowSize = {
  width: number;
  height: number;
};

type SafeAreaInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export function getAiWidgetBounds(
  window: WindowSize,
  insets: SafeAreaInsets,
  widgetSize: number,
  bottomClearance: number,
  edgeMargin: number
): AiWidgetBounds {
  const minX = insets.left + edgeMargin;
  const minY = insets.top + edgeMargin;

  return {
    minX,
    maxX: Math.max(minX, window.width - insets.right - widgetSize - edgeMargin),
    minY,
    maxY: Math.max(minY, window.height - widgetSize - bottomClearance),
  };
}

export function clampAiWidgetPosition(
  position: AiWidgetPosition,
  bounds: AiWidgetBounds
): AiWidgetPosition {
  return {
    x: Math.min(bounds.maxX, Math.max(bounds.minX, position.x)),
    y: Math.min(bounds.maxY, Math.max(bounds.minY, position.y)),
  };
}

export function snapAiWidgetToNearestEdge(
  position: AiWidgetPosition,
  bounds: AiWidgetBounds
): AiWidgetPosition {
  const midpoint = bounds.minX + (bounds.maxX - bounds.minX) / 2;

  return clampAiWidgetPosition(
    {
      x: position.x <= midpoint ? bounds.minX : bounds.maxX,
      y: position.y,
    },
    bounds
  );
}
