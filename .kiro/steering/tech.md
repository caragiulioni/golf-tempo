# Tech Stack and Conventions

The project is initialized (Expo, blank TypeScript template). Versions are pinned exactly in `package.json`.

## Stack

- TypeScript everywhere, including the timing engine.
- Expo with React Native components, running on web through React Native Web. A native app is a likely later step, so write UI with React Native primitives, not DOM elements or MUI.
- Styling: plain React Native `StyleSheet` with a small theme module in `src/theme/` (colors, spacing, radius, type sizes; light and dark chosen from the device setting). No UI library (no MUI, Tamagui or Gluestack). Shared components in `src/ui/components/` are built from `View`, `Text` and `Pressable` and read from the theme. No hard-coded colors, sizes or fonts in components.
- Light and dark mode: the user can switch with a toggle in the header menu, and the choice is remembered. Default is the device setting until the user picks one.
- Persistence: `@react-native-async-storage/async-storage` (uses `localStorage` on web, native storage on iOS and Android). Access it only through a small wrapper in `src/storage/`. It is asynchronous, so hold the first render until the saved theme choice has loaded, to avoid a flash of the wrong theme. Only the theme choice is persisted for now. Applied weight shift positions (Long Game and Short Game, saved separately) are also stored this way, temporarily, until the final release hard-codes them. Use a versioned key. Validate on load: if a value is missing, corrupted or outside the slider's safe range, fall back to the default. Saved values are per device and browser, so EXPORT is the source of truth. The final release must stop reading and ideally delete the saved key, so stale values cannot override the hard-coded ones. Confirmation dialogs use a shared in-app dialog component, not `window.confirm`, which is web-only.
- Animation: Reanimated or similar, anything that works on web and native.
- Hosting: Netlify, static export of the web build. No backend.

## Audio

- Web Audio API on web, scheduled from the audio clock (`AudioContext.currentTime`). Do not rely on `setTimeout` or `setInterval` for beat timing.
- All audio goes through an adapter interface, so the web and native implementations can differ. Native candidates: `react-native-audio-api` or `expo-audio`.
- Web audio quirks to handle: browsers keep audio locked until a user tap, so the first play press must resume the audio context. The iPhone silent switch can mute Web Audio in Safari. Background or locked tabs pause or throttle audio and timing. Phones may time differently than laptops. Keep the screen awake while playing with the Screen Wake Lock API so the phone does not auto-lock mid-session. If the page is hidden or the phone locks anyway, pause, and require a tap to resume. Check on real iPhones whether wake lock and Safari's audio session setting work as expected.
- Web audio is tested in desktop browsers plus iOS Safari and Android Chrome on real phones. Native audio (later port) must be tested on both an Android device and an iOS device (phone or tablet) before it is considered working. See `workflow.md`.
- Tones and the 808 loop are synthesized in code (oscillators and noise). No recorded audio files.
- Visuals must follow the same schedule as the audio, not a separate timer.

## Conventions

- Styles: named styles in StyleSheet.create at the bottom of each component file; inline only for small dynamic overrides.
- No DOM, `window`, or React imports inside the timing engine or audio adapter interfaces.
- Keep dependencies few and pinned to exact versions.
- Prefer small, plain modules over abstractions. No unnecessary infrastructure.
- Testing: the timing engine (`src/engine/`) gets automated tests, written with each engine task. Use a simple TypeScript-friendly runner (Vitest or Jest, decided at setup). Everything else (audio, UI) is checked manually and reported, unless the user asks for tests.

## Commands

Run from the project root.

| Task | Command |
|---|---|
| Install dependencies | `npm install` |
| Run in the browser (dev server, run it manually, it does not exit) | `npm run web` |
| Run the dev server for phone or simulator | `npm start` |
| Type check | `npm run typecheck` |
| Engine tests (single run, exits 0 when there are no tests yet) | `npm test` |
| Web production build | `npx expo export --platform web` (output in `dist/`) |

Netlify: build command `npx expo export --platform web`, publish directory `dist`. Not yet configured on Netlify.

Notes:
- Add new Expo-related packages with `npx expo install <package>`, then make sure the version in `package.json` is exact (no `~` or `^`).
- `npm audit` reports moderate issues in Expo's development tooling (glob and minimatch). They are not shipped in the app, and npm's suggested fix downgrades Expo to an old major version, so do not apply `npm audit fix --force`.
- Expo prints "Using src/app as the root directory for Expo Router" during builds. Expo Router is not installed. The message is harmless, and our `src/app` folder only happens to share the Router naming convention.
