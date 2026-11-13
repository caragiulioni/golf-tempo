// Reuse check: reuses AppText and Icon (check mark). Theme tokens only.
// No existing selector component, so this is new.
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { borderWidth, radius, spacing, useTheme } from '../../theme';
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
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: selected }}
            onPress={() => {
              if (!selected) onChange(option.value);
            }}
            style={[styles.option, selected && { backgroundColor: colors.accent }]}
          >
            {selected ? <Icon name="check" size={CHECK_SIZE} color="onAccent" /> : null}
            <AppText
              variant="label"
              size="body"
              color={selected ? 'onAccent' : 'text'}
              numberOfLines={1}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
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
