import { useState } from 'react';
/** Interaction state only: value, errors and validation stay with the caller. */
export function useFieldState() {
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  return {
    focused,
    touched,
    onFocus: () => setFocused(true),
    onBlur: () => {
      setFocused(false);
      setTouched(true);
    },
    reset: () => {
      setFocused(false);
      setTouched(false);
    },
  };
}
