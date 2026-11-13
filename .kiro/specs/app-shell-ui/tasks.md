# Implementation Plan: app-shell-ui

## Overview

Built bottom-up under `workflow.md`: pure libs, then theme and storage, shared components, static screens, a phone check, player hookup, timeline, audio lab move, output delay measurement, polish. Requirements are cited as R1 to R12 (`requirements.md`); design in `design.md`.

Conventions for every task:
- One concern, about 1 to 3 files. If it grows, split it.
- **Check** is stated up front. `[AUTO]` = Vitest/typecheck in the same task. `[MANUAL]` = a person looks or listens and reports what happened.
- UI tasks start with a **Reuse check** line (components in `src/ui/components/`, tokens in `src/theme/`: what is reused, extended or created, and why).
- Stop-for-review checkpoints close every wave and follow any timing or audio task. Do not start the next wave before review.
- No tests for UI or audio unless asked (`tech.md`). Pure libs get tests in the same task.

## Tasks

- [ ] 1. Wave 3.1: Pure libs (no UI). Goal: output delay and timeline geometry work and are tested.
  - [x] 1.1 Output delay function and test
    - Files: `src/ui/lib/outputDelay.ts`, `src/ui/lib/outputDelay.test.ts`, `vitest.config.mts` (widen `include` to `src/ui/lib/**/*.test.ts`).
    - Check [AUTO]: `npm test` passes. Reported value used; null/undefined/negative/NaN/Infinity fall to `baseLatencySeconds`, then to the platform constant; null info uses the constant; zero counts as reported; source labels correct. `npm run typecheck` passes.
    - _Requirements: 6.2, 6.3, 6.4, 6.6_
  - [x] 1.2 Timeline geometry and test
    - Files: `src/ui/lib/timelineGeometry.ts`, `src/ui/lib/timelineGeometry.test.ts`.
    - Check [AUTO]: for all 16 presets, x values strictly increase within 0..1, beat 1 at 0, beat 3 at 1, split at beat 2, diamond follows `weightShiftTime`, labels use the preset's frame counts, result changes with the preset, returns null when the engine gives no beat times.
    - _Requirements: 5.1, 5.11, 5.14_
  - [x] 1.3 Label overlap helper and test
    - Files: `src/ui/lib/timelineGeometry.ts`, `src/ui/lib/timelineGeometry.test.ts`.
    - Check [AUTO]: `labelsOverlap(widths, xs)` returns true/false for touching, overlapping and spaced cases; the short-form rule is covered.
    - _Requirements: 5.6, 7.6_
  - [ ] 1.4 Checkpoint - STOP FOR REVIEW (Wave 3.1)
    - Report: what changed, test output, what is next.

- [ ] 2. Wave 3.2: Theme, storage, fonts. Goal: tokens, saved theme choice and fonts available, no screens yet.
  - [ ] 2.1 Install dependencies
    - Run `npx expo install react-native-svg expo-font @expo-google-fonts/inter @expo-google-fonts/space-grotesk`, then pin exact versions in `package.json`.
    - Check [AUTO]: `npm run typecheck` passes; no `~` or `^` on the new packages.
    - _Requirements: 5.10, 8.1_
  - [ ] 2.2 Storage wrapper and theme choice
    - Files: `src/storage/storage.ts`, `src/storage/themeChoice.ts`, `src/storage/index.ts`.
    - Check [AUTO]: typecheck passes. [MANUAL] in the browser console or a throwaway call: save "dark", reload, load returns "dark"; a bad stored value and a read error return null; a write error does not throw. Key is `golf-tempo:theme:v1`.
    - _Requirements: 1.4, 1.5, 1.6_
  - [ ] 2.3 Theme tokens
    - Files: `src/theme/tokens.ts`, `src/theme/index.ts`.
    - Reuse check: `src/theme/` holds only a README; ported from `_references/DESIGN/tokens.css`. Adds timeline tokens, breakpoints and `layoutSizes`.
    - Check [AUTO]: typecheck passes. [MANUAL] compare light/dark values against `tokens.css` and the timeline tokens against the brief.
    - _Requirements: 1.1, 1.8, 5.9, 7.1_
  - [ ] 2.4 ThemeProvider and layout/motion hooks
    - Files: `src/theme/ThemeProvider.tsx`, `src/ui/hooks/useLayout.ts`, `src/ui/hooks/useReduceMotion.ts`.
    - Reuse check: new, nothing to reuse yet.
    - Check [MANUAL]: with a throwaway view, effective mode is saved choice else device; device change is followed only while nothing is saved; `useLayout` returns phone/tablet/laptop at 699/700/1099/1100 and flags short landscape.
    - _Requirements: 1.2, 1.3, 1.7, 7.1, 7.2_
  - [ ] 2.5 Checkpoint - STOP FOR REVIEW (Wave 3.2)

