import { useRef, useState } from 'react';
import {
  normalizeSelection,
  toggleSelection,
  type SelectionKey,
  type SelectionMode,
} from './selection';
export interface SelectionOptions<K extends SelectionKey> {
  mode?: SelectionMode;
  defaultSelectedKeys?: readonly K[];
  selectedKeys?: readonly K[];
  onChange?: (keys: readonly K[]) => void;
}
/** Local per instance unless selectedKeys is supplied. Removed item keys are retained; caller clears or reconciles controlled keys. */
export function useSelection<K extends SelectionKey>({
  mode = 'single',
  defaultSelectedKeys = [],
  selectedKeys: controlled,
  onChange,
}: SelectionOptions<K> = {}) {
  const [local, setLocal] = useState(() =>
    normalizeSelection(defaultSelectedKeys, mode)
  );
  const currentLocal = useRef(local);
  const selectedKeys = normalizeSelection(controlled ?? local, mode);
  const change = (next: readonly K[]) => {
    const normalized = normalizeSelection(next, mode);
    const previous = normalizeSelection(controlled ?? currentLocal.current, mode);
    if (
      previous.length === normalized.length &&
      previous.every((k, i) => k === normalized[i])
    )
      return;
    if (controlled === undefined) {
      currentLocal.current = normalized;
      setLocal(normalized);
    }
    onChange?.([...normalized]);
  };
  const current = () => normalizeSelection(controlled ?? currentLocal.current, mode);
  return {
    selectedKeys: selectedKeys as readonly K[],
    isSelected: (key: K) => selectedKeys.includes(key),
    select: (key: K) => change(mode === 'single' ? [key] : [...current(), key]),
    toggle: (key: K) => change(toggleSelection(current(), key, mode)),
    clear: () => change([]),
  };
}
