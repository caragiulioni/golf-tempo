# Background loop: change log and findings (for the engine audit)

Written for a fresh reviewer (the timing engine context) who has not seen the loop work. Covers spec 4 (`.kiro/specs/background-loop/`), Waves 4.1 to 4.4. Wave 4.5 (tuning on phones, porting notes) is not done.

State when written: 254 tests pass, `npm run typecheck` is clean. Waves 4.1, 4.2 and 4.3 are committed (`60c9af6`, `d880bf7`, `b72dff6`). The loop rewrite (4.1b) and the main-screen switch (4.4) are uncommitted.

## 1. What was built

| Area | File | Change |
|---|---|---|
| Engine | `src/engine/loop.ts` (new) | `loopEvents(preset, options?)` and `stepTimes(preset)`. Pure, imports only `beats`, `presets`, `repeat`. |
| Engine | `src/engine/loop.test.ts` (new) | 16 presets by the invariants below, plus named examples and ghost kick tests. |
| Engine | `src/engine/index.ts` | Exports the loop constants, `loopEvents`, `stepTimes` and types. |
| Audio | `src/audio/types.ts` | `LoopVoice` type and optional `AudioAdapter.playLoopVoice?(voice, time, accent?)`. |
| Audio | `src/audio/webAudio.ts` | Synthesized kick, snare and hat, one shared noise buffer, a loop bus at 0.5 of the beeps. `stopAll()` fades loop voices like beeps. |
| Audio | `src/audio/player.ts` | `SwingOptions.loop` (default false), `loopSchedule()`, `ScheduledSwing.loop`. `scheduleSwing` plays beeps first, then loop events. |
| UI | `src/audio-lab/AudioLab.tsx` | Kick, Snare and Hat test buttons and a Loop on/off option. |
| UI | `src/app/MainScreen.tsx`, `src/ui/hooks/usePlayerSession.ts` | The Background loop switch is live (`useState(false)`, not saved). A loop change restarts like a preset change. |

Engine independence still holds: `loop.ts` has no React, DOM or audio imports.

## 2. The loop rules as built now

One bar equals one swing cycle (`cycleSeconds(preset)`), so beat 1 is always the bar start, and the loop keeps playing through the silent repeat pause (as Tour Tempo does).

The bar is 12 steps. All of this is data at the top of `loop.ts`:

- `KICK_STEPS` = 0, 4, 8
- `SNARE_STEPS` = 2, 6, 10
- A hat on every step. `HAT_ACCENT_STEPS` = 0, 2, 6, 10 are louder.
- `GHOST_KICK_STEPS` = 1, 5, 9, only when one step (cycle / 12) is at most `GHOST_KICK_MAX_STEP_SECONDS` = 0.17 s. That is Long 18/6 and Short 14/7 and 16/8. Set the constant to 0 to remove them.
- Any step longer than `HAT_MAX_GAP_SECONDS` = 0.5 s gets extra quiet hat ticks, evenly spaced, so no hat gap exceeds 0.5 s (including the wrap to the next bar).

Two step grids (`stepTimes`):

- Even grid, when `beatTimes(preset).beat2 <= ANCHOR_MIN_BEAT2_SECONDS` (1.0 s). That is Long 18/6 to 30/10 and all Short Game. Step i is `i * cycle / 12`. This is what Tour Tempo does.
- Anchored grid, for Long 42/14 and slower. Steps are even inside three sections (beat 1 to beat 2 is 4 steps, beat 2 to beat 3 is 2 steps, beat 3 to the next beat 1 is 6 steps), so beat 2 is exactly on step 4 and beat 3 exactly on step 6.
- `ANCHOR_MIN_BEAT2_SECONDS` = 0 means always anchored. `Infinity` means always even.

`loopEvents` output is sorted by time (kick, snare, hat on ties), has every time in `[0, cycle)`, and starts with a kick at 0. It does not read weight shift settings and does not touch `buildSequence`, so the three original beats and the weight shift beat are unchanged.

## 3. What we discovered (and how the design changed)

