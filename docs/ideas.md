# Ideas and Follow-ups

**Planning equivalent: the long-range wish list.**

Ideas for after the current plan, from the developer and from Mike. Nothing here is decided or scheduled. When an idea is approved, it gets a spec (or joins one) in `.kiro/specs/_index.md`, and its status here changes to "Scheduled".

Status values: **Idea** (written down), **Discussing** (being shaped), **Scheduled** (has a spec), **Dropped** (with the reason).

## Guiding principles

Every idea here is checked against these two principles. They come from the developer, November 2026.

1. **Understood on first open.** Someone opening the app for the first time should know what it is telling them to do, without tutorials. The test: with no other context, do they know what to tap, and what the sound is asking them to do? If an idea needs an explanation to work, it isn't ready.
2. **Stand apart from Tour Tempo.** Tour Tempo assumes you already know its system (bare frame counts like "24/8"). This app teaches the system as you use it, and adds the weight shift beat. Ideas that make the app explain itself are what set it apart.

Status: recorded here only. Whether to also add them to `.kiro/steering/product.md` (where every UI decision would be checked against them) is not decided yet.

---

## 1. Friendly preset names that teach tempo

**Status:** Idea. **From:** the developer.

**The problem.** The preset buttons show frame counts like "24/8". Golfers who know Tour Tempo understand them. Most people don't, and the app currently doesn't explain them.

**The idea.** Give each preset a plain name and a short description, so the app teaches what each tempo is for. The numbers stay visible, so people who know them can still find their tempo.

**Decided (developer): the big frame count stays in the Current session card.** The large "30/10" stays as the main display, with the name and description added alongside it, not in its place. Two reasons:
- It looks good. The big numbers are the hero of the design.
- It's part of the teaching. Seeing "Deliberate" next to "30/10" connects the plain name to the numbers golfers use. Someone who has heard "30/10" at the course and never asked what it means learns it here.

**Draft table (Long Game):**

| Frame count | Label | Archetype | Good for |
|---|---|---|---|
| 18/6 | Aggressive | The Ultra-Compact Swing | High-swing-speed players who have a very short, rapid backswing. |
| 21/7 | Brisk | The Modern Athletic Swing | Fast-tempo players who rely on explosive rotation. |
| 24/8 | Standard | The Balanced Tour Swing | The traditional benchmark for a rhythmic, well-timed full swing. |
| 27/9 | Smooth | The Rhythmic Classic Swing | Golfers who prefer a sweeping, elegant, and perfectly paced motion. |
| 30/10 | Deliberate | The Tempo & Rhythm Drill | Great for full swings with a very lazy, calm pace, or for long-iron control. |
| 42/14 | Form Focus | The Structural Baseline | Ideal for slow-motion breakdown of your takeaways and shoulder turns. |
| 60/20 | Slow | The Sequence Drill | Feeling each move happen in order: takeaway, weight shift, top, impact. |
| 84/28 | Super Slow | The Component Drill | Freezing your position at the top and checking each part of the swing. |
| 120/40 | Ultra Slow | The Weight Shift Drill | Feeling the lateral weight transfer start in the hips before the club reaches the top. |
| 168/56 | Slow Motion | The Full Breakdown | The slowest practice swing, about 7.5 seconds, to rehearse every position. |

The 42/14 and 84/28 rows use the original "Form Focus" and "Super Slow" text, moved onto the app's presets. The 60/20, 120/40 and 168/56 rows are new drafts. All slow presets are for practice swings only, as decided for the slow presets.

**Button layout note:** longer labels on the buttons will mean a different button layout (for example fewer columns, or taller buttons with the name above the numbers). That's fine, and expected. The grid is redesigned when this idea is built. Idea 2 (grouping the presets) changes the grid too, so design the two together.

**Draft table (Short Game), from Mike:**

| Frame count | Label | Shot type archetype | Best used for |
|---|---|---|---|
| 14/7 | Brisk / Crisp | The Short Game Standard | Crisp greenside chips, pitch shots, and aggressive bunker blasts. |
| 16/8 | Firm / Confident | The Speed-Control Putt | Standard putting strokes and mid-distance lag putts. |
| 18/9 | Smooth / Flowing | The Rhythmic Stroke | Long distance putts or players who like a soft, pendulum putting feel. |
| 20/10 | Deliberate | The Heavy Putter Pace | Players using heavily weighted putters, or a slow-motion chipping drill. |
| 22/11 | Slow Mechanical | The Takeaway Drill | Practicing a perfectly straight back-and-through putting path. |
| 24/12 | Super Slow-Mo | The Yips Buster | For players fighting the "yips": forces a completely smooth, un-rushed stroke. |

