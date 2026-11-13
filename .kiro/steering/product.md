# Product: Golf Tempo Trainer

A personalized golf tempo trainer modeled on Tour Tempo, with one addition: a weight shift beat for the lateral weight transfer (starting in the hips) in the user's brother's swing.

Source material lives in `_references/` (spec, Tour Tempo screen recording, screenshots). Read `_references/INIT golf tempo.md` for the full spec. The original spec calls the added beat the "fourth beat"; we call it the weight shift beat, because in time order it is the second moment. Open decisions are tracked in `docs/dev_questions.md` (developer) and `docs/client_questions.md` (brother). The brother's original answers are in `docs/client_questions_ANSWERS.md`.

## The swing, in time order

1. Takeaway (beat 1)
2. Weight shift (the added beat)
3. Top of swing (beat 2)
4. Impact (beat 3)

Everything stays framed around Tour Tempo's three beats and current tempos. The weight shift is one additional data point.

## Core behavior

- Three beeps per swing, as in Tour Tempo: beat 1 (takeaway), beat 2 (top of backswing), beat 3 (impact).
- Long Game presets (3:1): 18/6, 21/7, 24/8, 27/9, 30/10, then slower practice presets 42/14, 60/20, 84/28, 120/40, 168/56. Ten buttons.
- Short Game presets (2:1): 14/7, 16/8, 18/9, 20/10, 22/11, 24/12. Slower Short Game presets are pending the brother's answer.
- Slow presets are for slow practice swings, to feel each part of the move. They are not for real swings.
- Tempo is chosen with preset buttons. No tempo slider and no automatic speed-up.
- One background 808-style loop, generated in code, with an on/off toggle. Off by default; it plays when the user presses play. It plays in both Long Game and Short Game. Beat 1 lands on the start of a bar. At slow tempos a hi-hat carries a steady pulse (see `docs/dev_questions.md`).
- Play/pause toggle in the Current session header.
- No sound styles (Voice, String, Bossa Nova). Dropped for now.

## The weight shift beat

- It sits between beat 1 and beat 2 (confirmed by the brother).
- It uses a different sound from the other three.
- It is stored as a normalized position (0 to 1) between beat 1 and beat 2, so it keeps the same relative position at every tempo (confirmed).
- Long Game and Short Game have independent weight shift settings. In Short Game the movement is more subtle.
- Starting value for Long Game: 0.53 (chosen by ear, November 2026; it replaced 0.67, the midpoint of the whole swing). Short Game starts at about 0.75, the midpoint of the whole 2:1 swing (the brother is not certain; tuned by ear).
- The original three beats are never moved or recalculated because of it.

## Temporary CONFIG mode

CONFIG mode lives inside the real app. It is not a separate app or branch, so the brother tests his settings in the actual app at every tempo.

- A CONFIG item in the header menu reveals a slider for the weight shift position, an APPLY button, a reset-to-default button and an EXPORT button that produces JSON.
- APPLY saves the current category's value (Long Game or Short Game, one at a time) to local storage on that device. Normal mode then plays with the applied value at every tempo.
- If there are unapplied slider changes and the user leaves CONFIG, show a yes/no confirmation dialog before discarding them. Yes discards the changes and leaves. No stays in CONFIG.
- EXPORT exports the applied values.
- The brother uses it to find the right position, then sends the export to the developer.
- Final values get hard-coded into the engine and CONFIG is removed, including reading the saved values. Build it so removal is easy: keep all CONFIG UI, saving and export code in its own module.

## Principles

- Accurate timing and reliable playback come first.
- Keep it lightweight. No backend, accounts, database or analytics.
- Light and dark mode, both designed (see `_references/DESIGN/` and `docs/design/`). A toggle in the header menu switches between them, and the choice is remembered between visits.
- Header: logo and wordmark on the left, a menu button on the right. The menu holds CONFIG (temporary; later replaced by a "How to" item or removed) and the light/dark toggle. See `docs/design-brief.md`, section 12.
- Polished, responsive UI with its own identity. Tour Tempo is a functional reference, not a visual template.
