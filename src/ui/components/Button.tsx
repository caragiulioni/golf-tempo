// Reuse check: listed src/ui/components and src/theme. PresetButton has selection semantics
// (radio, check mark) and IconButton is icon-only, so neither fits a plain text action.
// Reuses AppText, useFocusRing, tokens (colors, radius, tapMin, borderWidth, opacity, spacing).
// Created: Button (primary and secondary). No new tokens.
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { borderWidth, opacity, radius, spacing, tapMin, useTheme } from '../../theme';
import { useFocusRing } from '../hooks/useFocusRing';
import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'secondary';

type Props = {
  label: string;
  onPress: () => void;
  /** primary: filled accent, the main action. secondary: outlined surface. */
  variant?: ButtonVariant;
  disabled?: boolean;
  /** Only when the spoken name should differ from the label. */
  accessibilityLabel?: string;
};

export function Button({ label, onPress, variant = 'secondary', disabled, accessibilityLabel }: Props) {
  const { colors } = useTheme();
  const { onFocus, onBlur, ringStyle } = useFocusRing();
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      onFocus={onFocus}
      onBlur={onBlur}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: primary ? colors.accent : colors.surface,
          borderColor: primary ? colors.accent : colors.border,
        },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        ringStyle(colors.accent),
      ]}
    >
      <AppText variant="label" color={primary ? 'onAccent' : 'text'} style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: tapMin,
    paddingHorizontal: spacing.lg,
    borderWidth: borderWidth.thin,
    borderRadius: radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { textAlign: 'center' },
  pressed: { opacity: opacity.pressed },
  disabled: { opacity: opacity.disabled },
});
