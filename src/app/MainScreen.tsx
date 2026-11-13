// Reuse check: Header, Card, Badge, PlayButton, SectionLabel, SegmentedControl, PresetGrid,
// PresetButton, AppText, useLayout and theme tokens are reused as is. Nothing new is created.
// Only layout tokens (maxContentWidth, timelineSlotMinHeight, laptopColumns) were added to the theme.
// Loop switch timeline fix: checked src/ui/components and src/theme; extended BeatTimeline with a
// `restartKey` prop (no new component, no new styles or tokens).
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORY_RATIO, PRESETS, presetLabel } from '../engine';
import type { Category, Preset, WeightShiftSettings } from '../engine';
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
  Card,
  Header,
  MenuItem,
  PlayButton,
  PresetButton,
  PresetGrid,
  SectionLabel,
  SegmentedControl,
  StatusMessage,
  Switch,
} from '../ui/components';
import { CATEGORY_NAME, CATEGORY_OPTIONS, PRESET_COLUMNS, presetKey } from '../ui/lib/categoryUi';
import { useLayout } from '../ui/hooks/useLayout';
import {
  PAUSED_TEXT,
  START_FAILED_TEXT,
  audioNow,
  onSwing,
  outputDelay,
  usePlayerSession,
} from '../ui/hooks/usePlayerSession';
import { readDeviceInfo, shouldShowSilentSwitchHint } from '../ui/lib/silentSwitch';

const SILENT_SWITCH_HINT = 'No sound? Check silent mode, mute in Control Center and the volume.'; // R4.8

// Fixed for the life of the page, so read once.
const showSilentSwitchHint = shouldShowSilentSwitchHint(Platform.OS, readDeviceInfo());

type Props = {
  category: Category;
  /** Index into PRESETS[category] for each category. */
  presetByCategory: Record<Category, number>;
  onCategoryChange: (category: Category) => void;
  onPresetChange: (category: Category, index: number) => void;
  /** Weight shift positions to play and draw with. */
  weightShiftSettings: WeightShiftSettings;
  /** False while Config or the Audio lab is open: this screen then ignores changes and never restarts playback. */
  active: boolean;
  onOpenConfig: () => void;
  onOpenLab: () => void;
};

export function MainScreen({
  category,
  presetByCategory,
  onCategoryChange,
  onPresetChange,
  weightShiftSettings,
  active,
  onOpenConfig,
  onOpenLab,
}: Props) {
  const { colors, toggle, toggleLabel } = useTheme();
  const { layout } = useLayout();
  const laptop = layout === 'laptop';
  const presets = PRESETS[category];
  const selectedIndex = presetByCategory[category];
  const selected = presets[selectedIndex];
  // Not saved: the loop is off every time the app starts.
  const [loop, setLoop] = useState(false);
  const session = usePlayerSession({ preset: selected, loop, settings: weightShiftSettings }, { active });

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
        weightShiftPosition={weightShiftSettings[category]}
        playing={session.playing}
        subscribeSwings={onSwing}
        audioNow={audioNow}
        outputDelay={outputDelay}
        restartKey={loop}
      />
    </Card>
  );

  const controls = (
    <View style={[styles.controlsColumn, laptop && styles.controlsColumnLaptop]}>
      <View style={styles.controlGroup}>
        <SectionLabel>Game length</SectionLabel>
        <SegmentedControl
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={onCategoryChange}
          accessibilityLabel="Game length"
        />
      </View>
      <View style={styles.controlGroup}>
        <SectionLabel>Available sessions</SectionLabel>
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
                selected={i === selectedIndex}
                onPress={() => onPresetChange(category, i)}
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={styles.page}
        >
          <Header
            menu={(close) => (
              <>
                <MenuItem label="Config" onPress={() => { close(); onOpenConfig(); }} />
                <MenuItem label={toggleLabel} onPress={() => { close(); toggle(); }} />
                <MenuItem label="Audio lab (testing)" onPress={() => { close(); onOpenLab(); }} />
              </>
            )}
          />
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
  heroCardLaptop: { flex: laptopColumns.hero },
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
  tempoBadgeBox: { flex: 1 },
  /** Right-hand column: game length, sessions, loop switch. */
  controlsColumn: { gap: spacing.xl },
  controlsColumnLaptop: { flex: laptopColumns.controls },
  /** A section label with its control underneath. */
  controlGroup: { gap: spacing.sm },
});
