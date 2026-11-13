import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { borderWidth, opacity, radius, spacing, tapMin, useTheme } from '../../theme';
import { useFocusRing } from '../hooks/useFocusRing';
import { Icon } from './Icon';
import type { IconName } from './Icon';

type Props = {
  icon: IconName;
  onPress: () => void;
  /** Required: icon-only buttons need a name for screen readers. */
  accessibilityLabel: string;
  /** Icon size in points. Defaults to a size that fits the tap target. */
  iconSize?: number;
  disabled?: boolean;
  /** For buttons that open a menu: sends the open/closed state to screen readers. */
  expanded?: boolean;
};


export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  iconSize = tapMin - 2 * spacing.md,
  disabled,
  expanded,
}: Props) {
  const { colors } = useTheme();
  const { onFocus, onBlur, ringStyle } = useFocusRing();


  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled, expanded }}
      disabled={disabled}
      onPress={onPress}
      onFocus={onFocus}
      onBlur={onBlur}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: pressed ? colors.hero : colors.surface,
          borderColor: colors.border,
        },
        ringStyle(colors.accent),
        disabled && styles.disabled,
      ]}
    >
      <Icon name={icon} size={iconSize} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minWidth: tapMin,
    minHeight: tapMin,
    borderWidth: borderWidth.thin,
    borderRadius: radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: opacity.disabled },
});
