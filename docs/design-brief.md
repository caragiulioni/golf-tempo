# Design Brief: Golf Tempo Trainer

This brief is for designing the look of the app outside of Kiro (in a design tool). When the design is done, bring back the items in section 9 and the app will be built to match.

Existing starting point: `_references/layout-DARKMODE.png` and `_references/layout-LIGHTMODE.png`. They are clean and plain. This brief says what to keep, what to change and what is still missing.

## 1. What the app is

A golf tempo trainer. It plays a rhythm of beeps that match the timing of a golf swing, so the golfer can swing in time. It is modeled on an app called Tour Tempo, with one addition: an extra beep for the weight shift.

The swing, in time order:

1. **Takeaway:** the club starts moving back. (Beep 1)
2. **Weight shift:** the lateral weight transfer, starting in the hips. This is the added beep, with its own distinct sound.
3. **Top of swing:** the club reaches the top. (Beep 2)
4. **Impact:** the club reaches the ball. (Beep 3)

The backswing is longer than the downswing: 3:1 in the Long Game and 2:1 in the Short Game. That ratio is what the numbers mean. In "30 / 10" the first number is the backswing time and the second is the downswing time (in video frames, 30 per second).

## 2. Who uses it

- A golfer working on his swing, practicing alone, often outdoors or at a range, on a phone. Glare, one hand, and quick glances are normal.
- A planner by profession who thinks visually and cares about structure and clarity.
- It also doubles as a calibration tool for finding the weight shift timing (CONFIG mode, see section 6).

## 3. Feel

- Modern, calm and focused, like a training product, not a toy.
- A little fun. The app should have personality, mostly in the header and the icon.
- Clarity first. One main thing is on screen at a time: the current session and the play button.
- Keep the green direction from the existing mockups (sage green in dark mode, deep forest green in light mode), unless the design finds something better.

## 4. Platforms and sizes

Design for all of these, in light and dark:

- Phone, portrait (primary).
- Phone, landscape.
- Tablet.
- Laptop or desktop browser.

The app runs in a browser first and may become an iOS and Android app later, so avoid effects that only work on the web (heavy blur, complex CSS-only tricks).

## 5. What to change from the current mockups

a) **Add flair to the header ("Current session").** Right now it is just small text, a large "30 / 10" and "Long game". Make it the star of the screen. This is also where the **play/pause button** lives.

b) **Remove the Voice / String / Bossa Nova row.** Sound styles are dropped.

c) **Available sessions in two rows.** There are now more presets than fit in one row:
- Long Game: 18/6, 21/7, 24/8, 27/9, 30/10, then slower practice presets 42/14, 60/20, 84/28, 120/40, 168/56. Ten in total, so two rows of five.
- Short Game: 14/7, 16/8, 18/9, 20/10, 22/11, 24/12. Six now, possibly more later. Design the grid so six, ten and a few more all look good.

## 6. Screens and components to design

### Main screen
- Header: label, large session numbers ("30 / 10"), the category ("Long game"), the play/pause button. Add flair.
- Game length control: Long game / Short game.
- Available sessions: the two-row preset grid. The selected preset is clearly marked.
- Background loop toggle (on or off, off by default).
- Light/dark mode toggle and entry to CONFIG mode, both in the header menu (see section 12).
- A small hint on iPhone: "No sound? Check your silent switch."

### Beat timeline (needs the most design thought)
Shows the swing as it plays. It has four moments: takeaway, weight shift, top of swing, impact. They are spaced by their real timing: the weight shift sits about two thirds of the way from takeaway to top in the Long Game, and the swing's last part (top to impact) is one quarter of the whole. As each beep plays, its moment lights up. The weight shift moment should look distinct from the other three, since it has a different sound. It must stay readable on a phone and scale from fast tempos (about a second) to very slow ones (about seven seconds).

### Play/pause
Large and easy to hit with a thumb. Clear states: stopped, playing. It restarts from the beginning each time.

### CONFIG mode (temporary)
The brother uses this to find the right weight shift position. It should feel like a natural part of the app, not a developer tool. Contains:
- A slider for the weight shift position, with visual feedback showing where it falls between takeaway and top of swing.
- **APPLY** (saves the setting for the selected category, Long Game or Short Game, one at a time).
- **Reset to default.**
- **EXPORT** (produces a small file to send back).
- A yes/no confirmation dialog shown when leaving CONFIG with unapplied changes. Suggested wording: "You have changes you haven't applied. Leave without applying?" with Yes and No.

### Button and control states
For preset buttons, segmented controls and the play button: default, selected, pressed, disabled, and (for the timeline) active.

## 7. Layout notes

