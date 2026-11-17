// The Configure weight shift label and its panel, at the very bottom of the main screen (V2-09).
// Reuse check: listed src/ui/components and src/theme. Reused as is: SectionLabel (via ExpanderHeader), AppText,
// IconButton (minus, plus), Slider, Button (APPLY, RESET) and HowTo (this folder). New:
// ExpanderHeader (label with an arrow), added to src/ui/components.
// TEMPORARY: the whole src/config-mode/ folder is deleted in spec 6.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WEIGHT_SHIFT_RANGE, presetLabel, weightShiftTime } from '../engine';
import type { Category, Preset } from '../engine';
import { spacing } from '../theme';
import { AppText, Button, Card, ExpanderHeader, IconButton, Slider } from '../ui/components';
import { CATEGORY_NAME } from '../ui/lib/categoryUi';
import { HowTo } from './HowTo';
import { DEFAULT_BLURB } from './howToSteps';
/** One slider step, and one press of a nudge button. */
export const SLIDER_STEP = 0.01;
const percentOf = (position: number) => Math.round(position * 100);
type Props = {
  open: boolean;
  onToggle: () => void;
  category: Category;
  selected: Preset;
  /** Where the slider is, and the saved position, for this game. */
  draft: number;
  saved: number;
  /** This game has never been applied. */
  neverApplied: boolean;
  /** This game's slider is not where the saved value is. */
  unapplied: boolean;
  onSliderChange: (value: number) => void;
  onSliderEnd: (value: number) => void;
  onNudge: (direction: 1 | -1) => void;
  onApply: () => void;
  onReset: () => void;
};
export function ConfigPanel({
  open,
  onToggle,
  category,
  selected,
  draft,
  saved,
  neverApplied,
  unapplied,
  onSliderChange,
  onSliderEnd,
  onNudge,
  onApply,
  onReset,
}: Props) {
  const percent = percentOf(draft);
  const seconds = weightShiftTime(selected, draft).toFixed(2);
  // APPLY is also open on a game never applied, so "the starting value is right" can be saved.
  const canApply = unapplied || neverApplied;
  const statusText = unapplied
    ? `NOT APPLIED YET. Saved: ${neverApplied ? 'nothing yet' : `${percentOf(saved)} %`}. Slider: ${percent} %. Press APPLY to save.`
    : neverApplied
      ? `Saved: nothing yet. Using the starting value, ${percentOf(saved)} %. Press APPLY to keep it.`
      : `Saved: ${percentOf(saved)} %. This is what the app plays.`;
  return (
    <Card accessibilityLabel="Configure weight shift" style={styles.wrap}>
      <ExpanderHeader label="Configure weight shift" expanded={open} onPress={onToggle} />
      {open ? (
        <View style={styles.body}>
          <AppText color="text2" size="label">
            {DEFAULT_BLURB}
          </AppText>
          <HowTo />
          <View style={styles.readout}>
            <AppText variant="num" size="display" accessibilityLabel={`${percent} percent`}>
              {percent} %
            </AppText>
            <AppText color="text2" size="label">
              {CATEGORY_NAME[category]}: {seconds} s after takeaway, at {presetLabel(selected)}
            </AppText>
          </View>
          <View style={styles.sliderGroup}>
            <View style={styles.sliderRow}>
              <IconButton icon="minus" onPress={() => onNudge(-1)} accessibilityLabel="Move weight shift earlier by one step" />
              <View style={styles.sliderBox}>
                <Slider
                  value={draft}
                  min={WEIGHT_SHIFT_RANGE.min}
                  max={WEIGHT_SHIFT_RANGE.max}
                  step={SLIDER_STEP}
                  onChange={onSliderChange}
                  onChangeEnd={onSliderEnd}
                  accessibilityLabel="Weight shift position"
                  valueText={`${percent} percent of the way from takeaway to top`}
                />
              </View>
              <IconButton icon="plus" onPress={() => onNudge(1)} accessibilityLabel="Move weight shift later by one step" />
            </View>
            <View style={styles.sliderEnds}>
              <AppText size="caption" color="text2">
                Takeaway
              </AppText>
              <AppText size="caption" color="text2">
                Top
              </AppText>
            </View>
          </View>
          <AppText
            size="label"
            variant={unapplied ? 'label' : 'ui'}
            color={unapplied ? 'text' : 'text2'}
            accessibilityRole={unapplied ? 'alert' : undefined}
          >
            {statusText}
          </AppText>
          <View style={styles.buttonRow}>
            <View style={styles.buttonBox}>
              <Button label="APPLY" variant="primary" disabled={!canApply} onPress={onApply} accessibilityLabel={`Apply ${CATEGORY_NAME[category]} weight shift`} />
            </View>
            <View style={styles.buttonBox}>
              <Button label="RESET" onPress={onReset} accessibilityLabel="Reset to the starting value" />
            </View>
          </View>
        </View>
      ) : null}
    </Card>
  );
}
const styles = StyleSheet.create({
  /** The card holding the label and, when open, the panel. */
  wrap: { gap: spacing.md },
  /** Everything inside the open panel. */
  body: { gap: spacing.lg },
  /** The percentage, with the seconds under it. */
  readout: { gap: spacing.xs },
  sliderGroup: { gap: spacing.xs },
  /** Minus, slider, plus. */
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  /** The slider takes the width between the two nudge buttons. */
  sliderBox: { flex: 1 },
  /** "Takeaway" under the left end, "Top" under the right end. */
  sliderEnds: { flexDirection: 'row', justifyContent: 'space-between' },
  /** APPLY and RESET side by side. */
  buttonRow: { flexDirection: 'row', gap: spacing.md },
  buttonBox: { flex: 1 },
});
