// Reuse check: reuses AppText. Theme tokens only. (V2-12: the check mark was removed.)
// Not an IconButton (text, not icon), so this is new.
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { borderWidth, radius, tapMin, useTheme } from '../../theme';
import { useFocusRing } from '../hooks/useFocusRing';
import { AppText } from './AppText';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
};

const BORDER = borderWidth.thick; // same width selected or not, so nothing shifts on selection

export function PresetButton({ label, selected, onPress, accessibilityLabel }: Props) {
  const { colors } = useTheme();
  const { onFocus, onBlur, ringStyle } = useFocusRing();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      onFocus={onFocus}
      onBlur={onBlur}
      style={[
        styles.base,
        {
          backgroundColor: selected ? colors.accent : colors.surface,
          borderColor: selected ? colors.text : colors.border,
        },
        ringStyle(colors.accent),
      ]}
    >
      <AppText
        variant="num"
        size="caption"
        color={selected ? 'onAccent' : 'text'}
        numberOfLines={1}
        style={styles.label}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: tapMin,
    minWidth: 0,
    borderWidth: BORDER,
    borderRadius: radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  label: { textAlign: 'center' },
});
