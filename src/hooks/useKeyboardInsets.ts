import { useSyncExternalStore } from 'react';
import {
  Keyboard,
  Platform,
  useWindowDimensions,
  type KeyboardEvent,
} from 'react-native';
import {
  createKeyboardObserver,
  hiddenKeyboard,
  keyboardOverlap,
  type KeyboardSnapshot,
} from './keyboardObserver';
const fromMetrics = (
  metrics: KeyboardEvent['endCoordinates'] | undefined
): KeyboardSnapshot =>
  metrics && metrics.height > 0
    ? { visible: true, height: metrics.height, screenY: metrics.screenY }
    : hiddenKeyboard;
const observer = createKeyboardObserver({
  read: () =>
    Platform.OS === 'web' ? hiddenKeyboard : fromMetrics(Keyboard.metrics()),
  listen: (publish) => {
    if (Platform.OS === 'web') return () => {};
    const update = (event: KeyboardEvent) =>
      publish(fromMetrics(event.endCoordinates));
    const hide = () => publish(hiddenKeyboard);
    const subscriptions = [
      Keyboard.addListener('keyboardDidShow', update),
      Keyboard.addListener('keyboardDidHide', hide),
    ];
    if (Platform.OS === 'ios')
      subscriptions.push(Keyboard.addListener('keyboardWillChangeFrame', update));
    return () => subscriptions.forEach((subscription) => subscription.remove());
  },
});
/** Observation only. Never applies padding or safe area; the form/dock chooses ONE compensation owner. */
export function useKeyboardInsets() {
  const state = useSyncExternalStore(
    observer.subscribe,
    observer.getSnapshot,
    observer.getServerSnapshot
  );
  const { height } = useWindowDimensions();
  return {
    ...state,
    supported: Platform.OS !== 'web',
    overlap: keyboardOverlap(state, height),
  };
}
