# config-mode

**Planning equivalent: the temporary site office.**

The tools the brother uses to find the right weight shift position: the slider, the APPLY and reset buttons, the unapplied-changes warning and the EXPORT button.

## Rules

- Everything for CONFIG mode lives in this folder, including saving and export code. Nothing else in the app depends on it, except one clearly marked mount point in `app/`.
- It is temporary. When the right values are found, they get built into the engine, and this folder is deleted along with the code that reads saved values.

## Why it matters

Keeping it self-contained means removing it at the end is deleting a folder, not hunting through the app.
