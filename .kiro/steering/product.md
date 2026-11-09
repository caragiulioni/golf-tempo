# Product: Golf Tempo Trainer

A personalized golf tempo trainer modeled on Tour Tempo, with one addition: a fourth beat for a small movement in the user's brother's swing (believed to be a hip movement).

Source material lives in `_references/` (spec, Tour Tempo screen recording, screenshots). Read `_references/INIT golf tempo.md` for the full spec. Open decisions are tracked in `docs/dev_questions.md` (developer) and `docs/client_questions.md` (brother).

## Core behavior

- Three beeps per swing: beat 1 (takeaway), beat 2 (top of backswing), beat 3 (impact).
- Long Game presets (3:1): 18/6, 21/7, 24/8, 27/9, 30/10.
- Short Game presets (2:1): 14/7, 16/8, 18/9, 20/10, 22/11, 24/12.
- Slower presets will be added. Candidates: Long 33/11 to 42/14, Short 26/13 to 32/16. Final list depends on the brother's answer.
- One background 808-style loop, generated in code. Beat 1 lands on the start of a bar. Tour Tempo played it in Long Game only; whether ours does is an open question.
- No sound styles (Voice, String, Bossa Nova). Dropped for now.

## The fourth beat

- It sits between beats 1 and 2 (working hypothesis, not yet confirmed).
- It uses a different sound from the other three.
- It is stored as a normalized position (0 to 1) between beat 1 and beat 2, so it scales with every preset.
- Long Game and Short Game have independent fourth-beat settings.
- The original three beats are never moved or recalculated because of it.

## Temporary CONFIG mode

- A CONFIG toggle reveals a slider for the fourth beat and an EXPORT button that produces JSON.
- The brother uses it to find the right position, then sends the export to the developer.
- Final values get hard-coded into the engine and CONFIG is removed. Build it so removal is easy: keep all CONFIG UI and export code in its own module.

## Principles

- Accurate timing and reliable playback come first.
- Keep it lightweight. No backend, accounts, database or analytics.
- Light and dark mode, both designed (see `_references/layout-LIGHTMODE.png` and `layout-DARKMODE.png`). A visible toggle switches between them, and the choice is remembered between visits.
- Polished, responsive UI with its own identity. Tour Tempo is a functional reference, not a visual template.