Short Game notes:
- **Putting is new to the app.** Until now Short Game meant chips and pitches. Mike's table adds putting (16/8 to 24/12). Question for Mike: does the weight shift beat make sense for a putt? If not, putting is a good fit for "Three beats only" (idea 3), or the description could say so.
- **Pick one label each.** "Brisk / Crisp", "Firm / Confident" and "Smooth / Flowing" offer two choices; the button needs one.
- **Repeated names.** "Brisk" and "Deliberate" are also Long Game names (21/7 and 30/10), and "Super Slow-Mo" is close to Long Game's "Super Slow". The category is always shown, so repeats are allowed, but unique names teach better.
- **"The Yips Buster" is a promise.** The app can't guarantee it fixes the yips. Softer: "The Smooth Stroke Drill", with the description kept.
- **One section, no groups.** Short Game stays a single group in Available sessions (see idea 2). Mike's descriptions do fall into strokes (14/7 to 18/9) and drills (20/10 to 24/12), which would match the two rows of three, so splitting stays an option if he wants it later.

**Things to resolve before it's built:**

- **Short Game names (done):** Mike's table above. See the Short Game notes for what's left.
- **Chips and pitches:** the original 45/15 row mentioned "chip shots, pitching practice". That was dropped from the Long Game table, because chips and pitches are Short Game swings (2:1). Mike's Short Game table covers them at 14/7.
- **"Tour" in "The Balanced Tour Swing".** The app is modeled on Tour Tempo, so it's safer to avoid "Tour" in our own names. Something like "The Balanced Benchmark Swing" keeps the meaning.
- **The "Good for" lines are golf advice.** Mike should check each one, since he knows the swing and the app shouldn't promise more than the tempo can deliver.
- **Where the text goes.** Ten five-column buttons are already tight on a 320px phone, and "Deliberate" or "Form Focus" won't fit next to "120/40". Options: the name on the button with the numbers small underneath; or the numbers on the button, with the name and description in the Current session card above the timeline. The second keeps the grid as it is and puts the teaching where people look while they play.
- **What changes in the code.** Names and descriptions would be added to the preset data in `src/engine/presets.ts`, so they live in one place. The "24/8" label stays as each preset's id, and the CONFIG export doesn't change.

---

## 2. Split the presets into Full Swings and Drills

**Status:** Idea. **From:** the developer. **Related to:** idea 1 (both make the presets easier to understand). Kept separate because it can be built without the names.

**Decided (developer):** two labeled groups, both visible (option 1 below), named **Full Swings** and **Drills**. Long Game only; Short Game stays one group.

**The problem.** Available sessions shows all ten Long Game presets as one block. Two different kinds of tempo are mixed together: real swing tempos, and slow practice tempos that are not for real swings.

**The idea.** Show the presets as two groups, each with its own label:

- **Full Swings (18/6 to 30/10):** real swing tempos. Alternative label: "Target Tempos".
- **Drills (42/14 and slower):** slow practice swings for feeling each part of the move. Alternative label: "Form & Mechanics".

The slow range starts at 42/14, the app's first slow preset. There is no 33/11 in the app.

**Two ways to show it:**

1. **Two labeled groups, both visible.** A small label above each row. Long Game already shows two rows of five, and the first row is exactly the full swing presets and the second row exactly the drills, so this mostly adds two labels.
2. **A toggle** (Full Swings / Drills) that shows one group at a time. Less on screen, but it adds a third choice before picking a preset (game length, then group, then preset), and the drills become easy to miss.

Option 1 is simpler and keeps everything one tap away. Option 2 makes more sense if idea 1's longer button labels make the grid much taller.

**Things to resolve before it's built:**

