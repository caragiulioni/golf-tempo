# Project Structure

Current layout. The Expo project is set up at the repo root, and every folder under `src/` has a README. Folders under `src/` are created now; most are empty until their spec is built.

```
index.ts         Expo entry point. Registers src/app/App.tsx.
app.json         Expo app config.
package.json     Dependencies (exact versions) and scripts.
vitest.config.mts  Test runner config. Covers src/engine only.
assets/          Icons and splash images from the Expo template.
src/
  engine/        Pure TypeScript timing engine. No React, no DOM, no audio APIs.
  audio/         Audio adapter interface plus web implementation (native later).
                 Tone synthesis and the 808 loop live here.
  audio-lab/     Temporary Audio lab (testing) screen, mounted only from src/app/AudioLabMount.tsx.
  ui/            React Native UI.
    components/  Shared, reusable components (SegmentedControl, PresetButton,
                 SectionLabel, Badge, playback controls, beat timeline).
                 Check here first before adding any new UI element.
  config-mode/   Temporary CONFIG UI, slider and JSON export. Self-contained so it
                 can be deleted in Phase 4.
  storage/       Thin wrapper over AsyncStorage. Used for the saved theme choice.
  theme/         Design tokens: colors (light and dark), typography, spacing, radius.
                 Check here first before adding any new style value.
  app/           Screens and wiring.
_references/     Source material. Do not edit.
docs/            Working documents: dev_questions.md, client_questions.md, porting-guide.md.
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
