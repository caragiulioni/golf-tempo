// Reuse check: read IconButton, Button, SectionLabel, Icon, useFocusRing, tapMin and spacing tokens.
// Reuses SectionLabel (the text), Icon (two new chevrons) and the IconButton focus-ring pattern. New
// because no row exists that is a label with an arrow that opens and closes a panel.
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { opacity, spacing, tapMin, useTheme } from '../../theme';
import { useFocusRing } from '../hooks/useFocusRing';
import { Icon } from './Icon';
import { SectionLabel } from './SectionLabel';
type Props = {
  label: string;
  expanded: boolean;
  onPress: () => void;
  /** Only when the spoken name should differ from the label. */
  accessibilityLabel?: string;
};
/** A label with an arrow at the right (down when closed, up when open), that opens a panel. */
export function ExpanderHeader({ label, expanded, onPress, accessibilityLabel }: Props) {
  const { colors } = useTheme();
  const { onFocus, onBlur, ringStyle } = useFocusRing();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ expanded }}
      onPress={onPress}
      onFocus={onFocus}
      onBlur={onBlur}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, ringStyle(colors.accent)]}
    >
      <View style={styles.text}>
        <SectionLabel>{label}</SectionLabel>
      </View>
      <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={spacing.xl} color="text2" />
    </Pressable>
  );
}
const styles = StyleSheet.create({
  row: {
    minHeight: tapMin,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  text: { flex: 1 },
  pressed: { opacity: opacity.pressed },
});
