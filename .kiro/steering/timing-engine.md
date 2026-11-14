---
inclusion: fileMatch
fileMatchPattern: "src/engine/**"
---

# Timing Engine Rules

These apply whenever working in `src/engine/`.

## Independence

- Pure TypeScript. No imports from React, React Native, the DOM, or any audio API.
- Input: game category, selected preset, weight shift settings. Output: a playback sequence (a list of timed events) that the audio and visual layers both consume.

## Timing model

- Presets are frame counts at 30 fps. 30/10 means 30 frames from beat 1 to beat 2 (1.0 s) and 10 frames from beat 2 to beat 3.
- The beats follow the frame counts exactly: beat 2 at backFrames / 30, beat 3 a further downFrames / 30. No extra delay (`BEAT3_DELAY_SECONDS` = 0). So the ratio you hear is the true one: TOP sits at exactly 3/4 of the way to impact in Long Game (3:1) and 2/3 in Short Game (2:1), at every tempo.
- Tour Tempo's app plays beat 3 about 0.2 s later than its numbers (measured on all 11 presets, `_references/tempo-measurements.md`). We copied that at first, then removed it (developer decision, November 2026): a fixed delay squashed the heard ratio (Short 18/9 sounded 1.2:1) and, because it does not scale with tempo, it made the slow presets sound different from the fast ones.
- Rule of thumb: everything scales with tempo. A fixed amount of time, or a special case for some presets, makes slow and fast presets stop sounding like the same swing.

## Weight shift beat

- Position is normalized from 0 to 1 between beat 1 and beat 2, and keeps the same relative position at every tempo. Convert to real time only when building the sequence.
- Insert the weight shift beat into the sequence. Never move, shift or recalculate beats 1, 2 or 3 because of it.
- Clamp the position to a configurable safe range so it never lands on top of beat 1 or beat 2.
- Long Game and Short Game hold independent positions.
- Long Game starts at 0.70, Short Game at 0.60 (set by the developer, November 2026; they replaced 0.67 and 0.75, the midpoint of the whole swing). Both are starting values; the brother fine-tunes them in CONFIG.
- Support a three-beat mode (no weight shift beat) for baseline comparison.

## Presets

- Long Game: 18/6, 21/7, 24/8, 27/9, 30/10, 42/14, 60/20, 84/28, 120/40, 168/56 (all 3:1).
- Short Game: 14/7, 16/8, 18/9, 20/10, 22/11, 24/12 (2:1). Slower ones are pending.

## Looping

- Beat 1 aligns with the start of a bar in the background loop.
- The pause between repeats must scale with tempo. A fixed pause is too short at slow tempos. Pause factor (times beat 1 to beat 2): 1.5 for Long and Short Game; 4/3 for slow Long Game (42/14 and slower), so the bar is a whole number of measures of 8 hi-hats.
- Loop pattern: Tour Tempo's 12-step groove on an even grid for Long 18/6 to 30/10 and all Short Game (Short: TOP exactly on the step 4 kick, IMPACT on the step 6 snare). Slow Long Game uses a sparse pattern: one kick on beat 1 and a steady, countable hi-hat that lands on TOP and IMPACT. Details and history: `docs/background-loop-audit-notes.md`, section 9.
