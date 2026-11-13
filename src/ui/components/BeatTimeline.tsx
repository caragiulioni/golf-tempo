import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';
import type { ScheduledSwing } from '../../audio';
import type { Preset } from '../../engine';
import {
  radius,
  spacing,
  timeline,
  timelineSizes as S,
  timelineSlotMinHeight,
  useTheme,
} from '../../theme';
import { useLayout } from '../hooks/useLayout';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { labelsOverlap, timelineGeometry, weightShiftLabel } from '../lib/timelineGeometry';
import type { TimelineMarkerType } from '../lib/timelineGeometry';
import { AppText } from './AppText';
import { measureStyles } from './measureStyles';

type Props = {
  preset: Preset;
  /** Normalized weight shift position, 0..1 between beat 1 and beat 2. */
  weightShiftPosition: number;
  /** True while playing or restarting. When it turns false everything resets (R5.13). */
  playing?: boolean;
  /** Register for scheduled swings. Returns an unsubscribe function. */
  subscribeSwings?: (listener: (swing: ScheduledSwing) => void) => () => void;
  /** The audio clock in seconds, or null when there is none. */
  audioNow?: () => number | null;
  /** Seconds between a beep being scheduled and being heard. Defaults to outputDelaySeconds(). */
  outputDelay?: () => number;
};

/**
 * Seconds from a beep's scheduled audio time until it is heard. The visuals are shifted
 * by this so they line up with the sound.
 * TODO(9.1): replace with the measured output latency. Constant 0 until then.
 */
export function outputDelaySeconds(): number {
  return 0;
}

const NAMES: Record<TimelineMarkerType, string> = {
  beat1: 'Takeaway',
  weightShift: 'Weight shift',
  beat2: 'Top',
  beat3: 'Impact',
};

const SHIFT_SHORT = weightShiftLabel(true);

const PATTERN_ID = 'timeline-grid';

const NONE_LIT: Record<TimelineMarkerType, boolean> = {
  beat1: false,
  weightShift: false,
  beat2: false,
  beat3: false,
};

/**
 * Letter spacing that makes a phase label fit `avail`, or null when even the tightest
 * spacing is too wide. `width` was measured at the normal spacing.
 */
function fitSpacing(width: number, chars: number, avail: number): number | null {
  if (width <= avail) return S.phaseLetterSpacing;
  const spacing = S.phaseLetterSpacing - (width - avail) / chars;
  return spacing >= S.phaseLetterSpacingMin ? spacing : null;
}

