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
- **Blockers:** Measured Tour Tempo beat times per preset (`docs/dev_questions.md`, open item 2), or agree to use calculated times plus a fixed beat 3 delay. Short Game slow presets wait on the brother's answer (`docs/client_questions.md`, Q1). This does not block the rest of the engine.
- **Spec:** not started
- **Built:** not started

### 2. audio-playback
- **Scope:** Audio adapter interface, web implementation, web audio testing in desktop browsers plus iOS Safari and Android Chrome on real phones (handles the tap-to-unlock, silent switch and background-tab quirks), synthesized tones, a distinct weight shift sound, scheduling from the audio clock, start/stop/repeat, repeat pause that scales with tempo, restart-on-change behavior (stop, short pause, new run from beat 1, debounced), screen wake lock while playing, auto-pause when the page is hidden or the phone locks (resume needs a tap).
- **Depends on:** timing-engine.
- **Blockers:** none known.
- **Spec:** not started
- **Built:** not started

### 3. app-shell-ui
- **Scope:** Play/pause toggle in the Current session header (with an iOS silent-switch hint), header with a menu (CONFIG entry and light/dark toggle, see `docs/design-brief.md`, section 12), light/dark theme with the saved choice, one-time check that the app runs on a phone or simulator, project theme and visual identity, tempo badge, Long/Short toggle, preset buttons (two rows of five for Long Game, three by two for Short Game), playback controls with a playing state, beat/timeline visualization computed from the engine's beat times and animated from the audio schedule, responsive layout built from the design handoff in `_references/DESIGN/` (see `docs/design-brief.md`, section 12), bundled fonts, app icon and splash files, intro screen with logo, name and tagline ("Train Your Tempo. Transform Your Game.") that covers startup loading and can be skipped, app name and tagline kept in one place for easy renaming.
- **Depends on:** timing-engine, audio-playback.
- **Blockers:** Product name undecided ("Swing Sync" is taken; "Swing Tempo" is the current candidate, see `docs/design-brief.md`, section 12). Adaptive icon and splash files missing.
- **Spec:** not started
- **Built:** not started

### 4. background-loop
- **Scope:** One generated 808-style loop (kick, snare, hi-hat), locked to the tempo, with beat 1 on the start of a bar. On/off toggle, off by default. Plays in Long and Short Game. At slow tempos the hi-hat carries a steady pulse that lines up with the beeps.
- **Depends on:** audio-playback.
- **Blockers:** none known. Sound and pattern are tuned by ear.
- **Spec:** not started
- **Built:** not started

### 5. config-mode
- **Scope:** Temporary CONFIG entry in the header menu, weight shift slider with a safe range (Long Game starts near 0.67, Short Game near 0.75), independent Long/Short settings, immediate test playback (slider releases restart playback), visual position feedback, APPLY (saves one category at a time to local storage so normal mode uses it at every tempo), reset to default, yes/no confirmation dialog when leaving CONFIG with unapplied changes, JSON export of applied values with `weightShiftPosition` per category, and a short plain-language calibration guide for the brother (`docs/`, see `dev_questions.md` item 10). Lives inside the main app, not a separate branch. Isolated in its own module for easy removal.
- **Depends on:** timing-engine, audio-playback, app-shell-ui.
- **Blockers:** none known.
- **Spec:** not started
- **Built:** not started

### 6. final-weight-shift-release
- **Scope:** Hard-code calibrated weight shift values into the engine, make weight shift playback permanent, remove CONFIG mode and stop reading (and delete) the saved applied values, final checks, Netlify deploy.
- **Depends on:** config-mode and the calibration phase.
- **Blockers:** Calibration results from the brother.
- **Spec:** not started (written after calibration)
- **Built:** not started

## Not a spec

Project setup (create the Expo project, folders, test runner, fill in commands in `tech.md`) is a short task list done before spec 1.
