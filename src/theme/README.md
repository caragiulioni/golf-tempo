# theme

**Planning equivalent: the design guidelines for a district.**

The shared look of the app, defined once: colors for light and dark mode, spacing, corner radius and type sizes. The layout mockups in `_references/` (`layout-LIGHTMODE.png`, `layout-DARKMODE.png`) are the starting point.

## Rules

- Every color, size and font in the app comes from here.
- If a needed value is missing, add it here. Don't hard-code it where it's used.
- Light or dark is chosen from the device setting, and the user can switch with a toggle. The choice is remembered (see `storage/`).

## Why it matters

Change a value here and the whole app updates. It's also how light and dark mode work without duplicating any interface code.
