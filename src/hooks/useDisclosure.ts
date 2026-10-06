import { useRef, useState } from 'react';
export interface DisclosureOptions {
  initialOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
/** Ownership must stay controlled or uncontrolled for this mounted instance. */
export function useDisclosure({
  initialOpen = false,
  isOpen: controlled,
  onOpenChange,
}: DisclosureOptions = {}) {
  const [local, setLocal] = useState(initialOpen);
  const currentLocal = useRef(initialOpen);
  const isOpen = controlled ?? local;
  const change = (next: boolean) => {
    const previous = controlled ?? currentLocal.current;
    if (previous === next) return;
    if (controlled === undefined) {
      currentLocal.current = next;
      setLocal(next);
    }
    onOpenChange?.(next);
  };
  return {
    isOpen,
    open: () => change(true),
    close: () => change(false),
    toggle: () => change(!(controlled ?? currentLocal.current)),
  };
}
