# Design: timing-engine

## Files (all in `src/engine/`)

- `presets.ts`: preset data and the category ratios. Types for category and preset.
- `beats.ts`: beat 1, 2 and 3 times for a preset. Holds the beat 3 delay constant.
- `weightShift.ts`: safe range, defaults per category, clamp, position to seconds.
- `sequence.ts`: builds the ordered event list.
- `index.ts`: exports what other layers use.
- Tests sit next to the code as `*.test.ts`.

## Data shapes

```ts
type Category = 'long' | 'short';
type Preset = { category: Category; backFrames: number; downFrames: number };
type EventType = 'beat1' | 'weightShift' | 'beat2' | 'beat3';
type SequenceEvent = { type: EventType; time: number }; // seconds from start of swing
```

## Rules in code

- `FPS = 30`.
- `BEAT3_DELAY_SECONDS = 0` (was 0.20 until November 2026). Beat 2 time = backFrames / FPS. Beat 3 time = beat 2 + downFrames / FPS + BEAT3_DELAY_SECONDS. Beat 1 is 0.
- Weight shift time = clampedPosition x beat 2 time.
- `WEIGHT_SHIFT_RANGE = { min: 0.05, max: 0.95 }`.
- Defaults: see `DEFAULT_WEIGHT_SHIFT_POSITIONS` in `src/engine/weightShift.ts` (originally 0.67 and 0.75).
- The sequence is beats first, then the weight shift is added and everything is sorted by time. Beat times are never read back from the weight shift code.

## Swapping in measured values later

Beat 3 timing is computed in one function in `beats.ts`. To use measured values for a preset, add an optional per-preset override there. Nothing else changes.

## Checking

Automated tests (Vitest, `npm test`) for every requirement. Typecheck with `npm run typecheck`.
