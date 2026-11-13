# Requirements: config-mode

Shared decisions are in `product.md` (CONFIG mode section), `tech.md` (persistence, dialogs), `structure.md` (config-mode rules), `timing-engine.md`. Not restated. Visual source: `docs/design-brief.md` (CONFIG mode, section 12). Scope comes from spec 5 in `_index.md`. This spec resolves `dev_questions.md` items 5 (slider range), 7 (export shape) and 10 (calibration guide).

## Glossary

- **Config_Screen**: the CONFIG screen opened from the header menu.
- **Applied_Value**: the weight shift position saved on this device for one category. Normal mode plays with it.
- **Draft_Value**: the position currently on the slider in Config_Screen, one per category. It may differ from the Applied_Value.
- **Unapplied**: a category whose Draft_Value differs from its Applied_Value.
- **Default_Value**: `DEFAULT_WEIGHT_SHIFT_POSITIONS` in the engine (Long 0.50, Short 0.60).
- **Saved_Key**: the one versioned storage key holding the Applied_Values.
- **Mount_Point**: `src/app/ConfigMount.tsx`, the only file outside `src/config-mode/` that imports it.
- **Export_Text**: the JSON the EXPORT button produces.

## Requirements

### R1 Saved values

**User Story:** As the brother, I want my applied values remembered, so that normal mode uses them at every tempo.

1. THE Config_Mode SHALL store Applied_Values in one entry under a versioned Saved_Key, written through `src/storage/` only.
2. THE stored shape SHALL hold a version number and, per category, either a position or nothing (a category never applied has nothing stored).
3. WHEN loading, THE Config_Mode SHALL check each category on its own. IF a category's value is missing, not a finite number, or outside `WEIGHT_SHIFT_RANGE`, THEN that category SHALL use its Default_Value and the other category SHALL be unaffected.
4. IF the stored entry is missing, not valid JSON, not an object, or has an unknown version, THEN both categories SHALL use their Default_Values.
5. IF reading fails, THEN the app SHALL continue with Default_Values and show no error. IF writing fails, THEN the app SHALL keep the new value for the current session and show no error.
6. WHEN saving one category, THE Config_Mode SHALL keep the other category's stored value as it was.
7. THE app SHALL finish loading Applied_Values before the first frame of the main screen (the intro screen covers the wait, as for the theme).

### R2 Normal mode uses Applied_Values

1. THE main screen SHALL play and draw the weight shift at the category's Applied_Value (or Default_Value if none) at every tempo.
2. THE main screen, the Player options and the timeline SHALL receive the values as plain `WeightShiftSettings` props. Nothing outside `src/config-mode/` and the Mount_Point SHALL import `src/config-mode/`.
3. WHEN an Applied_Value changes, THE main screen SHALL use the new value the next time it plays and draws.
4. THE engine SHALL stay unchanged.

### R3 Config_Screen layout and navigation

1. THE header menu SHALL keep a "Config" item that opens Config_Screen in place of the current placeholder.
2. THE Config_Screen SHALL have a back control, a Long Game / Short Game control, a preset grid for the chosen category, the beat timeline, the slider with its value readout, a play button, a background loop switch, and the APPLY, reset and EXPORT controls.
3. WHEN Config_Screen opens, THE category and preset SHALL start from the main screen's current selection. After that, changes made in Config_Screen SHALL NOT change the main screen's selection.
4. THE Config_Screen SHALL use light and dark theme colors from the theme and the shared components, with no hard-coded values.
5. THE Config_Screen SHALL be usable at 320 pt wide and with touch only.

### R4 Slider and visual feedback

1. THE slider SHALL range over `WEIGHT_SHIFT_RANGE` in steps of 0.01.
2. THE readout SHALL show the Draft_Value as a percentage of the way from takeaway to top of swing, and as seconds after takeaway at the selected preset.
3. WHILE the slider is dragged, THE timeline's weight shift marker SHALL move with it, and the readout SHALL update.
4. THE slider SHALL be operable by keyboard (arrow keys, on web), by screen reader (adjust up and down) and by touch, with a touch target of at least 44 pt.
5. WHERE the nudge buttons are included (see design, open decision), pressing minus or plus SHALL change the Draft_Value by one step and count as a release.
6. Each category SHALL keep its own Draft_Value. Switching category SHALL show that category's Draft_Value and SHALL NOT change the other's.

### R5 Test playback

