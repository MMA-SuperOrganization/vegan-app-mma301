export interface SafeBackActions {
  canGoBack: () => boolean;
  goBack: () => void;
  goToFallback: () => void;
}

export function performSafeBack({
  canGoBack,
  goBack,
  goToFallback,
}: SafeBackActions) {
  if (canGoBack()) {
    goBack();
    return;
  }

  goToFallback();
}
