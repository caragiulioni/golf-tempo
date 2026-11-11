# Dev Questions

Open items for the developer to decide, plus a record of what has been decided. Leanings are noted where a recommendation exists.

Terminology: the added beat is called the **weight shift** beat. In time order the swing has four moments: takeaway (beat 1), weight shift (the added beat), top of swing (beat 2), impact (beat 3). The three original Tour Tempo beats keep their names and numbers.

## Decided

### Stack and tooling
- UI foundation: Expo with React Native Web, so the web app and a later native port share most code. Styling: plain React Native StyleSheet with a theme module (recommended; no UI library).
- Language: TypeScript throughout, including the timing engine.
- Audio: define an audio adapter interface. Web Audio API on web. Native candidates: `react-native-audio-api` or `expo-audio`.

### Beats and presets
- Presets verified against Tour Tempo screenshots (`_references`):
  - Long Game: 18/6, 21/7, 24/8, 27/9, 30/10
  - Short Game: 14/7, 16/8, 18/9, 20/10, 22/11, 24/12
- The three original beats are correct as they are in Tour Tempo and are copied as-is. Do not "correct" them to the printed numbers. The weight shift beat is one additional data point; everything stays framed around the current tempos.
- Weight shift placement (confirmed by client): between beat 1 (takeaway) and beat 2 (top of swing). It represents the initial lateral weight transfer, which starts in the hips.
- Position is stored as a normalized value (0 to 1) between beat 1 and beat 2 and keeps the same relative position at every tempo (confirmed by client).
- Starting value for Long Game: about 0.67. The client's diagram divides the swing into four equal parts and puts the weight shift at the midpoint of the whole swing, which is 2 of the 3 backswing parts. To be tuned by ear in CONFIG mode.
- Starting value for Short Game: about 0.75, the midpoint of the whole 2:1 swing. The client's answer was "about 3/4 of the way through" the backswing, but he is not certain and is still evaluating it. Tentative; tuned by ear.
- One rule covers both categories: the weight shift starts at the midpoint of the whole swing (about 0.67 Long Game, 0.75 Short Game).
- Long Game and Short Game have independent settings (confirmed). The same movement applies in Short Game, but it is more subtle: the golfer focuses on the hands moving around the torso instead of the hips and lower body. This changes what the golfer feels, not the beat.
- The weight shift beat uses a different sound from beats 1 to 3 so it can be told apart (confirmed).

### Slower tempos
- Added as more preset buttons, not a slider and not an automatic speed-up.
- Long Game, five new presets: 42/14 (1.4 s / 0.47 s), 60/20 (2.0 s / 0.67 s), 84/28 (2.8 s / 0.93 s), 120/40 (4.0 s / 1.33 s), 168/56 (5.6 s / 1.87 s). Ten Long Game buttons in total. Slowest total swing is about 7.5 s, within the client's 6 to 8 s target.
- Slow tempos are for slow practice swings to feel each part of the move, not for real swings.
- Ten or more buttons will not fit in one row on a phone. Use two rows or a row that scrolls sideways (UI spec).
- Short Game slow presets: pending (see client_questions.md, Q1).

