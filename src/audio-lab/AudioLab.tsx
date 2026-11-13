// Audio lab (testing). Opened from the header menu (mount point: task 8.3).
// Runs on the shared Player and adapter from usePlayerSession: no AudioContext of its own.
//
// Reuse check: reuses PresetButton (options and plain actions, selected=false),
// PresetGrid (rows), SectionLabel, Card, IconButton (back), StatusMessage, AppText and
// theme tokens. Creates nothing new in src/ui/components/.
import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  scheduleSwing,
  voiceFor,
  type PlayerState,
  type ScheduledBeep,
  type WakeLockStatus,
  type WeightShiftToneStyle,
} from '../audio';
import {
  PRESETS,
  buildSequence,
  clampPosition,
  defaultWeightShiftSettings,
  presetLabel,
  withPosition,
  type Category,
  type Preset,
} from '../engine';
import { maxContentWidth, spacing, useTheme } from '../theme';
import {
  AppText,
  Card,
  IconButton,
  PresetButton,
  PresetGrid,
  SectionLabel,
  StatusMessage,
} from '../ui/components';
import { getLog, subscribe as subscribeLog } from '../ui/hooks/sessionLog';
import { getSharedAdapter, getSharedPlayer } from '../ui/hooks/usePlayerSession';

/** How far ahead of "now" a test sound is scheduled, in seconds. */
const START_DELAY_SECONDS = 0.15;
const POSITION_STEP = 0.01;
const LOG_LINES_SHOWN = 10;
const CLOCK_READOUT_INTERVAL_MS = 1000;
const NO_AUDIO_TEXT = 'Audio is only available in the web version for now.';
const COPY_FAILED_TEXT = 'Could not copy automatically. Select the text below and copy it.';

type RunStats = { swings: number; minLeadMs: number; lastCycle: number };
const EMPTY_STATS: RunStats = { swings: 0, minLeadMs: Number.POSITIVE_INFINITY, lastCycle: 0 };
type RunClock = { seconds: number; driftMs: number };
type Beep = 'beat1' | 'weightShift' | 'beat2' | 'beat3';

const noop = () => {};

type Props = { onBack: () => void };