- The category control (Long game / Short game) and the preset grid should be reachable with one thumb on a phone.
- On tablets and laptops, use the extra width well. Don't just stretch the phone layout.
- Landscape on a phone should keep the play button and the timeline visible without scrolling, if possible.

## 8. Accessibility

- Text and controls meet good contrast in both modes. The small grey-green labels in the current light mockup look low in contrast. Check them.
- Tap targets at least 44 by 44 points.
- State is never shown by color alone (selected, playing, and so on).
- Respect the device setting for light or dark by default.

## 9. What to bring back

1. **Mockups** for phone portrait, phone landscape, tablet and laptop, in light and dark. Include the main screen while stopped and while playing, and the CONFIG screen.
2. **Exact colors:** a hex palette for both themes (backgrounds, surfaces, text, secondary text, accent, selected, borders, error or warning).
3. **Typography:** the fonts, and sizes and weights for the big session numbers, labels, buttons and body text. Prefer fonts that are free to use and work on web and phones.
4. **Spacing and shape:** the corner radius, spacing steps and border widths you use.
5. **The header design** with the play/pause button.
6. **The beat timeline**, with its states: idle, each moment active, and the distinct weight shift moment.
7. **Component states:** default, selected, pressed, disabled, for each control.
8. **The CONFIG area:** slider, APPLY, reset, EXPORT, and the confirmation dialog.
9. **Icon files:**
   - App icon, 1024 by 1024.
   - Android adaptive icon: foreground layer and background layer or color.
   - Favicon.
   - Splash image.
10. **Any motion ideas**, written down or described (how the timeline lights up, how the play button changes).

Send exports as PNG, plus the design file or a link if possible. Put them in `_references/design/` in the project.

## 10. Icon ideas (suggestions, not requirements)

The icon should be fun and recognizable at small sizes. A few directions to try:
- A golf tee or ball combined with a metronome's swinging arm.
- A swing arc with beat dots on it.
- A circular badge echoing the "30 / 10" split badge Tour Tempo uses, but in our own style and colors.

## 11. Open items that may affect the design

- Short Game may get slower presets, so its preset grid could grow.
- The Short Game weight shift position starts at about 3/4 of the way from takeaway to top of swing (the Long Game is about 2/3). It is tentative and tuned by ear. It does not change the visual design, only where the marker sits on the timeline.

## 12. Design handoff review

A first design handoff arrived in `_references/DESIGN/` (tokens, a responsive main screen in HTML, a spec, and logo files). This section records the review so the refinements are not lost. The handoff is the visual source of truth. Where it conflicts with sections 1 to 11, the handoff wins, except for the points below.

Review method: the HTML, CSS and spec were read as code. They were not rendered, and the exported boards mentioned in the spec were not in the folder.

### Keep
- Palette and tokens in `tokens.css` and `logo/palette.json` (supersedes the palette sampled from the first mockups).
- Selected state = fill, 2px outline and check mark. Color is never the only signal.
- Gold is used only for the weight shift (marker, label) and the ball.
- Layout by breakpoint: phone single column, tablet single column with larger sizes, laptop two columns.
- Removed Voice / String / Bossa Nova row.
- The S swoosh mark, in dark and light versions.

### Refinements (to make in the working copy of the main screen, then carry into the build)
1. **Play button and session numbers are too small.** Cause: on laptop, `.play` is set to 150px and then overridden to 112px a few lines later. The spec says 88px on phones where the CSS has 72px. The spec says the button overlaps the card edge, but the CSS puts it beside the number. Make the play button larger and the session numbers larger, especially on phones.
2. **Short Game presets.** The list is empty in the mockup. Fill in 14/7, 16/8, 18/9, 20/10, 22/11, 24/12. Six items in a five-column grid leave one orphan, so use three columns by two rows for Short Game. The grid must also cope with more Short Game presets later.
3. **Timeline ratios.** The Long Game (3:1) and Short Game (2:1) need different splits for the backswing and downswing bars and labels. The weight shift sits at about half of the whole swing in both categories.
4. **Timeline data comes from the engine.** Marker positions, bar split and labels must be computed from the engine's beat times, not hard-coded. The weight shift marker must also move live in CONFIG mode while the slider is dragged. If Tour Tempo's beat 3 delay is confirmed, the real proportions differ from the label ratios (for 30/10, top of swing near 67% of the swing instead of 75%).
5. **Playing state.** Define it: a pause icon in the play button, an updated accessible label ("Play" or "Pause"), and a timeline animation. Proposed animation: a playhead sweeps along the bar in real time, each marker lights up as its beep sounds, and the weight shift diamond pulses in gold. It follows the audio schedule, not a separate timer.
6. **Silent-switch hint** shows on iPhone only, not always.
7. **Small text.** Phase labels are 10px and others are 11 to 12px on phones. Raise them, since the app is used outdoors in glare.
8. **Fit check.** "168/56" in five columns on a 320px-wide phone looks tight. Test at 320 and 360.
9. **Segmented control check mark** must follow the selected option (it stays on "Long game" in the mockup).
10. **Landscape on phones** is not designed yet.
11. **Header menu** replaces the separate theme and CONFIG buttons, so the wordmark does not wrap at 320px (see "Header menu" below). Not built in the HTML mockup; it is specified here and built in the app.

