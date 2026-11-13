# docs

**Planning equivalent: the consultation record, the decision register, and handover documents.**

This folder holds working documents about the project that aren't plans for a specific feature.

## What's in it

- `client_questions.md`: questions for the person who will use the app. Answers get written under each question. Once a question is answered, the decision moves to `dev_questions.md` and the question is removed.
- `dev_questions.md`: the decision register. It lists what has been decided, what was learned from measuring Tour Tempo, and what is still open.
- `development-decisions.md`: plain-language notes for the user (Mike) on choices made during development: the problem, what was tried, what the app does now, how much it matters, and how it could be fixed later. One entry per decision.
- `calibration-guide.md`: plain-language steps for Mike on finding his weight shift position with the Config screen, and what to send back. Temporary: removed with CONFIG in spec 6.
- `porting-guide.md`: a running log of what must change to move the app from the web to iOS and Android. It also records which devices the audio has been tested on.

## Why it matters

Projects fail at handover when knowledge lives only in someone's head. We write things down as we go, while the reasons are fresh. At the end, the log becomes a single step-by-step guide that someone with little development experience can follow.

## How to use it

- After each feature is finished, a short entry gets added to the porting guide.
- Before the app goes to phones, read the porting guide from the top.
- New supporting documents go here.
