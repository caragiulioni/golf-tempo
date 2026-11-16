// Reuse check: shared by the header Wordmark and the intro screen (same image twice).
// The embossed S emblem as a square picture with a transparent background. Two images:
// the lighter green for dark mode and a slightly darker green for light mode.
// `mode` is a prop (not useTheme) so the intro can use it before the theme provider is ready.
import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ThemeMode } from '../../theme';

const EMBLEM = {
  dark: require('../../../assets/logo-emblem-dark.png'),
  light: require('../../../assets/logo-emblem-light.png'),
};

type Props = {
  mode: ThemeMode;
  /** Width and height in points. */
  size: number;
};

export function BrandEmblem({ mode, size }: Props) {
  return (
    <Image
      source={EMBLEM[mode]}
      resizeMode="contain"
      accessible={false}
      style={[styles.emblem, { width: size, height: size }]}
    />
  );
}

const styles = StyleSheet.create({
  /** Size is set inline (prop). */
  emblem: { flexShrink: 0 },
});
