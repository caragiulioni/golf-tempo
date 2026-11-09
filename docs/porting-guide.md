# Porting Guide: Web to iOS and Android

This is a running log, written as the project is built. After the last spec it gets rewritten into a single step-by-step guide for someone with little development experience.

Status: nothing in this guide has been tested on a real iOS or Android device unless an entry says so.

## Entry format

One entry per spec, added when the spec is finished.

```
### <spec name>
- What was built: plain-language summary.
- Carries over unchanged: what works the same on native.
- Web-only, must be replaced on native: what, where (file paths), and what to use instead.
- Needs testing on a real device: what to check.
- Decisions and reasons: anything a future reader would wonder about.
```

## Audio testing requirement

Audio must be tested on both Android and iOS. A pass on one platform does not count for the other. Record each result with the device model and OS or browser version, and what was checked: beats sound at the right times, the weight shift beat is audibly distinct, the loop stays locked to the beats, and there is no drift over a long session.

### Web (current build)

Test in desktop browsers plus iOS Safari and Android Chrome on real phones. Also check: audio starts after the first tap, the iPhone silent switch, and behavior when the tab is hidden or the screen locks.

| Device | OS / browser version | Result | Notes |
|---|---|---|---|
| (none tested yet) | | | |

### Native (after the port)

At least one Android device and at least one iOS device (phone or tablet).

| Device | OS version | Result | Notes |
|---|---|---|---|
| (none tested yet) | | | |

## Entries

(none yet)

## Final guide checklist (written after the last spec)

- [ ] Plain-language overview: what the app is and what porting involves.
- [ ] Prerequisites and tools to install.
- [ ] Step-by-step: run on a simulator, run on a real device, build for the stores.
- [ ] List of web-only parts and their native replacements.
- [ ] Known risks and untested areas.
