# Tasks: background-loop

Follows `.kiro/steering/workflow.md`. Stop for review at the end of every wave, and after any audio task. UI tasks open with a Reuse check.

## Wave 4.1: Loop pattern (engine, no sound)

- [x] 1. Spec docs. Check: requirements, design and tasks exist and `_index.md` spec 4 says Spec: DONE.
- [x] 2. `src/engine/loop.ts`, `loop.test.ts`, export from `src/engine/index.ts`. Check: `npm test` passes. Tests, over all 16 presets: bar length equals `cycleSeconds`; first event is a kick at time 0; all events in `[0, cycle)`; hat gap at most 0.5 s; hat ticks evenly spaced and one lands exactly on each quarter start; kick and snare on the table's quarters (normal and slow); 30/10 gives 2 hat ticks per quarter and 168/56 gives 9 and the slow table; same input gives the same output.

Stop for review.

## Wave 4.2: Loop sounds (audio, no player yet)

- [x] 1. `LoopVoice` type and optional `playLoopVoice` in `src/audio/types.ts`. Check: `npm run typecheck` passes; file imports nothing from the DOM or React.
- [x] 2. Kick, snare, hat, noise buffer, loop bus and `stopAll` fade in `src/audio/webAudio.ts`. Check: `npm run typecheck` passes.
- [x] 3. Three test buttons (Kick, Snare, Hat) in `src/audio-lab/AudioLab.tsx`. Check by ear on desktop: kick is a low thump that drops in pitch; snare is a short crack, not a beep; hat is a quiet tick. Each ends with no click. Press a button then Stop: no click or tail.

Stop for review (audio).

## Wave 4.3: Loop in the player

- [ ] 1. `SwingOptions.loop`, loop scheduling in `scheduleSwing`, `ScheduledSwing.loop` in `src/audio/player.ts`. Check: with a fake adapter or the lab log, 30/10 with loop on logs kick at beat 1 time and hat times at +0.375 s steps; loop off logs no loop events; beep times are unchanged from before.
- [ ] 2. Loop on/off option in the Audio lab, passed in the lab's swing options. Check by ear, desktop, 30/10 loop on: kick lands with beat 1; loop sits under the beeps and every beep is clearly audible; loop bar lines up with the swing for 2 minutes with no drift; Stop gives silence with no click; changing preset restarts cleanly once with the new tempo's loop from beat 1; 168/56 hat pulse is steady and kick and snare are sparse.

Stop for review (audio).

## Wave 4.4: UI toggle

- [ ] 1. Make the Loop_Switch live. Reuse check first: list `src/ui/components/`, reuse the existing `Switch` (remove only `disabled`), no new styles. Files: `src/app/MainScreen.tsx`, `src/ui/hooks/usePlayerSession.ts`. Check in the browser: switch is off on load; reload keeps it off; turning it on while stopped plays the loop on the next Play; toggling while playing restarts once (short pause, new run from beat 1); preset change keeps the loop on; Long and Short Game both play it; the switch is not greyed out.

Stop for review.

## Wave 4.5: Tune and porting notes

- [ ] 1. Tune constants by ear (levels, `SLOW_QUARTER_SECONDS`, hat gap, sounds), on desktop plus iPad Safari and Pixel Chrome. Check: record per device (model, browser version) whether the kick is audible on phone speakers and the beeps stay clear. Only named constants change.
- [ ] 2. Porting notes: add an entry to `docs/porting-guide.md` in its format (web-only: Web Audio synthesis in `webAudio.ts`; unchanged: `loop.ts` and the Switch wiring; untested on native). Update `_index.md` spec 4 Built status after review.

Stop for review.
