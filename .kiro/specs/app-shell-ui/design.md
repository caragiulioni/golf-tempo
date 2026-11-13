# Design: app-shell-ui

Prototype-level. Shared decisions are in the steering files and are not restated. Requirements: `requirements.md` (cited as R1 to R12). Visual source: `_references/DESIGN/` as amended by `docs/design-brief.md` section 12. Audio behavior and the output delay background: `.kiro/specs/audio-playback/design.md`, section "Audio buffer and output delay" (the source for R6).

## Overview

The app shell wraps the existing engine and audio player in the real UI: theme and saved light/dark choice, intro screen, header and menu, Long/Short preset selection, play control, a synced beat timeline, and a disabled loop switch. The work is split into shared components, a few pure and tested helpers, and hooks that connect the UI to the player.

## Architecture

### Files

```
src/theme/
  tokens.ts          light/dark color sets, radius, spacing, type sizes, timeline tokens, breakpoints
  ThemeProvider.tsx  context + useTheme(); owns mode, saved choice, device-follow rule
  index.ts
src/storage/
  storage.ts         getItem/setItem wrapper over AsyncStorage (try/catch, never throws)
  themeChoice.ts     loadThemeChoice(): 'light'|'dark'|null, saveThemeChoice(mode)
  index.ts
src/ui/
  brand.ts           APP_NAME = 'Swing Tempo', TAGLINE (single place, R2.8)
  lib/               pure, no React/DOM, Vitest-covered
    outputDelay.ts
    timelineGeometry.ts
  hooks/
    useLayout.ts        breakpoint from useWindowDimensions
    useReduceMotion.ts  AccessibilityInfo
    usePlayerSession.ts creates the shared Player/adapter, exposes state, swings, pause reason
  components/        see list below
src/app/
  App.tsx            providers + intro gate + screen switch
  Screen state       useState<'main'|'config'|'lab'> in App.tsx (no router)
  MainScreen.tsx
  ConfigPlaceholder.tsx   REPLACED by config-mode in spec 5
  AudioLabMount.tsx  the one marked mount point for the lab
src/audio-lab/       moved from src/app/dev/AudioLab.tsx (self-contained, nothing imports it except AudioLabMount)
  AudioLab.tsx
```

Audio Lab move: `src/app/dev/AudioLab.tsx` is deleted and `src/app/dev/` removed. The lab is rebuilt in `src/audio-lab/` from shared components and tokens, takes the app's Player and adapter from `usePlayerSession` (no own `AudioContext`), and guards web-only calls (`navigator.clipboard`, `location`, `document`) with `Platform.OS === 'web'` checks. Copy failure keeps the log visible and selectable (R10.5, R10.6). `structure.md` gets the new folder in the spec's last task.

### Dependencies to add

Install with `npx expo install`, then strip `~`/`^` so versions are exact:
- `react-native-svg` (grid, logo mark, icons)
- `expo-font`
- `@expo-google-fonts/inter`, `@expo-google-fonts/space-grotesk`, `@expo-google-fonts/michroma` (bundled font files, no network at runtime)
- `expo-clipboard` is not needed; the lab uses the web API behind a guard and shows the text for manual copy on native.

Reanimated is not added. The timeline uses RN `Animated` (see below). Vitest config `include` is widened to `src/ui/lib/**/*.test.ts`.

### Theme

`tokens.ts` ports `_references/DESIGN/tokens.css`: bg, surface, hero, border, text, text2, accent, accent-muted, on-accent, gold, switch-knob (light and dark sets); radius chip 14, card 28 (40 at tablet width and up); tap-min 44; fonts `Inter`, `SpaceGrotesk`. Timeline tokens (same in both modes, R5.9): container background (light mode `#3D5C45`, dark `#0A0C0A`), grid line (white at 10%), gold `#EEC967`, label `#F0F1EA`, marker outline `#A8B3AB`, downswing bar `#8FB78F`, backswing bar a lighter green around 3:1 on the container (picked by eye, checked against 3:1). Type sizes are set a step above the handoff on phones (R7.5), with a floor of 12 for any text and 13 for phase labels.

