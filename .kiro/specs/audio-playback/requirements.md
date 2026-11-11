# Requirements: audio-playback

Shared decisions live in the steering files (`product.md`, `tech.md`, `structure.md`, `timing-engine.md`, `workflow.md`). This spec does not restate them. Measured data: `_references/tempo-measurements.md`.

## Goal

Play the engine's beat list as sound, on the audio clock, repeating, with start/stop and the phone behavior a golfer needs. Web first, behind an adapter interface so a native version can replace it. No background loop (spec 4) and no real UI (spec 3).

## Requirements

1. **Adapter interface.** All audio goes through an interface in `src/audio/` with no DOM or React in it. It covers unlock, current audio time, play a tone at a given time, and stop everything.
2. **Web implementation.** Web Audio API, scheduled from `AudioContext.currentTime`. No `setTimeout` or `setInterval` for beat timing. A timer may only top up the schedule ahead of time.
3. **Tones.** Synthesized in code, no recorded files. Starting pitches from the reference measurements: beat 1 about 525 Hz, beat 2 about 312 Hz, beat 3 about 350 Hz. In Short Game, beat 3 uses the beat 1 tone.
4. **Weight shift tone.** The same family as the other beeps, short and crisp, with a sharp start, as loud as the rest, and at a different pitch. One named setting holds its pitch and length, with a switch for "same as the others", so both can be compared by ear.
5. **One swing.** Playing a preset schedules the engine's events at their exact times from a start time on the audio clock.
6. **Repeat pause.** After beat 3 there is a pause before the next beat 1, scaled with tempo: 1.5 times the beat 1 to 2 gap in Long Game, 1.9 times in Short Game. Both factors are named constants in `src/engine/`, with tests. Starting values, tuned by ear.
7. **Repeating playback.** Swings repeat without drift. The next swings are scheduled ahead of time on the audio clock.
8. **Start and stop.** The first play press unlocks browser audio. Playing always starts from beat 1. Stopping silences everything, including beeps already scheduled.
9. **Restart on change.** Changing the preset, category or weight shift position while playing stops fully, waits about 0.5 s, then starts a new run from beat 1. Rapid changes are debounced, so only the last one restarts. Nothing starts if playback was stopped.
10. **Screen wake lock** while playing, so the phone does not auto-lock.
11. **Keep playing in the background.** When the page is hidden or the phone locks, playback keeps going where the browser allows it (a driving range user should not have to unlock the phone between swings). The player schedules further ahead while in the background. If the system takes the audio away, the player stops cleanly and reports "paused"; resuming needs a tap. If the timer falls far behind, the run restarts from beat 1 instead of playing missed swings at once.
12. **Visuals follow the audio schedule.** The player exposes the scheduled event times on the audio clock so the UI can follow them. It does not use a separate timer.
13. **Real device testing.** Desktop browsers, an iPad (iOS Safari) and Android Chrome phones. Results are recorded per device in `docs/porting-guide.md`. A pass on one platform does not count for another.
14. **Porting notes.** The spec ends with an entry in `docs/porting-guide.md`.

## Out of scope

The background 808 loop and its toggle (spec 4). Real UI (spec 3). Native audio implementation (later port).
