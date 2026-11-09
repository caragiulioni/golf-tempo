---
inclusion: fileMatch
fileMatchPattern: "src/engine/**"
---

# Timing Engine Rules

These apply whenever working in `src/engine/`.

## Independence

- Pure TypeScript. No imports from React, React Native, the DOM, or any audio API.
- Input: game category, selected preset, fourth-beat settings. Output: a playback sequence (a list of timed events) that the audio and visual layers both consume.

## Timing model

- Presets are frame counts at 30 fps. 30/10 means 30 frames from beat 1 to beat 2 (1.0 s) and 10 frames from beat 2 to beat 3.
- Measured from Tour Tempo, beat 1 to beat 2 matches the frame math exactly. Beat 2 to beat 3 runs about 0.17 to 0.2 s longer than the label implies (for example 18/9 gives 0.50 s, not 0.30 s). The three beats are correct as they are, so copy Tour Tempo's real timing. Do not "fix" it to the printed numbers.
- Store beat 1/2/3 times per preset as data, ideally from measurements of Tour Tempo. For presets Tour Tempo does not have, the beat 3 delay is an open question (see `docs/dev_questions.md`).

## Fourth beat

- Position is normalized from 0 to 1 between beat 1 and beat 2. Convert to real time only when building the sequence.
- Insert the fourth beat into the sequence. Never move, shift or recalculate beats 1, 2 or 3 because of it.
- Clamp the position to a configurable safe range so it never lands on top of beat 1 or beat 2.
- Long Game and Short Game hold independent positions.
- Support a three-beat mode (no fourth beat) for baseline comparison.

## Looping

- Beat 1 aligns with the start of a bar in the background loop.
- The pause between repeats must scale with tempo. A fixed pause is too short at slow tempos.