`ThemeProvider`:
- State: `choice: 'light'|'dark'|null` and `device = useColorScheme()`. Effective mode is `choice ?? device`, so device changes are followed only while nothing is saved (R1.7).
- `setMode()` (from the menu) sets `choice` immediately and calls `saveThemeChoice` without awaiting; a write failure is swallowed, the session keeps the new mode (R1.3, R1.6).
- It does not render children until `ready`, which `App.tsx` supplies (see intro gate).

Storage key: `golf-tempo:theme:v1`, value `"light"` or `"dark"`. `loadThemeChoice` returns `null` for anything else, for a missing key, and on a read error (R1.5, R1.6).

### Fonts and intro gate

Change: Michroma (`fonts.brand`) is bundled and loaded with the others, used only for the "SWING TEMPO" text in the Wordmark and on the intro screen (via `BrandName`, size role `wordmark`). This overrides the earlier "no Michroma" decision.

`App.tsx` runs one startup effect:
1. `loadThemeChoice()` and `useFonts({ Inter_..., SpaceGrotesk_... })` start together.
2. `minTimerDone` is set after 2000 ms from first render. `timeoutDone` is set after 3000 ms.
3. `loaded = themeLoaded && fontsLoaded`. Font error counts as done with `useSystemFont = true` (theme typography falls back to the system font).
4. `canLeave = (loaded && minTimerDone) || timeoutDone`. Tap before load does nothing visible but sets `skipRequested`. `canLeave || (loaded && skipRequested)` swaps to the main screen. A tap after `loaded` leaves at once.
5. Swap uses a 200 ms fade, or no animation when reduce motion is on (R9.8).

The intro uses the theme for colors. Since the saved choice may not be loaded, the intro itself renders with the device scheme and the provider takes over when it swaps. No audio code is imported by the intro (R9.10).

The intro renders before the provider is ready, so it reads `useColorScheme()` directly through a small `introColors` helper in `theme/`, not hard-coded values.

### Navigation

`const [screen, setScreen] = useState<'main'|'config'|'lab'>('main')` in `App.tsx`. The menu calls `setScreen`. `MainScreen` stays mounted (hidden with `display: 'none'`) while on config or lab, so selection, player state and the playing session survive (R10.2, R7.2). Selection state lives in `App.tsx` (`category`, `presetByCategory`) and is passed down. Leaving the lab calls `player.stop()` only if the lab started the run (the lab has its own play control); the main screen's own run is stopped on entering the lab, since two UIs sharing one Player would fight.

### Layout and breakpoints

`useLayout()` returns `'phone' | 'tablet' | 'laptop'` from `useWindowDimensions().width`: under 700 phone, 700 to 1099 tablet, 1100 and up laptop (R7.1). It also returns `isShortLandscape` (width > height and height < 500). Laptop is two columns (session card and timeline left or right per the handoff, controls on the other); phone and tablet are one column.

| | phone | tablet | laptop |
|---|---|---|---|
| Play button | 75 | 120 | 128 |
| Card radius | 28 | 40 | 40 |

The tablet and laptop play button sizes are above the R4.1 minimums (112 / 112); the phone size 75 is below the earlier 88 minimum by the user's decision. All are checked by eye. In short landscape the session numbers shrink and the button stays 75 so the button and timeline fit without scrolling (R7.3); the exact numbers are tuned on a 568×320 window.

Layout code only uses tokens: sizes come from a `layoutSizes[layout]` table in `theme/tokens.ts`.

## Components and Interfaces

### Components

Reuse check (`src/ui/components/` and `src/theme/` contain only READMEs; nothing exists to reuse). Everything below is new, built from `View`/`Text`/`Pressable` and tokens. The audio lab and config placeholder reuse these, which is the point of keeping them shared.

