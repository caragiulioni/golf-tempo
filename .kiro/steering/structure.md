# Project Structure

Current layout. The Expo project is set up at the repo root. Most folders under `src/` have a README. `config-mode/` is still empty until its spec is built.

```
index.ts         Expo entry point. Registers src/app/App.tsx.
app.json         Expo app config.
package.json     Dependencies (exact versions) and scripts.
vitest.config.mts  Test runner config. Covers src/engine, src/ui/lib and src/theme.
assets/          Icons and splash images from the Expo template.
src/
  engine/        Pure TypeScript timing engine. No React, no DOM, no audio APIs.
  audio/         Audio adapter interface plus web implementation (native later).
                 Tone synthesis and the 808 loop live here.
  audio-lab/     AudioLab.tsx: temporary Audio lab (testing) screen, mounted only from
                 src/app/AudioLabMount.tsx.
  ui/            React Native UI.
    brand.ts     App name and tagline, in one place.
    components/  Shared, reusable components (SegmentedControl, PresetButton, PresetGrid,
                 SectionLabel, Badge, Header, Menu, Switch, PlayButton, BeatTimeline, ...).
                 Check here first before adding any new UI element.
    hooks/       React hooks (usePlayerSession, useLayout, useReduceMotion, useFocusRing).
    lib/         Pure helpers with tests (timeline geometry, output delay, silent switch,
                 snapToStep) and shared category data (categoryUi).
  config-mode/   Temporary CONFIG screen, saved values, How to and JSON export. Self-contained
                 so it can be deleted in Phase 4.
  storage/       Thin wrapper over AsyncStorage. Used for the saved theme choice.
  theme/         Design tokens: colors (light and dark), typography, spacing, radius.
                 Check here first before adding any new style value.
  app/           Screens and wiring: App.tsx (root), MainScreen.tsx, IntroScreen.tsx,
                 ConfigMount.tsx (CONFIG mount point), AudioLabMount.tsx (lab mount point).
_references/     Source material. Do not edit.
docs/            Working documents: dev_questions.md, client_questions.md, porting-guide.md,
                 calibration-guide.md (temporary, for the brother).
```

## Rules

- `engine/` knows nothing about React or the audio layer. UI and audio call into it.
- `config-mode/` may depend on everything else; nothing else may depend on it, except one clearly marked mount point in `app/`.
- Preset definitions are data in `engine/`, not scattered through the UI.

## Phases

1. Foundation: project, theme, Long/Short selection, presets, engine, three-beat playback, synced visuals.
2. Config mode: toggle, weight shift slider, per-category settings, test playback, JSON export.
3. Calibration: the brother tests and exports preferred positions.
4. Final: hard-code values, add permanent weight shift playback, remove config mode, deploy to Netlify.