### Changes already made in the working copy (`docs/design/main-screen.html`)
- Desktop (1100px and up): `.num` font-size 190px to 155px.
- Tablet (700 to 1099px): `.play` 112px to 90px.
- Phone (under 700px): `.play` 72px to 55px.
- Laptop keeps its own `.play` rule (112px).
- Short Game presets filled in (14/7 to 24/12) in a three-by-two grid. Switching game updates the session numbers, the pill (3 : 1 or 2 : 1) and the timeline split, and each game remembers its own selected preset (defaults 30/10 and 24/12). The Game length check mark now follows the selection. The mockup computes the timeline from the label ratio; the app uses the engine's beat times.
- Open issue found in the render: on phones in Short Game, the "Weight shift" and "Top" labels overlap, because top of swing moves to about 67% and the weight shift stays near 50%. Options to decide later: shorter labels on phones ("Shift"), or put the weight shift label above the track.
- Checked by rendering at 1100, 800, 360 and 320px wide.

### Header menu
Layout: `[logo mark + wordmark]` on the left, `[menu button]` on the right. Nothing else in the header.

Menu button:
- A hamburger icon, at least 44 by 44 points, styled like the other header buttons in the handoff (surface fill, 1px border, chip radius).
- Accessible label "Menu". Announces whether the menu is open or closed.

Dropdown:
- Opens below the button, aligned to its right edge, on top of the page content.
- Items, in order:
  1. **Config.** Opens CONFIG mode. Temporary: removed in the final release, possibly replaced by a "How to" item.
  2. **Light mode / Dark mode.** The label names the mode it switches to. Switching saves the choice (see `.kiro/steering/tech.md`).
- Each item is a full-width row at least 44 points tall.
- Closes when an item is chosen, when tapping outside it, and on Escape (web).
- Keyboard: focus moves into the menu when it opens and returns to the menu button when it closes.
- Built as a shared `Menu` component in `src/ui/components/` from React Native pieces, not a web-only dropdown, so it works on phones. Its overlay and outside-tap behavior can be shared with the confirmation dialog.
- Colors, radius and spacing from the theme tokens.

### Fonts
The mockup loads Inter, Space Grotesk and Michroma from a web service. In the app they must be bundled through Expo and loaded before the first render. Michroma is used only for the small wordmark. Decision changed: Michroma is bundled and used for the wordmark text (header and intro) until a wordmark SVG exists.

### Icon files still needed
Android adaptive-icon foreground (transparent background) and a monochrome version, and a splash image. The 1024 icon, web sizes and favicon exist.

Owner: Mike (Photoshop, Illustrator or AI-assisted). Needed only for the native app, not the web build. Rough guide, to be checked against Expo's documentation at the time:
- Adaptive icon foreground: 1024 by 1024 PNG, transparent background, logo kept inside the middle area (about the central two thirds), because Android crops the edges into different shapes.
- Adaptive icon background: a solid color from the palette, or a 1024 by 1024 PNG.
- Monochrome: the same logo shape in one flat color on a transparent background, same size and position as the foreground.
- Splash: the logo mark (or wordmark) as a PNG on a transparent background, plus one background color for light mode and one for dark.

### CONFIG mode
Not in the handoff. It will be designed in this project, together with Kiro, as a simple, temporary screen. It needs a live-moving weight shift marker on the timeline.

### Gold (weight shift color): to change
The developer does not like that gold changes between modes (`#E0B84E` dark, `#8C6A0E` light), and dislikes the light-mode gold in particular. Goal: one gold that works in both modes.

Contrast check (2026-11-11), against the hero cards the marker sits on (dark `#14201A`, light `#DCE6DA`):
- Current dark gold `#E0B84E`: 8.9:1 on dark, 1.5:1 on light. Fails in light mode, which is why the handoff darkened it.
- A gold-looking color that clears the 3:1 minimum for graphics on both cards was not found. Mid ambers such as `#B8860B` reach about 5.2:1 on dark but only about 2.5:1 on light. The light card is a mid-light green, which leaves little room.
- No single color of any hue reaches 4.5:1 for small text on both cards (the best found was about 3.6:1).