| Component | Purpose | Notes |
|---|---|---|
| `Text` (`AppText`) | themed text with variants (ui, num, label, brand) | all other components use it |
| `IconButton` | 44+ pt square, surface fill, border, chip radius | menu button, back control |
| `Header` | Wordmark left, menu button right | no other elements |
| `Wordmark` | `LogoMark` (SVG) + `APP_NAME` text | text from `brand.ts` |
| `Menu` | right-aligned dropdown, overlay, outside tap, Escape, focus return | shared overlay later reused by the confirm dialog in spec 5 |
| `MenuItem` | full-width row, min 44 pt | |
| `SegmentedControl` | Long/Short, check on selected only | |
| `PresetButton` | fill + 2px outline + check when selected | label via `presetLabel` |
| `PresetGrid` | N columns from a prop (5 or 3), wraps | no layout change when the engine adds presets |
| `SectionLabel` | small caps label | |
| `Badge` | tempo badge ("30 / 10") and ratio pill ("3 : 1") | one component, two variants |
| `Card` | hero/surface container with card radius | |
| `PlayButton` | play/pause icon, size prop, labels "Play"/"Pause" | |
| `StatusMessage` | paused / could not start message, silent-switch hint | |
| `Switch` | disabled-look switch with role, value, disabled state | no press or hover feedback |
| `BeatTimeline` | the timeline (container, grid, bars, markers, labels, playhead) | see Timeline |
| `Icon` set | play, pause, check, menu, back | SVG paths in one file |
| `LabLog` / `LabButton` | only what the lab needs beyond the above; `LabButton` is a `Button` variant added to `IconButton`'s family | created only if the lab cannot use `PresetButton`/`Card`; decided while rebuilding |

Extend rather than create: `Badge` covers both badge uses, `PresetButton` is used for the lab's preset buttons too. A generic `Button` is added only when the lab needs one.

### Player hookup

`usePlayerSession(selection)` (in `src/ui/hooks/`):
- Creates one `createWebAudioAdapter()` and one `createPlayer(adapter)` lazily on first use and keeps them in a module-level singleton (shared with the lab). It calls `attachWebSession(player, ...)` on web only.
- Subscribes with `player.subscribe({ onState, onSwing, onPaused })`:
  - `onState` updates `playerState`. On `playing` it clears the pause message. On `stopped` or `paused` it tells the timeline to reset (R5.13).
  - `onSwing(swing)` gives `startTime`, `beeps[]` (each with `type` and audio-clock `time`) and `cycleSeconds`. The hook reads the delay (see next section), logs it once to the lab log, and pushes `{ swing, outputDelaySeconds }` to the timeline through a ref callback, not React state, so the animation does not re-render the screen.
  - `onPaused(reason)` sets the "paused, tap to resume" message (R4.6).
- `toggle()` (play button): if `playing` or `restarting` call `stop()`, else `await player.start(swingOptions)` inside try/catch. A throw sets the "could not start, tap to try again" message and leaves the state stopped (R4.7).
- A `useEffect` on `[category, preset]` calls `player.change(swingOptions)` once per change, and skips the first render (R3.10). `change` does nothing when stopped.
- `swingOptions` = `{ preset, settings: defaultWeightShiftSettings(), includeWeightShift: true }`. Weight shift settings come from the engine defaults until spec 5 provides applied values.
- The silent-switch hint shows when `Platform.OS === 'web'` and the user agent matches iPhone/iPad, or `maxTouchPoints > 1` with a Mac platform (iPadOS).

### Output delay

Pure function in `src/ui/lib/outputDelay.ts` (no DOM, no `window`, no React, no audio import; takes plain numbers so it needs no `src/audio` types):

```ts
export type OutputDelaySource = 'reported' | 'fallback';
export type OutputDelay = { seconds: number; source: OutputDelaySource };
export type LatencyInfo = { outputLatencySeconds?: number | null; baseLatencySeconds?: number | null } | null;
export type PlatformKey = 'ios' | 'android' | 'desktop';

// R6.8. iOS measured on iPad Safari (3 ms); Android from the Pixel 6 report; desktop is a placeholder (Mac Chrome reported 56 ms).
export const FALLBACK_DELAY_SECONDS: Record<PlatformKey, number> = { ios: 0.003, android: 0.28, desktop: 0.05 };

export function resolveOutputDelay(info: LatencyInfo, platform: PlatformKey): OutputDelay;
```

