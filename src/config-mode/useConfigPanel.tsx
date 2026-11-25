// The Configure weight shift panel's state, and the panel itself, for the main screen (V2-09).
// Replaces the old Config screen. Called once, from MainScreen, through src/app/ConfigMount.tsx.
// TEMPORARY: the whole src/config-mode/ folder is deleted in spec 6.
//
// Two values per game, as before: `drafts` is what the slider shows and the scale draws (it moves
// during a drag); `committed` is what the Player plays (it changes when you let go, or press a key,
// − or +), so a drag never restarts the audio. Both start at the saved values and go back to them
// when a change is discarded.
import React, { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_WEIGHT_SHIFT_POSITIONS, WEIGHT_SHIFT_RANGE, withPosition } from '../engine';
import type { Category, Preset, WeightShiftSettings } from '../engine';
import { ConfirmDialog } from '../ui/components';
import { CATEGORY_NAME } from '../ui/lib/categoryUi';
import { snapToStep } from '../ui/lib/snapToStep';
import { ConfigPanel, SLIDER_STEP } from './ConfigPanel';
import type { AppliedSettingsApi } from './useAppliedSettings';
const CLOSE_TITLE = "You have changes you haven't applied. Close without applying?";
const switchTitle = (next: Category) =>
  `You have changes you haven't applied. Switch to ${CATEGORY_NAME[next]} without applying?`;
/** Positions are steps of 0.01, so anything closer than this is the same value. */
const same = (a: number, b: number) => Math.abs(a - b) < 1e-9;
type Dialog = { kind: 'close' } | { kind: 'switch'; next: Category; proceed: () => void } | null;
type Args = {
  category: Category;
  /** The tempo chosen on the main screen: the one the panel configures. */
  selected: Preset;
  applied: AppliedSettingsApi;
  /** Called when the panel has just been opened, so the screen can scroll it into view. */
  onOpened?: () => void;
};
export type ConfigPanelApi = {
  /** What the Player plays: changes when you let go of the slider. */
  playSettings: WeightShiftSettings;
  /** What the scale draws: moves with the slider. */
  drawSettings: WeightShiftSettings;
  /** Calls `proceed`, after asking first if the open panel has changes that are not applied. */
  requestCategoryChange: (next: Category, proceed: () => void) => void;
  /** The label, the panel and the confirmation dialog. Put it last on the main screen. */
  panel: ReactNode;
};
export function useConfigPanel({ category, selected, applied, onOpened }: Args): ConfigPanelApi {
  const saved = applied.state.settings;
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState<WeightShiftSettings>(saved);
  const [committed, setCommitted] = useState<WeightShiftSettings>(saved);
  const [dialog, setDialog] = useState<Dialog>(null);
  // A saved value changed (APPLY, or the saved values finished loading): the sliders follow it.
  const previousSaved = useRef(saved);
  useEffect(() => {
    const before = previousSaved.current;
    previousSaved.current = saved;
    (['long', 'short'] as const).forEach((c) => {
      if (same(before[c], saved[c])) return;
      setDrafts((d) => withPosition(d, c, saved[c]));
      setCommitted((d) => withPosition(d, c, saved[c]));
    });
  }, [saved]);
  const unapplied = !same(drafts[category], saved[category]);
  const neverApplied = !applied.state.applied[category];
  const discard = () => {
    setDrafts(saved);
    setCommitted(saved);
  };
  const onSliderChange = (value: number) => setDrafts((d) => withPosition(d, category, value));
  const onSliderEnd = (value: number) => {
    setDrafts((d) => withPosition(d, category, value));
    setCommitted((c) => withPosition(c, category, value));
  };
  const nudge = (direction: 1 | -1) =>
    onSliderEnd(
      snapToStep(drafts[category] + direction * SLIDER_STEP, WEIGHT_SHIFT_RANGE.min, WEIGHT_SHIFT_RANGE.max, SLIDER_STEP),
    );
  const toggleOpen = () => {
    if (!open) {
      setOpen(true);
      onOpened?.();
    } else if (unapplied) setDialog({ kind: 'close' });
    else setOpen(false);
  };
  const requestCategoryChange = (next: Category, proceed: () => void) => {
    if (next !== category && open && unapplied) setDialog({ kind: 'switch', next, proceed });
    else proceed();
  };
  const panel = (
    <>
      <ConfigPanel
        open={open}
        onToggle={toggleOpen}
        category={category}
        selected={selected}
        draft={drafts[category]}
        saved={saved[category]}
        neverApplied={neverApplied}
        unapplied={unapplied}
        onSliderChange={onSliderChange}
        onSliderEnd={onSliderEnd}
        onNudge={nudge}
        onApply={() => applied.apply(category, drafts[category])}
        onReset={() => onSliderEnd(DEFAULT_WEIGHT_SHIFT_POSITIONS[category])}
      />
      <ConfirmDialog
        visible={dialog !== null}
        title={dialog?.kind === 'switch' ? switchTitle(dialog.next) : CLOSE_TITLE}
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onConfirm={() => {
          const current = dialog;
          setDialog(null);
          discard();
          if (current?.kind === 'switch') current.proceed();
          else setOpen(false);
        }}
        onCancel={() => setDialog(null)}
      />
    </>
  );
  return { playSettings: committed, drawSettings: drafts, requestCategoryChange, panel };
}