Ways to get one gold anyway, to decide when the design is revisited:
1. One gold for the diamond, with a dark outline in light mode so the shape carries the contrast, not the fill.
2. Lighten the light-mode hero card so a mid gold passes 3:1 on it.
3. Show the "Weight shift" label in the normal text color, and keep gold only on the diamond. The label then passes in both modes, and color is not the only signal.

4. Take gold off the timeline entirely, and use it somewhere it can be the same in both modes. The timeline marks the weight shift by its diamond shape and its label, in the normal theme colors. Gold works the same in both modes when it is a **fill with dark text or a dark icon on top**, because the contrast that matters is then between the gold and its content, not the page: `#E0B84E` with `#0A0C0A` on it is 10.4:1, and with `#1B2A21` it is 8.0:1, in either mode. Candidate places: a gold chip showing the weight shift value in CONFIG mode, or a gold flash on the weight shift moment while playing. The fill's edge against the light page is low contrast, so it needs its text or icon, and should not rely on the fill alone.

5. **Put the timeline in its own container that is dark in both modes** (reference: `_references/SCALE.png`). In light mode the container background is the light-mode accent `#3D5C45` (the color of the selected Long game button and the play button). In dark mode it can be the page background `#0A0C0A`, a subtle inset on the hero card. Inside the container, use the dark-mode colors in both modes, so the timeline looks the same everywhere. Contrast check (2026-11-11):
   - One gold for both modes: `#EEC967`, slightly brighter than the current dark gold. 4.7:1 on `#3D5C45` and 12.3:1 on `#0A0C0A`, so it passes 4.5:1 for the small "Weight shift" label in both modes. The current `#E0B84E` gets only 4.0:1 on `#3D5C45`, which is fine for the diamond but not for the label.
   - Labels ("Takeaway", "Top", "Impact", "BACKSWING · 30"): `#F0F1EA` (6.6:1) or a pale green like `#C9DEC3` (5.2:1). The dark-mode secondary text `#A8B3AB` is only 3.5:1 on `#3D5C45`, so it fails for small text there.
   - Markers: `#A8B3AB` outlines pass the 3:1 graphic minimum (3.5:1).
   - Bars: the downswing bar `#8FB78F` passes (3.3:1). The backswing bar color `#4E6B58` nearly disappears on `#3D5C45` (1.3:1). It needs a lighter color, around 3:1, chosen when the design is revisited.
   - Watch: in light mode the play button and the container are the same green and sit close together in the hero card. Keep space between them, or give the play button a ring, so they don't merge.

   - **Tried in the working copy (2026-11-11):** option 5 is built in `docs/design/` and checked in renders at phone and laptop widths, both modes. It is the developer's preferred option so far.
   - **Grid texture on the container:** a very fine grid of 1px light lines every 5px, behind the timeline, to suggest a precise, high-performance instrument. White at 10% opacity in dark mode (raised from 5% by the developer) and 7% in light mode (tokens `--scale-grid` and `--scale-grid-size`). At 5% it was checked at 2x pixel density: present but subtle in both modes, and text and markers stayed clear. The 10% value has not been re-rendered. Tune the opacity and spacing by eye on real screens. In the app, CSS gradients are not available in React Native, so the grid is drawn with an SVG pattern (`react-native-svg`, supported by Expo) or a small repeating image.

These can be combined. Option 3 is likely needed with options 1 and 2, because of the small-text limit. Options 4 and 5 avoid the problem. Option 5 keeps gold on the timeline, where it means the most.

### Tagline and intro screen
- Tagline (decided): **"Train Your Tempo. Transform Your Game."** Two lines, two beats.
- Intro screen (decided): a short screen at startup showing the logo, the name and the tagline. It gives the app a performance-product feel, and it also covers the startup wait while the saved theme, fonts and saved CONFIG values load.
- Rules:
  - Shown only as long as loading takes, with a short minimum (about 1 second) so it does not flash.
  - A tap skips it.
  - Minimal motion; respect the device's reduce-motion setting.
  - Optional: a "Tap to begin" prompt that also unlocks browser audio. The play button already does this, so it is not required.
- Separate from the native splash image (the static image shown by the phone before the app starts), which is still needed for the native port.
- Not designed yet. Design it with the final name and wordmark.

### Product name
The handoff uses the name "Swing Sync". The app is currently "Golf Tempo" in `app.json` and in the docs. Undecided.
- "Swing Sync" is already used by another app, so it is out.
- "Swing Tempo" is the developer's current candidate (no existing app found by the developer). Not final; it may not go to the app stores, and the client may rename it later.
- Goal for now: something unique. Store-level checks only matter if it is published.
- Whatever the name, keep it in one place in the build (one constant for the name and tagline, plus `app.json`, plus one wordmark SVG), so a later rename is a small edit.
- The handoff's wordmark SVGs spell "SWING SYNC" and need redoing for the final name.
