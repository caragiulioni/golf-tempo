import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native';
import AudioLab from './dev/AudioLab';

// Placeholder root component. Replaced when the app-shell-ui spec is built.
export default function App() {
  return (
    <SafeAreaView>
      {/* TEMPORARY: listening-test screen. Remove with src/app/dev/ in spec 3. */}
      <AudioLab />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
