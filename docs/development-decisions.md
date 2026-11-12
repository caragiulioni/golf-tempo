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
