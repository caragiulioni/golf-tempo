// Reads and writes the applied values through the storage wrapper. Never throws.
// Temporary: spec 6 stops reading this key and deletes it.
import { getItem, setItem } from '../storage';
import { APPLIED_KEY, emptyApplied, parseApplied, serializeApplied, type AppliedState } from './appliedSettings';

/** Saved values, or defaults if nothing usable is saved or reading fails. */
export async function loadApplied(): Promise<AppliedState> {
  try {
    return parseApplied(await getItem(APPLIED_KEY));
  } catch {
    return emptyApplied();
  }
}

/** Saves the whole state. A failed write is ignored (the session keeps its value). */
export async function saveApplied(state: AppliedState): Promise<void> {
  try {
    await setItem(APPLIED_KEY, serializeApplied(state));
  } catch {
    // Ignored on purpose, see R1.5.
  }
}
