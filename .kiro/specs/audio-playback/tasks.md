# Tasks: audio-playback

Follows `.kiro/steering/workflow.md`. Stop for review at the end of every wave, and after any task that touches timing or audio.

## Wave 2.1: One swing you can hear (desktop browser)

- [x] 1. Spec docs. Check: requirements, design and tasks exist and `_index.md` is updated.
- [x] 2. Adapter interface with no web code. Check: `npm run typecheck` passes and `src/audio/types.ts` imports nothing from the DOM or React.
- [x] 3. Web tones: four voices, weight shift clearly distinct by default, with the tone switch. Check by ear: each tone plays from the temporary AudioLab button.
- [x] 4. Play one swing from the engine's list on the audio clock. Check: for 30/10, logged audio times match the engine within 1 ms, and by ear the weight shift sits between beat 1 and beat 2.

## Wave 2.2: Repeat, start/stop, restart on change

- [ ] 1. Repeat pause in the engine. Check: automated tests; cycle lengths close to the clips (24/8 about 2.5 s, 30/10 about 3.0 s).
- [ ] 2. Repeating playback. Check by ear and log: 30/10 repeats with no drift over 2 minutes.
- [ ] 3. Start and stop with unlock on the first tap. Check: starts from beat 1 every time; silence after stop, including already scheduled beeps.
- [ ] 4. Restart on change. Check: tap three presets quickly and only the last one plays; nothing starts if stopped.

## Wave 2.3: Phone behavior

- [ ] 1. Screen wake lock while playing. Check: the phone stays awake.
- [ ] 2. Auto-pause when hidden or locked; resume needs a tap. Check: switch tabs, then lock the phone.
- [ ] 3. Long session check, 5 minutes. Check: scheduled against actual time stays tiny.
- [ ] 4. Real device testing: desktop, iPad Safari, Android Chrome (two phones). Check: results recorded per device in `docs/porting-guide.md`.
- [ ] 5. Porting notes. Check: entry added to `docs/porting-guide.md`.