### 3.1 Tour Tempo's loop, measured from its clips
Method: ffmpeg extracted mono 22.05 kHz audio from `_references/tempo-clips/*.mp4`, then a spectrogram (STFT, about 5 ms hop) in a throwaway Python venv in `/tmp/tt` (not in the repo). Beeps were separated from drums by band: kick below 120 Hz, snare body 140 to 230 Hz and noise 2.5 to 5 kHz, hat 6 to 10 kHz. Beat 1 times (about 525 Hz) gave the cycle. Per-step energy was medianed over the cycles in each clip.

Findings, Long Game (18/6, 21/7, 24/8, 27/9, 30/10):

- The loop is 12 even steps per cycle (cycle / 12): 0.16 s at 18/6, 0.25 s at 30/10. A triplet or shuffle feel.
- Hat on every step. Strongest on steps 0 and 6, medium on 2 and 10, soft elsewhere.
- Kick on steps 0, 4, 8. Ghost kicks on 1, 5, 9 appear strongly at 18/6 and are gone by 21/7.
- Snare on steps 2, 6, 10, with step 6 loudest.
- Beat 2 lands at step 3.81 (18/6) to 4.01 (30/10). Beat 3 lands at step 6.34 (18/6) falling to 6.06 (30/10). So beat 3 is late on the grid at fast tempos because of its fixed 0.2 s delay, and converges toward step 6 as tempo slows.
- Measured cycle lengths: 1.916, 2.230, 2.499, 2.779, 2.998 s. Our `cycleSeconds` gives 1.90, 2.18, 2.47, 2.75, 3.03 s (within about 0.05 s).
- The loop keeps playing through the pause (hats on steps 7 to 11, kick on 8, snare on 10).

Short Game (14/7, 18/9, 24/12 analyzed): I found no loop in these clips. Activity sits only on the beeps. `_references/tempo-measurements.md` says the clips include the drum loop, so Short Game was probably recorded with it off (not certain). Short Game beat 2 measured at step 3.1 to 3.5 and beat 3 at 5.8 to 6.0 of a 12-step cycle, so beat 2 is about step 3, not 4. The Short Game loop here is our extrapolation of the Long Game pattern.

Caveats: screen-recording audio, beeps mixed into the same track. The hat-on-every-step, kick and snare positions are consistent across all five Long Game clips. Accent levels and the ghost kick strength are approximate. Short Game conclusions rest on three clips.

### 3.2 How the design changed, in the order we found it
1. First design (Wave 4.1): 4 equal quarters of the cycle, kick on quarters 1 and 3, snare on 2 and 4, hats evenly spaced per quarter. Sounded fine at fast tempos.
2. Listening at slow tempos: beats stopped lining up with the loop. Cause: beat 3 includes a fixed 0.2 s delay, but a grid that is a fixed fraction of the cycle scales with tempo. Beat 3 sat about 0.37 s early against the loop at 168/56 (about -0.07 s at 60/20, -0.13 at 84/28, -0.23 at 120/40). Beat 2 was never on the grid (about a third of the cycle).
3. Fix attempt 1 (Wave 4.1b, first version): anchor the grid to the beats at every tempo (hat on each beat, kick on beat 1, snare on beat 3). It fixed alignment but was too sparse and unlike Tour Tempo.
4. Measured Tour Tempo (above) and copied its 12-step pattern, with the three-section anchoring so beats stay on steps 4 and 6 at every tempo.
5. Listening again: the loop seemed to slow down only between beat 2 and beat 3, worst at 18/6. Cause: forcing beat 2 to beat 3 into exactly 2 steps stretches the middle steps (beat 2 to beat 3 is `down/30 + 0.2` s). Middle steps versus the other steps: +33% (18/6), +24% (21/7), +17% (24/8), +11% (27/9), +7% (30/10), -5% (42/14), -13% (60/20), -19% (84/28), -23% (120/40), -26% (168/56). Only about 30/10 is even.
6. Final: even grid for presets Tour Tempo has (matches its behavior, confirmed better by ear), anchored grid for the slower presets, switched by `ANCHOR_MIN_BEAT2_SECONDS`.

