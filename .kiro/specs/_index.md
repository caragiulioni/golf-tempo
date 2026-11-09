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
- **Scope:** Preset data for Long and Short Game, three-beat sequence, fourth-beat insertion from a normalized position, independent per-category settings, three-beat baseline mode, automated tests. Pure TypeScript, no UI or audio.
- **Depends on:** nothing.
- **Blockers:** Measured Tour Tempo beat times per preset (`docs/dev_questions.md`, item 2). Slower presets wait on the brother's answer (`docs/client_questions.md`, Q8).
- **Spec:** not started
- **Built:** not started

### 2. audio-playback
- **Scope:** Audio adapter interface, web implementation, web audio testing in desktop browsers plus iOS Safari and Android Chrome on real phones (handles the tap-to-unlock, silent switch and background-tab quirks), synthesized tones, a distinct fourth-beat sound, scheduling from the audio clock, start/stop/repeat, repeat pause that scales with tempo, restart-on-change behavior (stop, short pause, new run from beat 1, debounced), auto-pause when the tab is hidden.
- **Depends on:** timing-engine.
- **Blockers:** none known.
- **Spec:** not started
- **Built:** not started

### 3. app-shell-ui
- **Scope:** Play/pause toggle in the Current session header (with an iOS silent-switch hint), light/dark theme toggle with the saved choice, one-time check that the app runs on a phone or simulator, project theme and visual identity, tempo badge, Long/Short toggle, preset buttons, playback controls, beat/timeline visualization synced to the audio schedule, responsive layout.
- **Depends on:** timing-engine, audio-playback.
- **Blockers:** none known.
- **Spec:** not started
- **Built:** not started

### 4. background-loop
- **Scope:** One generated 808-style loop, locked to the tempo, with beat 1 on the start of a bar. On/off toggle.
- **Depends on:** audio-playback.
- **Blockers:** Brother's answers on default state (Q6) and Short Game (Q7).
- **Spec:** not started
- **Built:** not started

### 5. config-mode
- **Scope:** Temporary CONFIG toggle, fourth-beat slider with a safe range, independent Long/Short settings, immediate test playback, visual position feedback, JSON export. Isolated in its own module for easy removal.
- **Depends on:** timing-engine, audio-playback, app-shell-ui.
- **Blockers:** Brother's answers on beat placement (Q1), relative position across tempos (Q5), which decides the export shape.
- **Spec:** not started
- **Built:** not started

### 6. final-four-beat-release
- **Scope:** Hard-code calibrated fourth-beat values into the engine, make four-beat playback permanent, remove CONFIG mode, final checks, Netlify deploy.
- **Depends on:** config-mode and the calibration phase.
- **Blockers:** Calibration results from the brother.
- **Spec:** not started (written after calibration)
- **Built:** not started

## Not a spec

Project setup (create the Expo project, folders, test runner, fill in commands in `tech.md`) is a short task list done before spec 1.
