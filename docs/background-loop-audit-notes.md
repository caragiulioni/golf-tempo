# Background loop: change log and findings (for the engine audit)

Written for a fresh reviewer (the timing engine context) who has not seen the loop work. Covers spec 4 (`.kiro/specs/background-loop/`), Waves 4.1 to 4.4. Wave 4.5 (tuning on phones, porting notes) is not done.

**Current state:** section 9 (true 3:1 and 2:1, November 2026) replaces the loop rules in sections 2 and 8 where they differ. **Earlier update:** the engine audit is in section 8. Some rules in section 2 changed as a result (Short Game grid, slow hats, ghost kick list, a rounding bug). Section 8 is the current state where they differ.

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

## 8. Engine audit (November 2026)

Done by the timing engine context. Method: read `loop.ts`, `loop.test.ts`, `player.ts`, the loop parts of `webAudio.ts`, `MainScreen.tsx` and `usePlayerSession.ts`; ran the tests; computed where every beat lands on the drum grid for all 16 presets; ran the real `loopEvents` through a throwaway test (deleted afterwards). The clips were not re-extracted: the earlier beat measurements cover what was needed.

### 8.1 Engine integrity (answers section 5, item 1)
- `beats.ts`, `repeat.ts`, `sequence.ts`, `presets.ts` and `weightShift.ts` were unchanged by the loop work (no diff since spec 2's last commit, `eec4167`). The only later change is the weight shift default, made on purpose (8.4).
- `loop.ts` only reads `beatTimes` and `cycleSeconds`. It cannot move a beat.
- The player schedules beeps first, then the loop, from the same start time on the audio clock. Each bar starts exactly where the last one ended. Stop and restart fade the drums like the beeps.

### 8.2 Findings

Where the beats landed against the drums before the fixes (negative means the beep is before the drum):

| Preset | Grid | Beat 2 vs kick (step 4) | Beat 3 vs snare (step 6) |
|---|---|---|---|
| Long 18/6 | even | -33 ms | +50 ms |
| Long 30/10 | even | -11 ms | +17 ms |
| Long 42/14 to 168/56 | anchored | 0 | 0 |
| Short 14/7 | even | -129 ms | +7 ms |
| Short 18/9 | even | -147 ms | -20 ms |
| Short 24/12 | even | -173 ms | -60 ms |

1. **Short Game double hit (main cause of "hits not quite right").** On the even grid, Short Game beat 2 sits near step 3.1 to 3.3, so the kick on step 4 arrives 0.13 to 0.17 s after the beep, heard as a second hit. The pattern was copied from Long Game; no Short Game clip has a loop to copy.
2. **Long Game fast presets flam slightly, like Tour Tempo.** Up to 50 ms at 18/6. Faithful to the clips, so kept.
3. **Why no grid fixes everything:** beat 3 has a fixed 0.2 s delay, so beat 2 and beat 3 can only both sit on an even 12-step grid at one tempo (beat 2 at 1.2 s), which is not a preset. Every design gives up one of: an even drum pulse, beats exactly on drum hits, or no speed change inside the bar.
4. **Bug: 60/20 hat doubled for one step after impact.** That step is exactly 0.5 s, floating point made it a hair longer, and the "longer than 0.5 s gets extra ticks" rule split it. Hat gaps went 0.5, 0.25, 0.25, 0.5.
5. **Slow Long presets: the hat pulse sped up 13 to 26% between beat 2 and beat 3** (168/56: 0.467 s gaps, then 0.344 s). Conflicts with the product rule of a steady pulse at slow tempos.
6. **The weight shift is never on the drum grid** (step 2.4 to 2.7, between the snare and the next hat). By design, but with the loop on it sounds between drum hits, which matters when calibrating.
7. **Ghost kick threshold too tight:** 16/8 was 1.2 ms under the 0.17 s limit. Any pause-factor tuning could flip it.
8. Smaller: no master limiter (beat 1 plus kick plus accented hat peaks near 0.9 of full scale by estimate, so probably not clipping; low priority). The player's loop scheduling still has no automated test. Cycle lengths differ from Tour Tempo by under 50 ms (pause only; left alone). The 30/10 to 42/14 change in grid only happens between presets, which restart anyway.
9. Doc correction: `_references/tempo-measurements.md` said the clips include the drum loop. Only the Long Game clips do; the earlier measurement data shows no drum hits in the Short Game clips. Corrected. (Note: `structure.md` says `_references/` is not edited; that file was created by the developer during spec 1, so it was corrected in place. Move the correction to `docs/` if preferred.)

### 8.3 Decisions (developer, November 2026)
1. Short Game: anchor the grid to its beats. The developer counted the Short Game clips in 6 (not 4) and heard the beats land on the count. **Reversed after listening:** with the beeps off (new Audio lab "Beats: Off"), the loop audibly sped up between TOP and IMPACT, unnoticeable at 14/7 and worse the slower the preset (up to 23% at 24/12). Short Game is back on the even grid (`ANCHOR_MIN_BEAT2_SECONDS.short` = Infinity). Listened with the beeps on (18/9, 24/12): the beat 2 to kick gap is fine by ear, so the step 4 kick stays.
2. Slow Long presets: tick beat 2 to beat 3 as one span.
3. Calibration: the brother chooses whether to calibrate with the loop on or off (added to spec 5's scope in `.kiro/specs/_index.md` and to `docs/dev_questions.md`).
4. Fix the bugs (60/20 rounding, ghost kick threshold).
5. Long Game weight shift default changes from 0.67 to 0.53. **Later the same day:** 0.53 sat within 1 to 25 ms of the step 2 snare at the fast Long tempos (a flam). Defaults set to Long 0.50 and Short 0.60 as starting points; the brother fine-tunes them in CONFIG.

### 8.4 What changed (uncommitted, on top of the 4.1b and 4.4 work)

| Change | Where |
|---|---|
| `ANCHOR_STEPS` per category: Long beat 2 on step 4, beat 3 on 6; Short beat 2 on step 3, beat 3 on 6. Replaces `BEAT2_STEP` and `BEAT3_STEP`. | `src/engine/loop.ts` |
| `ANCHOR_MIN_BEAT2_SECONDS` per category: Long 1.0 (unchanged), Short Infinity (always even; briefly 0, anchored, then reversed by ear). New `usesAnchoredGrid(preset)`. | `src/engine/loop.ts` |
| `GHOST_KICK_PRESETS` list (Long 18/6, Short 14/7 and 16/8) replaces `GHOST_KICK_MAX_STEP_SECONDS`. Same presets as before. | `src/engine/loop.ts` |
| Hat tick rounding slack (60/20 fix). | `src/engine/loop.ts` |
| Slow anchored grids tick beat 2 to beat 3 as one span. Middle hat gaps: 84/28 0.378 s (was 0.283), 120/40 0.511 s (was 0.383), 168/56 0.517 s (was 0.344). 42/14 and 60/20 unchanged. | `src/engine/loop.ts` |
| Events sorted at the end (kick, snare, hat on ties), so forced ghost kicks stay in order. | `src/engine/loop.ts` |
| Long Game weight shift default 0.53 (was 0.67). | `src/engine/weightShift.ts`, steering `product.md` and `timing-engine.md`, spec 1 requirements, `docs/dev_questions.md` |
| Audio lab "Beats: Off" option: plays the loop on its own (beeps scheduled silently). Player `SwingOptions.beeps`, default true, so the main app is unchanged. | `src/audio/player.ts`, `src/audio-lab/AudioLab.tsx` |
| Tests: per-category grid checks, hats on beats for anchored grids, steady-pulse check, ghost kick list, 60/20 regression, 168/56 middle span, Short Game on the even grid, defaults 0.53. 280 tests pass, typecheck clean. | `src/engine/loop.test.ts`, `sequence.test.ts`, `weightShift.test.ts` |
| Spec text brought in line. | `.kiro/specs/background-loop/requirements.md`, `design.md`, `docs/development-decisions.md` section 2 |
| Timeline fix (found while listening): toggling the loop while playing left the stopped run's marker lights pending, so TOP lit during the restart pause. `BeatTimeline` gets a `restartKey` prop (the loop switch) that resets it like a preset change. | `src/ui/components/BeatTimeline.tsx`, `src/app/MainScreen.tsx` |

Unchanged: fast Long Game (18/6 to 30/10) keeps Tour Tempo's even grid; kick, snare, hat and accent tables; the beeps; the player.

### 8.5 Costs and what to listen for
- **Short Game:** anchored version heard and rejected (speed change between TOP and IMPACT). Back on the even grid; steady loop and the beat 2 to kick gap both accepted by ear on desktop.
- **Slow Long Game:** 84/28, 120/40 and 168/56 should now feel steadier between beat 2 and beat 3. 60/20 should no longer have the quick double hat right after impact.
- **Weight shift:** now 0.50 (Long) and 0.60 (Short), starting points for CONFIG.
- Not checked by ear yet. Wave 4.5 (phones) still applies.

## 9. True 3:1 and 2:1, and the loop rebuilt to fit (November 2026)

### 9.1 Why
The developer saw that Short Game TOP felt early. Golf sources agree the numbers are video frames (18/9 = 0.6 s back, 0.3 s down) and the ratio is 2:1 for the short game and 3:1 for full swings. Our impact had the 0.2 s delay copied from Tour Tempo's app, so the heard ratio was squashed: Short 14/7 to 24/12 sounded 1.1:1 to 1.3:1, Long 18/6 to 30/10 1.5:1 to 1.9:1, and the timeline put TOP at 52 to 57% (Short) and 60 to 65% (Long) instead of 67% and 75%.

### 9.2 Engine change
- `BEAT3_DELAY_SECONDS` 0.2 to 0 (`src/engine/beats.ts`). TOP is now exactly 3/4 (Long) and 2/3 (Short) of the way to impact at every tempo. Tests check it.
- The key principle, from the developer's ear: everything must scale with tempo. The old 0.2 s did not, which is why slow and fast presets never sounded like the same swing.

### 9.3 Loop: what was tried, in order, and the result
| Try | Result by ear |
|---|---|
| Keep Tour Tempo's pattern unchanged | Fast Long fine. Slow Long anchored grid made the hats speed up 33% between TOP and IMPACT (42/14, 60/20). |
| Slow Long: steady hats on the downswing grid | Hats steady, but the snare on IMPACT came too soon after the kick on TOP. |
| Slow Long: even drums plus a longer rest (pause factor 5/3) | Snare far from IMPACT; "weird at the end". Rejected. |
| All Long one rule (pause 1.5, even grid) | Same groove slowed down, but at 60/20 and slower the offsets lasted long enough to sound off. |
| **Slow Long: kick on beat 1 and steady hats only** | **Accepted.** Hats land on TOP and IMPACT (accented). |
| Slow Long pause 1.5 counted 4 x 8 + 2 at 168/56 | Pause factor 4/3: bar = 8 downswings = 16 or 32 hats, whole measures of 8, IMPACT on a first count. **Accepted.** |
| 120/40 hats doubled to 0.33 s (felt like double time) | `SPARSE_HAT_MAX_GAP_SECONDS` 0.7: 120/40 ticks at 0.67 s like its neighbours. **Accepted** (easier to count). |
| **Short Game pause factor 1.9 to 1.5** | **Accepted.** Bar = 3 x TOP, so TOP is exactly on the step 4 kick and IMPACT on the step 6 snare at every tempo (the developer's 6-count: TOP on 3, IMPACT on 4). |

### 9.4 Current rules
- Long 18/6 to 30/10: even 12-step grid, Tour Tempo's kick/snare/hat tables, pause 1.5. TOP at step 4.24 and IMPACT at 5.65 at every tempo (same relative spot). Ghost kicks at 18/6.
- Long 42/14 to 168/56 (`isSlowLongPreset`, `usesSparsePattern`): pause 4/3; one kick at 0; one steady hat on the downswing split into 2 or 4 parts (gap at most 0.7 s): 42/14 0.23 s, 60/20 0.33 s, 84/28 0.47 s, 120/40 0.67 s, 168/56 0.47 s; 16 hats per bar except 168/56 (32); accents on beat 1, TOP, IMPACT.
- Short Game: even 12-step grid, Tour Tempo's tables, pause 1.5. TOP exactly on the step 4 kick, IMPACT exactly on the step 6 snare. Ghost kicks at 14/7 and 16/8.
- Anchored grids are no longer used (`ANCHOR_MIN_BEAT2_SECONDS` Infinity for both); the code stays for reference.
- Cycle lengths are shorter than Tour Tempo's clips (no late impact; Short also rests less). Accepted by ear.

### 9.5 Checks
- 339 tests pass, typecheck clean. New tests: TOP at 3/4 and 2/3; same relative spot within each group; slow Long whole measures of 8 with IMPACT on a first count; Short TOP on the kick and IMPACT on the snare; slow Long rest = 4 downswings; Short cycle = 3 x TOP.
- Listened on desktop (Mac, local dev server) by the developer: Long at every tempo with the loop on and off, Short at 14/7, 18/9, 24/12. Phones not rechecked after this change.

