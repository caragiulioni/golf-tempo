// TEMPORARY listening-test screen for the audio-playback spec.
// Delete this folder and its one use in App.tsx when the app-shell-ui spec lands.
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  createPlayer,
  createWebAudioAdapter,
  scheduleSwing,
  voiceFor,
  type AudioAdapter,
  type Player,
  type PlayerState,
  type ScheduledBeep,
  type ScheduledSwing,
  type WeightShiftToneStyle,
} from '../../audio';
import {
  PRESETS,
  buildSequence,
  clampPosition,
  defaultWeightShiftSettings,
  presetLabel,
  withPosition,
  type Category,
  type Preset,
} from '../../engine';

/** How far ahead of "now" a test sound is scheduled, in seconds. */
const START_DELAY_SECONDS = 0.15;
const POSITION_STEP = 0.01;

function Button({ label, onPress, selected }: { label: string; onPress: () => void; selected?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.button}>
      <Text style={selected ? styles.selectedText : undefined}>{selected ? `[${label}]` : label}</Text>
    </Pressable>
  );
}

type RunStats = { swings: number; minLeadMs: number; lastCycle: number };
const EMPTY_STATS: RunStats = { swings: 0, minLeadMs: Number.POSITIVE_INFINITY, lastCycle: 0 };

export default function AudioLab() {
  const adapterRef = useRef<AudioAdapter | null>(null);
  const playerRef = useRef<Player | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>('stopped');
  const [stats, setStats] = useState<RunStats>(EMPTY_STATS);
  const [category, setCategory] = useState<Category>('long');
  const [preset, setPreset] = useState<Preset>(PRESETS.long[4]);
  const [settings, setSettings] = useState(defaultWeightShiftSettings());
  const [toneStyle, setToneStyle] = useState<WeightShiftToneStyle>('distinct');
  const [includeWeightShift, setIncludeWeightShift] = useState(true);
  const [report, setReport] = useState<string[]>([]);

  function getAdapterNow(): AudioAdapter {
    if (!adapterRef.current) adapterRef.current = createWebAudioAdapter();
    return adapterRef.current;
  }

  async function getAdapter(): Promise<AudioAdapter> {
    const adapter = getAdapterNow();
    await adapter.unlock();
    return adapter;
  }

  function getPlayer(): Player {
    if (!playerRef.current) {
      playerRef.current = createPlayer(getAdapterNow(), {
        onState: (state) => {
          setPlayerState(state);
          if (state === 'playing') setStats(EMPTY_STATS);
        },
        onSwing: (swing: ScheduledSwing) =>
          setStats((s) => ({
            swings: s.swings + 1,
            minLeadMs: Math.min(s.minLeadMs, swing.leadSeconds * 1000),
            lastCycle: swing.cycleSeconds,
          })),
      });
    }
    return playerRef.current;
  }

  const swingOptions = { preset, settings, includeWeightShift, toneStyle };

  // Any change while playing restarts the run (stop, short pause, start from beat 1).
  useEffect(() => {
    playerRef.current?.change(swingOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, settings, includeWeightShift, toneStyle]);

  // Stop the sound if this screen goes away.
  useEffect(() => () => playerRef.current?.stop(), []);

  async function playBeep(type: 'beat1' | 'weightShift' | 'beat2' | 'beat3') {
    const adapter = await getAdapter();
    adapter.playTone(voiceFor(category, type, toneStyle), adapter.now() + START_DELAY_SECONDS);
  }

  async function playSwing() {
    const adapter = await getAdapter();
    const start = adapter.now() + START_DELAY_SECONDS;
    const options = { preset, settings, includeWeightShift, toneStyle };
    const scheduled = scheduleSwing(adapter, start, options);
    setReport(buildReport(start, scheduled, options));
  }

  function chooseCategory(next: Category) {
    setCategory(next);
    setPreset(PRESETS[next][next === 'long' ? 4 : 2]);
  }

  const position = settings[category];

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.heading}>Audio lab (temporary)</Text>

      <Text style={styles.label}>Game</Text>
      <View style={styles.row}>
        <Button label="Long Game" selected={category === 'long'} onPress={() => chooseCategory('long')} />
        <Button label="Short Game" selected={category === 'short'} onPress={() => chooseCategory('short')} />
      </View>

      <Text style={styles.label}>Preset</Text>
      <View style={styles.row}>
        {PRESETS[category].map((p) => (
          <Button
            key={presetLabel(p)}
            label={presetLabel(p)}
            selected={p === preset}
            onPress={() => setPreset(p)}
          />
        ))}
      </View>

      <Text style={styles.label}>Weight shift position ({category}): {position.toFixed(2)}</Text>
      <View style={styles.row}>
        <Button
          label="- 0.01"
          onPress={() => setSettings(withPosition(settings, category, clampPosition(position - POSITION_STEP)))}
        />
        <Button
          label="+ 0.01"
          onPress={() => setSettings(withPosition(settings, category, clampPosition(position + POSITION_STEP)))}
        />
      </View>

      <Text style={styles.label}>Weight shift sound</Text>
      <View style={styles.row}>
        <Button label="Distinct" selected={toneStyle === 'distinct'} onPress={() => setToneStyle('distinct')} />
        <Button label="Same as beat 2" selected={toneStyle === 'same'} onPress={() => setToneStyle('same')} />
      </View>

      <Text style={styles.label}>Beats</Text>
      <View style={styles.row}>
        <Button label="With weight shift" selected={includeWeightShift} onPress={() => setIncludeWeightShift(true)} />
        <Button label="Three beats only" selected={!includeWeightShift} onPress={() => setIncludeWeightShift(false)} />
      </View>

      <Text style={styles.label}>Single beeps</Text>
      <View style={styles.row}>
        <Button label="Beat 1" onPress={() => playBeep('beat1')} />
        <Button label="Weight shift" onPress={() => playBeep('weightShift')} />
        <Button label="Beat 2" onPress={() => playBeep('beat2')} />
        <Button label="Beat 3" onPress={() => playBeep('beat3')} />
      </View>

      <Text style={styles.label}>Repeating playback: {playerState}</Text>
      <View style={styles.row}>
        <Button label="Play" onPress={() => getPlayer().start(swingOptions)} />
        <Button label="Stop" onPress={() => getPlayer().stop()} />
      </View>
      <Text>
        Swings scheduled: {stats.swings}. Cycle: {stats.lastCycle.toFixed(3)} s. Closest a swing came to
        being late: {Number.isFinite(stats.minLeadMs) ? `${stats.minLeadMs.toFixed(0)} ms ahead` : 'none yet'}
      </Text>

      <Text style={styles.label}>One swing</Text>
      <View style={styles.row}>
        <Button label="Play one swing" onPress={playSwing} />
      </View>

      {report.map((line, i) => (
        <Text key={i}>{line}</Text>
      ))}
    </ScrollView>
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
  screen: { padding: 16, gap: 8 },
  heading: { fontSize: 20, fontWeight: 'bold' },
  label: { marginTop: 12, fontWeight: 'bold' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: { paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1 },
  selectedText: { fontWeight: 'bold' },
});