- [ ] 3. Wave 3.3: Shared components. Goal: every UI piece exists once in `src/ui/components/`, shown on a throwaway gallery.
  - [ ] 3.1 AppText, Icon set, IconButton
    - Files: `src/ui/components/AppText.tsx`, `Icon.tsx`, `IconButton.tsx`.
    - Reuse check: `src/ui/components/` has only a README; create these as the base all others use.
    - Check [MANUAL]: all variants render in light and dark; IconButton is at least 44 x 44; icons: play, pause, check, menu, back.
    - _Requirements: 1.1, 7.5, 7.7_
  - [ ] 3.2 Brand constants, Wordmark, Header
    - Files: `src/ui/brand.ts`, `src/ui/components/Wordmark.tsx`, `Header.tsx`.
    - Reuse check: reuses AppText and IconButton; creates Wordmark and Header.
    - Check [MANUAL]: header shows wordmark left and menu button right only, at 320 and 1920 widths; changing `APP_NAME` changes the wordmark.
    - _Requirements: 2.1, 2.8, 8.5_
  - [ ] 3.3 Menu and MenuItem
    - Files: `src/ui/components/Menu.tsx`, `MenuItem.tsx`.
    - Reuse check: reuses AppText and IconButton; creates the overlay/dropdown.
    - Check [MANUAL]: opens, closes on item, outside tap and Escape; focus returns to the menu button; 44 pt rows; accessible label.
    - _Requirements: 2.6, 2.7_
  - [ ] 3.4 SegmentedControl, PresetButton, PresetGrid
    - Files: `src/ui/components/SegmentedControl.tsx`, `PresetButton.tsx`, `PresetGrid.tsx`.
    - Reuse check: reuses AppText and Icon (check); creates three components.
    - Check [MANUAL]: check mark on the selected option only; grid takes a column count (5 or 3) and wraps; "168/56" fits at 320 and 360 without wrapping.
    - _Requirements: 3.1, 3.3, 3.4, 3.8, 3.11_
  - [ ] 3.5 SectionLabel, Badge, Card
    - Files: `src/ui/components/SectionLabel.tsx`, `Badge.tsx`, `Card.tsx`.
    - Reuse check: `Badge` is one component with tempo and ratio variants; reuses AppText.
    - Check [MANUAL]: "30 / 10" and "3 : 1" render; card radius is 28 on phone and 40 at 700 and up.
    - _Requirements: 3.9, 1.8_
  - [ ] 3.6 PlayButton, StatusMessage, Switch
    - Files: `src/ui/components/PlayButton.tsx`, `StatusMessage.tsx`, `Switch.tsx`.
    - Reuse check: reuses Icon and AppText; Switch is new and has no press feedback.
    - Check [MANUAL]: play/pause icon and labels "Play"/"Pause"; sizes 96 / 120 / 128; disabled Switch exposes role switch, off value, disabled state and shows no pressed or hover change.
    - _Requirements: 4.1, 4.4, 4.5, 12.2, 12.3, 12.5, 12.6_
  - [ ] 3.7 Checkpoint - STOP FOR REVIEW (Wave 3.3)

