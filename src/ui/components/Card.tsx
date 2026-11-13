// Reuse check: useLayout + layoutSizes for radius, spacing and color tokens.
import React from 'react';
import { View } from 'react-native';
import type { ViewProps } from 'react-native';
import { borderWidth, layoutSizes, spacing, useTheme } from '../../theme';
import { useLayout } from '../hooks/useLayout';

export function Card({ style, ...rest }: ViewProps) {
  const { colors } = useTheme();
  const { layout } = useLayout();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: colors.hero,
          borderColor: colors.border,
          borderWidth: borderWidth.thin,
          borderRadius: layoutSizes[layout].cardRadius,
          padding: spacing.xl,
        },
        style,
      ]}
    />
  );
}
