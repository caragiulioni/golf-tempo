# Tasks: background-loop

Follows `.kiro/steering/workflow.md`. Stop for review at the end of every wave, and after any audio task. UI tasks open with a Reuse check.

## Wave 4.1: Loop pattern (engine, no sound)

- [x] 1. Spec docs. Check: requirements, design and tasks exist and `_index.md` spec 4 says Spec: DONE.
- [x] 2. `src/engine/loop.ts`, `loop.test.ts`, export from `src/engine/index.ts`. Check: `npm test` passes. Tests, over all 16 presets: bar length equals `cycleSeconds`; first event is a kick at time 0; all events in `[0, cycle)`; hat gap at most 0.5 s; hat ticks evenly spaced and one lands exactly on each quarter start; kick and snare on the table's quarters (normal and slow); 30/10 gives 2 hat ticks per quarter and 168/56 gives 9 and the slow table; same input gives the same output.

Stop for review.

## Wave 4.1b: Copy Tour Tempo's loop (after listening and measuring its clips)

- [x] 1. Rewrite `loopEvents` in `src/engine/loop.ts` and its tests: 12 steps, beat 2 on step 4, beat 3 on step 6, Tour Tempo's kick, snare, hat and ghost-kick tables. Check: `npm test` passes for all 16 presets. By ear (Wave 4.4 switch): beats 1, 2 and 3 line up with the loop at 18/6, 30/10, 84/28 and 168/56, and 18/6 sounds like the Tour Tempo clip.

## Wave 4.2: Loop sounds (audio, no player yet)

- [x] 1. `LoopVoice` type and optional `playLoopVoice` in `src/audio/types.ts`. Check: `npm run typecheck` passes; file imports nothing from the DOM or React.
- [x] 2. Kick, snare, hat, noise buffer, loop bus and `stopAll` fade in `src/audio/webAudio.ts`. Check: `npm run typecheck` passes.
- [x] 3. Three test buttons (Kick, Snare, Hat) in `src/audio-lab/AudioLab.tsx`. Check by ear on desktop: kick is a low thump that drops in pitch; snare is a short crack, not a beep; hat is a quiet tick. Each ends with no click. Press a button then Stop: no click or tail.

Stop for review (audio).

## Wave 4.3: Loop in the player

- [x] 1. `SwingOptions.loop`, loop scheduling in `scheduleSwing`, `ScheduledSwing.loop` in `src/audio/player.ts`. Check: with a fake adapter or the lab log, 30/10 with loop on logs kick at beat 1 time and hat times at 0, 0.5 and 1.0 s (beat 2), then beat 3 at 1.53 s; loop off logs no loop events; beep times are unchanged from before.
- [x] 2. Loop on/off option in the Audio lab, passed in the lab's swing options. Check by ear, desktop, 30/10 loop on: kick lands with beat 1; loop sits under the beeps and every beep is clearly audible; loop bar lines up with the swing for 2 minutes with no drift; Stop gives silence with no click; changing preset restarts cleanly once with the new tempo's loop from beat 1; 168/56 hat pulse is steady and kick and snare are sparse.

Stop for review (audio).

## Wave 4.4: UI toggle

- [x] 1. Make the Loop_Switch live. Reuse check first: list `src/ui/components/`, reuse the existing `Switch` (remove only `disabled`), no new styles. Files: `src/app/MainScreen.tsx`, `src/ui/hooks/usePlayerSession.ts`. Check in the browser: switch is off on load; reload keeps it off; turning it on while stopped plays the loop on the next Play; toggling while playing restarts once (short pause, new run from beat 1); preset change keeps the loop on; Long and Short Game both play it; the switch is not greyed out. Result: switch behavior checked by ear in the browser. Found while listening: toggling while playing left TOP lit during the restart; fixed with `BeatTimeline` `restartKey` (commit 84e4b69). That fix was not separately rechecked by eye.

Stop for review.

## Wave 4.5: Tune and porting notes

- [x] 1. Tune constants by ear (levels, hat gap, sounds), on desktop plus iPad Safari and Pixel Chrome. Check: record per device (model, browser version) whether the kick is audible on phone speakers and the beeps stay clear. Only named constants change. Result: desktop listening (Mac Chrome) accepted; Pixel 6 Chrome 157 and iPad Safari 16.6 scheduled cleanly through many restarts (logs). Speaker levels not formally rated per device; no problems reported, so no constants changed. Along the way: Short Game grid tried anchored and reverted to even by ear; weight shift defaults set to Long 0.50, Short 0.60.
- [x] 2. Porting notes: add an entry to `docs/porting-guide.md` in its format (web-only: Web Audio synthesis in `webAudio.ts`; unchanged: `loop.ts` and the Switch wiring; untested on native). Update `_index.md` spec 4 Built status after review.

Stop for review.
