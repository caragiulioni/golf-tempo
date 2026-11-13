import React from 'react';
import { Text } from 'react-native';
import type { TextProps, TextStyle } from 'react-native';
import { fonts, typeSizes, useTheme } from '../../theme';
import type { Colors } from '../../theme';
import { useLayout } from '../hooks/useLayout';

export type TextVariant = 'ui' | 'num' | 'label' | 'brand';
export type TextSize = keyof typeof typeSizes;

type Props = TextProps & {
  variant?: TextVariant;
  /** Size role from typeSizes. The actual size follows the layout. */
  size?: TextSize;
  /** Theme color key only. */
  color?: keyof Colors;
};

const variantFont: Record<TextVariant, string> = {
  ui: fonts.ui,
  num: fonts.num,
  label: fonts.uiSemiBold,
  brand: fonts.uiBold,
};

const variantDefaultSize: Record<TextVariant, TextSize> = {
  ui: 'body',
  num: 'body',
  label: 'label',
  brand: 'title',
};

export function AppText({ variant = 'ui', size, color = 'text', style, ...rest }: Props) {
  const { colors } = useTheme();
  const { layout } = useLayout();
  const base: TextStyle = {
    fontFamily: variantFont[variant],
    fontSize: typeSizes[size ?? variantDefaultSize[variant]][layout],
    color: colors[color],
  };
  return <Text {...rest} style={[base, style]} />;
}