### Background loop
- A single 808-style loop, generated in code (Web Audio oscillators and noise) so it stays locked to the tempo. No recorded audio files.
- On/off toggle. Off by default; it plays when the user presses play with the toggle on.
- Plays in both Long Game and Short Game. (Tour Tempo's recording showed no loop in Short Game; the client confirmed that was a recording error.)
- Beat 1 lands on the start of a bar, as in Tour Tempo.
- Slow tempos: add a hi-hat that ticks a whole number of times inside each quarter of the swing, so it always lines up with the beeps and keeps a steady pulse (roughly every 0.25 to 0.5 s). At slow tempos the kick and snare thin out and the hi-hat carries the pulse. To be tuned by ear.
- Sound styles (Voice, String, Bossa Nova): dropped. One tone set only.

### CONFIG mode
- CONFIG lives inside the real app. No separate app or branch. A separate calibration app was considered and dropped, mainly because it would have to share the timing engine and audio layer anyway.
- APPLY saves the current category's value (Long Game or Short Game, one at a time) to local storage on that device. Normal mode then uses it at every tempo, so the brother tests in the real app.
- Leaving CONFIG with unapplied changes shows a yes/no confirmation dialog. Yes discards and leaves; No stays.
- Reset-to-default button. EXPORT exports the applied values.
- Saved values are per device. The final release removes CONFIG and stops reading (and deletes) the saved key so stale values cannot override the hard-coded ones.
- The engine is unchanged by this: it already takes weight shift positions as input. APPLY is a UI and storage feature.

### Playback and phone behavior
- Play/pause toggle in the Current session header. The first press doubles as the tap that unlocks browser audio. Playing always starts from beat 1; pausing ends the loop (no mid-cycle resume).
- Changing anything while playing (preset, Long/Short, weight shift slider): stop fully, short pause (about 0.5 s), then start a new run from beat 1. Rapid changes are debounced so only the last one restarts. Nothing starts if playback was stopped. The slider restarts on release, not during the drag; the marker moves during the drag.
- Keep the screen awake while playing using the Screen Wake Lock API, so the phone does not auto-lock mid-session.
- If the tab is hidden or the phone locks anyway, pause automatically. Resuming needs a tap, because iOS keeps suspended audio locked.
- Show an iOS-only hint about the silent switch.

## Findings from the reference recording (VID_20261107_135008.mp4)

Measured from the audio track of a Tour Tempo screen recording (Tones style).

- Gap from beat 1 to beat 2 matches frame math at 30 fps exactly: 18/9 = 0.60 s, 24/12 = 0.75-0.80 s, 30/10 = 1.0 s.
- Gap from beat 2 to beat 3 is about 0.17-0.2 s longer than the label implies: 18/9 = 0.50 s (label implies 0.30), 24/12 = 0.60 s (0.40), 30/10 = 0.50 s (0.33).
- The extra delay is roughly constant across presets, not proportional.
- Tour Tempo plays a background loop that gets faster with tempo (3.0 s repeat at 30/10, about 2.5 s at 24/8). It was absent in the Short Game section because of a recording error.
- Next step: record each preset from Tour Tempo (loop off if possible) and store measured gap values per preset instead of computing from labels.

## Open

### 1. Slower tempo presets
- Short Game slow presets and slowest target: waiting on the client.
- Because beat 3 has a measured delay, decide how the new slow presets get their beat 3 timing (constant offset vs. scaled).

### 2. Measure Tour Tempo per preset
- Record every preset and extract exact beat 1/2/3 times. This is the source of truth for the timing engine. Alternative: start with calculated times plus a fixed beat 3 delay of about 0.18 s and replace with measurements later.

### 3. 808 loop design
- Loop length per preset, and exactly how the pattern thins out at slow tempos.
- Sound design for kick, snare and hi-hat, written as code.

### 4. Loop behavior (repeat pause)
- Define the pause between repetitions. A fixed pause feels too short at slow tempos. Lean: scale the pause with tempo.

### 5. Slider range
- Minimum margin from beats 1 and 2 (avoid 0% and 100%). Start with about 5%-95% and tune through experimentation.
- Check the margin still feels right at the fastest and slowest tempos.

### 6. Native audio timing
- How tight must scheduling be on native? Decide before the port.

### 7. Config export
- JSON shape: `configVersion`, `longGame.weightShiftPosition`, `shortGame.weightShiftPosition`. Consider tempo metadata and an export timestamp.
- The client confirmed the same relative position holds across tempos, so one value per category is enough.
- Export the applied (saved) values, not unapplied slider positions.

### 8. Visual design
- Layout mockups: `_references/layout-DARKMODE.png` and `layout-LIGHTMODE.png`. Sections: Current session (large "30 / 10" plus category), Game length (segmented control), Available sessions (preset buttons). Dark mode: near-black with green tint, sage green selected. Light mode: warm off-white, deep forest green selected.
- The mockups still show the sound-style row (Voice, String, Bossa Nova). Omit it.
- Design handoff received: `_references/DESIGN/` (tokens.css, main-screen.html, design-spec.md, logo files). It is the visual source of truth. Its palette replaces the one sampled from the first mockups, and its darker light-mode secondary text fixes the contrast concern. Review notes and the list of refinements are in `docs/design-brief.md`, section 12.
- Handoff is read-only source material. Refinements are made in a working copy.
- Beat timeline: positions, bar split and labels are computed from the engine's beat times, not hard-coded. The weight shift marker moves live in CONFIG. Animation follows the audio schedule (Reanimated works on web and native). Playing state and animation still need to be designed.
- Short Game presets and a three-by-two grid for them: to be added to the working copy.
- Fonts: bundle through Expo and hold the first render until loaded. Use the wordmark SVG and drop Michroma.
- Missing icon files: Android adaptive foreground and monochrome, and a splash image.
- Not yet designed: CONFIG screen (to be made in this project), phone landscape, playing state.
- Gold (weight shift color): replace the two different golds with one that works in both modes. Contrast findings and options are in `docs/design-brief.md`, section 12, "Gold".
- Product name: undecided. "Swing Sync" is taken by another app. "Swing Tempo" is the current candidate, not final. Keep the name in one place in the build. See `docs/design-brief.md`, section 12.
- Tagline (decided): "Train Your Tempo. Transform Your Game." Shown on a short, skippable intro screen at startup. See `docs/design-brief.md`, section 12.

### 9. Phone behavior to verify on real devices
- Whether the Screen Wake Lock API keeps an iPhone awake in Safari while playing.
- Whether Safari's audio session setting lets audio play with the silent switch on.
- What happens to audio and timing when the phone locks or the app is backgrounded.

### 10. Calibration guide for the client
- Write a short testing doc for Mike as part of the config-mode spec (plain language, step by step). Outline:
  - Pick one device, preferably his phone, and calibrate on that device only. Use the same browser each time.
  - Don't use private/incognito mode, and don't clear browser data while calibrating. Either wipes the saved values.
  - Safari on iPhone may delete a website's saved data after about a week of not visiting it (my understanding; verify). So when he is happy with a value, press EXPORT and send it right away, and don't rely on the saved value alone.
  - Test each category (Long Game, Short Game) at every tempo before exporting.
  - How to use CONFIG: slider, APPLY, reset, the unapplied-changes warning, EXPORT.
  - What to send back, and how.

### 11. Hosting
- Netlify static deploy of the Expo web export. Confirm build command and publish directory when the project is initialized.
