# Ideas and Follow-ups

**Planning equivalent: the long-range wish list.**

Ideas for after the current plan, from the developer and from Mike. Nothing here is decided or scheduled. When an idea is approved, it gets a spec (or joins one) in `.kiro/specs/_index.md`, and its status here changes to "Scheduled".

Status values: **Idea** (written down), **Discussing** (being shaped), **Scheduled** (has a spec), **Dropped** (with the reason).

## Guiding principles

Every idea here is checked against these two principles. They come from the developer, November 2026.

1. **Understood on first open.** Someone opening the app for the first time should know what it is telling them to do, without tutorials. The test: with no other context, do they know what to tap, and what the sound is asking them to do? If an idea needs an explanation to work, it isn't ready.
2. **Stand apart from Tour Tempo.** Tour Tempo assumes you already know its system (bare frame counts like "24/8"). This app teaches the system as you use it, and adds the weight shift beat. Ideas that make the app explain itself are what set it apart.

Status: also in `.kiro/steering/product.md` (on `dev-V2`), so every UI decision is checked against them.

**Where ideas get built:** in prototype versions (`dev-V2`, ...). When an idea is picked up, its status here becomes "Scheduled (V2-NN)", and the change is logged in `docs/changes/V2.md`.

---

## 1. Friendly preset names that teach tempo

**Status:** Partly scheduled: the archetype and "Good for" text in the Current session card is V2-10 (`docs/changes/V2.md`). The short labels are not scheduled. **From:** the developer.

**The problem.** The preset buttons show frame counts like "24/8". Golfers who know Tour Tempo understand them. Most people don't, and the app currently doesn't explain them.

**The idea.** Give each preset a plain name and a short description, so the app teaches what each tempo is for. The numbers stay visible, so people who know them can still find their tempo.

**Decided (developer): the big frame count stays in the Current session card.** The large "30/10" stays as the main display, with the name and description added alongside it, not in its place. Two reasons:
- It looks good. The big numbers are the hero of the design.
- It's part of the teaching. Seeing "Deliberate" next to "30/10" connects the plain name to the numbers golfers use. Someone who has heard "30/10" at the course and never asked what it means learns it here.

**Draft table (Long Game):**

| Frame count | Label | Archetype | Good for |
|---|---|---|---|
| 18/6 | Aggressive | The Ultra-Compact Swing | Short, explosive backswings with rapid transitions and powerful rotational speed. |
| 21/7 | Brisk | The Modern Athletic Swing | Dynamic, athletic swings with quick transitions and assertive acceleration. |
| 24/8 | Standard | The Balanced Tour Swing | Well-sequenced swings with a full backswing, smooth transition, and balanced power. |
| 27/9 | Smooth | The Rhythmic Classic Swing | Flowing, full-bodied swings with relaxed takeaways and effortless acceleration. |
| 30/10 | Deliberate | The Measured Swing | Patient backswings, controlled transitions, and gradual acceleration through impact. |
| 42/14 | Unhurried | The Deliberate Tour Swing | Exceptionally composed swings with extended backswings and measured, fluid transitions. |
| 60/20 | Slow | The Sequence Drill | Feeling each move happen in order: takeaway, weight shift, top, impact. |
| 84/28 | Super Slow | The Component Drill | Freezing your position at the top and checking each part of the swing. |
| 120/40 | Ultra Slow | The Weight Shift Drill | Feeling the lateral weight transfer start in the hips before the club reaches the top. |
| 168/56 | Slow Motion | The Full Breakdown | The slowest practice swing, about 7.5 seconds, to rehearse every position. |

All slow presets are for practice swings only, as decided for the slow presets.

**Button layout note:** longer labels on the buttons will mean a different button layout (for example fewer columns, or taller buttons with the name above the numbers). That's fine, and expected. The grid is redesigned when this idea is built. Idea 2 (grouping the presets) changes the grid too, so design the two together.

