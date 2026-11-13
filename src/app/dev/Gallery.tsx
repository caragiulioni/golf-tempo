// TEMPORARY: component gallery for visual review. Delete with src/app/dev/ in Wave 3.4.
// Reuse check: only shared components from src/ui/components and theme tokens are used.
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { LONG_GAME_PRESETS, SHORT_GAME_PRESETS, presetLabel } from '../../engine';
import type { Preset } from '../../engine';
import { spacing, useTheme } from '../../theme';
import {
  AppText,
  Badge,
  Card,
  Header,
  Icon,
  IconButton,
  LogoMark,
  Menu,
  MenuItem,
  PlayButton,
  PresetButton,
  PresetGrid,
  SectionLabel,
  SegmentedControl,
  StatusMessage,
  Switch,
  Wordmark,
} from '../../ui/components';
import type { IconName } from '../../ui/components';

const ICONS: IconName[] = ['play', 'pause', 'check', 'menu', 'back'];
const noop = () => {};
const presetKey = (p: Preset) => `${p.category}-${p.backFrames}-${p.downFrames}`;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.md }}>
      <SectionLabel>{title}</SectionLabel>
      {children}
    </View>
  );
}

type Props = { onOpenAudioLab: () => void };

export default function Gallery({ onOpenAudioLab }: Props) {
  const { mode, colors, toggle } = useTheme();
  const [category, setCategory] = useState<'long' | 'short'>('long');
  const [longSel, setLongSel] = useState(4);
  const [shortSel, setShortSel] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: spacing.lg, gap: spacing.xl }}>
        <AppText variant="brand">TEMPORARY gallery (mode: {mode})</AppText>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <IconButton icon="menu" onPress={toggle} accessibilityLabel="Toggle light or dark mode" />
          <AppText>Toggle light/dark</AppText>
        </View>
        <PresetButton label="Open audio lab" selected={false} onPress={onOpenAudioLab} />

        <Section title="Header + Menu">
          <Header onMenuPress={() => setMenuOpen(true)} menuExpanded={menuOpen} />
          <View style={{ alignItems: 'flex-end' }}>
            <Menu
              open={menuOpen}
              onOpen={() => setMenuOpen(true)}
              onClose={() => setMenuOpen(false)}
              trigger={({ onPress, expanded }) => (
                <IconButton
                  icon="menu"
                  onPress={onPress}
                  expanded={expanded}
                  accessibilityLabel="Menu"
                />
              )}
            >
              <MenuItem label="Config" onPress={() => setMenuOpen(false)} />
              <MenuItem label="How to" onPress={() => setMenuOpen(false)} />
              <MenuItem label={mode === 'dark' ? 'Light mode' : 'Dark mode'} onPress={toggle} />
            </Menu>
          </View>
        </Section>

        <Section title="Wordmark + LogoMark">
          <Wordmark />
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <LogoMark mode="light" />
            <LogoMark mode="dark" />
          </View>
        </Section>

        <Section title="AppText">
          <AppText variant="ui">ui: The quick brown fox</AppText>
          <AppText variant="num">num: 0123456789</AppText>
          <AppText variant="label">label: Section label</AppText>
          <AppText variant="brand">brand: Golf Tempo</AppText>
          <AppText color="text2">text2 colour</AppText>
          <AppText color="accent">accent colour</AppText>
        </Section>

        <Section title="Icon / IconButton">
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            {ICONS.map((name) => (
              <Icon key={name} name={name} size={32} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <IconButton icon="back" onPress={noop} accessibilityLabel="Back" />
            <IconButton icon="back" onPress={noop} accessibilityLabel="Back disabled" disabled />
          </View>
        </Section>

        <Section title="SegmentedControl">
          <SegmentedControl
            options={[
              { value: 'long', label: 'Long Game' },
              { value: 'short', label: 'Short Game' },
            ]}
            value={category}
            onChange={setCategory}
            accessibilityLabel="Category"
          />
        </Section>

        <Section title="PresetButton: unselected / selected">
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <PresetButton label="21 / 7" selected={false} onPress={noop} />
            <PresetButton label="21 / 7" selected onPress={noop} />
          </View>
        </Section>

        <Section title="PresetGrid: Long, 5 columns (10 presets)">
          <PresetGrid
            items={LONG_GAME_PRESETS}
            columns={5}
            keyOf={presetKey}
            accessibilityLabel="Long Game tempos"
            renderItem={(p) => {
              const i = LONG_GAME_PRESETS.indexOf(p);
              return (
                <PresetButton
                  label={presetLabel(p)}
                  selected={i === longSel}
                  onPress={() => setLongSel(i)}
                />
              );
            }}
          />
        </Section>

        <Section title="PresetGrid: Short, 3 columns">
          <PresetGrid
            items={SHORT_GAME_PRESETS}
            columns={3}
            keyOf={presetKey}
            accessibilityLabel="Short Game tempos"
            renderItem={(p) => {
              const i = SHORT_GAME_PRESETS.indexOf(p);
              return (
                <PresetButton
                  label={presetLabel(p)}
                  selected={i === shortSel}
                  onPress={() => setShortSel(i)}
                />
              );
            }}
          />
        </Section>

        <Section title="Badge">
          <Badge variant="tempo" back={30} down={10} />
          <Badge variant="ratio" text="3 : 1" />
        </Section>

        <Section title="Card + PlayButton">
          <Card>
            <View style={{ alignItems: 'center', gap: spacing.md }}>
              <PlayButton playing={playing} onPress={() => setPlaying((p) => !p)} />
              <View style={{ flexDirection: 'row', gap: spacing.lg }}>
                <PlayButton playing={false} onPress={noop} />
                <PlayButton playing onPress={noop} />
              </View>
            </View>
          </Card>
        </Section>

        <Section title="Switch">
          <Switch label="Loop on" checked={loop} onValueChange={setLoop} />
          <Switch label="Checked" checked onValueChange={noop} />
          <Switch label="Disabled off" checked={false} disabled />
          <Switch label="Disabled on" checked disabled />
        </Section>

        <Section title="StatusMessage">
          <StatusMessage variant="info" text="Paused. Tap play to resume." />
          <StatusMessage variant="hint" text="Tap a tempo, then press play." />
        </Section>
      </View>
    </ScrollView>
  );
}
