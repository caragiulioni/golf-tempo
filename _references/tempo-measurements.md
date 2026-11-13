# Tour Tempo beat measurements

Measured from screen recordings of the Tour Tempo app in `_references/tempo-clips/` (local only, git-ignored). The Long Game clips include the app's background drum loop; the Short Game clips do not (no drum hits were detected in them, so they were probably recorded with the loop off). Beeps were told apart from the drum by pitch: beat 1 about 525 Hz, beat 2 about 312 Hz, beat 3 about 350 Hz (Long Game). The drum sits near 175 Hz.

All times in seconds. "Label" is the frame math (frames / 30) for the printed numbers. "Extra" is measured minus label for the beat 2 to beat 3 gap.

Detection is good to a few milliseconds. The first swing in each clip is skipped when it was cut off.

## Long Game (3:1)

| Preset | 1 to 2 label | 1 to 2 measured | 2 to 3 label | 2 to 3 measured | Extra |
|---|---|---|---|---|---|
| 18/6 | 0.600 | 0.598 | 0.200 | 0.412 | 0.212 |
| 21/7 | 0.700 | 0.702 | 0.233 | 0.428 | 0.195 |
| 24/8 | 0.800 | 0.798 | 0.267 | 0.467 | 0.200 |
| 27/9 | 0.900 | 0.901 | 0.300 | 0.499 | 0.199 |
| 30/10 | 1.000 | 0.990 | 0.333 | 0.511 | 0.178 |

## Short Game (2:1)

| Preset | 1 to 2 label | 1 to 2 measured | 2 to 3 label | 2 to 3 measured | Extra |
|---|---|---|---|---|---|
| 14/7 | 0.467 | 0.463 | 0.233 | 0.438 | 0.205 |
| 16/8 | 0.533 | 0.532 | 0.267 | 0.466 | 0.199 |
| 18/9 | 0.600 | 0.599 | 0.300 | 0.500 | 0.200 |
| 20/10 | 0.667 | 0.666 | 0.333 | 0.533 | 0.200 |
| 22/11 | 0.733 | 0.728 | 0.367 | 0.571 | 0.204 |
| 24/12 | 0.800 | 0.795 | 0.400 | 0.601 | 0.201 |

## Findings

- Beat 1 to beat 2 matches the label (frames / 30) within a few milliseconds in every preset.
- Beat 2 to beat 3 runs about 0.20 s longer than the label, and the extra is the same at every tempo. It is a fixed delay, not a proportion.
- Short Game is very steady, 0.199 to 0.205 s. Long Game ranges from 0.178 to 0.212 s. The 30/10 low value is probably detection noise; its earlier measurement in `VID_20261107_135008.mp4` was 0.50 s (extra about 0.17).
- Full swing cycle (beat 1 to the next beat 1), including the repeat pause: Long Game 24/8 is 2.5 s, 30/10 is 3.0 s, Short Game 18/9 is about 2.29 s.
- Beat 3 in Short Game uses the same tone as beat 1. In Long Game it is a separate tone.

Not measured: the slow Long Game presets (42/14 and up). They do not exist in Tour Tempo.
