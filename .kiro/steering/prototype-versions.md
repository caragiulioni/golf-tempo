# Prototype Versions (dev-V2, dev-V3, ...)

**First, check the branch:** run `git branch --show-current`. Follow this file only when the branch is `dev-V<n>` (for example `dev-V2`) or a change branch `v<n>/...` (for example `v2/03-preset-groups`). On any other branch, including `main` and a future plain `dev`, ignore this file.

## What this phase is

The app works. A prototype version moves it from a Tour Tempo clone toward a stand-alone app that explains itself. Most changes rearrange or relabel UI that already exists. Ideas come from `docs/ideas.md` and are checked against the guiding principles in `product.md`.

- `main` holds the live app. Netlify deploys it automatically. It does not change during a version, except for urgent fixes.
- `dev-V<n>` collects the version's changes. Netlify gives it its own preview URL.
- The version's change log is `docs/changes/V<n>.md`. It is the list of every change, and the way back out of any of them.
- When the version is accepted, `dev-V<n>` merges into `main`. The next version starts a new `dev-V<n+1>` from `main`. The tag `prototype-v1` marks `main` before V2.

## The rule: one change, one commit, one log entry

1. Every change has an ID: `V2-01`, `V2-02`, and so on, in the order they land.
2. Every change is built on its own short branch, then squash-merged into `dev-V<n>`, so it lands as exactly one commit, however many work commits it took.
3. That one commit contains the whole change: code, styles, tests, and every doc the change affects (see "Docs" below). Nothing about the change lives in another commit.
4. The commit message starts with the ID: `V2-03: Preset buttons in two groups`.
5. The change has one entry in `docs/changes/V<n>.md`, added in the same commit. The entry is the change's mini-spec. It links to the commit by ID, not by hash (a commit cannot contain its own hash). Find the commit with `git log --grep "V2-03" --oneline`.
6. History is never rewritten: no force push, no amending pushed commits, no rebasing `dev-V<n>`. Undoing a change is a `git revert`, which adds a new commit.

## Step by step

Kiro runs these and explains each step. The developer can also follow them by hand.

**Start a change**
```
git switch dev-V2
git pull
git switch -c v2/03-preset-groups     # v<n>/<ID number>-<short-name>
```
Commit as often as needed on this branch. `git push -u origin v2/03-preset-groups` gives it a Netlify preview link (if branch deploys are on for all branches) for testing on a phone.

**Finish a change (squash-merge)**
```
git switch dev-V2
git pull
git merge --squash v2/03-preset-groups
git commit -m "V2-03: Preset buttons in two groups"
git push
```
Before the commit: the change log entry is filled in, `npm run typecheck` and `npm test` pass, and the docs checklist is done. Alternative: open a pull request on GitHub from the change branch into `dev-V2` and press **Squash and merge**, with the same commit message.

**Clean up** (ask the developer first)
```
git branch -D v2/03-preset-groups              # -D is needed: after a squash, git does not see the branch as merged
git push origin --delete v2/03-preset-groups
```

**Undo a change**
```
git log --grep "V2-03" --oneline              # find the commit
git revert <hash>
```
Then mark the entry **Reverted** in the change log, in the same revert commit (`git revert --no-commit <hash>`, edit the log, then commit with the message `Revert V2-03: Preset buttons in two groups`). Revert newest first: if another change depends on this one (see its "Depends on" line), revert that one first.

**Finish the version**
```
git switch main
git pull
git merge --no-ff dev-V2 -m "Merge V2"
git push
```
A normal merge, not a squash, so every `V2-xx` commit stays on `main` and can still be reverted there. Netlify then deploys `main`. Ask the developer before this step: it changes the live app.

## Docs

**In each change's commit** (they revert with the change):
- Its entry in `docs/changes/V<n>.md`.
- Steering files the change affects (`product.md`, `tech.md`, `structure.md`).
- `docs/design-brief.md` and `docs/design/` if the design changes.
- The idea's status in `docs/ideas.md` (for example "Scheduled (V2-03)").
- Folder READMEs if files are added or removed.

**Once per version, at merge into `main`** (shared logs that every change would otherwise fight over):
- One entry for the version in `docs/porting-guide.md`, written from the change log.
- The version's status in `.kiro/specs/_index.md`.
- The idea statuses in `docs/ideas.md` that change from "Scheduled" to done.

## Change rules

- **The timing engine does not change.** No edits in `src/engine/`, except preset data in `src/engine/presets.ts` (names, descriptions, groups). Existing engine tests must pass unchanged. Any other engine change: stop and ask.
- **Workflow rules still apply** (`workflow.md`): the Reuse check before any UI or style, theme tokens only, one concern per change. If a change needs "and" to describe it, it is two changes.
- **Keep changes independent** where possible, so any one can be reverted alone. When one builds on another, record it in "Depends on".
- **CONFIG stays and keeps working** in every version, so calibration is never interrupted.
- **Check every change against the guiding principles** in `product.md` before building it.
- **Stop for review** after each change lands on `dev-V<n>`.
