// Reuse check: Header, Card, Badge, PlayButton, SectionLabel, SegmentedControl, PresetGrid,
// PresetButton, AppText, useLayout and theme tokens are reused as is. Nothing new is created.
// Only layout tokens (maxContentWidth, timelineSlotMinHeight, laptopColumns) were added to the theme.
// Loop switch timeline fix: checked src/ui/components and src/theme; extended BeatTimeline with a
// `restartKey` prop (no new component, no new styles or tokens).
// V2-03 (sound buttons): reuses Button (extended with `checked`) for both buttons; extends
// BeatTimeline with `showWeightShift` and usePlayerSession with `includeWeightShift`. No new
// component or token.
// V2-10 (archetype and Good for): reuses AppText; the words come from the preset data.
// V2-08 (countdown on screen): no new component; BeatTimeline shows the 4, 3, 2, 1 itself, fed by
// the new onLeadIn listener from usePlayerSession.
// V2-06 (Tempo slider): replaces PresetGrid and PresetButton with the new StepSlider (built on
// Slider); both stay in use on the CONFIG screen. Each group remembers its last tempo.
// V2-05 (Gameplay / Practice Drills): reuses SegmentedControl (extended with `size`), PresetGrid and
// PresetButton as they are; presetsInGroup from the engine decides which tempos show.
import React, { useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORY_RATIO, PRESETS, presetLabel, presetsInGroup } from '../engine';
import type { Category, Preset, PresetGroup } from '../engine';
import {
  laptopColumns,
  maxContentWidth,
  spacing,
  useTheme,
} from '../theme';
import {
  AppText,
  Badge,
  BeatTimeline,
  Button,
  Card,
  Header,
  MenuItem,
  PlayButton,
  SectionLabel,
  SegmentedControl,
  StatusMessage,
  StepSlider,
} from '../ui/components';
import { CATEGORY_NAME, CATEGORY_OPTIONS } from '../ui/lib/categoryUi';
import { useConfigPanel } from './ConfigMount';
import type { AppliedSettingsApi } from './ConfigMount';
import { useLayout } from '../ui/hooks/useLayout';
import {
  PAUSED_TEXT,
  START_FAILED_TEXT,
  audioNow,
  onLeadIn,
  onSwing,
  outputDelay,
  usePlayerSession,
} from '../ui/hooks/usePlayerSession';
import { readDeviceInfo, shouldShowSilentSwitchHint } from '../ui/lib/silentSwitch';

const SILENT_SWITCH_HINT = 'No sound? Check silent mode, mute in Control Center and the volume.'; // R4.8

// Fixed for the life of the page, so read once.
const showSilentSwitchHint = shouldShowSilentSwitchHint(Platform.OS, readDeviceInfo());

/** The middle step of a list (the lower middle when the count is even). */
const middleOf = (list: readonly Preset[]): Preset => list[Math.floor(list.length / 2)];
const GROUP_OPTIONS: ReadonlyArray<{ value: PresetGroup; label: string }> = [
  { value: 'gameplay', label: 'GAMEPLAY' },
  { value: 'drills', label: 'PRACTICE DRILLS' },
];
type Props = {
  category: Category;
  /** Index into PRESETS[category] for each category. */
  presetByCategory: Record<Category, number>;
  onCategoryChange: (category: Category) => void;
  onPresetChange: (category: Category, index: number) => void;
  /** Weight shift positions to play and draw with. */
  applied: AppliedSettingsApi;
  /** False while Config or the Audio lab is open: this screen then ignores changes and never restarts playback. */
  active: boolean;
  onOpenLab: () => void;
};

