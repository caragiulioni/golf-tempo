// Reuse check: read AppText, IconButton (focus ring), theme tokens (switchKnob,
// border, accent, surface, radius, spacing). Reuses AppText; new because no
// label-row switch exists. Disabled state has no feedback and no handlers.
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { borderWidth, opacity, radius, spacing, switchSize, useTheme } from '../../theme';
import { useFocusRing } from '../hooks/useFocusRing';
import { AppText } from './AppText';

type Props = {
  label: string;
  checked: boolean;
  disabled?: boolean;
  /** Used only when not disabled. */
  onValueChange?: (value: boolean) => void;
};


export function Switch({ label, checked, disabled, onValueChange }: Props) {
  const { colors } = useTheme();
  const { onFocus, onBlur, ringStyle } = useFocusRing();

  const content = (
    <>
      <AppText>{label}</AppText>
      <View
        style={[
          styles.track,
          { backgroundColor: checked ? colors.accent : colors.border, borderColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.knob,
            {
              backgroundColor: checked ? colors.onAccent : colors.switchKnob,
              transform: [{ translateX: checked ? switchSize.travel : 0 }],
            },
          ]}
        />
      </View>
    </>
  );

  const rowStyle = [styles.row, { backgroundColor: colors.surface, borderColor: colors.border }];
  const a11yState = { checked, disabled: !!disabled };

  if (disabled) {
    return (
      <View
        accessible
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityState={a11yState}
        style={[...rowStyle, { opacity: opacity.disabled }]}
      >
        {content}
      </View>
    );
  }


  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={a11yState}
      onPress={() => onValueChange?.(!checked)}
      onFocus={onFocus}
      onBlur={onBlur}
      style={[
        ...rowStyle,
        ringStyle(colors.accent),
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: switchSize.rowHeight,
    paddingHorizontal: spacing.lg,
    borderRadius: switchSize.rowRadius,
    borderWidth: borderWidth.thin,
  },
  track: {
    width: switchSize.trackWidth,
    height: switchSize.trackHeight,
    borderRadius: radius.chip + 2,
    borderWidth: borderWidth.thin,
    justifyContent: 'center',
  },
  knob: {
    position: 'absolute',
    left: switchSize.inset - borderWidth.thin,
    width: switchSize.knob,
    height: switchSize.knob,
    borderRadius: switchSize.knob / 2,
  },
});
