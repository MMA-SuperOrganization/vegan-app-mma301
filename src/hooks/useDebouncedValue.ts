import { useEffect, useState } from 'react';
import { scheduleDebounced } from './debounce';
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => scheduleDebounced(value, delay, setDebouncedValue),
    [value, delay]
  );
  return debouncedValue;
}
