# Swing Sync: main screen spec
Source of truth: tokens.css + main-screen.html (responsive, one file). Reference screenshots = the six boards exported from the Design artifact.

## Layout (all sizes)
Header: logo mark + SWING SYNC wordmark (left); theme toggle + CONFIG (right).
Hero card: "CURRENT SESSION", game-type pill (Long game · 3 : 1), big ratio (30/10), beat timeline, round Play button overlapping card edge.
Then: GAME LENGTH segmented (Long / Short), AVAILABLE SESSIONS 2x5 grid, Background loop switch, silent-switch hint.
Removed: Voice / String / Bossa Nova row.

## Breakpoints
- Phone <700: single column, 20px pad, hero 300px, Play 88px.
- Tablet 700-1099: single column, 48px pad, hero 460px, Play 128px, chips 84px.
- Laptop >=1100: two columns (hero 1.45fr | controls 1fr), Play inside hero.

## Timeline (Long 3:1)
Takeaway 0%, Weight shift 50% (gold diamond), Top 75%, Impact 100%. Backswing bar = muted, downswing bar = accent. Short game: set ratios from design-brief.md.

## Rules
- Selected state = fill + 2px outline + check mark (borders are only ~1.5:1 contrast, never rely on color alone).
- Gold = accent only (weight-shift marker/label, ball). Never in the logo.
- Tap targets >=44px. All body text >=4.5:1 (checked, see logo/palette.json).
- Logo: logo-mark-dark.svg on dark, logo-mark-light.svg on light. Wordmark is outlined paths in logo/logo-lockup-*.svg (no font dependency). In the app header the wordmark is live Michroma text for simplicity; swap to the lockup SVG if the font fails to load.
- Not in scope yet: playing state, CONFIG screen, landscape.
