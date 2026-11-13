// Reuse check: Header, Card, Badge, PlayButton, SectionLabel, SegmentedControl, PresetGrid,
// PresetButton, AppText, useLayout and theme tokens are reused as is. Nothing new is created.
// Only layout tokens (maxContentWidth, timelineSlotMinHeight, laptopColumns) were added to the theme.
import React from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { CATEGORY_RATIO, PRESETS, presetLabel } from '../engine';
import type { Category, Preset } from '../engine';
import {
  laptopColumns,
  maxContentWidth,
  radius,
  spacing,
  timelineSlotMinHeight,
  useTheme,
} from '../theme';
import {
  AppText,
  Badge,
  Card,
  Header,
  MenuItem,
  PlayButton,
  PresetButton,
  PresetGrid,
  SectionLabel,
  SegmentedControl,
  Switch,
} from '../ui/components';
import type { SegmentedOption } from '../ui/components';
import { useLayout } from '../ui/hooks/useLayout';

const CATEGORY_OPTIONS: ReadonlyArray<SegmentedOption<Category>> = [
  { value: 'long', label: 'Long game' },
  { value: 'short', label: 'Short game' },
];
const CATEGORY_NAME: Record<Category, string> = { long: 'Long game', short: 'Short game' };
const COLUMNS: Record<Category, 3 | 5> = { long: 5, short: 3 };

const presetKey = (p: Preset) => `${p.category}-${p.backFrames}-${p.downFrames}`;
const noop = () => {};

type Props = {
  category: Category;
  /** Index into PRESETS[category] for each category. */
  presetByCategory: Record<Category, number>;
  onCategoryChange: (category: Category) => void;
  onPresetChange: (category: Category, index: number) => void;
  onOpenConfig: () => void;
  onOpenLab: () => void;
};

export function MainScreen({
  category,
  presetByCategory,
  onCategoryChange,
  onPresetChange,
  onOpenConfig,
  onOpenLab,
}: Props) {
  const { colors, toggle, toggleLabel } = useTheme();
  const { layout } = useLayout();
  const laptop = layout === 'laptop';
  const presets = PRESETS[category];
  const selectedIndex = presetByCategory[category];
  const selected = presets[selectedIndex];

  const hero = (
    <Card
      accessibilityLabel="Current session"
      style={[{ gap: spacing.lg }, laptop && { flex: laptopColumns.hero }]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <SectionLabel>Current session</SectionLabel>
        <Badge variant="ratio" text={`${CATEGORY_NAME[category]} · ${CATEGORY_RATIO[category]} : 1`} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg }}>
        <View style={{ flexShrink: 1 }}>
          <Badge variant="tempo" back={selected.backFrames} down={selected.downFrames} />
        </View>
        {/* Play is not wired to audio yet (task 4.5). */}
        <PlayButton playing={false} onPress={noop} />
      </View>
      {/* Slot for the BeatTimeline (later task). Empty on purpose. */}
      <View
        style={{
          flexGrow: 1,
          minHeight: timelineSlotMinHeight[layout],
          borderRadius: radius.chip,
          backgroundColor: colors.surface,
        }}
      />
    </Card>
  );

  const controls = (
    <View style={[{ gap: spacing.xl }, laptop && { flex: laptopColumns.controls }]}>
      <View style={{ gap: spacing.sm }}>
        <SectionLabel>Game length</SectionLabel>
        <SegmentedControl
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={onCategoryChange}
          accessibilityLabel="Game length"
        />
      </View>
      <View style={{ gap: spacing.sm }}>
        <SectionLabel>Available sessions</SectionLabel>
        <PresetGrid
          items={presets}
          columns={COLUMNS[category]}
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
      {/* Inactive on purpose: spec 4 (808 loop) wires this switch (state, storage, audio). */}
      <Switch label="Background loop" checked={false} disabled />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            width: '100%',
            maxWidth: maxContentWidth,
            flexGrow: 1,
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.xl,
            gap: spacing.lg,
          }}
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
            <View style={{ flex: 1, flexDirection: 'row', gap: spacing.xxl }}>
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
