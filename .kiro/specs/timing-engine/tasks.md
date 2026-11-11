# Tasks: timing-engine

Follows `.kiro/steering/workflow.md`. Stop for review at the end of every wave.

## Wave 1.1: Preset data and the three beats

- [x] 1. Spec docs. Check: requirements, design and tasks exist and `_index.md` is updated.
- [x] 2. Test runner check. Add one trivial test in `src/engine/`. Check: `npm test` runs it and passes.
- [x] 3. Preset data and ratio test. Check: 16 presets listed; the test fails if a preset breaks its category's ratio.
- [x] 4. Beat times for one preset. Check: 30/10 gives about 0, 1.0 and 1.53 s.
- [x] 5. Beat times against the measurements. Check: all 11 Tour Tempo presets pass within 25 ms; slow presets follow the same rule.

## Wave 1.2: Weight shift beat

- [x] 1. Weight shift time from a position. Check: 0.5 on 30/10 lands halfway; the same fraction on 18/6.
- [x] 2. Safe range clamp. Check: -1, 0, 1 and 2 land inside 0.05 to 0.95.
- [x] 3. Independent categories with defaults. Check: changing one does not change the other; defaults are 0.67 and 0.75.
- [x] 4. Beats never move. Check: beats 1, 2 and 3 are identical with and without the weight shift.

## Wave 1.3: Playback sequence

- [x] 1. Sequence builder. Check: 30/10 Long with defaults gives four events in time order, weight shift between beats 1 and 2.
- [x] 2. Three-beat mode. Check: three events with the same beat times as before.
- [x] 3. Sequence tests for the key rules. Check: `npm test` and `npm run typecheck` pass.
- [x] 4. Porting notes. Check: entry added to `docs/porting-guide.md` in the agreed format.
