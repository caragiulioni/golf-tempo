# Practice Drills: handoff for the UI work

Written in the timing engine context for a UI spec window. Idea: `docs/ideas.md`, idea 2 ("Split the presets into Full Swings and Practice Drills"), section "Drill timing".

**V2 changes:** V2-04 (preset data), V2-07 (drill timing and countdown sound) in the timing context; V2-05 (toggle), V2-06 (Tempo slider), V2-08 (countdown on screen) in the UI. Plan and order: `docs/changes/V2.md`.

**Names:** the two groups are now **Gameplay** (was "Full Swings") and **Practice Drills** (was "Drills"). Older names below mean the same groups.

**Status:** planned. The timing engine part is not built yet. Names below marked *(planned)* may change while it is built; this document is updated when the engine change lands, and that update replaces the *(planned)* marks.

## 1. What the golfer gets

On a drill preset (Long Game 42/14, 60/20, 84/28) each swing plays once, then a recovery measure to finish and reset, then a countdown of 4, 3, 2, 1 that leads into the next takeaway. The countdown sits on the hi-hat, so it lines up with the background loop whether the loop is on or off.

Full Swings (18/6 to 30/10) and all of Short Game do not change. 120/40 and 168/56 are removed.

## 2. Who builds what

| Part | Where | Who |
|---|---|---|
| Drill group in the preset data; remove 120/40, 168/56 | `src/engine/presets.ts` | Timing context |
| Drill bar: swing, recovery measure, countdown | `src/engine/repeat.ts` | Timing context |
| Countdown events 4, 3, 2, 1 | `src/engine/sequence.ts` | Timing context |
| Drill loop pattern on the longer bar | `src/engine/loop.ts` | Timing context |
| Tests that lock the rules (section 5) | `src/engine/*.test.ts` | Timing context |
| Countdown sound, picked by ear in the Audio lab | `src/audio/tones.ts`, `src/audio-lab/AudioLab.tsx` | Timing context |
| Placeholders where code reads event types, so nothing breaks | `src/audio/tones.ts`, `src/ui/lib/timelineGeometry.ts`, `src/audio-lab/AudioLab.tsx` | Timing context |
| **Countdown on screen** (numbers, pulse, animation) | UI | **UI spec** |
| **Gameplay / Practice Drills toggle and Tempo slider** (V2-05, V2-06) | UI | **UI spec** |
| **Timeline during the recovery measure and countdown** | `src/ui/components/BeatTimeline.tsx` | **UI spec** |

## 3. The timing, in counts

One **count** is one downswing: `downFrames / 30` seconds. The hi-hat ticks every half count. With the true 3:1 a drill swing is exactly 4 counts.

| Counts | What happens |
|---|---|
| 0 | Takeaway (beat 1) |
| between 0 and 3 | Weight shift, a fraction of the backswing, same as now |
| 3 | TOP (beat 2) |
| 4 | Impact (beat 3) |
| 4 to 8 | Recovery measure |
| 8, 9, 10, 11 | Countdown 4, 3, 2, 1 |
| 12 | Next takeaway (count 0 of the next bar) |

A bar is 12 counts = 24 hi-hats = 3 measures of 8: swing, recovery, countdown.

| Drill | One count | Hi-hat | Swing | Recovery + countdown | Whole bar |
|---|---|---|---|---|---|
| 42/14 | 0.47 s | 0.23 s | 1.87 s | 3.73 s | 5.60 s |
| 60/20 | 0.67 s | 0.33 s | 2.67 s | 5.33 s | 8.00 s |
| 84/28 | 0.93 s | 0.47 s | 3.73 s | 7.47 s | 11.20 s |

## 4. How the UI reads it

Nothing new to subscribe to. The countdown comes through the same schedule the timeline already follows.

- **Preset group:** each preset gets a `group` field, `'fullSwing'` or `'drill'` *(planned names)*, in `src/engine/presets.ts`. Use it for the labels and the grid. Do not decide in the UI which presets are drills.
- **Countdown events:** `buildSequence` returns four extra events for drills, `{ type: 'countdown', time, count: 4 | 3 | 2 | 1 }` *(planned shape)*, at counts 8 to 11 of the bar. Times are seconds from that bar's takeaway, like every other event.
- **During playback:** the player puts them in `ScheduledSwing.beeps` on the audio clock (`src/audio/player.ts`), next to takeaway, weight shift, TOP and impact. The timeline already receives that through `onSwing` (`src/ui/hooks/usePlayerSession.ts`).
- **Output delay:** apply it to countdown events exactly as to the other beats (`src/ui/lib/outputDelay.ts`), so the numbers change with the sound.
- **The countdown leads into the next bar's takeaway.** "1" is one count before the takeaway of the next scheduled swing.
- **Three-beat mode** (no weight shift) still has the countdown on drills *(planned)*.

## 5. Rules not to break

The timing context locks these with tests. The UI must not work around them, for example with its own timers.

1. Every drill bar is exactly 24 hi-hats (whole measures of 8).
2. Every countdown event lands exactly on a hi-hat, loop on or off.
3. Takeaway, weight shift, TOP and impact land where they do now, relative to the backswing.
4. Full Swings and Short Game produce exactly the same events as before.
5. Everything scales with tempo: no fixed seconds anywhere in the drill bar.
6. Visuals follow the audio schedule, never a separate timer (`.kiro/steering/tech.md`).

## 6. What the UI spec decides

- How the countdown looks: numbers, where they sit (lean: at TAKEAWAY on the timeline), the pulse, and what shows during the recovery measure before "4".
- The timeline's ease-back (the gold fill sliding back after impact): today it fills the pause. On drills the pause is much longer and holds the countdown. Decide how they share it.
- Decided in the V2 plan (replaces the earlier two-group grid): a **GAMEPLAY / PRACTICE DRILLS** toggle (V2-05) and a stepped **Tempo** slider in place of the preset buttons (V2-06). Long Game drops to 8 presets: 5 Gameplay (slider starts at 24/8), 3 Practice Drills (starts at 60/20).
- The "Available sessions" rename (decided: "Tempo", V2-06).
- Reuse check before any UI (`.kiro/steering/workflow.md`), and the guiding principles (`.kiro/steering/product.md`).

## 7. Open questions

- Pressing Play (and the restart after a change): start with a countdown before the first takeaway, or straight on takeaway as now? Affects the player and the timeline. To be decided while the engine part is built; this document records the answer.
- Countdown sound: chosen by ear in the Audio lab (timing context). Recorded here when picked.
- Whether the countdown hats are accented in the loop: decided by ear (timing context).

## 8. Where to read more

- `docs/ideas.md`, idea 2: the feature and the drill timing.
- `.kiro/steering/timing-engine.md`: the timing rules.
- `docs/background-loop-audit-notes.md`, section 9: why the slow presets use a kick and a steady hi-hat, and why bars must be whole measures of 8.
- `.kiro/steering/prototype-versions.md`: the approved engine exception for this feature.
