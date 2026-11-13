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
5. THE Engine SHALL divide the bar into 4 equal quarters and place kicks and snares on quarter starts from a named pattern table.
6. WHERE a quarter is longer than `SLOW_QUARTER_SECONDS`, THE Engine SHALL use the thinned pattern table (kick on quarter 1, snare on quarter 3).
7. THE Engine SHALL place `max(1, ceil(quarterSeconds / HAT_MAX_GAP_SECONDS))` evenly spaced hat ticks in each quarter, the first on the quarter start, so no gap between hat ticks exceeds `HAT_MAX_GAP_SECONDS`.
8. THE Engine SHALL return identical output for identical input.
9. THE Engine SHALL use the same rules for Long Game and Short Game.

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
