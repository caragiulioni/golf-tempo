# engine

**Planning equivalent: the master schedule calculation.**

The timing brain of the app. Given a game type, a tempo preset and the weight shift position, it works out exactly when each beep should happen, as a list of timed events. Nothing else in the app does timing math.

## Rules

- Plain TypeScript only. It must not import React, React Native, anything browser-specific, or any audio code.
- The three original beats never move because of the weight shift beat.
- This folder gets automated tests, written together with the code.

## Why it matters

Everything audible and visible follows this list of events. If a number here is wrong, the whole app is wrong, which is why it is isolated and tested. Because it knows nothing about the screen or the sound system, it moves to phones unchanged.

Details: `.kiro/steering/timing-engine.md`.
