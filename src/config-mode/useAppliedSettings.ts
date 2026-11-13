// Holds the applied weight shift values for the whole app. Called once, from App.tsx,
// through src/app/ConfigMount.tsx. Temporary: replaced by hard-coded values in spec 6.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Category } from '../engine';
import { emptyApplied, withApplied, type AppliedState } from './appliedSettings';
import { loadApplied, saveApplied } from './appliedStorage';

export type AppliedSettingsApi = {
  /** False until the saved values have been read (or reading failed). */
  loaded: boolean;
  state: AppliedState;
  /** Uses the value now, then saves it. The other category is untouched. */
  apply: (category: Category, position: number) => void;
};

export function useAppliedSettings(): AppliedSettingsApi {
  const [loaded, setLoaded] = useState(false);
  const [state, setState] = useState<AppliedState>(emptyApplied);
  // Latest state for apply(), so two quick applies never overwrite each other.
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let active = true;
    loadApplied()
      .then((saved) => {
        if (!active) return;
        stateRef.current = saved;
        setState(saved);
      })
      .catch(() => {}) // defaults stay
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  const apply = useCallback((category: Category, position: number) => {
    const next = withApplied(stateRef.current, category, position);
    stateRef.current = next;
    setState(next);
    void saveApplied(next);
  }, []);

  return { loaded, state, apply };
}
