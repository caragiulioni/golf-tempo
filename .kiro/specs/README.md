# specs

**Planning equivalent: the individual project plans, and the master schedule.**

A spec is the detailed plan for one feature. The steering files set the rules for the whole district. A spec is the plan for one building within it.

## What's in it

- `_index.md`: the master schedule. It lists every spec in order, what each covers, what it depends on, and what is blocking it. It shows two statuses for each: whether the plan is written, and whether the work is built.
- One folder per spec, created when that spec is next in line. Each will hold three documents:
  - **Requirements:** what the feature must do, and how we'll know it does.
  - **Design:** how it will be built.
  - **Tasks:** the work broken into small steps, each with a way to check it.

## Why it matters

Large projects get messy when the plans get ahead of what's known. So the master schedule lists everything up front, but each detailed plan is written just before the work starts, when we know the most. The schedule keeps the whole thing in view. The individual plans keep each piece focused.

## How to use it

- Start at `_index.md` to see where the project stands.
- A spec isn't finished until its requirements, design and tasks all exist. It isn't built until the work is done and reviewed.
- Specs should refer to the steering files for shared decisions. They shouldn't repeat them.
- When a spec changes, update `_index.md`.
