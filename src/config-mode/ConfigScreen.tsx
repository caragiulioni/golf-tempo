// Reuse check (Wave 5.4): listed src/ui/components, src/ui/lib and src/theme.
// Reused as is: Card, SectionLabel, Badge (ratio), BeatTimeline, PlayButton, StatusMessage,
// SegmentedControl, PresetGrid, PresetButton, Switch, IconButton (back, minus, plus), AppText,
// Slider, useLayout, theme tokens. Category options and preset helpers moved from MainScreen
// to src/ui/lib/categoryUi.ts so both screens share them. Nothing new is created here.
// TEMPORARY: the whole src/config-mode/ folder is deleted in spec 6.
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CATEGORY_RATIO,
  PRESETS,
  WEIGHT_SHIFT_RANGE,
  presetLabel,
  weightShiftTime,
  withPosition,
} from '../engine';
import type { Category, WeightShiftSettings } from '../engine';
import { laptopColumns, maxContentWidth, spacing, useTheme } from '../theme';
import {
  AppText,
  Badge,
  BeatTimeline,
  Card,
  IconButton,
  PlayButton,
  PresetButton,
  PresetGrid,
  SectionLabel,
  SegmentedControl,
  Slider,
  StatusMessage,
  Switch,
} from '../ui/components';
import { useLayout } from '../ui/hooks/useLayout';
import {
  PAUSED_TEXT,
  START_FAILED_TEXT,
  audioNow,
  onSwing,
  outputDelay,
  stopSharedPlayer,
  usePlayerSession,
} from '../ui/hooks/usePlayerSession';
import { CATEGORY_NAME, CATEGORY_OPTIONS, PRESET_COLUMNS, presetKey } from '../ui/lib/categoryUi';
import { snapToStep } from '../ui/lib/snapToStep';
import type { AppliedState } from './appliedSettings';

/** One slider step, and one press of a nudge button. */
export const SLIDER_STEP = 0.01;

type Props = {
  /** Where the main screen was when Config opened. After that the two are independent. */
  initialCategory: Category;
  initialPresetIndex: Record<Category, number>;
  /** What is saved on this device. The sliders start here. */
  applied: AppliedState;
  onBack: () => void;
};

