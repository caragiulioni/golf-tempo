# Development decisions

Plain-language notes on choices we made while building Swing Tempo, written to share with Mike. Each entry says what the problem was, what we tried, what the app does now, how much it matters, and how it could be fixed later.

The app is in beta. Some of these are trade-offs, not final answers.

---

## 1. What happens when the phone locks

**Short version:** the beats stop when the phone locks or when you switch to another app. The app keeps the screen on by itself while it plays, so this only happens if you lock the phone on purpose. When you come back, tap Play and it starts again from the first beat.

### The problem

The app runs in a web browser. Phones save battery by slowing down websites when the screen is locked. For a tempo trainer that is a real problem, because the beats only work if they are exactly on time.

On a Google Pixel 6 with the phone locked, the beats played cleanly for about 4 minutes. After that they started to crackle, then broke up, then stopped completely. Unlocking the phone brought them back. We could not find a setting that a website is allowed to change to stop this.

On an iPad, the sound stops as soon as the screen locks.

### What we tried

- **Keeping the screen on.** The app asks the phone to keep the screen awake while it plays. This works: the phone did not lock on its own in any test. It is still in the app.
- **A bigger sound buffer.** The phone gets more sound prepared in advance. This removed the crackling during short locks (15 to 25 seconds) on the Pixel and is now always on. It did not fix long locks.
- **Playing silent audio in the background.** A known trick to make a phone treat a website like a music player. It made no real difference on the Pixel.
- **Restarting the sound every few minutes.** An idea we looked at but did not build. The tests suggest the problem needs the phone to be locked, so restarting probably would not help, and a website may not be allowed to restart sound while the phone is locked.
- **A safety check.** If the sound starts falling behind, the app stops it rather than playing beats at the wrong time. This is still in the app as a backup.

### What the app does now

- While it plays, the screen stays on by itself.
- If the phone locks or you switch to another app, the beats stop straight away, with no crackling or broken beats.
- When you come back, it says the beats are paused. Tap Play to start again.

With the screen on, the beats stayed clean for over 7 minutes on the Pixel. A longer test (20 to 30 minutes) is still to do.

**A side benefit:** if a text comes in and you pick up the phone to answer it, the beats do not keep playing in the background while you are in another app.

### How much it matters

- **For normal practice:** it should be fine. Leave the phone face up with the app open and the screen stays on.
- **If you want to lock the phone or put it in your pocket:** the beats will stop. That is the main limit of the web version.
- **If you want to film your swing on the same phone with the beats playing:** opening the camera counts as switching apps, so the beats stop. Using a second phone to film works.
- Many apps behave this way, so it may not bother you. Tell us if it does.

### How it could be fixed later

The real fix is a proper phone app (iPhone and Android) instead of a website. A phone app is allowed to keep playing sound with the screen locked, the way music apps do. That is planned as a possible later step, and the timing parts of the app have been built so they carry over to a phone app.

---

## 2. The background loop copies Tour Tempo's groove

### What we found
We measured the audio in the Tour Tempo screen recordings (`_references/tempo-clips/`). Its drum loop is one bar per swing, split into 12 even steps:
- A hi-hat plays on every step, louder on steps 0, 2, 6 and 10.
- The kick plays on steps 0, 4 and 8. Quiet extra "ghost" kicks on steps 1, 5 and 9 appear only at the fastest tempo (18/6).
- The snare plays on steps 2, 6 and 10.
- Beat 2 lands on step 4 and beat 3 on step 6, so the beeps line up with the drums.
- The loop keeps playing through the pause between swings.
- The Short Game clips had no drum loop in them, so Short Game uses the same pattern, placed to fit its beats (see below).

### How the app does it
The app uses the same pattern. For the fast Long Game tempos the 12 steps are even, exactly as in Tour Tempo, so beat 2 and beat 3 sit very slightly off the drums (by up to 0.05 s at 18/6), as they do in Tour Tempo. For the slow Long Game tempos the steps are placed so beat 2 is on step 4 and beat 3 on step 6. In Short Game the steps are placed so beat 2 is on step 3 and beat 3 on step 6: with even steps, beat 2 landed about 0.15 s before a kick and sounded like a double hit. At slow tempos a step can be over a second long, so extra quiet hi-hats fill it in to keep a steady pulse. The pattern lives in `src/engine/loop.ts` as plain tables, so changing the groove means changing a list. The ghost kicks play on a named list of presets (`GHOST_KICK_PRESETS`); empty the list to remove them.
