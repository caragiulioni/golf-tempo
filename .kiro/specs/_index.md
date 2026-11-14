# Spec Index

The ordered list of specs for the Golf Tempo Trainer. Keep this file current.

## How this works

- Every spec is listed here from the start. Full specs (requirements, design, tasks) are written just in time, when a spec is next in line.
- Two statuses per spec:
  - **Spec**: DONE once requirements, design and tasks all exist. Not started, or in progress, until then.
  - **Built**: DONE once the work is implemented and reviewed.
- Every spec ends with a "Porting notes" task that adds an entry to `docs/porting-guide.md`. A spec is not Built: DONE until that entry exists. Spec 6 also includes the final rewrite of the guide.
- Specs must not restate shared decisions. Refer to the steering files (`product.md`, `tech.md`, `structure.md`, `timing-engine.md`, `workflow.md`) instead.
- Write specs in order. If a spec has an unresolved blocker, resolve it or agree on a working assumption first.
- If a spec changes, update this index in the same step.

## Specs

### 1. timing-engine
- **Scope:** Preset data for Long Game (10 presets, including the slow practice ones up to 168/56) and Short Game, three-beat sequence, weight shift beat insertion from a normalized position (same relative position at every tempo), independent per-category settings, three-beat baseline mode, automated tests. Pure TypeScript, no UI or audio.
- **Depends on:** nothing.
- **Blockers:** none. Beat times were measured (`_references/tempo-measurements.md`). The reference plays beat 3 about 0.20 s later than its label; that was copied at first and removed in November 2026, so beat 3 now follows the label exactly (true 3:1 and 2:1, see `timing-engine.md`). Short Game slow presets wait on the brother's answer (`docs/client_questions.md`, Q1) and are not part of this spec.
- **Spec:** DONE (`.kiro/specs/timing-engine/`)
- **Built:** DONE

### 2. audio-playback
- **Scope:** Audio adapter interface, web implementation, web audio testing in desktop browsers plus iOS Safari and Android Chrome on real phones (handles the tap-to-unlock, silent switch and background-tab quirks), synthesized tones, a distinct weight shift sound, scheduling from the audio clock, start/stop/repeat, repeat pause that scales with tempo, restart-on-change behavior (stop, short pause, new run from beat 1, debounced), screen wake lock while playing, auto-pause when the page is hidden or the phone locks (resume needs a tap).
- **Depends on:** timing-engine.
- **Blockers:** none known. Needs real devices for Wave 2.3: an iPad (iOS Safari) and Android phones.
- **Spec:** DONE (`.kiro/specs/audio-playback/`)
- **Built:** DONE. Tested on Mac (Chrome 156), Pixel 6 (Chrome 157, including 30 minutes screen on) and iPad (Safari 16.6). Behavior on lock: stops (see `docs/development-decisions.md`, entry 1). Still open, not blocking: the brother's Android (real UI after spec 3; Audio lab log only if needed), and one check opened from an in-app browser such as Gmail's. Temporary test screen: `src/audio-lab/AudioLab.tsx`, mounted from the menu. Draft site: Netlify project `swing-tempo-beta` (draft deploys only, nothing on the main URL yet).

