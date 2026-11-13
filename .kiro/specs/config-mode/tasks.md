# Tasks: config-mode

Follows `.kiro/steering/workflow.md`. Stop for review at the end of every wave, and after any task that touches timing or audio. UI tasks open with a Reuse check (list `src/ui/components/` and `src/theme/`, decide reuse, extend or create).

Status: plan approved (reset does not save, nudge buttons in, config-mode tests in, export extras in, restart only while playing, loop starts off). In-app How to added as 5.5 task 4. Working through the waves.

## Wave 5.1: Saved values and export text (pure logic, no UI)

- [x] 1. Spec docs. Check: requirements, design and tasks exist and `_index.md` spec 5 says Spec: DONE. (Done with this plan.)
- [x] 2. `src/config-mode/appliedSettings.ts`, `appliedSettings.test.ts`, add `src/config-mode/**/*.test.ts` to `vitest.config.mts`. Check: `npm test` passes. Tests: missing, empty, invalid JSON, non-object, unknown version give both defaults; NaN, string, below 0.05 and above 0.95 values fall back for that category only; a good value is kept; `mergeApplied` for one category keeps the other; serialize then parse round-trips; result is always inside the safe range.
- [x] 3. `src/config-mode/exportText.ts`, `exportText.test.ts`. Check: `npm test` passes (Wave 5.1 result: 13 files, 321 tests pass, typecheck clean). Tests: JSON parses; has `configVersion`, `exportedAt`, both categories; `applied` is false for a never-applied category and the position is the default; `device` appears only when given; unapplied drafts are not an input, so cannot appear.

Stop for review.

## Wave 5.2: Normal mode uses applied values (no CONFIG UI yet)

- [x] 1. `src/config-mode/appliedStorage.ts`, `src/config-mode/useAppliedSettings.ts`, `src/app/ConfigMount.tsx` (hook re-export only for now). Check: `npm run typecheck` passes; with the hook not yet used, nothing changes in the app.
- [x] 2. Wire it in: `src/app/App.tsx` (call the hook, add to the load gate, pass `settings` down), `src/app/MainScreen.tsx` (prop to the hook and `BeatTimeline`), `src/ui/hooks/usePlayerSession.ts` (`settings` in `SessionSelection` and `swingOptionsFor`). Check in the browser, by writing the Saved_Key in dev tools: `{"version":1,"long":0.8}` then reload. Long game timeline diamond sits near 80 % and the weight shift beep comes late in the backswing at 30/10 and at 168/56; Short game still at 0.60; no saved value, corrupted text, or `{"version":1,"long":5}` all show the defaults (0.50 and 0.60); no console errors; app starts with the intro as before.

Result: typecheck, 321 tests and the web export pass. The browser and listening check is for the reviewer (below).

Stop for review (touches playback).

## Wave 5.3: New shared components

- [x] 1. `Slider` in `src/ui/components/`, plus theme tokens if needed (built: `Slider.tsx`, token `sliderSize`, pure `src/ui/lib/snapToStep.ts` with tests; demo on the Config placeholder, deleted in Wave 5.4 task 2). Typecheck and 327 tests pass; manual check below still to be done by the user. Reuse check first. Check [MANUAL], on the placeholder screen temporarily: drag moves the thumb and fires `onChange`; release fires `onChangeEnd` once; arrow keys step by 0.01; screen reader announces the value; thumb touch area at least 44 pt; works in light and dark and at 320 pt wide; clamps at the ends. Temporary demo code is removed afterwards.
- [x] 2. (Built: `Button.tsx`, no new tokens.) `Button` in `src/ui/components/` (primary, secondary, disabled). Reuse check first (look at `PresetButton`, `IconButton`, `PlayButton`; extend one if it fits). Check [MANUAL]: all variants and the disabled state in light and dark; at least 44 pt tall; focus ring; label wraps safely at 320 pt.
- [x] 3. (Built: `Overlay.tsx`, `Menu.tsx` imports it.) Extract `Overlay` from `src/ui/components/Menu.tsx` into `Overlay.tsx` and export it. Check [MANUAL]: the menu opens and closes as before (outside tap, Escape, item press, focus returns to the menu button).
- [x] 4. (Built: `ConfirmDialog.tsx`, tokens `scrim` and `dialogMaxWidth`.) `ConfirmDialog` in `src/ui/components/` on top of `Overlay`. Check [MANUAL]: title, Yes and No; Escape and outside tap act as No; focus moves into the dialog and back; text readable in light and dark. Shown from a temporary trigger, removed afterwards.
- [x] 5. (Built: `minus` and `plus` in `Icon.tsx`.) (Only if nudge buttons are approved) `minus` and `plus` icons in `Icon.tsx`. Check [MANUAL]: both render in light and dark at the `IconButton` size.

