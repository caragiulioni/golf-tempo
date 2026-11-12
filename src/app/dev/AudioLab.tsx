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
  type WebAudioAdapter,
  type WebAudioOptions,
  type ScheduledBeep,
  type ScheduledSwing,
  type WakeLockStatus,
  type WeightShiftToneStyle,
  attachWebSession,
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
const LOG_LINES_SHOWN = 10;
/** The Copy log button includes this many lines, so a long session is not cut off. */
const LOG_LINES_KEPT = 300;

/**
 * Experiments, switched on from the page address:
 *   ?latency=interactive   the small audio buffer, to compare (the default is 'playback')
 *   ?keepalive=1        a silent audio element that may keep iOS playing on lock
 */
function readExperiments(): WebAudioOptions {
  if (typeof location === 'undefined') return {};
  const params = new URLSearchParams(location.search);
  const latency = params.get('latency');
  const options: WebAudioOptions = {};
  if (latency === 'interactive' || latency === 'balanced' || latency === 'playback') {
    options.latencyHint = latency;
  }
  if (params.get('keepalive') === '1') options.keepAlive = true;
  return options;
}
const EXPERIMENTS = readExperiments();
const CLOCK_READOUT_INTERVAL_MS = 1000;

type RunClock = { seconds: number; driftMs: number };