### 3. app-shell-ui
- **Scope:** Play/pause toggle in the Current session header (with an iOS silent-switch hint), header with a menu (CONFIG entry, a placeholder screen until spec 5, and light/dark toggle, see `docs/design-brief.md`, section 12), light/dark theme with the saved choice, one-time check that the app runs on a phone or simulator, project theme and visual identity, tempo badge, Long/Short toggle, preset buttons (two rows of five for Long Game, three by two for Short Game), playback controls with a playing state, beat/timeline visualization computed from the engine's beat times and animated from the audio schedule, responsive layout built from the design handoff in `_references/DESIGN/` (see `docs/design-brief.md`, section 12), bundled fonts, app icon and splash files, intro screen with logo, name and tagline ("Train Your Tempo. Transform Your Game.") that covers startup loading, shows for at least 2 s and can be skipped, with the wordmark as Michroma text (not an SVG), app name and tagline kept in one place for easy renaming (`src/ui/brand.ts`). A background loop switch is shown but inactive until spec 4. Temporary Audio lab item in the header menu next to CONFIG: moves the audio lab (now `src/audio-lab/AudioLab.tsx`, with its Copy log button) into the app as a stripped-down sub page, rebuilt with the shared components and theme tokens, using the app's real player. A developer tool, not part of the brother's testing: he tests the real UI, and only opens the lab (and taps Copy log) if we ask him to after he reports a problem. Label it so it reads as a testing tool (for example "Audio lab (testing)"). Kept in its own module (`src/audio-lab/AudioLab.tsx`) with one marked mount point (`src/app/AudioLabMount.tsx`); the menu item is temporary, the lab itself stays as a hidden Diagnostics page after the release (see spec 6). Web-only bits (clipboard, page address) get small guards so the lab can also run on native.
- **Depends on:** timing-engine, audio-playback.
- **Blockers:** none for the web build. Product name: build with "Swing Tempo" (decided for the build; kept in one place so renaming stays easy). Android adaptive icon (foreground and monochrome) and splash image are still missing; they only matter for the native app, so they are not a blocker for spec 3.
- **Spec:** DONE (`.kiro/specs/app-shell-ui/`)
- **Built:** DONE. Waves 3.1 to 3.10 built and reviewed. Known limitation (decided, not blocking): phone landscape (R7.3) does not fit without scrolling; about 40 pt too tall at 568x320. Options noted for later: two-column short-landscape layout, or a trimmed stack. The gold fill is faint against the bars (about 1.4:1), accepted. Still open, not blocking: iPad and Pixel output delay logs were reported as numbers only; desktop fallback (50 ms) is a placeholder.

### 4. background-loop
- **Scope:** One generated 808-style loop (kick, snare, hi-hat), locked to the tempo, with beat 1 on the start of a bar. On/off toggle, off by default. Plays in Long and Short Game. At slow tempos the hi-hat carries a steady pulse that lines up with the beeps.
- **Depends on:** audio-playback.
- **Blockers:** none known. Sound and pattern are tuned by ear.
- **Spec:** DONE (`.kiro/specs/background-loop/`)
- **Built:** DONE. Checked by ear on desktop; Pixel 6 (Chrome 157) and iPad (Safari 16.6) scheduled cleanly. Not formally rated: kick and level on phone speakers. Not rechecked by eye: timeline reset when toggling the loop while playing. History and audit: `docs/background-loop-audit-notes.md`.

### 5. config-mode
- **Scope:** Temporary CONFIG entry in the header menu, weight shift slider with a safe range (Long Game starts at 0.70, Short Game at 0.60), a background loop on/off choice while calibrating (the brother decides whether to calibrate with the loop on or off; the weight shift never sits on the drum grid, so the loop can pull his ear), independent Long/Short settings, immediate test playback (slider releases restart playback), visual position feedback, APPLY (saves one category at a time to local storage so normal mode uses it at every tempo), reset to default, yes/no confirmation dialog when leaving CONFIG with unapplied changes, JSON export of applied values with `weightShiftPosition` per category, and a short plain-language calibration guide for the brother (`docs/`, see `dev_questions.md` item 10). Lives inside the main app, not a separate branch. Isolated in its own module for easy removal.
- **Depends on:** timing-engine, audio-playback, app-shell-ui.
- **Blockers:** none known.
- **Spec:** DONE (`.kiro/specs/config-mode/`). Decided: slider plus − and + buttons, RESET does not save, config-mode logic has automated tests, export includes `exportedAt`, `applied` and `device`, an in-app How to was added.
- **Built:** Waves 5.1 to 5.5 built and reviewed; calibration guide (`docs/calibration-guide.md`) and porting notes written. Not DONE until the phone check (Wave 5.6, task 2: Mac, Pixel 6, iPad) is recorded in `docs/porting-guide.md`.

### 6. final-weight-shift-release
- **Scope:** Hard-code calibrated weight shift values into the engine, make weight shift playback permanent, remove CONFIG mode and stop reading (and delete) the saved applied values, remove the Audio lab menu item but keep the lab itself as a hidden Diagnostics page (decided), reachable only through a hidden gate such as `?lab=1` or a long-press on the logo, so it can be used to test audio on native phones and to collect logs, final checks, Netlify deploy.
- **Depends on:** config-mode and the calibration phase.
- **Blockers:** Calibration results from the brother.
- **Spec:** not started (written after calibration)
- **Built:** not started

## Not a spec

Project setup (create the Expo project, folders, test runner, fill in commands in `tech.md`) is a short task list done before spec 1.
