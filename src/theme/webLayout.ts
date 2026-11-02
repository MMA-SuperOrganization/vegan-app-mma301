/**
 * Desktop-only layout constraints. Keeping these values in one place prevents
 * individual screens from inventing incompatible web widths.
 */
export const webLayout = {
  contentMaxWidth: 880,
  feedMaxWidth: 760,
  formMaxWidth: 640,
  catalogMaxWidth: 1180,
  navigationMaxWidth: 720,
  dialogMaxWidth: 720,
  desktopBreakpoint: 960,
  wideBreakpoint: 1280,
  pageGutter: 24,
  dockBottomSpace: 16,
} as const;