### 3.3 Smaller findings
- The spec guessed 8 hat ticks per quarter at 168/56. The rule gives 9 (quarter is 4.02 s). Moot now, kept here because it showed hand estimates of cycle length were off.
- At 30/10 the cycle is 3.033 s (our 0.2 s beat 3 delay plus the 1.5 pause factor), not the 3.0 s Tour Tempo measures. Steps are 0.2528 s, not 0.25 s.
- The Audio lab's Single beeps card (which holds the loop buttons) only shows when `getSharedPlayer()` is not null. In Expo Go there is no web audio, so the card is hidden. Test audio in the browser or a Netlify draft.
- Five-minute browser run, 21/7 with loop on, several preset changes: closest swing was 100 ms ahead of schedule, no growth in clock drift, restarts clean. Loop on did not change beep times (checked with a temporary fake-adapter test, then deleted).

## 4. Decisions made

| Decision | Value | Where |
|---|---|---|
| Loop keeps playing through the repeat pause | yes | `design.md` |
| Optional `playLoopVoice` on the adapter | yes, so other adapters and fakes compile | `types.ts` |
| Slow/normal pattern tables and `SLOW_QUARTER_SECONDS` | removed (replaced by step tables and the anchoring cutoff) | `loop.ts` |
| Loop switch persisted | no, off on every start | `MainScreen.tsx` |
| Short Game pattern | same pattern and ghost kick rule as Long Game, even grid | `loop.ts` |

## 5. Things the audit should look at

1. Beat 2 and beat 3 timing in `beats.ts` and `repeat.ts` are unchanged. Confirm `loop.ts` only reads them (`beatTimes`, `cycleSeconds`) and cannot move any beat.
2. Switching rule at the boundary between the even and anchored grids (Long 30/10 to 42/14). There is a jump in behavior: step stretch goes from +7% to -5%. Check it is acceptable, or whether a smooth blend is better.
3. The anchored grid's middle steps are 5 to 26% off the other steps for slow Long presets. By ear this was only judged on fast presets. Slow presets need a listening pass on desktop, iPad and Pixel (Wave 4.5).
4. Short Game: beat 2 lands near step 3, and no Short Game clip had a loop to confirm the pattern. Confirm the choice of Long Game's pattern for Short Game, with ghost kicks on 14/7 and 16/8.
5. `GHOST_KICK_MAX_STEP_SECONDS` = 0.17 sits between 16/8 (0.168 s) and 18/9 (0.187 s). Tight margin on 16/8. It compares `cycle / 12`, and the pause factors (Long 1.5, Short 1.9) feed into it.
6. Whether Tour Tempo's cycle should replace our `cycleSeconds` for Long Game. Measured: 1.916, 2.230, 2.499, 2.779, 2.998 s. Ours: 1.90, 2.18, 2.47, 2.75, 3.03 s. The differences are small. They affect the repeat pause, not the loop rules.
7. `loopEvents` gives every hat the same loudness except one flag (`accent`). Tour Tempo has several levels. Only the adapter's boolean exists today.
8. Test coverage: `loop.test.ts` checks all 16 presets for step grid shape, beat positions (anchored: exact, even: within half a step, Short beat 2 near step 3), kick and snare steps, hats on every step with accents, hat gap, sorting, range, ghost kick on/off and determinism. It does not test `loopSchedule` or the player scheduling. Those were checked once with a throwaway test and by ear.

## 6. Still to do (spec 4)

- Wave 4.4: the main-screen switch is built. Check by ear and in the browser that it is off on load, off after reload, and restarts once when toggled while playing.
- Wave 4.5: tune levels and constants by ear on desktop, iPad Safari and Pixel Chrome, record per device. Add the porting notes entry to `docs/porting-guide.md`. Update `.kiro/specs/_index.md` spec 4 Built status.
- Known gaps in the plan: the player's loop scheduling has no automated test (the audio folder is not in the Vitest include list).

## 7. Where to read more

- `docs/development-decisions.md`, section 2 (plain-language summary of the Tour Tempo finding).
- `.kiro/specs/background-loop/requirements.md`, `design.md`, `tasks.md`.
- `src/engine/loop.ts` and `src/engine/loop.test.ts`.
- `_references/tempo-measurements.md` (the earlier beat timing measurements).
