export interface KeyboardSnapshot {
  readonly visible: boolean;
  readonly height: number;
  readonly screenY: number | null;
}
export interface KeyboardAdapter {
  read: () => KeyboardSnapshot;
  listen: (publish: (state: KeyboardSnapshot) => void) => () => void;
}
export const hiddenKeyboard: KeyboardSnapshot = {
  visible: false,
  height: 0,
  screenY: null,
};
/** Lazy shared subscription: exactly one adapter listener set while there are consumers. */
export function createKeyboardObserver(adapter: KeyboardAdapter) {
  let snapshot = hiddenKeyboard;
  let stop: (() => void) | undefined;
  const listeners = new Set<() => void>();
  const publish = (next: KeyboardSnapshot) => {
    if (
      next.visible === snapshot.visible &&
      next.height === snapshot.height &&
      next.screenY === snapshot.screenY
    )
      return;
    snapshot = next;
    listeners.forEach((listener) => listener());
  };
  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => hiddenKeyboard,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      if (listeners.size === 1) {
        publish(adapter.read());
        stop = adapter.listen(publish);
      }
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          stop?.();
          stop = undefined;
          snapshot = hiddenKeyboard;
        }
      };
    },
  };
}
export function keyboardOverlap(state: KeyboardSnapshot, windowHeight: number) {
  return state.visible && state.screenY !== null
    ? Math.max(0, Math.min(state.height, windowHeight - state.screenY))
    : 0;
}
