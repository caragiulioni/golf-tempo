# Workflow: Waves and Tasks

Work is organized into waves, and waves into small tasks. The goal is that every piece can be tested on its own and reviewed without effort.

## Definitions

- **Wave**: a themed group of tasks that ends in something that works and can be demonstrated. The four phases in `structure.md` are split into several waves each. Example: "Wave 1.2: preset data and beat sequence from the engine, no UI."
- **Task**: one small change with one purpose.

## Specs

- The ordered list of specs is in `.kiro/specs/_index.md`. Check it before creating or changing any spec, and update it when a spec's status changes.
- Write full specs (requirements, design, tasks) just in time, in index order. Do not write later specs early.
- Specs refer to steering files for shared decisions and do not restate them.
- Tasks inside a spec follow the wave and task rules below.

## Reuse before you build (UI and styling)

This rule has been missed before and only caught in code review. Treat it as a required step, not a suggestion.

Before adding ANY UI element (JSX/markup) or ANY style:

1. List the contents of `src/ui/components/` and `src/theme/`, and read the components and tokens that could be related.
2. Decide for each new element: reuse an existing component, extend an existing component (add a prop or variant), or create a new one. Prefer reuse, then extension. Create new only when nothing fits.
3. For styling: use existing theme tokens (colors, spacing, radius, type). If a needed value does not exist, add it to the theme. Never hard-code a color, size or font in a component.
4. If the same element or style appears twice, it belongs in a shared component or theme token.

Every UI task must open with a short "Reuse check" before any code is written. It names the components and tokens that were checked, and says what will be reused, extended or created and why. A UI task with no Reuse check is not ready for review.

## Porting notes

The app is built for web first and may be ported to iOS and Android later, possibly by someone with little development experience. Keep `docs/porting-guide.md` current as we go.

- Every spec ends with a "Porting notes" task. It adds one entry to `docs/porting-guide.md` using the entry format in that file.
- At that point, audit what the spec built: anything web-only (DOM, `window`, browser APIs, Web Audio), anything that carries over unchanged, and what needs testing on a real device.
- Write for a non-developer: plain language, exact file paths, no assumed knowledge.
- Never claim something works on native unless it was actually run there. Say "expected to work" or "untested".
- After the last spec, one final task rewrites the log into a single step-by-step guide.
- Audio testing, web (now): test in desktop browsers plus iOS Safari and Android Chrome on real phones. A pass on one platform does not count for the other.
- Audio testing, native (later port): requires at least one Android device AND at least one iOS device (phone or tablet). Audio timing and behavior differ between them, so a pass on one does not count for the other. Anything not tested on both is marked "untested on native".
- Record all audio results per device (model and OS or browser version) in `docs/porting-guide.md`.
- After the first UI wave, do a one-time check that the app runs on a phone or simulator via Expo, and record the result.

## Task rules

- One concern per task. If a description needs "and", split it.
- Small diff: about 1 to 3 files, readable in a few minutes. If it is growing past that, stop and split it.
- Every task states up front how it will be checked: an observable result, such as a value, a behavior in the browser, or a sound.
- Build in layers, bottom up: engine first, then audio, then UI. Do not build UI on top of untested timing.
- No unrelated cleanup or extra features inside a task.
- A task is done only when it builds and its check passes. For UI tasks, it must also have a Reuse check (see above) and no duplicated components or styles.
- Engine tasks: the check is an automated test, written in the same task as the code. Engine tests cover the key rules: the original three beats never move, the fourth beat lands at the configured position, positions stay independent per category, and presets keep the same relative position.
- Audio and UI tasks: the check is a manual one. Describe exactly what to look at or listen for, and report what happened.

## Wave rules

- Plan the wave before starting: list its tasks in order, each with its check.
- Stop for review at the end of every wave, and after any task that touches timing or audio.
- Do not start the next wave until the current one is reviewed.
- Later waves can change as we learn more. Adjust the plan when reality differs, and say so.

## Task list format

```
Wave 1.2: Preset data and beat sequence
  1. Preset data for Long and Short Game. Check: all 11 presets listed with correct ratios.
  2. Beat time calculation for one preset. Check: 30/10 gives beats at 0 s, 1.0 s, 1.33 s.
  3. ...
```

## Working with the user

- Present the wave plan first and wait for approval.
- At each stop, say what changed, how it was checked, and what is next.
- If something unexpected shows up (for example the Tour Tempo timing mismatch), report it and decide together before continuing.
