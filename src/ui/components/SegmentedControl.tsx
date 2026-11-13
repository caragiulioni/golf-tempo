// Reuse check: reuses AppText and Icon (check mark). Theme tokens only.
// No existing selector component, so this is new.
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { borderWidth, radius, spacing, useTheme } from '../../theme';
import { useFocusRing } from '../hooks/useFocusRing';
import { AppText } from './AppText';
import { Icon } from './Icon';

export type SegmentedOption<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  /** Name for the group, read by screen readers. */
  accessibilityLabel?: string;
};

const CHECK_SIZE = spacing.lg;

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: Props<T>) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      {options.map((option) => (
        <Option
          key={option.value}
          label={option.label}
          selected={option.value === value}
          onPress={() => onChange(option.value)}
        />
      ))}
    </View>
  );
}

function Option({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  const { onFocus, onBlur, ringStyle } = useFocusRing();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPress={() => {
        if (!selected) onPress();
      }}
      onFocus={onFocus}
      onBlur={onBlur}
      style={[
        styles.option,
        selected && { backgroundColor: colors.accent },
        ringStyle(colors.accent),
      ]}
    >
      {selected ? <Icon name="check" size={CHECK_SIZE} color="onAccent" /> : null}
      <AppText variant="label" size="body" color={selected ? 'onAccent' : 'text'} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    borderWidth: borderWidth.thin,
    borderRadius: radius.chip,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  option: {
    flex: 1,
    minHeight: spacing.xxxl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.chip - spacing.xs,
  },
});