export function ConfigScreen({ initialCategory, initialPresetIndex, applied, onBack }: Props) {
  const { colors } = useTheme();
  const { layout } = useLayout();
  const laptop = layout === 'laptop';

  const [category, setCategory] = useState<Category>(initialCategory);
  const [presetIndex, setPresetIndex] = useState(initialPresetIndex);
  // `drafts` is what the slider shows and the timeline draws; it moves during a drag.
  // `committed` is what the Player plays; it changes on release (or key press, nudge), so a
  // drag never restarts the audio.
  const [drafts, setDrafts] = useState<WeightShiftSettings>(applied.settings);
  const [committed, setCommitted] = useState<WeightShiftSettings>(applied.settings);
  // Not saved, and not shared with the main screen's switch: off every time Config opens.
  const [loop, setLoop] = useState(false);

  const presets = PRESETS[category];
  const selected = presets[presetIndex[category]];
  const draft = drafts[category];

  const session = usePlayerSession({ preset: selected, loop, settings: committed });

  // Entering: stop whatever the main screen was playing. Leaving: stop Config's run.
  useEffect(() => {
    stopSharedPlayer();
    return () => stopSharedPlayer();
  }, []);

  const onSliderChange = (value: number) => setDrafts((d) => withPosition(d, category, value));
  const onSliderEnd = (value: number) => {
    setDrafts((d) => withPosition(d, category, value));
    setCommitted((c) => withPosition(c, category, value));
  };
  const nudge = (direction: 1 | -1) =>
    onSliderEnd(snapToStep(draft + direction * SLIDER_STEP, WEIGHT_SHIFT_RANGE.min, WEIGHT_SHIFT_RANGE.max, SLIDER_STEP));

  const percent = Math.round(draft * 100);
  const seconds = weightShiftTime(selected, draft).toFixed(2);

  const hero = (
    <Card accessibilityLabel="Weight shift" style={[styles.heroCard, laptop && styles.heroCardLaptop]}>
      <View style={styles.heroHeaderRow}>
        <SectionLabel>Configuring weight shift</SectionLabel>
        <Badge
          variant="ratio"
          text={`CONFIGURING ${CATEGORY_NAME[category]} · ${CATEGORY_RATIO[category]} : 1`}
        />
      </View>
      <View style={styles.readoutRow}>
        <View style={styles.readoutText}>
          <AppText variant="num" size="display" accessibilityLabel={`${percent} percent`}>
            {percent} %
          </AppText>
          <AppText color="text2" size="label">
            {seconds} s after takeaway, at {presetLabel(selected)}
          </AppText>
        </View>
        <PlayButton playing={session.playing} onPress={session.toggle} />
      </View>
      {session.message === 'startFailed' ? (
        <StatusMessage variant="info" text={START_FAILED_TEXT} />
      ) : null}
      {session.message === 'paused' ? <StatusMessage variant="info" text={PAUSED_TEXT} /> : null}
      <BeatTimeline
        preset={selected}
        weightShiftPosition={draft}
        playing={session.playing}
        subscribeSwings={onSwing}
        audioNow={audioNow}
        outputDelay={outputDelay}
        restartKey={`${loop}-${committed[category]}`}
      />
      <View style={styles.sliderGroup}>
        <View style={styles.sliderRow}>
          <IconButton icon="minus" onPress={() => nudge(-1)} accessibilityLabel="Move weight shift earlier by one step" />
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
          <IconButton icon="plus" onPress={() => nudge(1)} accessibilityLabel="Move weight shift later by one step" />
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
    </Card>
  );

  const controls = (
    <View style={[styles.controlsColumn, laptop && styles.controlsColumnLaptop]}>
      <View style={styles.controlGroup}>
        <SectionLabel>Game length</SectionLabel>
        <SegmentedControl
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={setCategory}
          accessibilityLabel="Game length"
        />
      </View>
      <View style={styles.controlGroup}>
        <SectionLabel>Tempo to test</SectionLabel>
        <PresetGrid
          items={presets}
          columns={PRESET_COLUMNS[category]}
          keyOf={presetKey}
          accessibilityLabel={`${CATEGORY_NAME[category]} tempos`}
          renderItem={(p) => {
            const i = presets.indexOf(p);
            return (
              <PresetButton
                label={presetLabel(p)}
                selected={i === presetIndex[category]}
                onPress={() => setPresetIndex((prev) => ({ ...prev, [category]: i }))}
              />
            );
          }}
        />
      </View>
      <Switch label="Background loop" checked={loop} onValueChange={setLoop} />
    </View>
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <View style={styles.titleRow}>
            <IconButton icon="back" onPress={onBack} accessibilityLabel="Back" />
            <AppText variant="brand" size="title" accessibilityRole="header">
              Config
            </AppText>
          </View>
          {laptop ? (
            <View style={styles.laptopColumns}>
              {hero}
              {controls}
            </View>
          ) : (
            <>
              {hero}
              {controls}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /** Whole screen. backgroundColor is set inline (theme). */
  screen: { flex: 1 },
  /** ScrollView content: centres the page column. */
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  /** Centred, width-limited column. */
  page: {
    width: '100%',
    maxWidth: maxContentWidth,
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  /** Back button and "Config" title. */
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  /** Laptop only: hero card and controls side by side. */
  laptopColumns: { flex: 1, flexDirection: 'row', gap: spacing.xxl },
  /** The weight shift card: readout, play, timeline, slider. */
  heroCard: { gap: spacing.lg },
  heroCardLaptop: { flex: laptopColumns.hero },
  /** Top row of the card: section label left, ratio badge right. */
  heroHeaderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  /** Percentage and seconds on the left, play button on the right. */
  readoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  /** Takes the free width left of the play button. */
  readoutText: { flex: 1, gap: spacing.xs },
  /** Slider with its end captions underneath. */
  sliderGroup: { gap: spacing.xs },
  /** Minus, slider, plus. */
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  /** The slider takes the width between the two nudge buttons. */
  sliderBox: { flex: 1 },
  /** "Takeaway" under the left end, "Top" under the right end. */
  sliderEnds: { flexDirection: 'row', justifyContent: 'space-between' },
  /** Right-hand column: game length, tempo, loop switch. */
  controlsColumn: { gap: spacing.xl },
  controlsColumnLaptop: { flex: laptopColumns.controls },
  /** A section label with its control underneath. */
  controlGroup: { gap: spacing.sm },
});
