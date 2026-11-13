import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaView } from 'react-native';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { ThemeProvider } from '../theme';
import AudioLab from './dev/AudioLab';
import Gallery from './dev/Gallery';

// TEMPORARY wiring: gallery + audio lab. Replaced in Wave 3.4.
export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });
  const [showLab, setShowLab] = useState(false);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider initialChoice={null}>
      <SafeAreaView style={{ flex: 1 }}>
        {showLab ? (
          <AudioLab />
        ) : (
          <Gallery onOpenAudioLab={() => setShowLab(true)} />
        )}
        <StatusBar style="auto" />
      </SafeAreaView>
    </ThemeProvider>
  );
}