- [ ] 4. Wave 3.4: First screens, no audio. Goal: intro, main screen layout and menu work in the browser.
  - [ ] 4.1 Intro screen and startup gate
    - Files: `src/app/IntroScreen.tsx`, `src/app/App.tsx`.
    - Reuse check: reuses Wordmark/AppText and `brand.ts`; intro colors come from a small `introColors` helper in `src/theme/`.
    - Check [MANUAL]: intro shows at least 1000 ms and stays while loading; tap before load waits for load; tap after load leaves within 500 ms; forced font and storage failures reach the main screen by 3 s; no wrong-theme flash on reload; reduce motion gives no fade; no audio context created.
    - _Requirements: 1.4, 8.2, 8.3, 8.4, 9.1 to 9.10_
  - [ ] 4.2 Main screen layout with selection state
    - Files: `src/app/MainScreen.tsx`, `src/app/App.tsx`.
    - Reuse check: reuses Header, SegmentedControl, PresetGrid, Badge, Card, SectionLabel, PlayButton (not wired); creates nothing new unless a gap shows.
    - Check [MANUAL]: Long shows 2 rows of 5, Short 3 x 2 from engine data; start 30/10 and 24/12; each category remembers its preset; resize across 700 and 1100 keeps selection; no clipping at 320 and 360.
    - _Requirements: 3.1 to 3.9, 3.11, 7.1, 7.2, 7.4_
  - [ ] 4.3 Menu wiring and Config placeholder
    - Files: `src/app/App.tsx`, `src/app/ConfigPlaceholder.tsx`.
    - Reuse check: reuses Menu, MenuItem, Header, IconButton; placeholder uses AppText.
    - Check [MANUAL]: three items in order Config, Dark/Light mode, Audio lab (testing); theme switch within 100 ms and survives reload; Config shows title and a working return control; Escape/outside tap leave screen and theme unchanged. Lab item is present but only closes the menu until Wave 3.8.
    - _Requirements: 1.3, 2.2, 2.3, 2.4, 2.7_
  - [ ] 4.4 Inactive loop switch
    - Files: `src/app/MainScreen.tsx`.
    - Reuse check: reuses Switch and AppText.
    - Check [MANUAL]: always off on load, visibly disabled in light and dark; press does nothing, no storage write, no feedback; other controls unaffected.
    - _Requirements: 12.1 to 12.7_
  - [ ] 4.5 Checkpoint - STOP FOR REVIEW (Wave 3.4, end of first UI wave)

- [ ] 5. Wave 3.5: One-time phone check. Goal: know whether the app opens on a phone.
  - [x] 5.1 Expo Go phone check **[MANUAL, user does the device part]**
    - Run `npm start`, open on a real phone through Expo Go (simulator or emulator only if no phone). Record device model, OS version, real/simulator/emulator, what worked and what did not in `docs/porting-guide.md`. If it fails to open, record the reason and error and mark "untested on native".
    - Check [MANUAL]: first screen renders with no crash or red screen; entry exists. Exactly one such check in this spec.
    - _Requirements: 11.1, 11.2, 11.3_
  - [ ] 5.2 Checkpoint - STOP FOR REVIEW (Wave 3.5)

- [ ] 6. Wave 3.6: Player hookup. Goal: play, pause and restart on change work from the real UI.
  - [ ] 6.1 Player session hook and play button
    - Files: `src/ui/hooks/usePlayerSession.ts`, `src/app/MainScreen.tsx`.
    - Reuse check: reuses PlayButton and StatusMessage.
    - Check [MANUAL, listen]: play starts from beat 1 with three beeps plus weight shift sound; second press stops; one shared Player; failed start shows the "tap to try again" message and stays stopped.
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.7_
  - [ ] 6.2 Paused message and silent-switch hint
    - Files: `src/ui/hooks/usePlayerSession.ts`, `src/app/MainScreen.tsx`.
    - Reuse check: reuses StatusMessage.
    - Check [MANUAL]: hide the tab: message "paused, tap to resume" stays until a tap or play; hint shows on iPhone/iPad (iPadOS included) only.
    - _Requirements: 4.6, 4.8_
  - [ ] 6.3 Restart on selection change
    - Files: `src/ui/hooks/usePlayerSession.ts`.
    - Check [MANUAL, listen]: changing preset or category while playing restarts once per change from beat 1; nothing happens while stopped; no restart on first render.
    - _Requirements: 3.10_
  - [ ] 6.4 Checkpoint - STOP FOR REVIEW (Wave 3.6, audio)

