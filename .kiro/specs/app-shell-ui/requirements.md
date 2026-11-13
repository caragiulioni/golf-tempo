# Requirements Document

Shared decisions live in the steering files (`product.md`, `tech.md`, `structure.md`, `workflow.md`) and are not restated here. Scope comes from spec 3 in `.kiro/specs/_index.md`. Visual source of truth: `_references/DESIGN/` as amended by `docs/design-brief.md`, section 12 (the brief wins where they differ). Audio behavior: `.kiro/specs/audio-playback/design.md`.

## Introduction

The real app screen on top of the engine and the player: header with menu, theme, tempo selection, play/pause, and a beat timeline that follows the audio schedule. It also moves the audio lab into the menu as a testing tool. It excludes the background loop (spec 4) and CONFIG mode (spec 5); the menu only holds the CONFIG entry point as a placeholder, and the loop switch is shown but inactive.

Decisions resolved: timeline container is `design-brief.md` section 12 option 5, final for now. The engine decides the weight shift position; the brief's refinement 3 text saying otherwise is outdated.

## Glossary

- **App**: the Golf Tempo Trainer UI, shown under the product name held in one place (currently "Swing Tempo").
- **Player**: the audio player from `src/audio/` (`createPlayer`).
- **Timeline**: the beat timeline showing takeaway, weight shift, top of swing and impact.
- **Output_Delay**: the time between the Player scheduling a beep and the user hearing it.
- **Header_Menu**: the menu opened from the menu button in the header.
- **Intro_Screen**: the startup screen with logo, name and tagline.
- **Loop_Switch**: the background loop row (label and switch) on the main screen, inactive in this spec.
- **Wordmark**: the logo mark SVG plus the text "SWING TEMPO" in a bundled font, a placeholder for a later SVG.
- **Audio_Lab**: the temporary testing screen moved from `src/app/dev/AudioLab.tsx`.
- **Selection**: the current category (Long Game or Short Game) and the selected preset for each category.

## Requirements

### Requirement 1: Theme and light/dark mode

**User Story:** As a golfer, I want the app in light or dark mode, so that I can read it in any light.

#### Acceptance Criteria

1. THE App SHALL read all colors, spacing, radius and type sizes from the theme module in `src/theme/`, built from `_references/DESIGN/tokens.css`, and SHALL contain no hard-coded color, size or font values in components.
2. WHEN the App starts and no choice is saved, THE App SHALL use the device light/dark setting.
3. WHEN the user selects the light/dark item in the Header_Menu, THE App SHALL switch to the other mode within 100 ms and save the choice ("light" or "dark") through `src/storage/`.
4. WHEN the App starts with a valid saved choice ("light" or "dark"), THE App SHALL apply it for the first rendered frame and SHALL NOT render the main screen until the saved choice has finished loading, so that no frame in the wrong mode is shown.
5. IF the saved choice is missing, corrupted, or any value other than "light" or "dark", THEN THE App SHALL use the device light/dark setting and SHALL NOT show an error to the user.
6. IF reading or writing the saved choice through `src/storage/` fails, THEN THE App SHALL continue running with the device light/dark setting (on read failure) or the newly selected mode (on write failure) for the current session.
7. WHILE no choice has been saved, THE App SHALL follow changes to the device light/dark setting made during the session; WHILE a valid choice is saved, THE App SHALL ignore such changes.
8. THE theme module SHALL define, for both light and dark, the tokens surface, hero, border, accent-muted, on-accent and switch-knob; radius chip 14 and card 28 (40 on tablet width, meaning a viewport width of 700 or more); tap-min 44; and the fonts Inter and Space Grotesk.

### Requirement 2: Header and menu

**User Story:** As a user, I want a simple header with a menu, so that settings and tools do not crowd the main screen.

#### Acceptance Criteria

