// Scenario tests for saving, reloading and exporting, through the real load/save code
// with a fake in-memory storage standing in for the browser's local storage.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map<string, string>();
vi.mock('../storage', () => ({
  getItem: async (key: string) => store.get(key) ?? null,
  setItem: async (key: string, value: string) => {
    store.set(key, value);
  },
}));

import { DEFAULT_WEIGHT_SHIFT_POSITIONS } from '../engine';
import { APPLIED_KEY, emptyApplied, withApplied, type AppliedState } from './appliedSettings';
import { loadApplied, saveApplied } from './appliedStorage';
import { buildExportText } from './exportText';

const NOW = new Date('2026-11-14T10:00:00.000Z');
const D = DEFAULT_WEIGHT_SHIFT_POSITIONS;

/** What the hook's apply() does: change one category in the current state, then save. */
async function apply(state: AppliedState, category: 'long' | 'short', value: number) {
  const next = withApplied(state, category, value);
  await saveApplied(next);
  return next;
}
const exported = (state: AppliedState) => JSON.parse(buildExportText(state, NOW));
const stored = () => JSON.parse(store.get(APPLIED_KEY) ?? 'null');

beforeEach(() => store.clear());

describe('nothing saved', () => {
  it('uses the defaults and exports them as not applied', async () => {
    const state = await loadApplied();
    expect(state.settings).toEqual({ long: D.long, short: D.short });
    expect(store.size).toBe(0);
    expect(exported(state).longGame).toEqual({ weightShiftPosition: D.long, applied: false });
    expect(exported(state).shortGame).toEqual({ weightShiftPosition: D.short, applied: false });
  });
});

describe('Long game only', () => {
  it('saves long, leaves short untouched, and the export agrees (also after a reload)', async () => {
    await apply(await loadApplied(), 'long', 0.62);
    expect(stored()).toEqual({ version: 1, long: 0.62 }); // short is not written
    const reloaded = await loadApplied();
    expect(reloaded.settings).toEqual({ long: 0.62, short: D.short });
    expect(exported(reloaded).longGame).toEqual({ weightShiftPosition: 0.62, applied: true });
    expect(exported(reloaded).shortGame).toEqual({ weightShiftPosition: D.short, applied: false });
  });
});

describe('Short game only', () => {
  it('saves short, leaves long untouched, and the export agrees (also after a reload)', async () => {
    await apply(await loadApplied(), 'short', 0.71);
    expect(stored()).toEqual({ version: 1, short: 0.71 }); // long is not written
    const reloaded = await loadApplied();
    expect(reloaded.settings).toEqual({ long: D.long, short: 0.71 });
    expect(exported(reloaded).shortGame).toEqual({ weightShiftPosition: 0.71, applied: true });
    expect(exported(reloaded).longGame).toEqual({ weightShiftPosition: D.long, applied: false });
  });
});

describe('Long game, then Short game', () => {
  it('both are saved, neither overwrites the other, and the export has both', async () => {
    let state = await loadApplied();
    state = await apply(state, 'long', 0.62);
    expect(stored()).toEqual({ version: 1, long: 0.62 });
    state = await apply(state, 'short', 0.71);
    expect(stored()).toEqual({ version: 1, long: 0.62, short: 0.71 });
    expect(exported(state).longGame).toEqual({ weightShiftPosition: 0.62, applied: true });
    expect(exported(state).shortGame).toEqual({ weightShiftPosition: 0.71, applied: true });
    // Same after closing and reopening the app.
    const reloaded = await loadApplied();
    expect(reloaded).toEqual(state);
  });

  it('applying the same category again replaces only that value', async () => {
    let state = await apply(await loadApplied(), 'long', 0.62);
    state = await apply(state, 'short', 0.71);
    state = await apply(state, 'long', 0.55);
    expect(stored()).toEqual({ version: 1, long: 0.55, short: 0.71 });
  });
});

describe('what the app uses on start', () => {
  it('uses a saved value for a category if there is one, else its default', async () => {
    store.set(APPLIED_KEY, JSON.stringify({ version: 1, short: 0.8 }));
    const state = await loadApplied();
    expect(state.settings).toEqual({ long: D.long, short: 0.8 });
  });

  it('uses both defaults when there is no saved entry', async () => {
    expect((await loadApplied()).settings).toEqual(emptyApplied().settings);
  });
});
