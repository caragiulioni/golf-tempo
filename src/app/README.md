# app

**Planning equivalent: the site plan that brings it all together.**

The screens, and the wiring that connects the engine, the audio and the interface into one working app. The root component, `App.tsx`, is the entry point.

Right now `App.tsx` is a placeholder. It is replaced when the app-shell-ui spec is built.

## Rules

- Keep logic light. Timing math belongs in `engine/`, sound in `audio/`, and visual pieces in `ui/`.
- This is the only place that connects those parts to each other.