Rules (R6.2 to R6.4): `info` null (no context yet) → fallback. `outputLatencySeconds` finite and > 0 → reported (exactly zero is treated as not yet reported, because browsers report 0 right after Play, and goes straight to the platform constant, skipping base latency, which is far smaller than the real delay). Else `baseLatencySeconds` finite and ≥ 0 → that value, source `'fallback'`. Else the platform constant, source `'fallback'`. Platform detection (`detectPlatform()`) lives in `usePlayerSession`, not in the pure module.

First-swing rule (R6.5a): `resolveOutputDelayForSwing(info, platform, swingIndexInRun)` returns the platform constant (source `'fallback'`) for index 0 and calls `resolveOutputDelay` otherwise. The hook keeps a module counter `swingsInRun`, reset to 0 when the player state becomes `'playing'` (that event fires before the run's first swing) and incremented after each `onSwing`. The first log line of a run ends with ` first swing`.

Use: the hook calls `resolveOutputDelayForSwing(adapter.info(), platform, swingsInRun)` in `onSwing`, so a changed value applies from that swing on and does not touch swings in progress (R6.5). It writes one lab log line, `Output delay NNN ms (reported|fallback)`, per swing (R6.7). The fallback constants are updated in a task after measuring the iPad (Safari 16.6) and Pixel 6, and the measurements go in `docs/porting-guide.md` (R6.8).

Visual time of an event = `beep.time + delay.seconds` on the audio clock. The timeline converts that to a delay from now with `adapter.now()`: `msUntil = (beep.time + delay - adapter.now()) * 1000`.

### Timeline

Geometry, pure, in `src/ui/lib/timelineGeometry.ts`:

```ts
export type TimelineGeometry = {
  total: number;          // seconds from beat 1 to beat 3 (+ end padding is a UI constant)
  markers: { type: 'beat1'|'weightShift'|'beat2'|'beat3'; t: number; x: number }[]; // x in 0..1
  splitX: number;         // x of beat 2: backswing | downswing
  backLabel: string;      // `BACKSWING · ${preset.backFrames}`
  downLabel: string;      // `DOWN · ${preset.downFrames}`
};
export function timelineGeometry(preset: Preset, weightShiftPosition: number): TimelineGeometry | null;
```

It calls the engine (`beatTimes`, `weightShiftTime`) and computes `x = t / total`. Returns `null` when the engine gives no beat times (R5.14). No ratios appear in the UI (R5.1, R5.11). `x` is in the 0..1 range for the bar; horizontal padding is applied by the component.

Label overlap (R5.6, R7.6): `BeatTimeline` measures its width with `onLayout`, converts marker x to pixels, and lays labels out left to right. On phones the weight shift label is always the short form ("Shift"). On tablet and laptop it is "Weight shift" and switches to the short form only if two neighbouring labels would overlap. If it still overlaps, it moves above the track. This is decided by a small pure helper `labelsOverlap(widths, xs)` in the same lib file, with a test. Labels use `numberOfLines={1}` and are never truncated.

Rendering (`react-native-svg` for the grid, bars and markers; plain `Animated`):
- Container uses the container-background token, with an SVG `Pattern` for the 1px grid every 5 px (R5.5, R5.10).
- Backswing bar from 0 to `splitX` and downswing bar from `splitX` to 1, labelled `BACKSWING · n` and `DOWN · n`.
- Markers: weight shift is a diamond, others a circle. Unlit = outline; lit = filled and scaled 1.3× (R5.8).
- Gold fill (`fillBar`, the only use of gold): same height and radius as the bars, drawn above them and below the markers and playhead, from `px(0)` with width `progress * (px(1) - px(0))`. The playhead line uses the same `progress` value (0..1).
- The weight shift diamond, its lit fill, its pulse ring and its name are white like the other markers (R5.2, R5.12).

Driving it from the audio schedule (no separate timer):
- On a swing push, for the playhead: `Animated.timing(playhead, { toValue: 1, duration: cycleSeconds*1000 ... })` is not used, because the cycle includes the repeat pause. Instead a timer at the delayed beat 1 stops the previous animation, sets `progress` to 0, runs it to 1 over `total` seconds, then eases it back to 0 (`Easing.inOut(cubic)`) over `cycleSeconds - total - easeBackMarginMs` (never below `easeBackMinMs`, both in `timelineSizes`), so it finishes just before the next beat 1 (R5.4). The delayed start is `msUntil` for beat 1. `useNativeDriver: false` on web for layout-driven values, true where only transform/opacity change.
- For each marker, `setTimeout(lightMarker, msUntil)` is scheduled for that beep's delayed time, and the marker is unlit at the end of that swing's window or when the next lights. These timeouts only trigger visual state; the beep times and the delay come from the audio clock, so a late timeout shifts a marker by timer jitter only (a few ms, inside the 50 ms budget R5.4). Pending timeouts are cleared on stop, pause, change and unmount.
- Marker deactivation: a listener on `progress` (direction check: value falling) unlights a lit marker once the fill edge has passed back over it, in the order Impact, Top, Weight shift, Takeaway. It calls `setLit` only on crossings. Beat 1 still clears all markers as a safety net.
- Weight shift pulse: a 300 ms `Animated` scale/opacity pulse started at its lit time (R5.12).
- Reduce motion (R5.7): no sweep, playhead, ease-back or pulse; `progress` is set directly to each marker's x as it lights (stepped fill) and to 0 at the next beat 1.
- Stop or pause: clear timeouts, unlight all, playhead to 0 within 100 ms (R5.13).

This is a prototype choice. If device testing shows jitter above budget, the next step is a `requestAnimationFrame` loop that compares `adapter.now()` with the swing's delayed beep times; it uses the same inputs, so only `BeatTimeline`'s internals change.

### Intro, header menu, loop switch

- Intro screen: `IntroScreen` in `src/app/`, shows `LogoMark`, `APP_NAME`, `TAGLINE`; no button. Fade respects reduce motion.
- Menu items in order: Config, light/dark (label from current mode), Audio lab (testing). Selecting calls `setScreen`/`setMode` and closes the menu. Escape and outside tap close it and return focus to the menu button via a ref.
- Loop switch: `Switch` with `disabled`, `accessibilityRole="switch"`, `accessibilityState={{ checked: false, disabled: true }}`, reduced-emphasis token colors. `onPress` is not wired, so there is no feedback.

## Data Models

- `OutputDelay`: `{ seconds: number; source: 'reported' | 'fallback' }`, from `resolveOutputDelay` (see Output delay).
- `TimelineGeometry`: marker times and 0..1 positions, `splitX` and the two phase labels, from `timelineGeometry` (see Timeline).
- `Selection`: `category` and `presetByCategory`, held in `App.tsx` (see Navigation).
- Theme choice: `'light' | 'dark' | null`, stored under `golf-tempo:theme:v1` (see Theme).

## Correctness Properties

No property-based tests. The two pure functions (`resolveOutputDelay`, `timelineGeometry`) are small, and example tests over all 16 presets and the listed edge inputs cover them.

## Testing Strategy

- Vitest (pure functions only; config `include` widened to `src/ui/lib/**/*.test.ts`):
  - `outputDelay.test.ts`: reported value used; `null`, `undefined`, negative, `NaN` and `Infinity` for `outputLatencySeconds` fall to `baseLatencySeconds`, then to the platform constant; `info` null uses the constant; source labels are right; zero goes straight to the platform constant, even when a base latency is present.
  - `timelineGeometry.test.ts`: for all 16 presets the x values are strictly increasing, within 0..1, beat 1 at 0 and beat 3 at 1; the diamond position follows `weightShiftTime`; labels use the preset's frame counts; the split sits at beat 2; the result changes when the preset changes; `labelsOverlap` cases.
- Manual checks (reported per task): theme switch and reload with no flash; intro timing; fonts offline; presets fit at 320 and 360; breakpoints and rotation keep state; play, pause, restart on change; beeps against lights on Mac, Pixel 6 and iPad (do the lights land with the beeps, not before); reduce motion; lab runs on native without errors; one phone check via Expo Go; porting notes entry.

## Error Handling

Storage read/write errors and font errors never block the UI (R1.6, R8.4, R9.7). `player.start` rejections show the "could not start" message. Missing engine beat times show the idle timeline. Web-only calls in the lab are behind `Platform.OS === 'web'`.