export default function AudioLab() {
  const adapterRef = useRef<WebAudioAdapter | null>(null);
  const playerRef = useRef<Player | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>('stopped');
  const [stats, setStats] = useState<RunStats>(EMPTY_STATS);
  const [wakeLock, setWakeLock] = useState<WakeLockStatus>('idle');
  const [log, setLog] = useState<string[]>([]);
  const [clock, setClock] = useState<RunClock>({ seconds: 0, driftMs: 0 });
  const detachRef = useRef<(() => void) | null>(null);
  // For the "Simulate audio stall" test button: pushes the device clock ahead so the
  // audio clock looks like it fell behind.
  const wallOffsetMsRef = useRef(0);
  // Where the audio clock and the device clock were when the run began.
  const clockStartRef = useRef<{ audio: number; wall: number } | null>(null);

  function addLog(text: string) {
    const time = new Date().toLocaleTimeString();
    setLog((lines) => [`${time}  ${text}`, ...lines].slice(0, LOG_LINES_KEPT));
  }
  const [category, setCategory] = useState<Category>('long');
  const [preset, setPreset] = useState<Preset>(PRESETS.long[4]);
  const [settings, setSettings] = useState(defaultWeightShiftSettings());
  const [toneStyle, setToneStyle] = useState<WeightShiftToneStyle>('distinct');
  const [includeWeightShift, setIncludeWeightShift] = useState(true);
  const [report, setReport] = useState<string[]>([]);
  const [copyStatus, setCopyStatus] = useState('');
  const [copyFallback, setCopyFallback] = useState('');

  function getAdapterNow(): WebAudioAdapter {
    if (!adapterRef.current) {
      const adapter = createWebAudioAdapter(EXPERIMENTS);
      adapter.onStateChange((state) => addLog(`Audio context: ${state}`));
      adapterRef.current = adapter;
    }
    return adapterRef.current;
  }

  async function getAdapter(): Promise<AudioAdapter> {
    const adapter = getAdapterNow();
    await adapter.unlock();
    return adapter;
  }

  function getPlayer(): Player {
    if (!playerRef.current) {
      const adapter = getAdapterNow();
      const player = createPlayer(
        adapter,
        {
        onResync: () => addLog('Timer fell behind. Restarted from beat 1.'),
        onPaused: (reason, behind) =>
          addLog(
            reason === 'stalled'
              ? `Paused: audio stalled (audio clock ${((behind ?? 0) * 1000).toFixed(0)} ms behind)`
              : 'Paused: the system took the audio away',
          ),
        onState: (state) => {
          setPlayerState(state);
          addLog(`Player: ${state}`);
          if (state === 'playing') {
            setStats(EMPTY_STATS);
            if (!clockStartRef.current) {
              clockStartRef.current = { audio: adapter.now(), wall: performance.now() };
            }
          }
          if (state === 'stopped' || state === 'paused') clockStartRef.current = null;
        },
        onSwing: (swing: ScheduledSwing) =>
          setStats((s) => ({
            swings: s.swings + 1,
            minLeadMs: Math.min(s.minLeadMs, swing.leadSeconds * 1000),
            lastCycle: swing.cycleSeconds,
          })),
        },
        { wallClockMs: () => performance.now() + wallOffsetMsRef.current },
      );
      detachRef.current = attachWebSession(player, {
        onWakeLock: (status) => {
          setWakeLock(status);
          addLog(`Wake lock: ${status}`);
        },
        onVisibility: (hidden) => addLog(hidden ? 'Page hidden or phone locked' : 'Page visible again'),
      });
      playerRef.current = player;
    }
    return playerRef.current;
  }

  /** Everything needed to understand a test run, as plain text to paste into a message. */
  function buildLogText(): string {
    const info = adapterRef.current?.info() ?? null;
    const ms = (seconds: number | null | undefined) =>
      seconds === null || seconds === undefined ? 'not reported' : `${(seconds * 1000).toFixed(1)} ms`;
    return [
      'Swing Tempo audio lab log',
      `Copied at: ${new Date().toString()}`,
      `Page: ${typeof location === 'undefined' ? 'unknown' : location.href}`,
      `Browser: ${typeof navigator === 'undefined' ? 'unknown' : navigator.userAgent}`,
      `Experiments: latency=${EXPERIMENTS.latencyHint ?? 'playback (default)'}, keepalive=${EXPERIMENTS.keepAlive ? 'on' : 'off'}`,
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

  async function copyLog() {
    const text = buildLogText();
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(`Copied ${log.length} log lines. Paste them into a message.`);
      setCopyFallback('');
    } catch {
      // Some browsers block copying. Show the text so it can be selected by hand.
      setCopyStatus('Could not copy automatically. Select the text below and copy it.');
      setCopyFallback(text);
    }
  }

  const swingOptions = { preset, settings, includeWeightShift, toneStyle };

  // Any change while playing restarts the run (stop, short pause, start from beat 1).
  useEffect(() => {
    playerRef.current?.change(swingOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, settings, includeWeightShift, toneStyle]);

  // Stop the sound and let go of the wake lock if this screen goes away.
  useEffect(
    () => () => {
      playerRef.current?.stop();
      detachRef.current?.();
    },
    [],
  );

  // Once a second: how long the run has gone, and how far the audio clock has drifted
  // from the device clock. A small, steady number is fine. A growing one is a problem.
  useEffect(() => {
    const id = setInterval(() => {
      const start = clockStartRef.current;
      const adapter = adapterRef.current;
      if (!start || !adapter) return;
      const audioSeconds = adapter.now() - start.audio;
      const wallSeconds = (performance.now() - start.wall) / 1000;
      setClock({ seconds: wallSeconds, driftMs: (audioSeconds - wallSeconds) * 1000 });
    }, CLOCK_READOUT_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

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
        <Button
          label="Simulate audio stall (test)"
          onPress={() => {
            wallOffsetMsRef.current += 500;
            addLog('Test: pushed the device clock ahead by 500 ms');
          }}
        />
      </View>
      {playerState === 'paused' ? (
        <Text style={styles.selectedText}>Playback paused. Tap Play to start again from beat 1.</Text>
      ) : null}
      <Text>
        Swings scheduled: {stats.swings}. Cycle: {stats.lastCycle.toFixed(3)} s. Closest a swing came to
        being late: {Number.isFinite(stats.minLeadMs) ? `${stats.minLeadMs.toFixed(0)} ms ahead` : 'none yet'}
      </Text>

      <Text>
        Wake lock: {wakeLock}. Run time: {clock.seconds.toFixed(0)} s. Audio clock vs device clock:{' '}
        {clock.driftMs.toFixed(1)} ms
      </Text>
      <Text>
        Experiments: latency={EXPERIMENTS.latencyHint ?? 'playback (default)'}, keepalive=
        {EXPERIMENTS.keepAlive ? 'on' : 'off'}
      </Text>
      <Text style={styles.label}>Event log (newest first, last {LOG_LINES_SHOWN} shown)</Text>
      {log.slice(0, LOG_LINES_SHOWN).map((line, i) => (
        <Text key={i}>{line}</Text>
      ))}
      <View style={styles.row}>
        <Button label="Copy log" onPress={copyLog} />
      </View>
      {copyStatus ? <Text>{copyStatus}</Text> : null}
      {copyFallback ? <Text selectable>{copyFallback}</Text> : null}

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
