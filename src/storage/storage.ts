// Thin wrapper over AsyncStorage. The rest of the app imports from here only.
// Neither function ever throws: a failed read returns null, a failed write is ignored.
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // Swallowed on purpose: the session keeps working, the value just is not remembered.
  }
}
