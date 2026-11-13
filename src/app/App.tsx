import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { loadThemeChoice } from '../storage';
import type { ThemeChoice } from '../storage';
import { setSystemFontOnly, ThemeProvider } from '../theme';
import { useReduceMotion } from '../ui/hooks/useReduceMotion';
import { LONG_GAME_PRESETS, SHORT_GAME_PRESETS } from '../engine';
import type { Category } from '../engine';
import { ConfigPlaceholder } from './ConfigPlaceholder';
import { MainScreen } from './MainScreen';
import { IntroScreen } from './IntroScreen';

// Defaults: 30/10 (Long) and 24/12 (Short), found by value so a list change cannot break them.
const DEFAULT_PRESET_INDEX: Record<Category, number> = {
  long: LONG_GAME_PRESETS.findIndex((p) => p.backFrames === 30 && p.downFrames === 10),
  short: SHORT_GAME_PRESETS.findIndex((p) => p.backFrames === 24 && p.downFrames === 12),
};
const MIN_INTRO_MS = 1000; // R9.2
const MAX_INTRO_MS = 3000; // R8.4, R9.7

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });
  const [themeDone, setThemeDone] = useState(false);
  const [choice, setChoice] = useState<ThemeChoice | null>(null);
  const [minDone, setMinDone] = useState(false);
  const [timeoutDone, setTimeoutDone] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [introGone, setIntroGone] = useState(false);
  const [screen, setScreen] = useState<'main' | 'config' | 'lab'>('main');
  const reduceMotion = useReduceMotion();
  // Selection lives here so it survives layout changes and later screens (design: Navigation).
  const [category, setCategory] = useState<Category>('long');
  const [presetByCategory, setPresetByCategory] = useState<Record<Category, number>>({
    long: DEFAULT_PRESET_INDEX.long,
    short: DEFAULT_PRESET_INDEX.short,
  });
  const onPresetChange = useCallback(
    (c: Category, index: number) => setPresetByCategory((prev) => ({ ...prev, [c]: index })),
    [],
  );

  useEffect(() => {
    let active = true;
    loadThemeChoice()
      .then((c) => active && setChoice(c))
      .catch(() => {}) // device theme is used
      .finally(() => active && setThemeDone(true));
    const minTimer = setTimeout(() => setMinDone(true), MIN_INTRO_MS);
    const maxTimer = setTimeout(() => setTimeoutDone(true), MAX_INTRO_MS);
    return () => {
      active = false;
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, []);

  // A font error counts as done (R8.4).
  const fontsDone = fontsLoaded || fontError != null;
  const loaded = themeDone && fontsDone;
  // R9.2 to R9.7: leave after loading AND 1000 ms, or on tap once loaded, or at 3000 ms regardless.
  const leaving = timeoutDone || (loaded && (minDone || tapped));
  // Fonts failed or too slow: text uses the system font from here on.
  if (fontError != null || (leaving && !fontsLoaded)) setSystemFontOnly();

  const onTap = useCallback(() => setTapped(true), []);
  const onFadeEnd = useCallback(() => setIntroGone(true), []);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        {leaving ? (
          <ThemeProvider initialChoice={choice}>
            {/* Stays mounted but hidden off the main screen so selection survives. */}
            <View style={{ flex: 1, display: screen === 'main' ? 'flex' : 'none' }}>
              <MainScreen
                category={category}
                presetByCategory={presetByCategory}
                onCategoryChange={setCategory}
                onPresetChange={onPresetChange}
                onOpenConfig={() => setScreen('config')}
                // The real lab arrives in Wave 3.8; until then the item only closes the menu.
                onOpenLab={() => {}}
              />
            </View>
            {screen === 'config' ? <ConfigPlaceholder onBack={() => setScreen('main')} /> : null}
            <StatusBar style="auto" />
          </ThemeProvider>
        ) : null}
        {introGone ? null : (
          <IntroScreen
            onTap={onTap}
            leaving={leaving}
            onFadeEnd={onFadeEnd}
            reduceMotion={reduceMotion}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}
