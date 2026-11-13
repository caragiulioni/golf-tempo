import { useState } from 'react';
import type { NativeSyntheticEvent, TargetedEvent, ViewStyle } from 'react-native';
import { focusRing } from '../../theme';

/**
 * Keyboard-only focus ring for Pressable. Native has no :focus-visible, so the ring
 * never shows there. Spread onFocus/onBlur on the Pressable and add ringStyle(color)
 * to its style (returns undefined when the ring should not show).
 * Pass inset = true to draw the ring inside the element (e.g. menu rows).
 */
export function useFocusRing() {
  const [focusVisible, setFocusVisible] = useState(false);

  const onFocus = (e: NativeSyntheticEvent<TargetedEvent>) => {
    const target = e.target as unknown as { matches?: (selector: string) => boolean };
    setFocusVisible(typeof target?.matches === 'function' ? target.matches(':focus-visible') : false);
  };
  const onBlur = () => setFocusVisible(false);

  const ringStyle = (color: string, inset = false): ViewStyle | undefined =>
    focusVisible
      ? ({
          outlineStyle: 'solid',
          outlineWidth: focusRing.width,
          outlineColor: color,
          outlineOffset: inset ? -focusRing.offset : focusRing.offset,
        } as ViewStyle)
      : undefined;

  return { focusVisible, onFocus, onBlur, ringStyle };
}
