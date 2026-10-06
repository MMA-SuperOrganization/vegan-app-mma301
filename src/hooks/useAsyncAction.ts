import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createAsyncActionController } from './asyncAction';
export { AsyncActionBusyError, AsyncActionDiscardedError } from './asyncAction';
export function useAsyncAction<Args extends unknown[], Result>(
  action: (...args: Args) => Promise<Result>,
  { scopeKey }: { scopeKey?: string | number } = {}
) {
  const [controller] = useState(createAsyncActionController);
  const previousScope = useRef(scopeKey);
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot
  );
  useLayoutEffect(() => {
    controller.activate();
    return controller.deactivate;
  }, [controller]);
  useLayoutEffect(() => {
    if (!Object.is(previousScope.current, scopeKey)) {
      previousScope.current = scopeKey;
      controller.reset();
    }
  }, [controller, scopeKey]);
  const run = useCallback(
    (...args: Args) => controller.run(action, ...args),
    [controller, action]
  );
  return { ...state, run, reset: controller.reset };
}