- **Group names (decided):** "Full Swings" and "Drills".
- **Short Game (decided):** a single group, with no group labels. See the Short Game notes in idea 1.
- **Rename "Available sessions".** The section label should say what the buttons choose: a tempo. Candidates: **"Tempo"** (shortest, and it's what the buttons set), "Choose your tempo", "Swing tempo", "Pace". "Session" is also used in "Current session", which describes what's playing, so the two labels currently compete. Lean: "Tempo", keeping "Current session" for the card. Decide when the grid is redesigned.
- **Group data.** Store each preset's group in the preset data in `src/engine/presets.ts`, alongside its name from idea 1, so the UI does not decide which presets are drills.
- **Design together with idea 1.** Both change the preset grid.

---

## 3. Beats control on the main screen

**Status:** Idea. **From:** the developer.

**The idea.** Bring the Audio lab's Beats control into the main app, so users can choose what they hear on top of the loop. Under the Background loop switch, add a "Beats" section label and three buttons in one row, in the same order as the Audio lab:

| With weight shift | Three beats only | Off |
|---|---|---|

- **With weight shift:** all four beeps (the default).
- **Three beats only:** the original Tour Tempo beeps, no weight shift beep.
- **Off:** no beeps. Only the background loop plays.

**Key points:**

- **Defaults:** Beats = With weight shift, and Background loop = off (as it is now).
- **The app is never silent.** If the loop is off and the user picks Beats "Off", the background loop turns on by itself, so people don't think the app is broken. The reverse case needs the same rule: if Beats are off and the user turns the loop off, Beats switch back to "With weight shift". Either way, show a short note so the change isn't a surprise, for example "Background loop turned on so you can still hear the tempo."
- **Changing it while playing** follows the existing rule for any change: stop, short pause, new run from beat 1.
- **The visuals follow the choice (decided).** With "Three beats only", the weight shift is removed from the visuals completely: the gold diamond and its "Weight shift" label come off the scale, and the weight shift silhouette is left out of the silhouette sequence (idea 5), so the figure goes takeaway, top, impact. With "Off", the markers still light up in time with the loop, so the visuals keep teaching the tempo.
- **Open: weight shift marker with Beats "Off".** There's no beep in that mode, but the loop still keeps time. Decide whether the diamond and the weight shift silhouette stay (they still show where it happens) or go.

**Things to resolve before it's built:**

- **Which component.** The Audio lab draws these as a grid of option buttons. The main app's Game length row uses `SegmentedControl`. Do the Reuse check then; a three-option `SegmentedControl` is the likely fit.
- **Fit on small phones.** "With weight shift" and "Three beats only" in three equal columns may wrap at 320px. Shorter labels are an option, such as "4 beats", "3 beats", "Off".
- **Remember the choice?** Only the theme and the CONFIG values are saved now. Decide whether the Beats choice is saved between visits or resets to the default.
- **What changes in the code.** The audio layer already supports all three modes (the Audio lab uses them), and the engine has the three-beat mode. The work is in the main screen and `usePlayerSession`.
- **Audio lab.** It is the developer's test playground and will be removed. This idea copies its behavior, not its code.

---

## 4. One-line instruction in the Current session card

**Status:** Idea. **From:** Kiro, from the first-open test.

**The problem.** A newcomer hears beeps but nothing tells them what each one means for their swing. This is the most likely point of confusion on first open.

**The idea.** One short line in the Current session card that says what to do. Drafts:

- With weight shift: "Start your backswing on the first beep, shift your weight on the second, start down on the third, and hit the ball on the last."
- Three beats only: "Start your backswing on the first beep, start down on the second, and hit the ball on the last."
- Shortest version: "Start your backswing on the first beep. Hit the ball on the last."

**Things to resolve before it's built:**

- **Pick the wording.** The long version is complete but long on a phone. The short version leaves out the middle beeps, which the timeline labels already name.
- **Follows the Beats choice (idea 3).** The line changes with "With weight shift" and "Three beats only". With Beats "Off", it describes following the loop instead, or is hidden.
- **Putting.** If Mike confirms Short Game includes putts (idea 1), "hit the ball" still works, but "backswing" may read oddly for a putt. "Start back" covers both.
- **Placement and size.** Small enough not to compete with the big tempo numbers, readable outdoors. Likely near the timeline, since the line explains it.
- **Dismissible or always on?** Always on is simplest. If it starts to feel like clutter for regular users, it could hide after the first few sessions.

---

## 5. Swing silhouettes that show each position (first draft)

**Status:** Idea. **From:** the developer.

**The idea.** Four silhouettes of a golfer, one for each moment of the swing: takeaway, weight shift, top, impact. While playing, the figure changes pose on each beep, in time with the audio, so the user sees what their body should be doing on that beat. Each silhouette has one highlighted area that draws attention to what matters in that position, for example the hips and legs on the weight shift frame.

The scale shows *when* each moment happens. The silhouettes show *what* happens. Together they answer the first-open question: what is the sound asking me to do?

**Rip cord: if it doesn't look amazing, the whole idea is dropped.** The silhouettes have to look professional. Golfers notice a wrong position instantly, and amateur-looking art would make the whole app look amateur. If the traced and styled frames aren't clearly pro quality, this idea is marked Dropped and the app keeps the scale on its own.

**How the artwork gets made:**

1. **Find a video of a pro golfer** with a great swing. It needs to be:
   - Face-on (camera facing the golfer's chest). The lateral weight shift only shows from this angle; from down the line it's hidden.
   - Slow motion or a high frame rate, so each position has a sharp frame.
   - Whole body and club in frame, against a plain or simple background, which makes step 3 much easier.
2. **Pick the four frames:** takeaway, weight shift, top, impact. Kiro can pull still frames from the video at exact moments.
3. **Trace each frame into a silhouette.** Mike can do this in Photoshop (remove the background, for example with Select Subject) and Illustrator (Image Trace into vector shapes), then clean up by hand: smooth edges, crisp club shaft and head. Tracing from a real video means the positions are correct and all four frames match in size and proportion. This is the main work, likely an afternoon or more for a set of four.
4. **Style the silhouettes.** Fill color from the theme, and one highlight area per frame. Gold for the weight shift frame, to match the gold diamond on the scale. Accent green for the others. A small arrow on the weight shift frame, because a lateral hip move barely shows in a still image. This step can go to a design tool; Kiro writes the prompt.

Generating the figures from scratch with a design tool was considered and ruled out: four matching, anatomically correct golfers holding a club is a known weak spot for those tools.

**Where it shows in the app (current lean):**

- **Live, in the Current session card:** a toggle between the scale and the silhouettes ("Scale | Swing"). Only one shows at a time on phones, so the card stays compact. Tablets and laptops may have room for both.
- **On a "How to" page in the header menu:** the four frames, each with a sentence explaining the position. No timing needed. A natural replacement for the CONFIG menu item later.
- Both use the same four images, so the art is made once.
- Replacing the scale entirely was ruled out: the silhouettes show positions, but only the scale shows the timing.
- Cheapest way to test: build the How to page first (static), and add the live toggle once the art passes the rip cord.

**Things to resolve before it's built:**

- **Rights to the video.** Tracing a frame from someone else's footage can still raise copyright questions (the video) and likeness questions (the golfer), even as a silhouette. Safer sources: stock footage with a license that allows use in an app, or Mike's own swing filmed to the guide in step 1. Check the source before tracing.
- **Short Game needs its own set.** A chip or putt looks nothing like a full swing, so it needs a second set of four. Putting may not have a weight shift frame (see the putting question in idea 1).
- **Follows the Beats choice (idea 3, decided).** With "Three beats only", the weight shift silhouette is removed from the sequence, so the figure shows takeaway, top, impact. The scale drops its weight shift marker at the same time.
- **Highlight areas.** Mike decides what each frame highlights, since he knows what matters in each position.
- **File format.** One SVG per frame, all with the same size and framing, the silhouette and the highlight as separate shapes so their colors come from the theme in light and dark mode.

---

## 6. Move the iPhone silent-switch hint above the Background loop switch

**Status:** Idea. **From:** the developer.

**Now:** on iPhone, the hint ("No sound? Check silent mode, mute in Control Center and the volume.") sits in the Current session card, between the play button and the scale (`src/app/MainScreen.tsx`).

**The idea:** move it to just above the Background loop switch, so it sits with the sound controls. With the Beats control (idea 3) below the loop switch, the hint, the loop and the Beats choice form one group about sound.

**Things to check:**

- **Phones:** the controls come below the Current session card, so the hint moves further down the screen. Someone with no sound looks at the sound controls, so it's still in the right place, but check it is easy to find.
- **Optional:** a "Sound" section label above the group, if the group reads better with one.
- **Small change:** the hint keeps its current component (`StatusMessage`) and text, only its position changes.

---

## 7. Mike's ideas

**Status:** Waiting for his list.

(Add each one as its own numbered section, in the same format as idea 1.)
