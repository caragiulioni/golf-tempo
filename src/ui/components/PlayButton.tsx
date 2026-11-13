// Reuse check: read AppText, Icon, IconButton, theme tokens, layoutSizes.
// Reuses Icon (play/pause) and the IconButton focus-ring pattern; new because
// no existing button is round, accent-filled, or layout-sized.
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { layoutSizes, opacity, useTheme } from '../../theme';
import { useLayout } from '../hooks/useLayout';
import { useFocusRing } from '../hooks/useFocusRing';
import { Icon } from './Icon';

type Props = {
  playing: boolean;
  onPress: () => void;
  /** Overrides the size from layoutSizes[layout].playButton. */
  size?: number;
};

const ICON_RATIO = 0.4; // icon size as a share of the button

export function PlayButton({ playing, onPress, size }: Props) {
  const { colors } = useTheme();
  const { layout } = useLayout();
  const { onFocus, onBlur, ringStyle } = useFocusRing();
  const dim = size ?? layoutSizes[layout].playButton;


  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={playing ? 'Pause' : 'Play'}
      onPress={onPress}
      onFocus={onFocus}
      onBlur={onBlur}
      style={({ pressed }) => [
        styles.base,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          backgroundColor: colors.accent,
          opacity: pressed ? opacity.pressed : 1,
        },
        ringStyle(colors.text),
      ]}
    >
      <Icon name={playing ? 'pause' : 'play'} size={Math.round(dim * ICON_RATIO)} color="onAccent" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});
