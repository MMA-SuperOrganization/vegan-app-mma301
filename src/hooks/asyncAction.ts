export class AsyncActionBusyError extends Error {
  constructor() {
    super('An action is already running.');
    this.name = 'AsyncActionBusyError';
  }
}
export class AsyncActionDiscardedError extends Error {
  constructor() {
    super('Action result discarded after reset or unmount.');
    this.name = 'AsyncActionDiscardedError';
  }
}
export interface AsyncActionSnapshot {
  readonly pending: boolean;
  readonly error: unknown;
}
/** One controller per hook instance; no cache, retry, API, or server cancellation. */
export function createAsyncActionController() {
  let active = true;
  let locked = false;
  let generation = 0;
  let snapshot: AsyncActionSnapshot = { pending: false, error: null };
  const listeners = new Set<() => void>();
  const publish = (next: AsyncActionSnapshot) => {
    snapshot = next;
    listeners.forEach((listener) => listener());
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    activate: () => {
      active = true;
      if (snapshot.pending !== locked) publish({ pending: locked, error: null });
    },
    deactivate: () => {
      active = false;
      generation++;
    },
    reset: () => {
      generation++;
      if (active) publish({ pending: locked, error: null });
    },
    async run<Args extends unknown[], Result>(
      action: (...args: Args) => Promise<Result>,
      ...args: Args
    ): Promise<Result> {
      if (!active) throw new AsyncActionDiscardedError();
      if (locked) throw new AsyncActionBusyError();
      locked = true;
      const id = ++generation;
      publish({ pending: true, error: null });
      try {
        const result = await action(...args);
        if (!active || id !== generation) throw new AsyncActionDiscardedError();
        return result;
      } catch (error) {
        if (!active || id !== generation) throw new AsyncActionDiscardedError();
        publish({ pending: true, error });
        throw error;
      } finally {
        locked = false;
        if (active) publish({ pending: false, error: snapshot.error });
      }
    },
  };
}
