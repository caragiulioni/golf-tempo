// Reuse check: Header and MenuItem as they were; the menu was written inline in MainScreen and is now shared
// with the How it works screen (V2-20), so the header and its menu are the same on both. Nothing new is created.
import React from 'react';
import { useTheme } from '../theme';
import { Header, MenuItem } from '../ui/components';
/**
 * The Audio lab (testing) item in the menu. Off for now (V2-17). Set it to true to get it back while
 * developing: the screen and its code are untouched.
 */
const SHOW_AUDIO_LAB = false;
type Props = {
  onOpenHowItWorks: () => void;
  onOpenLab: () => void;
};
/** The logo and wordmark, with the menu: How it works and the light/dark switch (and the Audio lab, when it is switched on). */
export function AppHeader({ onOpenHowItWorks, onOpenLab }: Props) {
  const { toggle, toggleLabel } = useTheme();
  return (
    <Header
      menu={(close) => (
        <>
          <MenuItem label="How it works" onPress={() => { close(); onOpenHowItWorks(); }} />
          <MenuItem label={toggleLabel} onPress={() => { close(); toggle(); }} />
          {SHOW_AUDIO_LAB ? (
            <MenuItem label="Audio lab (testing)" onPress={() => { close(); onOpenLab(); }} />
          ) : null}
        </>
      )}
    />
  );
}