- [ ] 7. Wave 3.7: Beat timeline. Goal: lights and playhead follow the audio schedule.
  - [ ] 7.1 Static timeline (idle state)
    - Files: `src/ui/components/BeatTimeline.tsx`, `src/app/MainScreen.tsx`.
    - Reuse check: reuses AppText, Card/tokens and `timelineGeometry`; BeatTimeline is new. Grid via `react-native-svg`.
    - Check [MANUAL]: dark container with grid in both modes; diamond for weight shift, other markers non-diamond; four text labels; `BACKSWING · n` / `DOWN · n` split at beat 2; geometry changes per preset.
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.9, 5.10, 5.11, 5.14_
  - [ ] 7.2 Label fit
    - Files: `src/ui/components/BeatTimeline.tsx`.
    - Reuse check: reuses `labelsOverlap`.
    - Check [MANUAL]: all presets (18/6 to 168/56) at 320, 360 and 1280: labels visible, untruncated, not overlapping; Short Game phone shows "Shift". Report whether the short label is accepted.
    - _Requirements: 5.6, 7.6_
  - [ ] 7.3 Playhead and marker lighting from the audio schedule
    - Files: `src/ui/components/BeatTimeline.tsx`, `src/ui/hooks/usePlayerSession.ts`.
    - Check [MANUAL, watch and listen]: playhead sweeps once per swing; each marker lights with its beep (no separate timer, uses swing times and `adapter.now()`); lit = larger (1.25x or more) and filled; stop/pause clears all within 100 ms; no stuck lights after preset change.
    - _Requirements: 5.4, 5.8, 5.13_
  - [ ] 7.4 Weight shift pulse and reduce motion
    - Files: `src/ui/components/BeatTimeline.tsx`.
    - Check [MANUAL]: 300 ms gold pulse once per swing on the diamond; with reduce motion on, no sweep or pulse and the diamond is solid gold while active.
    - _Requirements: 5.7, 5.12_
  - [ ] 7.5 Checkpoint - STOP FOR REVIEW (Wave 3.7, timing)

- [ ] 8. Wave 3.8: Audio lab move. Goal: lab runs inside the app on the real Player; old file gone.
  - [ ] 8.1 Rebuild the lab in `src/audio-lab/`
    - Files: `src/audio-lab/AudioLab.tsx`, plus a `Button` variant in `src/ui/components/` only if nothing fits.
    - Reuse check: reuse PresetButton, Card, SectionLabel, IconButton (back, 44 pt), StatusMessage; extend before creating. Use the shared Player and adapter from `usePlayerSession`; no own `AudioContext`.
    - Check [MANUAL, listen]: lab plays through the real Player; labelled "Audio lab (testing)"; back control returns to main with category and preset kept and lab audio stopped.
    - _Requirements: 10.1 to 10.4_
  - [ ] 8.2 Web guards and Copy log
    - Files: `src/audio-lab/AudioLab.tsx`.
    - Check [MANUAL]: Copy log copies the full text and shows confirmation; with the clipboard blocked, text stays visible and selectable with an error shown. Every `navigator`, `location`, `document` use is behind `Platform.OS === 'web'`; unavailable features are hidden or shown disabled with a reason.
    - _Requirements: 10.5, 10.6, 10.8_
  - [ ] 8.3 Mount point and old file removal
    - Files: `src/app/AudioLabMount.tsx`, `src/app/App.tsx`, delete `src/app/dev/AudioLab.tsx`.
    - Check [AUTO]: `npm run typecheck` and `npx expo export --platform web` pass; no import of the old path; only `AudioLabMount` imports the lab; mount point is marked. [MANUAL] the menu item opens the lab within 300 ms; the main run stops on entering the lab.
    - _Requirements: 2.5, 10.1, 10.7_
  - [ ] 8.4 Checkpoint - STOP FOR REVIEW (Wave 3.8, audio)

- [ ] 9. Wave 3.9: Output delay. Goal: visuals land with what is heard, constants set from measurements.
  - [ ] 9.1 Apply delay to visuals and log it
    - Files: `src/ui/hooks/usePlayerSession.ts`, `src/ui/components/BeatTimeline.tsx`.
    - Check [MANUAL]: each swing writes one lab log line `Output delay NNN ms (reported|fallback)`; a changed value applies from the next swing only; lights are not early against the beeps on Mac.
    - _Requirements: 6.1, 6.5, 6.7_
  - [ ] 9.2 Measure the fallback delay **[MANUAL, user does the device part]**
    - User runs the app on the iPad (Safari 16.6) and the Pixel 6 (reports about 280 ms), plays several presets, and copies the lab log from each. Agent reads the logs, then sets the iOS and Android constants in `src/ui/lib/outputDelay.ts` and records device model, browser version and values in `docs/porting-guide.md`.
    - Check [MANUAL]: on both devices the lights land with the beeps by ear and eye (within about 20 ms); [AUTO] `npm test` still passes with the new constants.
    - _Requirements: 6.1, 6.3, 6.8_
  - [ ] 9.3 Checkpoint - STOP FOR REVIEW (Wave 3.9, timing and audio)