1. THE Config_Screen SHALL play through the shared Player, with the Draft_Value of the chosen category and the selected preset.
2. WHEN the slider is released (or a nudge or reset happens, or the preset, category or loop changes) while playing, THE Config_Screen SHALL restart through `player.change()` like any other change. A drag in progress SHALL NOT restart playback.
3. WHILE stopped, THOSE same changes SHALL NOT start playback.
4. THE loop switch SHALL be off each time Config_Screen opens and SHALL be independent of the main screen's loop switch. It SHALL NOT be saved.
5. WHEN Config_Screen opens or closes, THE running playback SHALL stop first. Main screen and Config_Screen SHALL NOT both react to one change (no double restart, and an APPLY SHALL NOT restart or alter the test run).

### R6 APPLY, reset, status

1. WHEN the user presses APPLY, THE Config_Mode SHALL save the chosen category's Draft_Value as its Applied_Value, and leave the other category as it was. APPLY SHALL NOT restart playback.
2. THE Config_Screen SHALL show, for the chosen category, the Applied_Value (or "Default" if none) and whether the Draft_Value is Unapplied.
3. WHILE the chosen category is not Unapplied and has already been applied once, THE APPLY control SHALL be disabled. A category never applied keeps APPLY enabled, so the starting value can be saved as a deliberate choice (the export then says `applied: true`).
4. WHEN the user presses reset, THE slider SHALL return to the Default_Value for the chosen category. Reset SHALL NOT save; the user presses APPLY to save.
5. WHEN APPLY completes, THE main screen SHALL use the value from then on (R2.3).

### R7 Leave confirmation

1. WHEN the user leaves Config_Screen (back control) and either category is Unapplied, THE app SHALL show a yes/no dialog: "You have changes you haven't applied. Leave without applying?"
2. WHEN the user answers Yes, THE app SHALL discard all Draft_Values and leave. WHEN the user answers No (or presses Escape or the system back), THE app SHALL stay in Config_Screen with the Draft_Values unchanged.
3. WHEN no category is Unapplied, THE back control SHALL leave without a dialog.
4. THE dialog SHALL be the shared in-app dialog component (not `window.confirm`), with the buttons at least 44 pt, a labelled title, and focus moved into it and back out.

### R8 EXPORT

1. WHEN the user presses EXPORT, THE Config_Screen SHALL show the Export_Text, selectable, and a Copy button.
2. THE Export_Text SHALL be JSON with: `configVersion`, `exportedAt` (ISO date and time), `longGame.weightShiftPosition`, `shortGame.weightShiftPosition`, and per category `applied` (true if the user applied a value, false if it is still the default).
3. THE Export_Text SHALL contain Applied_Values only, never Draft_Values. WHEN a category is Unapplied, THE Config_Screen SHALL say so beside the Export_Text.
4. WHEN Copy succeeds, THE Config_Screen SHALL say so. IF copying is not possible (no clipboard, insecure page, blocked, native), THEN it SHALL tell the user to select the text and copy it by hand.
5. WHERE the platform is web, THE Export_Text SHALL also include the browser's user agent text as `device`. Elsewhere it SHALL be left out.

### R9 Isolation

1. All Config_Screen UI, saving, loading and export code SHALL live in `src/config-mode/`, except the Mount_Point and the shared components added under `src/ui/components/`.
2. Removing CONFIG (spec 6) SHALL be: delete `src/config-mode/` and the Mount_Point, restore the Config item's removal in the menu, and make `App.tsx` pass the hard-coded values. No other file SHALL need a change beyond that list. The design lists these places.

### R10 Documentation

1. THE project SHALL have a plain-language calibration guide for the brother in `docs/` (dev_questions item 10): one device, same browser, no private mode, no clearing site data, the Safari saved-data caveat (verify before writing), test every tempo in each category, how to use CONFIG, loop on or off while calibrating, and what to send back.
2. THE spec SHALL end with a "Porting notes" entry in `docs/porting-guide.md`.

### R11 In-app How to

1. THE Config_Screen SHALL show a short How to near the top, in plain language, at most five short steps: pick a game length and tempo, press play, move the slider until the weight shift beep feels right, press APPLY, check other tempos, then EXPORT and send it.
2. THE How to SHALL be collapsed or compact enough that the slider is visible without scrolling on a 568 pt tall phone once it is closed, and SHALL use the exact button names shown on screen.
3. THE How to text SHALL live in one named constant in `src/config-mode/`, so it can be edited without touching layout code.

## Decisions (approved by the user)

Reset does not save. Nudge buttons are included. Tests for pure `config-mode` logic are included. Export includes `exportedAt`, `applied` and `device`. Changes restart playback only while playing. Leave dialog uses the brief's wording for either category. Loop switch starts off.

## Out of scope

Hard-coding values and removing CONFIG (spec 6), tempo metadata per preset in the export, import of an exported file, hardware back button on Android, native audio, any change to the engine, saving the loop choice or the Config_Screen selection.
