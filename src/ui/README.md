# ui

**Planning equivalent: the public realm.**

Everything the user sees and taps: the tempo badge, the Long/Short toggle, the preset buttons, the play button and the beat timeline.

## Rules

- Built from React Native pieces (`View`, `Text`, `Pressable`), not web-only elements, so it works on phones.
- Shared pieces live in `components/`. Before adding any new element or style, check there and in `theme/` first, and reuse or extend what exists.
- No hard-coded colors, sizes or fonts. Those come from `theme/`.

## Why it matters

Checking what already exists before building something new is how projects stay consistent and avoid duplicate work. The rule is in `.kiro/steering/workflow.md`.