1. THE App SHALL show the Wordmark on the left of the header and the menu button on the right, with no other visible element in the header, at every viewport width from 320 to 1920 CSS pixels.
2. WHEN the user activates the menu button while the menu is closed, THE Header_Menu SHALL open and list exactly three items, in this order: Config, the light/dark item, and Audio lab (testing). The light/dark item SHALL be labelled with the mode it will switch to (for example, "Dark mode" while the light theme is active).
3. WHEN the user chooses Config, THE App SHALL close the menu and show a placeholder screen that has a visible "Config" title and a control that returns to the main screen, until spec 5 provides the CONFIG screen.
4. WHEN the user chooses the light/dark item, THE App SHALL switch to the other theme, remember the choice per the persistence rules in the steering files, and close the menu.
5. WHEN the user chooses Audio lab (testing), THE App SHALL close the menu and show the Audio lab screen.
6. THE Header_Menu SHALL follow the behavior in `docs/design-brief.md`, "Header menu" (44-point targets, close on item, outside tap and Escape, focus handling, accessible label) and SHALL be a shared component in `src/ui/components/`.
7. WHEN the menu closes through Escape or an outside tap, THE Header_Menu SHALL return focus to the menu button and SHALL leave the current screen and theme unchanged.
8. THE App SHALL keep the product name ("Swing Tempo") and tagline in one module, and THE Wordmark SHALL read its text from the name constant, so that renaming is a one-place edit plus `app.json`.

### Requirement 3: Tempo selection

**User Story:** As a golfer, I want to pick Long or Short Game and a preset, so that I can practice at my tempo.

#### Acceptance Criteria

1. THE App SHALL show a Long Game / Short Game segmented control with exactly one option selected at a time, and a check mark shown on the selected option only.
2. WHEN the user presses the unselected option of the segmented control, THE App SHALL move the selection and the check mark to that option within 100 ms.
3. WHILE Long Game is selected, THE App SHALL show the 10 Long Game presets in two rows of five.
4. WHILE Short Game is selected, THE App SHALL show the Short Game presets from the engine in a grid of three columns, adding rows when the engine provides more than 3 presets, with no change to the layout code.
5. THE App SHALL read preset lists and ratios from `src/engine/`, not define them in the UI.
6. THE App SHALL remember a separate selected preset for each category for the duration of the session, starting at 30/10 for Long Game and 24/12 for Short Game.
7. WHEN the user switches category, THE App SHALL show the preset last selected in that category as selected, without changing the other category's remembered preset.
8. THE App SHALL show the selected preset, and only that preset, with a fill, an outline and a check mark.
9. THE App SHALL show the tempo badge with the selected preset as "A / B" (for example "30 / 10") and the ratio pill as "3 : 1" for Long Game or "2 : 1" for Short Game.
10. WHEN the user changes the Selection (category or preset) while the Player is playing, THE App SHALL pass the change to the Player's restart behavior exactly once per change.
11. THE preset buttons SHALL fit without clipping or text wrapping at screen widths of 320 and 360 points, including the label "168/56".

### Requirement 4: Play and pause

**User Story:** As a golfer, I want one large button to start and stop the beats.

#### Acceptance Criteria

1. THE App SHALL show a play/pause button in the Current session header, with a touch target of at least 112 by 112 points on tablet and laptop. On phones the button is 75 by 75 points, below the earlier 88 minimum, by the user's decision. The handoff CSS (72 / 112 / 112) and the brief's working copy (55 / 90 / 112) differ; `design.md` sets the final sizes, which SHALL NOT be smaller than these minimums, and they are checked by eye.
2. WHEN the user presses the button while the Player is stopped or paused, THE App SHALL unlock audio and start the Player from beat 1.
3. WHEN the user presses the button while the Player is playing, THE App SHALL stop the Player.
4. WHILE the Player is playing, THE App SHALL show a pause icon and the accessible label "Pause".
5. WHILE the Player is stopped or paused, THE App SHALL show a play icon and the accessible label "Play".
6. WHEN the Player reports it paused (page hidden, system took the audio, or stalled), THE App SHALL show a visible message stating that playback paused and that a tap resumes, and SHALL keep the message visible until the user presses the button or the Player starts playing again.
7. IF audio cannot be unlocked or started when the user presses the button, THEN THE App SHALL keep the Player stopped, show the play icon with the label "Play", and show a visible message stating that audio could not start and that the user can tap to try again.
8. WHERE the device is an iPhone or iPad, THE App SHALL show the hint "No sound? Check your silent switch." near the play/pause button at all times while the Current session header is visible.

### Requirement 5: Beat timeline

**User Story:** As a golfer, I want to see the swing's four moments light up as I hear them.

#### Acceptance Criteria

