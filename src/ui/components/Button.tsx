// Reuse check: listed src/ui/components and src/theme. PresetButton has selection semantics
// (radio, check mark) and IconButton is icon-only, so neither fits a plain text action.
// Reuses AppText, useFocusRing, tokens (colors, radius, tapMin, borderWidth, opacity, spacing).
// Created: Button (primary and secondary). No new tokens.
// V2-03: extended with `checked` (on/off button, filled when on) so the sound buttons reuse it.
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
  /**
   * Makes this an on/off button: filled when true, outlined when false. Screen readers get the
   * state from the `switch` role.
   */
  checked?: boolean;
  /** Less side padding and a one-line label, so a row of buttons fits on a small phone. */
  compact?: boolean;
  /** Only when the spoken name should differ from the label. */
  accessibilityLabel?: string;
};

export function Button({ label, onPress, variant = 'secondary', disabled, checked, compact, accessibilityLabel }: Props) {
  const { colors } = useTheme();
  const { onFocus, onBlur, ringStyle } = useFocusRing();
  const primary = checked === undefined ? variant === 'primary' : checked;
  return (
    <Pressable
      accessibilityRole={checked === undefined ? 'button' : 'switch'}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={checked === undefined ? { disabled: !!disabled } : { disabled: !!disabled, checked }}
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
        compact && styles.compact,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        ringStyle(colors.accent),
      ]}
    >
      <AppText
        variant="label"
        color={primary ? 'onAccent' : 'text'}
        style={styles.label}
        numberOfLines={compact ? 1 : undefined}
      >
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
  /** Side padding of one small step, for a row of buttons. */
  compact: { paddingHorizontal: spacing.sm },
  label: { textAlign: 'center' },
  pressed: { opacity: opacity.pressed },
  disabled: { opacity: opacity.disabled },
});