export function AudioLab({ onBack }: Props) {
  const { colors } = useTheme();
  const player = getSharedPlayer();
  const [playerState, setPlayerState] = useState<PlayerState>(() => player?.getState() ?? 'stopped');
  const [stats, setStats] = useState<RunStats>(EMPTY_STATS);
  const [wakeLock, setWakeLock] = useState<WakeLockStatus>('idle');
  const [clock, setClock] = useState<RunClock>({ seconds: 0, driftMs: 0 });
  const clockStartRef = useRef<{ audio: number; wall: number } | null>(null);
  const log = useSyncExternalStore(subscribeLog, getLog, getLog);

  const [category, setCategory] = useState<Category>('long');
  const [preset, setPreset] = useState<Preset>(PRESETS.long[4]);
  const [settings, setSettings] = useState(defaultWeightShiftSettings());
  const [toneStyle, setToneStyle] = useState<WeightShiftToneStyle>('distinct');
  const [includeWeightShift, setIncludeWeightShift] = useState(true);
  const [report, setReport] = useState<string[]>([]);
  const [copyStatus, setCopyStatus] = useState('');
  const [copyFailed, setCopyFailed] = useState(false);
  const [fallbackText, setFallbackText] = useState('');

  const swingOptions = { preset, settings, includeWeightShift, toneStyle };

  // On entering: stop the main screen's run. Follow the player's state and swings.
  // On leaving: stop any lab audio.
  useEffect(() => {
    if (!player) return;
    const state = player.getState();
    if (state === 'playing' || state === 'restarting') player.stop();
    setPlayerState(player.getState());
    const unsubscribe = player.subscribe({
      onState: (next) => {
        setPlayerState(next);
        if (next === 'playing') {
          setStats(EMPTY_STATS);
          const adapter = getSharedAdapter();
          if (!clockStartRef.current && adapter) {
            clockStartRef.current = { audio: adapter.now(), wall: performance.now() };
          }
        }
        if (next === 'stopped' || next === 'paused') clockStartRef.current = null;
      },
      onSwing: (swing) =>
        setStats((s) => ({
          swings: s.swings + 1,
          minLeadMs: Math.min(s.minLeadMs, swing.leadSeconds * 1000),
          lastCycle: swing.cycleSeconds,
        })),
    });
    return () => {
      unsubscribe();
      player.stop();
    };
  }, [player]);

  // Wake lock status for the readout comes from the shared log lines' source: the same
  // callbacks write "Wake lock: <status>". Read the latest such line.
  useEffect(() => {
    const line = log.find((entry) => entry.includes('Wake lock: '));
    if (line) setWakeLock(line.split('Wake lock: ')[1] as WakeLockStatus);
  }, [log]);

  // Options changed while playing: restart from beat 1 with the new options.
  useEffect(() => {
    player?.change(swingOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, settings, includeWeightShift, toneStyle]);

  // Once a second: run time, and how far the audio clock has drifted from the device clock.
  useEffect(() => {
    const id = setInterval(() => {
      const start = clockStartRef.current;
      const adapter = getSharedAdapter();
      if (!start || !adapter) return;
      const audioSeconds = adapter.now() - start.audio;
      const wallSeconds = (performance.now() - start.wall) / 1000;
      setClock({ seconds: wallSeconds, driftMs: (audioSeconds - wallSeconds) * 1000 });
    }, CLOCK_READOUT_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  async function playBeep(type: Beep) {
    const adapter = getSharedAdapter() ?? (getSharedPlayer(), getSharedAdapter());
    if (!adapter) return;
    await adapter.unlock();
    adapter.playTone(voiceFor(category, type, toneStyle), adapter.now() + START_DELAY_SECONDS);
  }

  async function playLoopVoice(voice: 'kick' | 'snare' | 'hat') {
    const adapter = getSharedAdapter() ?? (getSharedPlayer(), getSharedAdapter());
    if (!adapter?.playLoopVoice) return;
    await adapter.unlock();
    adapter.playLoopVoice(voice, adapter.now() + START_DELAY_SECONDS);
  }

  async function playSwing() {
    const adapter = getSharedAdapter() ?? (getSharedPlayer(), getSharedAdapter());
    if (!adapter) return;
    await adapter.unlock();
    const start = adapter.now() + START_DELAY_SECONDS;
    const scheduled = scheduleSwing(adapter, start, swingOptions);
    setReport(buildReport(start, scheduled, swingOptions));
  }

  function startRun() {
    player?.start(swingOptions).catch(noop);
  }

  /** Everything needed to understand a test run, as plain text to paste into a message. */
  function buildLogText(): string {
    const web = Platform.OS === 'web';
    const info = getSharedAdapter()?.info() ?? null;
    const ms = (seconds: number | null | undefined) =>
      seconds === null || seconds === undefined ? 'not reported' : `${(seconds * 1000).toFixed(1)} ms`;
    return [
      'Swing Tempo audio lab log',
      `Copied at: ${new Date().toString()}`,
      `Page: ${web && typeof location !== 'undefined' ? location.href : 'unknown'}`,
      `Browser: ${web && typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'}`,
      `Audio context: ${info ? `${info.state}, ${info.sampleRate} Hz, base latency ${ms(info.baseLatencySeconds)}, output latency ${ms(info.outputLatencySeconds)}` : 'not created yet (nothing played)'}`,
      `Selected: ${category} game, preset ${presetLabel(preset)}, weight shift ${settings[category].toFixed(2)}, ${toneStyle} tone, ${includeWeightShift ? 'with' : 'without'} weight shift`,
      `Player: ${playerState}. Wake lock: ${wakeLock}`,
      `Run time: ${clock.seconds.toFixed(0)} s. Audio clock vs device clock: ${clock.driftMs.toFixed(1)} ms`,
      `Swings scheduled: ${stats.swings}. Closest a swing came to being late: ${Number.isFinite(stats.minLeadMs) ? `${stats.minLeadMs.toFixed(0)} ms ahead` : 'none yet'}`,
      '',
      'Event log (newest first):',
      ...(log.length ? log : ['(empty)']),
    ].join('\n');
  }

  // Copies on web when the clipboard allows it. Any other case (native, insecure page,
  // blocked permission, rejected write) shows the full text to select and copy by hand.
  async function copyLog() {
    const text = buildLogText();
    try {
      if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.clipboard) {
        throw new Error('Clipboard not available');
      }
      await navigator.clipboard.writeText(text);
      setCopyFailed(false);
      setFallbackText('');
      setCopyStatus(`Copied ${log.length} log lines. Paste them into a message.`);
    } catch {
      setCopyFailed(true);
      setFallbackText(text);
      setCopyStatus(COPY_FAILED_TEXT);
    }
  }

  function chooseCategory(next: Category) {
    setCategory(next);
    setPreset(PRESETS[next][next === 'long' ? 4 : 2]);
  }

  const position = settings[category];
  const stepPosition = (delta: number) =>
    setSettings(withPosition(settings, category, clampPosition(position + delta)));

  const optionGrid = <T extends string>(
    label: string,
    items: ReadonlyArray<{ key: T; label: string; selected: boolean; onPress: () => void }>,
    columns: 3 | 5 = 3,
  ) => (
    <PresetGrid
      items={items}
      columns={columns}
      accessibilityLabel={label}
      keyOf={(item) => item.key}
      renderItem={(item) => (
        <PresetButton label={item.label} selected={item.selected} onPress={item.onPress} />
      )}
    />
  );
  const actionGrid = (
    label: string,
    items: ReadonlyArray<{ label: string; onPress: () => void }>,
    columns: 3 | 5 = 3,
  ) =>
    optionGrid(
      label,
      items.map((item) => ({ key: item.label, label: item.label, selected: false, onPress: item.onPress })),
      columns,
    );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.page}>
      <View style={styles.header}>
        <IconButton icon="back" accessibilityLabel="Back" onPress={onBack} />
        <AppText variant="brand" size="title" accessibilityRole="header">
          Audio lab (testing)
        </AppText>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {!player ? <StatusMessage variant="info" text={NO_AUDIO_TEXT} /> : null}

        <Card style={styles.card}>
          <SectionLabel>Game</SectionLabel>
          {optionGrid('Game', [
            { key: 'long', label: 'Long Game', selected: category === 'long', onPress: () => chooseCategory('long') },
            { key: 'short', label: 'Short Game', selected: category === 'short', onPress: () => chooseCategory('short') },
          ])}

          <SectionLabel>Preset</SectionLabel>
          {optionGrid(
            'Preset',
            PRESETS[category].map((p) => ({
              key: presetLabel(p),
              label: presetLabel(p),
              selected: p === preset,
              onPress: () => setPreset(p),
            })),
            5,
          )}

          <SectionLabel>{`Weight shift position (${category}): ${position.toFixed(2)}`}</SectionLabel>
          {actionGrid('Weight shift position', [
            { label: '- 0.01', onPress: () => stepPosition(-POSITION_STEP) },
            { label: '+ 0.01', onPress: () => stepPosition(POSITION_STEP) },
          ])}

          <SectionLabel>Weight shift sound</SectionLabel>
          {optionGrid('Weight shift sound', [
            { key: 'distinct', label: 'Distinct', selected: toneStyle === 'distinct', onPress: () => setToneStyle('distinct') },
            { key: 'same', label: 'Same as beat 2', selected: toneStyle === 'same', onPress: () => setToneStyle('same') },
          ])}

          <SectionLabel>Beats</SectionLabel>
          {optionGrid('Beats', [
            { key: 'with', label: 'With weight shift', selected: includeWeightShift, onPress: () => setIncludeWeightShift(true) },
            { key: 'without', label: 'Three beats only', selected: !includeWeightShift, onPress: () => setIncludeWeightShift(false) },
          ])}
        </Card>

        {player ? (
        <Card style={styles.card}>
          <SectionLabel>Single beeps</SectionLabel>
          {actionGrid(
            'Single beeps',
            [
              { label: 'Beat 1', onPress: () => playBeep('beat1') },
              { label: 'Weight shift', onPress: () => playBeep('weightShift') },
              { label: 'Beat 2', onPress: () => playBeep('beat2') },
              { label: 'Beat 3', onPress: () => playBeep('beat3') },
            ],
            5,
          )}

          <SectionLabel>Loop sounds</SectionLabel>
          {actionGrid('Loop sounds', [
            { label: 'Kick', onPress: () => playLoopVoice('kick') },
            { label: 'Snare', onPress: () => playLoopVoice('snare') },
            { label: 'Hat', onPress: () => playLoopVoice('hat') },
          ])}

          <SectionLabel>{`Repeating playback: ${playerState}`}</SectionLabel>
          {actionGrid('Repeating playback', [
            { label: 'Play', onPress: startRun },
            { label: 'Stop', onPress: () => player?.stop() },
          ])}
          {playerState === 'paused' ? (
            <StatusMessage variant="info" text="Playback paused. Tap Play to start again from beat 1." />
          ) : null}
          <AppText size="caption" color="text2">
            {`Swings scheduled: ${stats.swings}. Cycle: ${stats.lastCycle.toFixed(3)} s. Closest a swing came to being late: ${Number.isFinite(stats.minLeadMs) ? `${stats.minLeadMs.toFixed(0)} ms ahead` : 'none yet'}`}
          </AppText>
          <AppText size="caption" color="text2">
            {`Wake lock: ${wakeLock}. Run time: ${clock.seconds.toFixed(0)} s. Audio clock vs device clock: ${clock.driftMs.toFixed(1)} ms`}
          </AppText>
        </Card>
        ) : null}

        <Card style={styles.card}>
          <SectionLabel>{`Event log (newest first, last ${LOG_LINES_SHOWN} shown)`}</SectionLabel>
          {log.slice(0, LOG_LINES_SHOWN).map((line, i) => (
            <AppText key={`${i}-${line}`} size="caption" variant="num">
              {line}
            </AppText>
          ))}
          {actionGrid('Log', [{ label: 'Copy log', onPress: copyLog }])}
          {copyStatus ? (
            <StatusMessage variant={copyFailed ? 'info' : 'hint'} text={copyStatus} />
          ) : null}
          {fallbackText ? (
            <AppText selectable size="caption" variant="num">
              {fallbackText}
            </AppText>
          ) : null}
        </Card>

        {player ? (
          <Card style={styles.card}>
            <SectionLabel>One swing</SectionLabel>
            {actionGrid('One swing', [{ label: 'Play one swing', onPress: playSwing }])}
            {report.map((line, i) => (
              <AppText key={i} size="caption" variant="num">
                {line}
              </AppText>
            ))}
          </Card>
        ) : null}
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/** Compare what was scheduled on the audio clock with the engine's list. */
function buildReport(
  start: number,
  scheduled: ScheduledBeep[],
  options: { preset: Preset; settings: ReturnType<typeof defaultWeightShiftSettings>; includeWeightShift: boolean },
): string[] {
  const expected = buildSequence(options);
  let worst = 0;
  const lines = scheduled.map((beep, i) => {
    const offset = beep.time - start;
    const diffMs = Math.abs(offset - expected[i].time) * 1000;
    worst = Math.max(worst, diffMs);
    return `${beep.type}: engine ${expected[i].time.toFixed(4)} s, audio clock ${offset.toFixed(4)} s, voice ${beep.voice}`;
  });
  return [
    `Preset ${presetLabel(options.preset)}`,
    ...lines,
    `Largest difference: ${worst.toFixed(3)} ms (limit 1 ms)`,
  ];
}

const styles = StyleSheet.create({
  /** Whole screen. backgroundColor is set inline (theme). */
  screen: { flex: 1 },
  /** Centred, width-limited column. */
  page: { flex: 1, width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  content: { padding: spacing.lg, gap: spacing.lg },
  card: { gap: spacing.md },
});
