# src

**Planning equivalent: the built project, organized by district.**

This is where the actual app code lives. Everything before this point was planning. Each subfolder has one job, and a rule about what it may depend on. The full layout and rules are in `.kiro/steering/structure.md`.

| Folder | Job |
|---|---|
| `engine/` | The timing brain. Works out when each beep happens. |
| `audio/` | Makes the sounds and plays them at the right moments. |
| `ui/` | What you see and tap. |
| `theme/` | Colors, spacing and type sizes, shared by everything. |
| `storage/` | Remembers small things between visits, like light or dark mode. |
| `config-mode/` | The temporary tools for finding the weight shift position. Removed later. |
| `app/` | Wires the pieces together into the screens. |

Each folder has its own README.