/** Idle beat timeline: grid container, phase labels, two bars, four markers and their names. */
export function BeatTimeline({
  preset,
  weightShiftPosition,
  playing = false,
  subscribeSwings,
  audioNow,
  outputDelay = outputDelaySeconds,
}: Props) {
  const { mode } = useTheme();
  const { layout } = useLayout();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const geometry = useMemo(
    () => timelineGeometry(preset, weightShiftPosition),
    [preset, weightShiftPosition],
  );

  // Playback follow. State is local, so only this component re-renders.
  const [lit, setLit] = useState<Record<TimelineMarkerType, boolean>>(NONE_LIT);
  // Mirror of `lit`, so the progress listener can check it without waiting for a render.
  const litRef = useRef(NONE_LIT);
  const updateLit = (fn: (prev: Record<TimelineMarkerType, boolean>) => Record<TimelineMarkerType, boolean>) => {
    litRef.current = fn(litRef.current);
    setLit(litRef.current);
  };
  const [headVisible, setHeadVisible] = useState(false);
  // Progress (0..1) at which each marker is fully uncovered while the fill eases back.
  const unlightAt = useRef<Record<TimelineMarkerType, number>>({
    beat1: 0,
    weightShift: 0,
    beat2: 0,
    beat3: 0,
  });
  const progress = useRef(new Animated.Value(0)).current;
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const headAnim = useRef<Animated.CompositeAnimation | null>(null);
  const outputDelayRef = useRef(outputDelay);
  outputDelayRef.current = outputDelay;
  const reduceMotion = useReduceMotion();
  const reduceRef = useRef(reduceMotion);
  reduceRef.current = reduceMotion;
  const pulse = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef<Animated.CompositeAnimation | null>(null);

  const reset = useRef(() => {});
  reset.current = () => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
    headAnim.current?.stop();
    headAnim.current = null;
    pulseAnim.current?.stop();
    pulseAnim.current = null;
    pulse.setValue(0);
    progress.setValue(0);
    updateLit(() => NONE_LIT);
    setHeadVisible(false);
  };

  // Ease-back (R5.4): while the fill falls, a marker goes back to unlit as the edge passes it.
  // Only direction and crossings matter, so setLit runs a few times per swing, not per frame.
  useEffect(() => {
    let last = 0;
    const id = progress.addListener(({ value }) => {
      const falling = value < last;
      last = value;
      if (!falling) return;
      const crossed = (Object.keys(unlightAt.current) as TimelineMarkerType[]).filter(
        (t) => litRef.current[t] && value <= unlightAt.current[t],
      );
      if (crossed.length === 0) return;
      litRef.current = { ...litRef.current, ...Object.fromEntries(crossed.map((t) => [t, false])) };
      setLit(litRef.current);
    });
    return () => progress.removeListener(id);
  }, [progress]);

  // Follow the audio schedule. Subscribed whether or not `playing` is true yet, because the
  // first swing is announced just before the play state reaches this component. Changing the
  // preset or weight shift position runs the cleanup, which drops everything pending.
  useEffect(() => {
    if (!geometry || !subscribeSwings || !audioNow) return;
    const total = geometry.total;
    const markerX = Object.fromEntries(geometry.markers.map((m) => [m.type, m.x])) as Record<
      TimelineMarkerType,
      number
    >;
    const unsubscribe = subscribeSwings((swing: ScheduledSwing) => {
      const now = audioNow();
      if (now === null) return;
      const delay = outputDelayRef.current();
      const msUntil = (time: number) => Math.max(0, (time + delay - now) * 1000);

      // Fill and playhead: at beat 1 jump to 0, sweep to 1 over `total`, then ease back to 0 so
      // it lands just before the next beat 1. Starting from a timer at beat 1 means the previous
      // swing's animation is stopped exactly when this one takes over, not earlier.
      // Reduce motion (R5.7): no sweep or ease-back; the fill steps at each marker below.
      const easeBackMs = Math.max(
        S.easeBackMinMs,
        (swing.cycleSeconds - total) * 1000 - S.easeBackMarginMs,
      );
      const sweepTimer = setTimeout(() => {
        timers.current.delete(sweepTimer);
        if (reduceRef.current) return;
        headAnim.current?.stop();
        progress.setValue(0);
        const sweep = Animated.sequence([
          Animated.timing(progress, {
            toValue: 1,
            duration: total * 1000,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(progress, {
            toValue: 0,
            duration: easeBackMs,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: false,
          }),
        ]);
        headAnim.current = sweep;
        setHeadVisible(true);
        sweep.start();
      }, msUntil(swing.startTime));
      timers.current.add(sweepTimer);

      for (const beep of swing.beeps) {
        const type = beep.type;
        const timer = setTimeout(() => {
          timers.current.delete(timer);
          // Reduce motion: the fill steps to this marker (and back to 0 at beat 1).
          if (reduceRef.current) progress.setValue(markerX[type]);
          // Beat 1 starts a new swing: clear the previous swing's markers first (safety net).
          updateLit((prev) => ({ ...(type === 'beat1' ? NONE_LIT : prev), [type]: true }));
          // Weight shift pulse (R5.12): once per swing, from the moment the diamond lights.
          if (type === 'weightShift' && !reduceRef.current) {
            pulseAnim.current?.stop();
            pulse.setValue(0);
            const anim = Animated.timing(pulse, {
              toValue: 1,
              duration: S.pulseMs,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            });
            pulseAnim.current = anim;
            anim.start();
          }
        }, msUntil(beep.time));
        timers.current.add(timer);
      }
    });
    return () => {
      unsubscribe();
      reset.current();
    };
  }, [geometry, subscribeSwings, audioNow, progress, pulse]);

  // Turning reduce motion on mid-play drops any sweep or pulse in progress.
  useEffect(() => {
    if (reduceMotion) {
      headAnim.current?.stop();
      headAnim.current = null;
      pulseAnim.current?.stop();
      pulseAnim.current = null;
      pulse.setValue(0);
      setHeadVisible(false);
    }
  }, [reduceMotion, pulse]);

  // Stop, pause or error: clear at once (R5.13).
  useEffect(() => {
    if (!playing) reset.current();
  }, [playing]);
  const bg = timeline.containerBg[mode];
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((s) => (s.width === width && s.height === height ? s : { width, height }));
  };

  // Text widths by string, measured once by hidden copies. Measuring never depends on the
  // layout decisions below, so it settles after one pass (no feedback loop).
  const [widths, setWidths] = useState<Record<string, number>>({});
  const onMeasure = (key: string) => (e: LayoutChangeEvent) => {
    const w = Math.ceil(e.nativeEvent.layout.width);
    setWidths((prev) => (prev[key] === w ? prev : { ...prev, [key]: w }));
  };

  const trackW = Math.max(0, size.width - 2 * S.paddingX);
  const px = (x: number) => S.paddingX + x * trackW;
  if (geometry && trackW > 0) {
    for (const m of geometry.markers) {
      unlightAt.current[m.type] = Math.max(0, m.x - S.marker / 2 / trackW);
    }
  }

  const backShort = `BACK · ${preset.backFrames}`;
  const measureKeys = geometry
    ? [...Object.values(NAMES), SHIFT_SHORT, geometry.backLabel, backShort, geometry.downLabel]
    : [];
  const measured = measureKeys.length > 0 && measureKeys.every((k) => widths[k] !== undefined);
  const ready = geometry !== null && size.width > 0 && measured;

  let shiftName: string = NAMES.weightShift;
  let shiftAbove = false;
  let backText = geometry?.backLabel ?? '';
  let backSpacing: number = S.phaseLetterSpacing;
  let downSpacing: number = S.phaseLetterSpacing;
  let downLeft = 0;
  let backWidth = 0;
  if (ready && geometry) {
    const types = geometry.markers.map((m) => m.type);
    const namesOverlap = (shiftText: string) => {
      const ws = types.map((t) => widths[t === 'weightShift' ? shiftText : NAMES[t]]);
      const xs = geometry.markers.map((m, i) => {
        const x = px(m.x);
        if (i === 0) return x - S.marker / 2 + ws[i] / 2;
        if (i === types.length - 1) return x + S.marker / 2 - ws[i] / 2;
        return x;
      });
      return labelsOverlap(ws, xs, S.nameMinGap);
    };
    // Phone always uses the short form; tablet and laptop only when the full name overlaps.
    shiftName = weightShiftLabel(layout === 'phone' || namesOverlap(NAMES.weightShift));
    if (shiftName === SHIFT_SHORT && namesOverlap(SHIFT_SHORT)) {
      shiftAbove = true;
      shiftName = NAMES.weightShift;
    }

    // DOWN has no short form. If it cannot fit its own slot even at the tightest spacing,
    // its box grows leftwards past beat 2 and the BACKSWING box gives up that room.
    const splitPx = px(geometry.splitX);
    const downSlot = size.width - S.paddingX - (splitPx + S.phaseGap / 2);
    const downMin =
      widths[geometry.downLabel] +
      geometry.downLabel.length * (S.phaseLetterSpacingMin - S.phaseLetterSpacing);
    const downAvail = Math.max(downSlot, Math.ceil(downMin));
    downLeft = size.width - S.paddingX - downAvail;
    const backAvail = downLeft - S.phaseGap - S.paddingX;
    backWidth = backAvail;
    const fitFull = fitSpacing(widths[geometry.backLabel], geometry.backLabel.length, backAvail);
    if (fitFull !== null) {
      backSpacing = fitFull;
    } else {
      backText = backShort;
      backSpacing = fitSpacing(widths[backShort], backShort.length, backAvail) ?? S.phaseLetterSpacingMin;
    }
    downSpacing =
      fitSpacing(widths[geometry.downLabel], geometry.downLabel.length, downAvail) ??
      S.phaseLetterSpacingMin;
  }

  return (
    <View
      onLayout={onLayout}
      accessibilityLabel={
        geometry ? `Swing timeline: ${geometry.backLabel}, ${geometry.downLabel}` : 'Swing timeline'
      }
      testID="timelineContainer"
      style={[styles.timelineContainer, { minHeight: timelineSlotMinHeight[layout], backgroundColor: bg }]}
    >
      {size.width > 0 && size.height > 0 ? (
        <Svg
          width={size.width}
          height={size.height}
          style={styles.gridSvg}
          accessible={false}
        >
          <Defs>
            <Pattern id={PATTERN_ID} width={S.gridSize} height={S.gridSize} patternUnits="userSpaceOnUse">
              <Path
                d={`M ${S.gridSize} 0 L 0 0 0 ${S.gridSize}`}
                fill="none"
                stroke={timeline.gridLine}
                strokeWidth={S.gridLineWidth}
              />
            </Pattern>
          </Defs>
          <Rect width={size.width} height={size.height} fill={`url(#${PATTERN_ID})`} />
        </Svg>
      ) : null}

      {/* Hidden copies of every label, only to read their natural widths. */}
      {geometry ? (
        <View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={measureStyles.measureCopy}
        >
          {measureKeys.map((key) => {
            const phase = key === geometry.backLabel || key === backShort || key === geometry.downLabel;
            return (
              <View key={key} style={styles.measureItem} onLayout={onMeasure(key)}>
                {phase ? (
                  <AppText variant="label" size="phaseLabel" style={styles.phaseText}>
                    {key}
                  </AppText>
                ) : (
                  <AppText variant="ui" size="label">
                    {key}
                  </AppText>
                )}
              </View>
            );
          })}
        </View>
      ) : null}

      {ready && geometry ? (
        <View style={styles.timelineContent}>
          {/* Phase labels, split at beat 2. */}
          <View style={styles.phaseRow}>
            <View style={[styles.phaseRowBack, { width: Math.max(0, backWidth) }]}>
              <AppText
                variant="label"
                size="phaseLabel"
                numberOfLines={1}
                ellipsizeMode="clip"
                style={[styles.phaseText, { letterSpacing: backSpacing }]}
              >
                {backText}
              </AppText>
            </View>
            <View style={[styles.phaseRowDown, { left: downLeft }]}>
              <AppText
                variant="label"
                size="phaseLabel"
                numberOfLines={1}
                ellipsizeMode="clip"
                style={[styles.phaseText, styles.phaseTextRight, { letterSpacing: downSpacing }]}
              >
                {geometry.downLabel}
              </AppText>
            </View>
          </View>

          {/* Weight shift name moved above the track when the names row is too tight. */}
          {shiftAbove ? (
            <View style={styles.nameRow}>
              <View
                style={[
                  styles.shiftNameAboveBox,
                  {
                    left: Math.max(
                      S.paddingX - S.marker / 2,
                      px(geometry.markers[1].x) - widths[shiftName] / 2,
                    ),
                  },
                ]}
              >
                <AppText variant="ui" size="label" numberOfLines={1} style={styles.nameDefault}>
                  {shiftName}
                </AppText>
              </View>
            </View>
          ) : null}

          {/* Bars and markers. */}
          <View style={styles.track} testID="track">
            <Bar left={px(0)} right={px(geometry.splitX)} color={timeline.backswingBar} />
            <Bar left={px(geometry.splitX)} right={px(1)} color={timeline.downswingBar} />
            {/* Gold fill: grows with the playhead over both bars, shrinks on the ease-back. */}
            <Animated.View
              pointerEvents="none"
              testID="fillBar"
              style={[
                styles.markerBase,
                styles.fillBar,
                {
                  left: px(0),
                  width: progress.interpolate({ inputRange: [0, 1], outputRange: [0, px(1) - px(0)] }),
                },
              ]}
            />
            {headVisible ? (
              <Animated.View
                pointerEvents="none"
                testID="playheadLine"
                style={[
                  styles.playheadLine,
                  { left: progress.interpolate({ inputRange: [0, 1], outputRange: [px(0), px(1)] }) },
                ]}
              />
            ) : null}
            {geometry.markers.map((m) =>
              m.type === 'weightShift' ? (
                <React.Fragment key={m.type}>
                  <PulseRing x={px(m.x)} pulse={pulse} />
                  <Diamond
                    x={px(m.x)}
                    fill={lit[m.type] ? timeline.label : bg}
                    lit={lit[m.type]}
                    testID="marker-weightShift"
                  />
                </React.Fragment>
              ) : (
                <Circle
                  key={m.type}
                  x={px(m.x)}
                  fill={lit[m.type] ? timeline.label : bg}
                  lit={lit[m.type]}
                  testID={`marker-${m.type}`}
                />
              ),
            )}
          </View>

          {/* Names under the markers. */}
          <View style={styles.nameRow}>
            {geometry.markers.map((m, i) => {
              const first = i === 0;
              const last = i === geometry.markers.length - 1;
              const x = px(m.x);
              const place = first
                ? { left: x - S.marker / 2, alignItems: 'flex-start' as const }
                : last
                  ? { left: x + S.marker / 2 - S.nameBoxWidth, alignItems: 'flex-end' as const }
                  : { left: x - S.nameBoxWidth / 2, alignItems: 'center' as const };
              const shift = m.type === 'weightShift';
              if (shift && shiftAbove) return null;
              return (
                <View key={m.type} style={[styles.markerNameBox, place]}>
                  <AppText
                    variant="ui"
                    size="label"
                    numberOfLines={1}
                    style={styles.nameDefault}
                  >
                    {shift ? shiftName : NAMES[m.type]}
                  </AppText>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function Bar({ left, right, color }: { left: number; right: number; color: string }) {
  return (
    <View
      style={[
        styles.markerBase,
        styles.bar,
        { left, width: Math.max(0, right - left), backgroundColor: color },
      ]}
    />
  );
}

function Circle({ x, fill, lit, testID }: { x: number; fill: string; lit: boolean; testID: string }) {
  return (
    <View
      testID={testID}
      style={[
        styles.markerBase,
        styles.circle,
        { left: x - S.marker / 2, backgroundColor: fill, transform: [{ scale: lit ? S.litScale : 1 }] },
      ]}
    />
  );
}

/** White ring behind the diamond that scales out and fades as `pulse` goes 0 to 1. */
function PulseRing({ x, pulse }: { x: number; pulse: Animated.Value }) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.markerBase,
        styles.diamondShape,
        styles.pulseRing,
        {
          left: x - S.diamond / 2,
          opacity: pulse.interpolate({ inputRange: [0, 0.01, 1], outputRange: [0, S.pulseOpacity, 0] }),
          transform: [
            { rotate: '45deg' },
            { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, S.pulseScale] }) },
          ],
        },
      ]}
    />
  );
}

function Diamond({ x, fill, lit, testID }: { x: number; fill: string; lit: boolean; testID: string }) {
  return (
    <View
      testID={testID}
      style={[
        styles.markerBase,
        styles.diamondShape,
        {
          left: x - S.diamond / 2,
          backgroundColor: fill,
          transform: [{ rotate: '45deg' }, { scale: lit ? S.litScale : 1 }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  /** Outer rounded box. minHeight and backgroundColor are set inline (layout / mode). */
  timelineContainer: {
    flexGrow: 1,
    borderRadius: radius.chip,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingVertical: S.paddingY,
  },
  /** Grid pattern drawn behind everything. */
  gridSvg: { position: 'absolute', left: 0, top: 0 },
  /** One hidden label copy inside the measuring layer. */
  measureItem: { position: 'absolute', left: 0, top: 0 },
  /** Stack of phase row, optional shift name row, track and names row. */
  timelineContent: { gap: S.phaseGap },
  /** Row holding BACKSWING and DOWNSWING labels. */
  phaseRow: { height: S.phaseHeight },
  /** BACKSWING label box with underline. width is set inline. */
  phaseRowBack: {
    position: 'absolute',
    left: S.paddingX,
    borderBottomWidth: S.phaseUnderline,
    borderBottomColor: timeline.backswingBar,
    paddingBottom: spacing.xs,
  },
  /** DOWNSWING label box with underline. left is set inline. */
  phaseRowDown: {
    position: 'absolute',
    right: S.paddingX,
    borderBottomWidth: S.phaseUnderline,
    borderBottomColor: timeline.downswingBar,
    paddingBottom: spacing.xs,
  },
  /** Phase label text. letterSpacing is overridden inline. */
  phaseText: { color: timeline.label, letterSpacing: S.phaseLetterSpacing },
  /** Right-aligned DOWNSWING text. */
  phaseTextRight: { textAlign: 'right' },
  /** Row for marker names (also the row for the raised weight shift name). */
  nameRow: { height: S.nameHeight },
  /** Raised weight shift name box. left is set inline. */
  shiftNameAboveBox: { position: 'absolute' },
  /** Name box under one marker. left and alignItems are set inline. */
  markerNameBox: { position: 'absolute', width: S.nameBoxWidth },
  nameDefault: { color: timeline.label },
  /** Row holding bars, playhead and markers. */
  track: { height: S.trackHeight },
  /** Moving playhead. left is animated inline. */
  playheadLine: {
    position: 'absolute',
    top: 0,
    height: S.trackHeight,
    width: S.playheadWidth,
    marginLeft: -S.playheadWidth / 2,
    backgroundColor: timeline.label,
  },
  /** Shared by Bar, Circle, Diamond and PulseRing: absolutely positioned on the track. */
  markerBase: { position: 'absolute' },
  /** Bar segment. left, width and backgroundColor are set inline. */
  bar: {
    top: (S.trackHeight - S.barHeight) / 2,
    height: S.barHeight,
    borderRadius: S.barHeight / 2,
  },
  /** Round beat marker. left, fill and scale are set inline. */
  circle: {
    top: (S.trackHeight - S.marker) / 2,
    width: S.marker,
    height: S.marker,
    borderRadius: S.marker / 2,
    borderWidth: S.markerBorder,
    borderColor: timeline.markerOutline,
  },
  /** Weight shift diamond and its pulse ring share this shape. */
  diamondShape: {
    top: (S.trackHeight - S.diamond) / 2,
    width: S.diamond,
    height: S.diamond,
    borderRadius: S.diamondRadius,
    borderWidth: S.markerBorder,
    borderColor: timeline.markerOutline,
  },
  /** Pulse ring colour, overrides the diamond outline. */
  pulseRing: { borderColor: timeline.label },
  /** Gold fill over both bars. left and the animated width are set inline. */
  fillBar: {
    top: (S.trackHeight - S.barHeight) / 2,
    height: S.barHeight,
    borderRadius: S.barHeight / 2,
    backgroundColor: timeline.gold,
  },
});