1. WHEN the Selection changes, THE Timeline SHALL recompute the four marker positions, the backswing/downswing split and the phase labels from the engine's beat times for the new Selection, with no hard-coded ratios.
2. THE Timeline SHALL show the weight shift marker as a diamond and the other three markers as a non-diamond shape, and SHALL label all four markers with text, with the weight shift marker and its name in the same white as the other markers.
3. WHILE the Player is stopped, THE Timeline SHALL show the idle state: all four markers unlit, the playhead at the start of the bar, and all labels visible.
4. WHILE the Player is playing, THE Timeline SHALL sweep a playhead and a gold fill from the start to the end of the bar once per swing, SHALL then ease them back to the start so the ease-back finishes just before the next beat 1, SHALL return each marker to its unlit state as the fill edge passes back over it, and SHALL light each marker within 50 ms of its beep sounding, using the swing start times and event times from the Player and not a separate timer.
5. THE Timeline SHALL sit in the container that is dark in both modes with the fine grid texture (`design-brief.md`, section 12, option 5), with label text at 4.5:1 contrast or higher and marker shapes at 3:1 contrast or higher against the container.
6. THE Timeline SHALL keep all labels and markers fully visible, untruncated and non-overlapping for every preset, from the fastest (about 1 second per swing) to the slowest (about 7 seconds), at viewport widths from 320 px to 1280 px.
7. WHERE the device reduce-motion setting is on, THE Timeline SHALL light each marker at its beep time without the playhead sweep, the ease-back and the weight shift pulse animation, and SHALL instead step the gold fill to each marker's position as that marker lights and reset it to the start at the next beat 1.
8. WHILE a marker is the active moment, THE Timeline SHALL show it with a non-color cue in addition to color: a larger size (at least 1.25 times the unlit size) and a filled appearance where unlit markers are outlined.
9. THE theme module SHALL include timeline tokens: container background, grid line, one gold (#EEC967, used only for the timeline fill), label colors, and a lighter backswing bar at 3:1 contrast or higher against the container.
10. THE Timeline SHALL draw the grid with `react-native-svg`, installed with `npx expo install` and pinned to an exact version.
11. THE Timeline SHALL label the phases "BACKSWING · n" and "DOWN · n" and split the bar at the engine's beat 2 time, so the bar proportions can differ from the label ratio because beat 3 sounds 0.20 s later than the label implies.
12. WHILE the Player is playing, THE Timeline SHALL pulse the weight shift diamond with a white ring once per swing, starting at the weight shift event time and lasting 300 ms.
13. WHEN the Player changes from playing to stopped or paused, THE Timeline SHALL unlight all markers and return the playhead and fill to the start of the bar within 100 ms, cancelling any ease-back.
14. IF the engine returns no beat times for the current Selection, THEN THE Timeline SHALL show the idle state with no markers lit and SHALL keep the Player controls usable.

### Requirement 6: Visuals delayed by audio output latency

**User Story:** As a golfer, I want the lights to match what I hear, so that the timeline is not early.

#### Acceptance Criteria

1. WHEN a Timeline event is scheduled, THE App SHALL delay its visual by the Output_Delay, so that each marker lights within 20 ms of the moment its beep is heard.
2. WHEN `info().outputLatencySeconds` of the web audio adapter is a finite number greater than 0, THE App SHALL use it as the Output_Delay and record the source as "reported".
3. IF `outputLatencySeconds` is exactly zero (not filled in yet), THEN THE App SHALL use the named per-platform fallback constant directly, skipping `baseLatencySeconds`, and record the source as "fallback". IF `outputLatencySeconds` is null, undefined, negative, or not a finite number (for example Safari), THEN THE App SHALL use `baseLatencySeconds` as the Output_Delay when it is a finite number greater than or equal to 0, otherwise a named per-platform fallback constant, and record the source as "fallback".
4. WHILE the audio context does not exist yet, THE App SHALL use the per-platform fallback constant as the Output_Delay and record the source as "fallback".
5. WHEN a swing starts, THE App SHALL re-read the Output_Delay, and a changed value SHALL apply from that swing onward without changing the delay of a swing already in progress.
   5a. THE first swing of every run (after start, restart, or resume from pause) SHALL use the per-platform fallback constant, source "fallback", whatever the browser reports, because browsers report a startup value that is too small (seen on Pixel 6: 24 ms, then 272 ms and 280 ms). From the second swing of the run, criteria 2 to 4 apply.
6. THE Output_Delay logic SHALL be a pure function of its inputs (reported values and fallback constants), with no browser, DOM, or `window` access, so that it can be tested without a browser.
7. WHEN the Output_Delay is read at the start of a swing, THE App SHALL write one entry to the Audio_Lab log containing the Output_Delay in milliseconds and its source ("reported" or "fallback").
8. THE per-platform fallback constants SHALL be set from measurements taken on the iPad (Safari 16.6) and the Pixel 6 (about 280 ms reported), and the measured values, device model, and browser version SHALL be recorded in `docs/porting-guide.md`.

### Requirement 7: Responsive layout

**User Story:** As a user on any device, I want the layout to use the screen well.

#### Acceptance Criteria

1. THE App SHALL select the layout from the viewport width in points: phone for widths under 700 (single column), tablet for 700 to 1099 inclusive (single column, larger sizes), and laptop for 1100 and up (two columns).
2. WHEN the viewport width crosses a breakpoint boundary (for example by resizing a browser window or rotating a device), THE App SHALL switch to the layout for the new width without reloading and without losing the selected game, selected preset or playing state.
3. WHILE a phone is in landscape (width greater than height, and height under 500 points), THE App SHALL keep the play button and the Timeline fully visible without vertical scrolling, at viewport sizes from 568 by 320 points up to 932 by 430 points.
4. THE App SHALL render without clipped or overlapping content, and without horizontal scrolling, at viewport widths of 320 and 360 points, including "168/56" in the Long Game preset grid.
5. THE App SHALL give every interactive control a tap target of at least 44 by 44 points, and SHALL render all text at no less than the minimum text size set in `design-brief.md` sections 8 and 12 (item 7), which raises the phone phase labels above the handoff's 10 points and the other labels above its 11 to 12 points. Note: phone phase labels are now 12 (user decision); tablet 13 and laptop 14 are unchanged.
6. WHILE the viewport is phone width, THE App SHALL always show the weight shift label as "Shift" (both Long Game and Short Game), so that it does not overlap the "Top" label at 320 and 360 points; on tablet and laptop it uses "Weight shift" and falls back to "Shift" only on overlap. THE App SHALL record in the task report whether the user accepted the shortened label.
7. THE App SHALL build every UI element from shared components in `src/ui/components/` and theme tokens in `src/theme/`, after the Reuse check required by `workflow.md`, with no hard-coded colors, sizes or fonts in the layout code.

### Requirement 8: Fonts, icons and branding

**User Story:** As a user, I want the app to look finished from the first frame.

#### Acceptance Criteria

1. THE App SHALL bundle the Inter, Space Grotesk and Michroma font files through Expo (Michroma only for the wordmark text), so that no font is requested from a network source at runtime.
2. WHILE the Inter or Space Grotesk fonts are still loading, THE App SHALL not render the main screen.
3. WHEN the bundled fonts (Inter, Space Grotesk and Michroma) have finished loading, THE App SHALL render the main screen with Inter and Space Grotesk applied through theme typography tokens.
4. IF either font fails to load, THEN THE App SHALL render the main screen with the system font for all text, within 3 seconds of the app starting, and SHALL keep the app usable.
5. THE App SHALL render the Wordmark as the logo mark SVG followed by the text "SWING TEMPO" in Michroma (also used for the name on the intro screen), as a placeholder that can be replaced later by an SVG, and SHALL not use Michroma for any other text.
6. THE App SHALL use the existing app icon, favicon and web icon files without creating or modifying them.

### Requirement 9: Intro screen

**User Story:** As a user, I want a short branded start screen that does not slow me down.

#### Acceptance Criteria

1. WHEN the App starts, THE Intro_Screen SHALL show the logo, the app name and the tagline "Train Your Tempo. Transform Your Game." while the saved theme choice and fonts load.
2. WHEN the App starts, THE Intro_Screen SHALL remain visible for at least 2000 ms from first render.
3. WHILE the saved theme choice or fonts are still loading, THE Intro_Screen SHALL remain visible, even after 2000 ms has passed.
4. WHEN 2000 ms has passed and loading has finished, THE App SHALL replace the Intro_Screen with the main screen within 500 ms.
5. WHEN the user taps the Intro_Screen before loading has finished, THE App SHALL keep the Intro_Screen visible until loading has finished, then show the main screen within 500 ms, without waiting for the remainder of the 2000 ms.
6. WHEN the user taps the Intro_Screen after loading has finished, THE App SHALL show the main screen within 500 ms of the tap.
7. IF the saved theme choice or fonts fail to load, THEN THE App SHALL show the main screen using the device theme setting and the system font within 3000 ms of app start, and SHALL not stay on the Intro_Screen indefinitely.
8. WHERE the device reduce-motion setting is on, THE Intro_Screen SHALL show the logo, name and tagline as static content, with no fade, movement or scaling, and SHALL change to the main screen without a transition animation.
9. THE Intro_Screen SHALL show no "Tap to begin" prompt or any other start button, because the play button on the main screen is the formal start.
10. THE Intro_Screen SHALL not start audio or create an audio context.

### Requirement 10: Audio lab in the menu

**User Story:** As the developer, I want the audio lab inside the app, so that I can diagnose audio problems on a real device.

#### Acceptance Criteria

1. WHEN the user chooses the Audio lab (testing) item in the header menu, THE App SHALL close the menu and replace the main screen with the Audio_Lab sub page within 300 ms, showing a back control that is at least 44 by 44 points.
2. WHEN the user activates the back control on the Audio_Lab sub page, THE App SHALL return to the main screen, stop any audio the Audio_Lab is playing, and preserve the previously selected category and preset.
3. THE Audio_Lab SHALL play sound through the app's real Player and audio adapter, with no separate audio context or private playback path.
4. THE Audio_Lab SHALL build its UI only from the shared components in the UI components module and the theme tokens, with no hard-coded colors, sizes or fonts.
5. WHEN the user presses the Copy log button, THE Audio_Lab SHALL copy the full current log text to the clipboard and show a visible confirmation of success.
6. IF copying the log fails or the clipboard is unavailable, THEN THE Audio_Lab SHALL keep the log text visible and selectable on screen and show an error indication that the copy failed.
7. THE Audio_Lab SHALL live in its own module, be mounted from the App at exactly one clearly marked mount point, and have no other module depend on it. The file `src/app/dev/AudioLab.tsx` SHALL be removed, with no remaining imports of it.
8. WHERE the platform is native, THE Audio_Lab SHALL guard every web-only call (clipboard, page address, and any other browser API) so that opening and using the lab on iOS and Android raises no runtime error. Any feature that is unavailable on that platform SHALL be hidden or shown disabled with a visible reason.

### Requirement 11: Phone check and porting notes

**User Story:** As the developer, I want to know the app runs on a phone, and the port to be documented.

#### Acceptance Criteria

1. WHEN the first UI wave of this spec is complete, THE spec SHALL include exactly one check that opens the app on a real phone through Expo Go, or on an iOS simulator or Android emulator if no real phone is available, and confirms that the app's first screen renders without a crash or red error screen.
2. WHEN the phone check is run, THE spec SHALL record in `docs/porting-guide.md` the device model, OS version, whether the check used a real phone, a simulator or an emulator, a list of what worked, and a list of what did not work.
3. IF the phone check cannot be run or fails to open the app, THEN THE spec SHALL record in `docs/porting-guide.md` the reason and the error shown, and mark native status as "untested on native" instead of "works".
4. THE spec SHALL end with a Porting notes task that adds exactly one entry to `docs/porting-guide.md`, using the entry format already defined in that file.
5. THE Porting notes entry SHALL list three groups: web-only parts (DOM, `window`, browser APIs, Web Audio), parts expected to carry over unchanged, and parts untested on native. Each item SHALL name the file path it refers to.
6. THE Porting notes entry SHALL describe any item as "expected to work" or "untested" unless it was run on a real device or simulator, and SHALL be written in plain language that a non-developer can follow.

### Requirement 12: Background loop switch (inactive)

**User Story:** As the brother testing the app, I want to see where the background loop switch will be, without it seeming to work.

#### Acceptance Criteria

1. THE App SHALL show the Loop_Switch on the main screen as in the handoff: a row with a label and a switch, in the off position on every app load.
2. THE Loop_Switch SHALL use a shared Switch component in `src/ui/components/`.
3. THE Loop_Switch SHALL appear in a visibly disabled state, with the label and the switch both rendered at reduced emphasis using theme tokens, in both light and dark mode, so that a tester can tell it apart from an enabled switch by looking at it.
4. WHEN the user presses or taps the Loop_Switch (label or switch), THE App SHALL keep the switch in the off position, produce no sound, and write nothing to local storage.
5. WHEN the user presses or taps the Loop_Switch, THE App SHALL show no pressed, hover or focus-activation feedback that suggests the control responded.
6. THE Loop_Switch SHALL expose the switch role, the off value, and the disabled state to assistive technology.
7. WHILE the Loop_Switch is inactive, THE App SHALL leave the play/pause control, tempo selection and weight shift behavior unaffected by any interaction with the Loop_Switch.

## Out of Scope

Wiring the background loop and its switch (spec 4). CONFIG screen (spec 5). Native audio. Android adaptive icon and splash image files. Rename of the product (build uses "Swing Tempo").
