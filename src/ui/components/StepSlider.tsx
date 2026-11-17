// Reuse check: read Slider, AppText, SectionLabel, Switch, theme tokens (sliderSize, spacing).
// Reuses Slider (and its snapToStep snapping) for the drag, keyboard and screen reader behavior,
// and AppText for the tempo labels. Created because no component shows the named steps under a
// slider. Added token: sliderSize.stepLabel (width of one step label). End labels reuse SectionLabel.
// V2-16: the whole control sits on the swing scale's dark grid box (GridBackdrop, timeline tokens), so the
// white handle stays visible in light mode. Slider got an optional trackColor.
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { borderWidth, radius, sliderSize, spacing, timeline, useTheme } from '../../theme';
import { AppText } from './AppText';
import { GridBackdrop } from './GridBackdrop';
import { SectionLabel } from './SectionLabel';
import { Slider } from './Slider';
type Props = {
  /** One label per step, in order (for example "24/8"). */
  labels: ReadonlyArray<string>;
  /** Index of the selected step. */
  value: number;
  onChange: (index: number) => void;
  /** Required: names the control for screen readers. */
  accessibilityLabel: string;
  /** Optional words above the left and right ends of the slider. */
  startLabel?: string;
  endLabel?: string;
  /** Added to the spoken value, for example "Gameplay" makes it "24/8, Gameplay". */
  spokenSuffix?: string;
};
// Room each side so the first and last labels, centred under the thumb, are not cut off.
const SIDE_INSET = Math.max(0, (sliderSize.stepLabel - sliderSize.thumb) / 2);
/** A slider that snaps to named steps, with every step's label under the track. */
export function StepSlider({ labels, value, onChange, accessibilityLabel, startLabel, endLabel, spokenSuffix }: Props) {
  const { mode, colors } = useTheme();
  const [width, setWidth] = useState(0);
  const [boxSize, setBoxSize] = useState({ width: 0, height: 0 });
  const last = labels.length - 1;
  const travel = Math.max(1, width - sliderSize.thumb);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  return (
    <View
      onLayout={(e: LayoutChangeEvent) => {
        const { width: w, height: h } = e.nativeEvent.layout;
        setBoxSize((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
      }}
      style={[styles.panel, { backgroundColor: timeline.containerBg[mode], borderColor: colors.border }]}
    >
      <GridBackdrop width={boxSize.width} height={boxSize.height} patternId="tempo-grid" />
      {startLabel || endLabel ? (
        // Hidden from screen readers: the slider's own label says which way is which.
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.endLabels}
        >
          <SectionLabel style={styles.endLabel}>{startLabel}</SectionLabel>
          <SectionLabel style={styles.endLabel}>{endLabel}</SectionLabel>
        </View>
      ) : null}
      <View style={styles.box}>
        <Slider
          value={value}
          min={0}
          max={last}
          step={1}
          onChange={onChange}
          onChangeEnd={onChange}
          accessibilityLabel={accessibilityLabel}
          valueText={spokenSuffix ? `${labels[value]}, ${spokenSuffix}` : labels[value]}
          trackColor={timeline.backswingBar}
        />
        {/* Hidden from screen readers: the slider already speaks the selected step. */}
        <View
          onLayout={onLayout}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.labelRow}
        >
          {labels.map((label, i) => (
            <View
              key={label}
              style={[
                styles.labelBox,
                { left: sliderSize.thumb / 2 + (last > 0 ? (i / last) * travel : 0) - sliderSize.stepLabel / 2 },
              ]}
            >
              <AppText
                variant="num"
                size="caption"
                numberOfLines={1}
                style={[styles.stepLabel, i === value ? styles.selected : styles.unselected]}
              >
                {label}
              </AppText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  /** The dark box behind the control, like the swing scale's. backgroundColor and borderColor are set inline. */
  panel: {
    borderRadius: radius.chip,
    borderWidth: borderWidth.thin,
    overflow: 'hidden',
    padding: spacing.md,
  },
  /** Grey words above the ends and for the tempos not selected; the selected tempo is the light text color, bold. */
  endLabel: { color: timeline.labelMuted },
  stepLabel: { color: timeline.label },
  unselected: { color: timeline.labelMuted },
  /** Words above the slider ends: first left-aligned, second right-aligned. */
  endLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE_INSET, // lines up with the slider's first and last thumb positions
  },
  box: { paddingHorizontal: SIDE_INSET },
  /** Same width as the slider, so label positions match the thumb positions. */
  labelRow: { height: spacing.xl },
  labelBox: { position: 'absolute', top: 0, width: sliderSize.stepLabel, alignItems: 'center' },
  /** The selected step is bold, so it stands out by more than colour. */
  selected: { fontWeight: '700' },
});
