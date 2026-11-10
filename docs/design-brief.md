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
- Light/dark mode toggle.
- Entry to CONFIG mode.
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
