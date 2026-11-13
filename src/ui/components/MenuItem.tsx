import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { spacing, tapMin, useTheme } from '../../theme';
import { useFocusRing } from '../hooks/useFocusRing';
import { AppText } from './AppText';

type Props = {
  label: string;
  onPress: () => void;
};


export function MenuItem({ label, onPress }: Props) {
  const { colors } = useTheme();
  const { onFocus, onBlur, ringStyle } = useFocusRing();


  return (
    <Pressable
      role="menuitem"
      accessibilityLabel={label}
      onPress={onPress}
      onFocus={onFocus}
      onBlur={onBlur}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: colors.hero },
        ringStyle(colors.accent, true),
      ]}
    >
      <AppText>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignSelf: 'stretch',
    minHeight: tapMin,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
});
