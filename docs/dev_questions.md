# Dev Questions

Open items for the developer to decide. Leanings are noted where a recommendation exists.

## Decided

- UI foundation: Expo with React Native Web, so the web app and a later native port share most code. Optional styling layer: Tamagui or Gluestack UI. (Replaces MUI from the original spec, which is web-only.)
- Language: TypeScript throughout, including the timing engine.
- Audio: define an audio adapter interface. Web Audio API on web; `react-native-audio-api` or `expo-audio` on native.
- Presets verified against Tour Tempo screenshots (`_references`):
  - Long Game: 18/6, 21/7, 24/8, 27/9, 30/10
  - Short Game: 14/7, 16/8, 18/9, 20/10, 22/11, 24/12
- Beat timing: the three beats are correct as they are in Tour Tempo and are copied as-is. Do not "correct" them to the printed numbers.
- Sound styles (Voice, String, Bossa Nova): dropped for now. One tone set only.
- Background loop: a single 808-style loop, generated in code (Web Audio oscillators and noise) so it stays locked to the tempo. No recorded audio files.
- Playback control: a play/pause toggle in the Current session header. The first press doubles as the tap that unlocks browser audio. Playing always starts from beat 1; pausing ends the loop (no mid-cycle resume).
- Changing anything while playing (preset, Long/Short, fourth-beat slider): stop fully, short pause (about 0.5 s), then start a new run from beat 1. Rapid changes are debounced so only the last one restarts. Nothing starts if playback was stopped. The slider restarts on release, not during the drag; the on-screen marker moves during the drag.
- Show an iOS-only hint about the silent switch. Pause automatically when the tab is hidden.
- Fourth-beat sound (answered by client: YES): the fourth beat uses a different sound from beats 1-3 so it can be told apart. Lean: different pitch or timbre.

## Findings from the reference recording (VID_20261107_135008.mp4)

Measured from the audio track of a Tour Tempo screen recording (Tones style).

- Gap from beat 1 to beat 2 matches frame math at 30 fps exactly: 18/9 = 0.60 s, 24/12 = 0.75-0.80 s, 30/10 = 1.0 s.
- Gap from beat 2 to beat 3 is about 0.17-0.2 s longer than the label implies: 18/9 = 0.50 s (label implies 0.30), 24/12 = 0.60 s (0.40), 30/10 = 0.50 s (0.33).
- The extra delay is roughly constant across presets, not proportional.
- Tour Tempo plays a background loop in Long Game; in Short Game the recording had only the three beats. The loop got faster with tempo (3.0 s repeat at 30/10, about 2.5 s at 24/8).
- Next step: record each preset from Tour Tempo (loop off if possible) and store measured gap values per preset instead of computing from labels.

## Open

### 1. Slower tempo presets
- BPM is not a concept in Tour Tempo, so the client is asked in presets instead (client_questions.md, Q8): candidate Long Game 33/11 to 42/14 (+3/+1 steps), Short Game 26/13 to 32/16 (+2/+1 steps). Waiting on the answer.
- Presets are frame counts, not BPM. Slower presets mean larger counts at the same ratio (3:1 Long, 2:1 Short).
- Because beat 3 has a measured delay, decide how slow presets get their beat 3 timing (constant offset vs. scaled).

### 2. Measure Tour Tempo per preset
- Record every preset and extract exact beat 1/2/3 times. This is the source of truth for the timing engine.

### 3. 808 loop design
- On or off by default, with a toggle? (Asked in client_questions.md, Q6.)
- Play in Short Game too? Tour Tempo did not. (Asked in client_questions.md, Q7.)
- Alignment (decided): beat 1 lands on the start of a bar, as in Tour Tempo. Loop length per preset is still to be defined.
- Sound design for kick/hat/snare, written as code.

### 4. Loop behavior (repeat pause)
- Define the pause between repetitions. A fixed pause feels too short at slow tempos. Lean: scale the pause with tempo.

### 5. Slider range
- Minimum margin from beats 1 and 2 (avoid 0% and 100%). Start with about 5%-95% and tune through experimentation.
- Check the margin still feels right at the fastest and slowest tempos.

### 6. Native audio timing
- How tight must scheduling be on native? Decide before the port.

### 7. Config export
- Confirm the JSON shape (`configVersion`, `longGame.fourthBeatPosition`, `shortGame.fourthBeatPosition`). Consider tempo metadata and an export timestamp.
- Depends on client Q5: if the position differs per tempo, the export needs per-preset values rather than one value per category.

### 8. Visual design
- Layout mockups: `_references/layout-DARKMODE.png` and `layout-LIGHTMODE.png`. Sections: Current session (large "30 / 10" plus category), Game length (segmented control), Available sessions (preset buttons). Dark mode: near-black with green tint, sage green selected. Light mode: warm off-white, deep forest green selected.
- The mockups still show the sound-style row (Voice, String, Bossa Nova). Omit it, since sound styles are dropped.
- Not yet designed: play/stop controls, beat timeline, loop toggle, CONFIG area.
- Recommended styling layer (pending approval): plain React Native StyleSheet with a small theme module (colors, spacing, radius, type; light and dark chosen from the device setting) and a few shared components (SegmentedControl, PresetButton, SectionLabel). No Tamagui or Gluestack: the design is simple and a library would add setup and defaults to override.
- Beat/timeline visualization and animation approach (Reanimated works on web and native).
- Check: contrast of the small grey-green section labels in light mode. Confirm exact color values from the mockup source.

### 9. Hosting
- Netlify static deploy of the Expo web export. Confirm build command and publish directory when the project is initialized.