export function MainScreen({
  category,
  presetByCategory,
  onCategoryChange,
  onPresetChange,
  applied,
  active,
  onOpenLab,
}: Props) {
  const { colors, toggle, toggleLabel } = useTheme();
  const { layout } = useLayout();
  const laptop = layout === 'laptop';
  const presets = PRESETS[category];
  const selectedIndex = presetByCategory[category];
  const selected = presets[selectedIndex];
  // Long Game only: the selected preset's group decides which tempos show.
  const group: PresetGroup | null = category === 'long' ? (selected.group ?? 'gameplay') : null;
  const visiblePresets = group ? presetsInGroup('long', group) : presets;
  // Each group remembers its last tempo while the app is open (not saved). A group starts at
  // its middle tempo: 24/8 for Gameplay, 60/20 for Practice Drills.
  const lastInGroup = useRef<Record<PresetGroup, number>>({
    gameplay: PRESETS.long.indexOf(middleOf(presetsInGroup('long', 'gameplay'))),
    drills: PRESETS.long.indexOf(middleOf(presetsInGroup('long', 'drills'))),
  });
  const onGroupChange = (next: PresetGroup) => {
    if (group) lastInGroup.current[group] = selectedIndex;
    onPresetChange('long', lastInGroup.current[next]);
  };
  const stepIndex = visiblePresets.indexOf(selected);
  // Not saved: the loop is off every time the app starts.
  const [loop, setLoop] = useState(false);
  // Not saved either: the weight shift beat is on every time the app starts.
  const [weightShiftByCategory, setWeightShiftByCategory] = useState<Record<Category, boolean>>({
    long: true,
    short: true,
  });
  // Each game keeps its own on or off (V2-14): turn it off in Short Game and Long Game is still on.
  const weightShift = weightShiftByCategory[category];
  const setWeightShift = (on: boolean) => setWeightShiftByCategory((prev) => ({ ...prev, [category]: on }));
  // The Configure weight shift panel (temporary, see ConfigMount): what to play and draw, and its panel.
  // When the panel opens, scroll so its label is near the top of the screen. The panel is the last
  // thing on the page, so it can open below the fold.
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const panelRef = useRef<React.ComponentRef<typeof View>>(null);
  const scrollY = useRef(0);
  const scrollPanelIntoView = () => {
    // Wait a moment, so the opened panel has been laid out and the page is long enough to scroll.
    setTimeout(() => {
      const scroller = scrollRef.current;
      const panel = panelRef.current;
      if (!scroller || !panel) return;
      scroller.measureInWindow((_x, scrollerTop) => {
        panel.measureInWindow((_px, panelTop) => {
          scroller.scrollTo({ y: Math.max(0, scrollY.current + panelTop - scrollerTop - spacing.lg), animated: true });
        });
      });
    }, 80);
  };
  const config = useConfigPanel({ category, selected, applied, onOpened: scrollPanelIntoView });
  const session = usePlayerSession(
    { preset: selected, loop, settings: config.playSettings, includeWeightShift: weightShift },
    { active },
  );

  const hero = (
    <Card
      accessibilityLabel="Current session"
      style={[styles.heroCard, laptop && styles.heroCardLaptop]}
    >
      <View style={styles.heroHeaderRow}>
        <SectionLabel>Current session</SectionLabel>
        <Badge variant="ratio" text={`${CATEGORY_NAME[category]} · ${CATEGORY_RATIO[category]} : 1`} />
      </View>
      <View style={styles.tempoRow}>
        <View style={styles.tempoBadgeBox}>
          <Badge variant="tempo" back={selected.backFrames} down={selected.downFrames} />
          {selected.archetype ? (
            <AppText variant="label" size="label" accessibilityLabel={`Tempo name: ${selected.archetype}`}>
              {selected.archetype}
            </AppText>
          ) : null}
        </View>
        <PlayButton playing={session.playing} onPress={session.toggle} />
      </View>
      {session.message === 'startFailed' ? (
        <StatusMessage variant="info" text={START_FAILED_TEXT} />
      ) : null}
      {session.message === 'paused' ? <StatusMessage variant="info" text={PAUSED_TEXT} /> : null}
      {showSilentSwitchHint ? (
        <StatusMessage variant="hint" text={SILENT_SWITCH_HINT} />
      ) : null}
      <BeatTimeline
        preset={selected}
        weightShiftPosition={config.drawSettings[category]}
        showWeightShift={weightShift}
        playing={session.playing}
        subscribeSwings={onSwing}
        subscribeLeadIns={onLeadIn}
        audioNow={audioNow}
        outputDelay={outputDelay}
        restartKey={`${loop}-${weightShift}`}
      />
    </Card>
  );

  const soundToggles = (
    <View style={styles.soundToggles}>
      <View style={styles.soundToggle}>
        <Button
          label="Background loop"
          checked={loop}
          onPress={() => setLoop(!loop)}
        />
      </View>
      <View style={styles.soundToggle}>
        <Button
          label="Weight shift"
          checked={weightShift}
          onPress={() => setWeightShift(!weightShift)}
        />
      </View>
    </View>
  );
  const controls = (
    <View style={[styles.controlsColumn, laptop && styles.controlsColumnLaptop]}>
      <View style={styles.controlGroup}>
        <SectionLabel>Game length</SectionLabel>
        <SegmentedControl
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(next) => config.requestCategoryChange(next, () => onCategoryChange(next))}
          accessibilityLabel="Game length"
        />
      </View>
      <View style={styles.controlGroup}>
        <SectionLabel>Tempo</SectionLabel>
        {group ? (
          <SegmentedControl
            options={GROUP_OPTIONS}
            value={group}
            onChange={onGroupChange}
            accessibilityLabel="Tempo group"
            size="label"
          />
        ) : null}
        <StepSlider
          labels={visiblePresets.map(presetLabel)}
          value={stepIndex}
          onChange={(i) => onPresetChange(category, presets.indexOf(visiblePresets[i]))}
          accessibilityLabel="Tempo, from rapid to smooth"
          spokenSuffix={group === 'drills' ? 'Practice Drills' : group === 'gameplay' ? 'Gameplay' : undefined}
          startLabel="RAPID"
          endLabel="SMOOTH"
          caption={selected.goodFor}
        />
      </View>
      {/* Very last on the screen, closed to start with, so an open panel is out of the way (V2-09). */}
      <View ref={panelRef} collapsable={false}>
        {config.panel}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView
        ref={scrollRef}
        onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          scrollY.current = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={styles.page}
        >
          <Header
            menu={(close) => (
              <>
                <MenuItem label={toggleLabel} onPress={() => { close(); toggle(); }} />
                <MenuItem label="Audio lab (testing)" onPress={() => { close(); onOpenLab(); }} />
              </>
            )}
          />
          {laptop ? (
            <View style={styles.laptopColumns}>
              <View style={styles.heroColumnLaptop}>
                {hero}
                {soundToggles}
              </View>
              {controls}
            </View>
          ) : (
            <>
              {hero}
              {soundToggles}
              {controls}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /** Whole screen, behind everything. backgroundColor is set inline (theme). */
  screen: { flex: 1 },
  /** ScrollView content: centres the page column. */
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  /** The centred, width-limited column holding header and content. */
  page: {
    width: '100%',
    maxWidth: maxContentWidth,
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  /** Laptop only: hero card and controls side by side. */
  laptopColumns: { flex: 1, flexDirection: 'row', gap: spacing.xxl },
  /** "Current session" card. */
  heroCard: { gap: spacing.lg },
  heroCardLaptop: { flex: 1 },
  /** Laptop only: left column holding the hero card and the sound toggles under it. */
  heroColumnLaptop: { flex: laptopColumns.hero, gap: spacing.lg },
  /** The two sound buttons side by side, directly below the hero card. */
  soundToggles: { flexDirection: 'row', gap: spacing.sm },
  /** One of the two sound buttons: they share the row width equally. */
  soundToggle: { flex: 1 },
  /** Top row of the hero card: section label left, ratio badge right. */
  heroHeaderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  /** Row with the tempo numbers and the play button. */
  tempoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  /** Takes the free width left of the play button. */
  tempoBadgeBox: { flex: 1, gap: spacing.xs },
  /** Right-hand column: game length, sessions. */
  controlsColumn: { gap: spacing.xl },
  controlsColumnLaptop: { flex: laptopColumns.controls },
  /** A section label with its control underneath. */
  controlGroup: { gap: spacing.sm },
});