**Draft table (Short Game), from Mike (22/11 and 24/12 are Kiro's draft suggestions, kept for now):**

| Frame count | Label | Archetype | Best used for |
|---|---|---|---|
| 14/7 | Brisk / Crisp | The Short Game Standard | Decisive strokes with crisp contact for chips, pitches, and bunker shots. |
| 16/8 | Firm / Confident | The Speed-Control Putt | Balanced, controlled strokes for consistent putting and distance control. |
| 18/9 | Smooth / Flowing | The Rhythmic Stroke | Soft, pendulum-like strokes for longer putts and delicate distance control. |
| 20/10 | Deliberate | The Heavy Putter Pace | Heavily weighted putters and players favouring a slow, controlled stroke. Also suited to deliberate chipping practice. |
| 22/11 | Patient | The Patient Stroke | Slower, softer strokes for long lag putts and delicate chips where feel matters more than speed. |
| 24/12 | Silky | The Slow Pendulum | The slowest Short Game tempo: relaxed, unhurried strokes to feel the pendulum motion and develop soft touch around the green. |

Short Game notes:
- **Pick one label each.** "Brisk / Crisp", "Firm / Confident" and "Smooth / Flowing" offer two choices; the button needs one.
- **Repeated names.** "Brisk", "Smooth" and "Deliberate" are also Long Game names (21/7, 27/9 and 30/10). The category is always shown, so repeats are allowed, but unique names teach better.
- **One section, no groups.** Short Game stays a single group in Available sessions (see idea 2). Mike's descriptions do fall into strokes (14/7 to 18/9) and drills (20/10 to 24/12), which would match the two rows of three, so splitting stays an option if he wants it later.
- **22/11 and 24/12 are drafts.** Mike's table named 14/7 to 20/10. "Patient" and "Silky" (with their archetypes and descriptions) were suggested for the last two so all six presets have a name. Keep for now, Mike should check them, and "Easy" or "Feather" are alternatives to "Silky". 24/12 is the app's default Short Game preset, so its name is the first one a new user sees.

**Things to resolve before it's built:**

- **Short Game names (done):** Mike's table above. See the Short Game notes for what's left.
- **Chips and pitches:** the original 45/15 row mentioned "chip shots, pitching practice". That was dropped from the Long Game table, because chips and pitches are Short Game swings (2:1). Mike's Short Game table covers them at 14/7.
- **"Tour" in "The Balanced Tour Swing".** The app is modeled on Tour Tempo, so it's safer to avoid "Tour" in our own names. Something like "The Balanced Benchmark Swing" keeps the meaning.
- **The "Good for" lines are golf advice.** Mike should check each one, since he knows the swing and the app shouldn't promise more than the tempo can deliver.
- **Where the text goes.** Ten five-column buttons are already tight on a 320px phone, and "Deliberate" or "Form Focus" won't fit next to "120/40". Options: the name on the button with the numbers small underneath; or the numbers on the button, with the name and description in the Current session card above the timeline. The second keeps the grid as it is and puts the teaching where people look while they play.
- **What changes in the code.** Names and descriptions would be added to the preset data in `src/engine/presets.ts`, so they live in one place. The "24/8" label stays as each preset's id, and the CONFIG export doesn't change.

---

## 2. Split the presets into Full Swings and Practice Drills

**Status:** Scheduled (V2-04 to V2-08, see `docs/changes/V2.md`). Timing planned (November 2026), see "Drill timing" below. **From:** the developer. **Related to:** idea 1 (both make the presets easier to understand). Kept separate because it can be built without the names.

**Decided (developer, V2 plan):** a toggle with two linked buttons, **GAMEPLAY** and **PRACTICE DRILLS** (option 2 below), and a stepped **Tempo** slider in place of the preset buttons (V2-06). Long Game only; Short Game has no toggle. This replaces the earlier decision of two labeled groups both visible, named Full Swings and Drills.

**The problem.** Available sessions shows all ten Long Game presets as one block. Two different kinds of tempo are mixed together: real swing tempos, and slow practice tempos that are not for real swings.

**The idea.** Show the presets as two groups, each with its own label:

- **Gameplay (18/6 to 30/10):** real swing tempos. Earlier names: "Full Swings", "Target Tempos".
- **Practice Drills (42/14, 60/20, 84/28):** slow practice swings for feeling each part of the move. Earlier names: "Drills", "Form & Mechanics".

The slow range starts at 42/14, the app's first slow preset. There is no 33/11 in the app. **120/40 and 168/56 are removed** (decided, developer): too slow to be useful, and the drill timing below works cleanly only without them.

**Two ways to show it:**

1. **Two labeled groups, both visible.** A small label above each row. Long Game already shows two rows of five, and the first row is exactly the full swing presets and the second row exactly the drills, so this mostly adds two labels.
2. **A toggle** (Full Swings / Drills) that shows one group at a time. Less on screen, but it adds a third choice before picking a preset (game length, then group, then preset), and the drills become easy to miss.

Option 1 is simpler and keeps everything one tap away. Option 2 makes more sense if idea 1's longer button labels make the grid much taller.

**Things to resolve before it's built:**

- **Group names (decided, V2 plan):** "Gameplay" and "Practice Drills" (earlier: "Full Swings" and "Drills").
- **Short Game (decided):** a single group, with no toggle. See the Short Game notes in idea 1.
- **Rename "Available sessions" (decided, V2-06):** "Tempo", keeping "Current session" for the card. "Session" was used in both labels, so they competed. The wording can change later.
- **Group data.** Store each preset's group in the preset data in `src/engine/presets.ts`, alongside its name from idea 1, so the UI does not decide which presets are drills.
- **Design together with idea 1.** Both change how tempos are chosen and described (now the Tempo slider, V2-06, and the text in V2-10).

**Drill timing (planned, developer and Kiro, November 2026).** This is a timing engine change, so it is an approved exception to the V2 rule "the timing engine does not change" (see `.kiro/steering/prototype-versions.md`). Drills only: Full Swings and Short Game do not change.

*What the golfer gets.* Each drill swing plays once, then a recovery measure to finish and reset, then a countdown of 4, 3, 2, 1 that leads into the next takeaway. The countdown sits on the hi-hat, so it lines up with the background loop whether the loop is on or off.

*The count.* One count is one downswing (`downFrames / 30`). With the true 3:1 a drill swing is exactly 4 counts (takeaway to TOP 3, TOP to impact 1), and the hi-hat ticks every half count, so a swing is one measure of 8 hats.

*The bar (one cycle), in counts:*

| Counts | What happens |
|---|---|
| 0 to 4 | The swing: takeaway on 0, weight shift as now (a fraction of the backswing), TOP on 3, impact on 4 |
| 4 to 8 | Recovery measure (finish, reset) |
| 8 to 12 | Countdown: 4 on count 8, 3 on 9, 2 on 10, 1 on 11 |
| 12 | Next takeaway (count 0 of the next bar) |

So a bar is 12 counts = 24 hats = 3 measures of 8 (swing, recovery, countdown).

| Drill | One count | Hi-hat | Swing | Recovery + countdown | Whole bar |
|---|---|---|---|---|---|
| 42/14 | 0.47 s | 0.23 s | 1.87 s | 3.73 s | 5.60 s |
| 60/20 | 0.67 s | 0.33 s | 2.67 s | 5.33 s | 8.00 s |
| 84/28 | 0.93 s | 0.47 s | 3.73 s | 7.47 s | 11.20 s |

*Decided:* the countdown counts once per count (every other hi-hat), not on every hi-hat (every hi-hat at 42/14 would be a number every 0.23 s). A recovery measure comes before the countdown. The countdown sound is chosen by ear.

*Work split.*

- **Timing engine and countdown sound (Kiro, in the timing context):** drill group and the two removed presets in `presets.ts`; the drill bar in `repeat.ts`; new `countdown` events (4, 3, 2, 1) in `sequence.ts`; drill loop pattern in `loop.ts`; tests that lock the rules (below); a countdown voice in `tones.ts`, with candidate sounds in the Audio lab to pick from by ear. Placeholders where other code reads event types, so nothing breaks.
- **UI (from the handoff):** the countdown on screen (numbers, pulse, animation; V2-08), the Gameplay / Practice Drills toggle (V2-05) and the Tempo slider (V2-06). Handoff document: `docs/drills-handoff.md`.

*Rules the tests will lock (so later changes cannot break them):* every drill bar is exactly 24 hats (whole measures of 8); every countdown event lands exactly on a hi-hat, loop on or off; takeaway, weight shift, TOP and impact land where they do now, relative to the backswing; Full Swings and Short Game produce exactly the same events as before; everything scales with tempo (no fixed seconds anywhere in the drill bar).

*Decided (V2-07):* pressing Play, and the restart after a change, start with a countdown before the first takeaway.

---

## 3. Beats control on the main screen

**Status:** Replaced by V2-03 (`docs/changes/V2.md`): two toggles below the Current session card, Background loop and Weight shift. Takeaway, top and impact always play, so there is no "Beats off" option and the never-silent rule below is not needed. Weight shift off hides the diamond, as decided below. Kept here for the history. **From:** the developer.

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
- **Putting.** Mike's Short Game table (idea 1) includes putts, so "hit the ball" still works, but "backswing" may read oddly for a putt. "Start back" covers both.
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
- **Short Game needs its own set.** A chip or putt looks nothing like a full swing, so it needs a second set of four. Putting may not have a weight shift frame, since Mike's Short Game table (idea 1) includes putts.
- **Follows the Beats choice (idea 3, decided).** With "Three beats only", the weight shift silhouette is removed from the sequence, so the figure shows takeaway, top, impact. The scale drops its weight shift marker at the same time.
- **Highlight areas.** Mike decides what each frame highlights, since he knows what matters in each position.
- **File format.** One SVG per frame, all with the same size and framing, the silhouette and the highlight as separate shapes so their colors come from the theme in light and dark mode.

---

## 6. Move the iPhone silent-switch hint above the Background loop switch

**Status:** Idea, not in the V2 plan. V2-03 moves the Background loop toggle to just below the Current session card, next to the new Weight shift toggle, so "above the Background loop switch" would now put the hint right under the card. Decide its place after V2-03 lands. **From:** the developer.

**Now:** on iPhone, the hint ("No sound? Check silent mode, mute in Control Center and the volume.") sits in the Current session card, between the play button and the scale (`src/app/MainScreen.tsx`).

**The idea:** move it to just above the Background loop switch, so it sits with the sound controls. With the Beats control (idea 3) below the loop switch, the hint, the loop and the Beats choice form one group about sound.

**Things to check:**

- **Phones:** the controls come below the Current session card, so the hint moves further down the screen. Someone with no sound looks at the sound controls, so it's still in the right place, but check it is easy to find.
- **Optional:** a "Sound" section label above the group, if the group reads better with one.
- **Small change:** the hint keeps its current component (`StatusMessage`) and text, only its position changes.

---

## 7. Explain the tempo ratios

**Status:** Idea. **From:** the developer. **Related to:** ideas 1 and 4 (all three explain what the app is telling you).

**The idea.** Say, in plain words, what the two tempo ratios are and why they differ. The wording the developer wants kept:

- **3:1 Tempo (Full Swing):** A slow, controlled backswing followed by a fast, explosive downswing.
- **2:1 Tempo (Short Game):** A smooth, pendulum-like stroke with a shorter follow-through, ideal for putting and chipping.

**Why it matters.** The first principle at the top of this file says someone should understand the app on first open. The numbers "30/10" and "3 : 1" mean nothing to a newcomer until they know the backswing takes three times as long as the downswing. These two lines explain the ratio in terms of how the swing feels.

**Where it could go (not decided, the developer is thinking about it).** Candidates:
- Next to the ratio pill in the Current session card ("Long game · 3 : 1"), as a short line that changes with the game length.
- On the "How to" page in the header menu (idea 5), with the silhouettes.
- As a short line under the game length control (Long game / Short game).
- With the preset names and descriptions from idea 1, as the intro to each table.

**Things to resolve before it's built:**
- **Where it shows** (see above), and whether it is always on or can be dismissed.
- **Wording check.** "Fast, explosive downswing" and "shorter follow-through" are golf claims, so Mike should read them once.
- **Fit on small phones.** One line each, so it should be short enough to read at a glance.

---

## 8. Mike's ideas

**Status:** Waiting for his list.

(Add each one as its own numbered section, in the same format as idea 1.)

---

## 9. Redesign the countdown sound

**Status:** Idea. **From:** the developer (V2-07 review, November 2026).

**The problem.** The Practice Drills countdown (V2-07) uses the "Falling" pattern, picked by ear: the pitch steps down from 4 to 1. The pattern is right, but the sound itself (a plain synthesized beep) should be redesigned.

**What stays.** The timing: four counts on the hi-hat, "1" one count before the takeaway, and the lead-in when Play is pressed. Only the sound changes.

**Where it lives.** `src/audio/tones.ts`: the `countFall4` to `countFall1` voices (pitch, length, harmonic, attack, level) and `DEFAULT_COUNTDOWN_TONE_STYLE`. The other candidates (Tick, Last high) are still there and can be switched in the Audio lab. A different kind of sound (for example a woodblock, a click or a soft voice) would need a new sound shape in `src/audio/webAudio.ts`, like the loop's kick and snare.

**Things to resolve:**
- What it should sound like, by ear, against the beats and the loop on a phone speaker.
- Whether "1" should stand out from 4, 3 and 2.
- Whether the countdown hats in the loop should be accented (still open from V2-07).