All five built and demoed on the Config placeholder (Menu > Config), which is deleted in Wave 5.4. Typecheck, 327 tests and web export pass. Manual checks are for the reviewer.

Stop for review.

## Wave 5.4: Config screen and test playback

- [ ] 1. `usePlayerSession(selection, { active })`, and `MainScreen` passes `active` from `App`. Check [MANUAL, listen]: main screen unchanged with `active` true: play, change preset while playing restarts once, loop toggle restarts once. With `active` false (set by hand to test): no restart and no start.
- [ ] 2. `src/config-mode/ConfigScreen.tsx` (no playback yet), mounted through `ConfigMount.tsx`; delete `ConfigPlaceholder.tsx`. Layout: back, Long/Short control, preset grid, timeline, slider and readout (and nudges if approved). Check [MANUAL]: dragging moves the (white) weight shift diamond live; readout shows percent and seconds and the seconds change with the preset; Long and Short keep separate drafts; starts from main's category and preset; back returns without a dialog yet; 320 pt, tablet, laptop, light and dark all fit.
- [ ] 3. Playback in Config: `PlayButton`, loop `Switch`, committed values for restart on release. Check [MANUAL, listen] desktop: play at 30/10, drag (no restart during drag), release (one restart with a short pause, new run from beat 1, beep moved to the new place); preset change and loop toggle restart once; stopped release does not start; entering Config stops main's run; leaving stops Config's run; main screen playback afterwards is unaffected.

Stop for review (audio).

## Wave 5.5: APPLY, reset, leave dialog, export

- [ ] 1. APPLY, reset and the saved status line. Check [MANUAL]: APPLY saves the chosen category only (check Long, then Short, in dev tools or by reload); disabled when nothing to apply; reload, then main screen plays with the value at several tempos in that category and the other category is unchanged; reset moves the slider to 0.50 (Long) or 0.60 (Short) and shows "Not applied yet" until APPLY; APPLY during playback does not restart it.
- [ ] 2. Leave confirmation. Check [MANUAL]: no dialog when clean; with Long changed, with Short changed, and with both, back shows the dialog; No stays with drafts intact; Yes leaves and the drafts are gone on reopening; Escape acts as No; main screen unchanged after Yes.
- [ ] 3. EXPORT and Copy. Check [MANUAL]: JSON shows both categories with the saved values and `applied` flags; an unapplied draft is not in it and a note is shown; Copy works on desktop Chrome and the pasted text parses; blocked clipboard shows the select-by-hand hint.

- [ ] 4. In-app How to (R11): `HOW_TO_STEPS` constant and a collapsible block at the top of `ConfigScreen`. Reuse check first (`Card`, `SectionLabel`, `AppText`). Check [MANUAL]: reads clearly in light and dark, button names match the screen, closed by default after first read is not required; slider visible at 568 pt tall when closed.

Stop for review.

## Wave 5.6: Guide, phone check, porting notes

- [ ] 1. `docs/calibration-guide.md` for the brother (R10.1). First verify the Safari saved-data rule with a source and link it. Check: reads in plain language with exact button names as on screen, and each step can be followed on his phone.
- [ ] 2. Phone check [MANUAL] on Mac Chrome, Pixel 6 and iPad Safari (real devices): slider usable by touch; value survives reload; export copy works or the manual hint appears; playback restart on release sounds right. Record per device (model, browser version) in `docs/porting-guide.md`. The brother's own phone is a later, separate check.
- [ ] 3. Porting notes: add an entry to `docs/porting-guide.md` in its format (web-only: clipboard and user agent in the export, `onKeyDown` in `Slider`, `Overlay` Escape handling; unchanged: storage wrapper, pure logic, screen; untested on native). Update `_index.md` spec 5 Built, `structure.md` (Mount_Point name, `ConfigPlaceholder` gone), `src/ui/components/README.md` and `src/config-mode/README.md`.

Stop for review.
