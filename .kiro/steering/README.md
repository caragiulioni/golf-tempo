---
inclusion: manual
---

# steering

**Planning equivalent: the zoning code and design guidelines.**

Steering files are the standing rules of the project. They apply to everything that gets built, the way a zoning code applies to every parcel in a district. Kiro reads them automatically before it does any work.

## What's in it

- `product.md`: what the app is and does. The goals, the presets, the weight shift beat, CONFIG mode.
- `tech.md`: the tools we build with, and the conventions we follow.
- `structure.md`: how the project's folders are organized, and which parts may depend on which.
- `timing-engine.md`: the rules for the timing code, the most critical part. Kiro only reads it when working in that code.
- `workflow.md`: how work is organized. Small phases, a check for each step, review stops, and notes for the port to phones.

## Why it matters

Without rules, every feature gets decided from scratch, and the decisions drift apart. Steering is where a decision gets made once and applied everywhere. When Kiro does something you didn't expect, check here first: either a rule is missing, or the rule isn't clear.

## How to use it

- Read `product.md` first. It's the shortest way to see what the project is.
- To change a rule, edit the file. Kiro will follow the new rule from then on.
- Keep each file focused on one subject. Short and specific is better than long and general.
- This README is set to manual, so Kiro doesn't load it every time. It is for people.
