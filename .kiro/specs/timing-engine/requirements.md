# Requirements: timing-engine

Shared decisions live in the steering files (`product.md`, `timing-engine.md`, `structure.md`, `tech.md`, `workflow.md`). This spec does not restate them. Measured data: `_references/tempo-measurements.md`.

## Goal

A pure TypeScript engine in `src/engine/` that turns a category, a preset and weight shift settings into a list of timed events. No UI, no audio.

## Requirements

1. **Presets as data.** All 10 Long Game and 6 Short Game presets are defined in `src/engine/`. Each stores its two frame counts. The ratio comes from the category (Long 3:1, Short 2:1), and a test fails if a preset does not match.
2. **Three-beat times.** For any preset the engine gives beat 1, 2 and 3 in seconds from the start of the swing. Beat 1 to 2 is frames / 30. Beat 2 to 3 is frames / 30 plus a fixed delay of 0.20 s, held in one named constant. The same rule applies to the slow presets (42/14 and up).
3. **Matches the measurements.** The beat times for the 11 Tour Tempo presets match `_references/tempo-measurements.md` within 25 ms.
4. **Weight shift time.** A normalized position (0 to 1) between beat 1 and beat 2 converts to seconds. The same position is the same fraction of the beat 1 to 2 gap at every tempo.
5. **Safe range.** The position is clamped to 0.05 to 0.95. The range is a named constant.
6. **Independent categories.** Long Game and Short Game each hold their own position. Defaults: Long 0.53 (was 0.67 until November 2026), Short 0.75.
7. **Beats never move.** Beats 1, 2 and 3 have identical times with or without the weight shift beat.
8. **Three-beat mode.** A switch leaves the weight shift beat out of the sequence.
9. **Sequence output.** One function takes category, preset, settings and mode, and returns the events in time order. Each event has a type (beat 1, weight shift, beat 2, beat 3) and a time in seconds.
10. **Independence.** The engine imports nothing from React, React Native, the DOM or any audio API.
11. **Porting notes.** The spec ends with an entry in `docs/porting-guide.md`.

## Out of scope

Repeat pause, background loop, sounds and any UI (specs 2 to 5). Short Game slow presets (waiting on the brother; easy to add as data later).
