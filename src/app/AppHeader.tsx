// Reuse check: Header and MenuItem as they were; the menu was written inline in MainScreen and is now shared
// with the How it works screen (V2-20), so the header and its menu are the same on both. Nothing new is created.
import React from 'react';
import { useTheme } from '../theme';
import { Header, MenuItem } from '../ui/components';
type Props = {
  onOpenHowItWorks: () => void;
  onOpenLab: () => void;
};
/** The logo and wordmark, with the menu: How it works, the light/dark switch, and the Audio lab (testing). */
export function AppHeader({ onOpenHowItWorks, onOpenLab }: Props) {
  const { toggle, toggleLabel } = useTheme();
  return (
    <Header
      menu={(close) => (
        <>
          <MenuItem label="How it works" onPress={() => { close(); onOpenHowItWorks(); }} />
          <MenuItem label={toggleLabel} onPress={() => { close(); toggle(); }} />
          <MenuItem label="Audio lab (testing)" onPress={() => { close(); onOpenLab(); }} />
        </>
      )}
    />
  );
}
