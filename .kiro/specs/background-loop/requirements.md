# Requirements: background-loop

Shared decisions are in `product.md`, `tech.md`, `timing-engine.md`. Prototype level: sound and pattern are tuned by ear.

## Glossary

- **Loop**: the generated 808-style background pattern (kick, snare, closed hat).
- **Bar**: one loop repeat. One bar equals one swing cycle, `cycleSeconds(preset)`.
- **Loop_Switch**: the "Background loop" switch on the main screen.

## Requirements

### R1 Loop pattern (engine)

**User Story:** As a golfer, I want the loop locked to my swing, so that beat 1 always lands on the start of a bar.

1. THE Engine SHALL provide `loopEvents(preset, options)` returning a list of `{ voice: 'kick' | 'snare' | 'hat', time, accent? }`, with `time` in seconds relative to beat 1 of the bar.
2. THE Engine SHALL give every bar a length of `cycleSeconds(preset)` for all 16 presets.
3. THE Engine SHALL place a kick at time 0.
4. THE Engine SHALL return only events with `0 <= time < cycleSeconds(preset)`.
5. THE Engine SHALL split the bar into 12 even steps (cycle / 12) for every preset. (Beat-anchored grids were tried and rejected by ear, November 2026; `ANCHOR_MIN_BEAT2_SECONDS` is Infinity for both categories.) In Short Game, beat 2 SHALL land exactly on step 4 and beat 3 exactly on step 6 (follows from the pause factor 1.5).
6. THE Engine SHALL place kicks on steps 0, 4, 8, snares on steps 2, 6, 10, and a hat on every step, louder on steps 0, 2, 6, 10 (named tables, copied from Tour Tempo). EXCEPT slow Long Game (beat 1 to beat 2 over 1.0 s, 42/14 and slower), which SHALL use the sparse pattern: one kick at time 0, no snare, and one steady hat tick for the whole bar (the downswing split into the fewest even number of parts with a gap of at most `SPARSE_HAT_MAX_GAP_SECONDS`, 0.7 s), so hats land exactly on beat 1, beat 2, beat 3 and the bar end, accented on beats 1, 2 and 3, and the bar counts as 16 or 32 hats (whole measures of 8).
7. WHERE the preset is listed in `GHOST_KICK_PRESETS` (Long 18/6, Short 14/7 and 16/8), THE Engine SHALL add ghost kicks on steps 1, 5, 9.
8. WHERE a step is longer than `HAT_MAX_GAP_SECONDS` (normal pattern), THE Engine SHALL add evenly spaced extra hat ticks inside it, so no gap between hat ticks, including the wrap to the next bar, exceeds `HAT_MAX_GAP_SECONDS`. A step of exactly `HAT_MAX_GAP_SECONDS` SHALL get one tick.
9. THE Engine SHALL return identical output for identical input.
10. THE Engine SHALL use the same kick, snare and hat tables for Long Game and Short Game (except the slow Long Game sparse pattern, requirement 6).

### R2 Loop sounds

1. THE Audio_Adapter SHALL play kick, snare and hat voices synthesized in code, with no audio files.
2. THE Audio_Adapter SHALL play loop voices through a loop bus whose level is lower than the beeps.
3. WHEN `stopAll()` is called, THE Audio_Adapter SHALL fade out loop voices that are sounding or scheduled, without clicks.

### R3 Playback

1. WHERE `SwingOptions.loop` is true, THE Player SHALL schedule each bar's loop events at `swing.startTime + event.time` from the same lookahead scheduling as the beeps.
2. WHERE `SwingOptions.loop` is false or absent, THE Player SHALL schedule no loop events.
3. WHEN the loop is toggled while playing, THE Player SHALL restart like any other change (stop, restart pause, new run from beat 1).

### R4 UI

1. THE Loop_Switch SHALL be off when the app starts.
2. WHEN the user toggles the Loop_Switch, THE App SHALL pass `loop` in the swing options.
3. THE App SHALL not persist the Loop_Switch state.
4. THE Audio_Lab SHALL offer a Loop on/off option.

## Out of scope

Ducking, volume slider, persistence, native audio, sound styles.