- [ ] 10. Wave 3.10: Polish and wrap-up. Goal: spec checked on all sizes, documented, marked done.
  - [ ] 10.1 Responsive pass **[MANUAL]**
    - Fix only layout issues found. Check: 320, 360, 700, 1100, 1920 widths; phone landscape 568x320 to 932x430 shows play button and timeline without vertical scroll; no horizontal scroll; every tap target 44 or more; min text sizes per brief sections 8 and 12.
    - _Requirements: 7.1 to 7.5_
  - [ ] 10.2 Accessibility and motion pass **[MANUAL]**
    - Fix only issues found. Check: labels and roles, focus order, contrast (labels 4.5:1, markers 3:1), reduce motion on intro and timeline, offline fonts, Michroma used only for the wordmark text.
    - _Requirements: 5.5, 8.1, 8.5, 9.8_
  - [ ] 10.3 Porting notes
    - Files: `docs/porting-guide.md` (one entry, existing format).
    - Check [MANUAL]: exactly one entry with three groups (web-only, expected to carry over, untested on native), each item with a file path, plain language, "expected to work" or "untested" unless run on a device, phone-check and delay results referenced.
    - _Requirements: 11.4, 11.5, 11.6_
  - [ ] 10.4 Update index and structure docs
    - Files: `.kiro/specs/_index.md` (spec 3: Spec DONE; Built DONE after review), `.kiro/steering/structure.md` (add `src/audio-lab/`, note `src/ui/lib` and `src/ui/hooks`).
    - Check [MANUAL]: both files match what exists on disk; `npm run typecheck`, `npm test` and `npx expo export --platform web` pass.
    - _Requirements: 10.7, 11.4_
  - [ ] 10.5 Final checkpoint - STOP FOR REVIEW (Wave 3.10)

## Notes

- Manual-check tasks are marked **[MANUAL]**. Device steps by the user are marked "user does the device part".
- The temporary gallery (`src/app/dev/Gallery.tsx`) is a component showcase, not the real layout, so repeats on it are expected. It is deleted in Wave 3.4 (task 4.2).
- The old audio lab opened from the gallery has no back control. The real back control (44 pt, R10.1) is built in task 8.1, and the old lab is replaced in 8.3.
- TODO (wording, temporary): the silent-switch hint "No sound? Check your silent switch." does not fit iPads, which often have no switch (the tester's iPad has only volume buttons and a top button). Improve the text, for example "No sound? Check silent mode, mute in Control Center and the volume." Revisit in task 10.2 and confirm on the iPad and an iPhone. Text is in `src/app/MainScreen.tsx` (R4.8 wording would change too).
- No optional (`*`) tasks: engine-style tests are required in 1.1 to 1.3. No property tests, since the design has no Correctness Properties section.
- Plan can change as we learn; any change is reported at the next stop.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "2.1"] },
    { "id": 1, "tasks": ["1.3", "2.2", "2.3"] },
    { "id": 2, "tasks": ["2.4"] },
    { "id": 3, "tasks": ["3.1"] },
    { "id": 4, "tasks": ["3.2", "3.3", "3.4", "3.5", "3.6"] },
    { "id": 5, "tasks": ["4.1"] },
    { "id": 6, "tasks": ["4.2"] },
    { "id": 7, "tasks": ["4.3", "4.4"] },
    { "id": 8, "tasks": ["5.1"] },
    { "id": 9, "tasks": ["6.1"] },
    { "id": 10, "tasks": ["6.2"] },
    { "id": 11, "tasks": ["6.3"] },
    { "id": 12, "tasks": ["7.1"] },
    { "id": 13, "tasks": ["7.2"] },
    { "id": 14, "tasks": ["7.3"] },
    { "id": 15, "tasks": ["7.4"] },
    { "id": 16, "tasks": ["8.1"] },
    { "id": 17, "tasks": ["8.2"] },
    { "id": 18, "tasks": ["8.3"] },
    { "id": 19, "tasks": ["9.1"] },
    { "id": 20, "tasks": ["9.2"] },
    { "id": 21, "tasks": ["10.1", "10.2"] },
    { "id": 22, "tasks": ["10.3"] },
    { "id": 23, "tasks": ["10.4"] }
  ]
}
```
