# audio

**Planning equivalent: the utilities connection.**

Turns the engine's list of timed events into sound. It makes the beeps and the background loop in code (no sound files), and schedules them against the audio clock so the timing stays exact.

## Rules

- All sound goes through one adapter interface. The web version uses the browser's Web Audio. A phone version will be written later behind the same interface.
- Don't time beeps with ordinary timers. They drift. Use the audio clock.
- Handle phone quirks: audio needs a tap to start, the iPhone silent switch can mute it, and locked screens pause it.

## Why it matters

This is the part most likely to behave differently on web and on phones. Keeping it behind an interface means the rest of the app doesn't have to change when the phone version is written.
