# app

**Planning equivalent: the site plan that brings it all together.**

The screens, and the wiring that connects the engine, the audio and the interface into one working app. The root component, `App.tsx`, is the entry point.

Right now `App.tsx` is a placeholder. It is replaced when the app-shell-ui spec is built.

Screens: `MainScreen.tsx` (the app), `IntroScreen.tsx`, `HowItWorksScreen.tsx` (menu, top item; its words are in `howItWorksText.ts`), `AppHeader.tsx` (the header and its menu, shared by both screens), and the temporary `AudioLabMount.tsx` and `ConfigMount.tsx` mount points.
## Rules

- Keep logic light. Timing math belongs in `engine/`, sound in `audio/`, and visual pieces in `ui/`.
- This is the only place that connects those parts to each other.
