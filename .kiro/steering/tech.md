# Tech Stack and Conventions

The project is not yet initialized. Update the commands section below once it is.

## Stack

- TypeScript everywhere, including the timing engine.
- Expo with React Native components, running on web through React Native Web. A native app is a likely later step, so write UI with React Native primitives, not DOM elements or MUI.
- Styling: plain React Native `StyleSheet` with a small theme module in `src/theme/` (colors, spacing, radius, type sizes; light and dark chosen from the device setting). No UI library (no MUI, Tamagui or Gluestack). Shared components in `src/ui/components/` are built from `View`, `Text` and `Pressable` and read from the theme. No hard-coded colors, sizes or fonts in components.
- Light and dark mode: the user can switch with a toggle, and the choice is remembered. Default is the device setting until the user picks one.
- Persistence: `@react-native-async-storage/async-storage` (uses `localStorage` on web, native storage on iOS and Android). Access it only through a small wrapper in `src/storage/`. It is asynchronous, so hold the first render until the saved theme choice has loaded, to avoid a flash of the wrong theme. Only the theme choice is persisted for now. Weight shift settings stay session-only, as the spec says.
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

- No DOM, `window`, or React imports inside the timing engine or audio adapter interfaces.
- Keep dependencies few and pinned to exact versions.
- Prefer small, plain modules over abstractions. No unnecessary infrastructure.
- Testing: the timing engine (`src/engine/`) gets automated tests, written with each engine task. Use a simple TypeScript-friendly runner (Vitest or Jest, decided at setup). Everything else (audio, UI) is checked manually and reported, unless the user asks for tests.

## Commands

To be filled in after project setup (install, start, web build, Netlify publish directory).
