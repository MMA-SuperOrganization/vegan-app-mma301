import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { remainingSeconds } from './timer';

export function useStepTimer(durationSeconds: number, stepKey: string) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const [running, setRunning] = useState(false);
  const deadlineRef = useRef<number | null>(null);

  const sync = useCallback(() => {
    const next = remainingSeconds(deadlineRef.current);
    setRemaining(next);
    if (next === 0) {
      deadlineRef.current = null;
      setRunning(false);
    }
  }, []);

  useEffect(() => {
    deadlineRef.current = null;
    setRunning(false);
    setRemaining(durationSeconds);
  }, [durationSeconds, stepKey]);

  useEffect(() => {
    if (!running) return;
    sync();
    const interval = setInterval(sync, 250);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [running, sync]);

  const start = () => {
    if (remaining <= 0) setRemaining(durationSeconds);
    const seconds = remaining <= 0 ? durationSeconds : remaining;
    deadlineRef.current = Date.now() + seconds * 1000;
    setRunning(true);
  };

  const pause = () => {
    sync();
    deadlineRef.current = null;
    setRunning(false);
  };

  const reset = () => {
    deadlineRef.current = null;
    setRunning(false);
    setRemaining(durationSeconds);
  };

  return { remaining, running, start, pause, reset };
}
