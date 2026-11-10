# storage

**Planning equivalent: the records office.**

A small wrapper that saves and loads little pieces of information between visits: the light/dark choice and, temporarily, the applied weight shift positions from CONFIG mode.

## Rules

- The rest of the app never talks to the storage library directly. It goes through this wrapper, so the library can be swapped without touching anything else.
- Storage is asynchronous: the app waits until saved values have loaded before drawing the first screen, to avoid a flash of the wrong theme.
- Saved values are checked on load. Missing, corrupted or out-of-range values fall back to defaults.
- Saved values live on one device and browser only.
