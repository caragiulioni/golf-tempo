// Reuse check: listed src/ui/components (no slider, no draggable control) and src/theme.
// Reuses colors (border, accent, surface), borderWidth, tapMin, spacing, useFocusRing.
// Created: Slider. Added token: sliderSize (track height, thumb size).
//
// Built from View and PanResponder (no dependency). Controlled: the parent keeps `value`.
// onChange fires on every move; onChangeEnd fires once on release, on every key press and on
// every screen reader adjustment. Use onChangeEnd for anything expensive (like restarting audio).
import React, { useCallback, useRef, useState } from 'react';
import {
  PanResponder,
  Platform,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';
import { borderWidth, opacity, sliderSize, tapMin, useTheme } from '../../theme';
import { useFocusRing } from '../hooks/useFocusRing';
import { snapToStep } from '../lib/snapToStep';

type Props = {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  onChangeEnd: (value: number) => void;
  /** Required: names the control for screen readers. */
  accessibilityLabel: string;
  /** Spoken value, for example "53 percent". Defaults to the number. */
  valueText?: string;
  disabled?: boolean;
};

/** Number of steps a Page Up / Page Down key moves. */
const PAGE_STEPS = 10;

export function Slider({
  value,
  min,
  max,
  step,
  onChange,
  onChangeEnd,
  accessibilityLabel,
  valueText,
  disabled,
}: Props) {
  const { colors } = useTheme();
  const { onFocus, onBlur, ringStyle } = useFocusRing();
  const [width, setWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const boxRef = useRef<React.ComponentRef<typeof View>>(null);
  // Left edge of the control in window coordinates, measured when a touch starts.
  const leftRef = useRef(0);
  // False between touch start and the first measurement, so early moves are not misread.
  const measuredRef = useRef(false);
  // Latest value, so the release handler never reads a stale prop.
  const latest = useRef(value);
  latest.current = value;
  // Handlers read the latest props through a ref, because PanResponder is created once.
  const propsRef = useRef({ min, max, step, width, onChange, onChangeEnd, disabled });
  propsRef.current = { min, max, step, width, onChange, onChangeEnd, disabled };

  const travel = Math.max(1, width - sliderSize.thumb);
  const fraction = max > min ? (Math.min(max, Math.max(min, value)) - min) / (max - min) : 0;
  const thumbX = fraction * travel;

  const valueAt = useCallback((pageX: number) => {
    const p = propsRef.current;
    const span = Math.max(1, p.width - sliderSize.thumb);
    const f = (pageX - leftRef.current - sliderSize.thumb / 2) / span;
    return snapToStep(p.min + f * (p.max - p.min), p.min, p.max, p.step);
  }, []);

  const move = useCallback(
    (e: GestureResponderEvent) => {
      if (!measuredRef.current) return;
      const next = valueAt(e.nativeEvent.pageX);
      if (next === latest.current) return;
      latest.current = next;
      propsRef.current.onChange(next);
    },
    [valueAt],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !propsRef.current.disabled,
      onMoveShouldSetPanResponder: () => !propsRef.current.disabled,
      // Keep the drag once it starts: a parent ScrollView must not steal it.
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        const pageX = e.nativeEvent.pageX;
        setDragging(true);
        measuredRef.current = false;
        boxRef.current?.measureInWindow((x) => {
          leftRef.current = x;
          measuredRef.current = true;
          // The first touch jumps the thumb to the finger (a tap on the track works).
          const next = valueAt(pageX);
          if (next !== latest.current) {
            latest.current = next;
            propsRef.current.onChange(next);
          }
        });
      },
      onPanResponderMove: (e) => move(e),
      onPanResponderRelease: () => {
        setDragging(false);
        propsRef.current.onChangeEnd(latest.current);
      },
      onPanResponderTerminate: () => {
        setDragging(false);
        propsRef.current.onChangeEnd(latest.current);
      },
    }),
  ).current;

  /** One step or more up or down (keyboard and screen reader). Counts as a release. */
  const nudge = useCallback((steps: number) => {
    const p = propsRef.current;
    if (p.disabled) return;
    const next = snapToStep(latest.current + steps * p.step, p.min, p.max, p.step);
    if (next === latest.current) return;
    latest.current = next;
    p.onChange(next);
    p.onChangeEnd(next);
  }, []);

  const jumpTo = useCallback((target: number) => {
    const p = propsRef.current;
    if (p.disabled || target === latest.current) return;
    latest.current = target;
    p.onChange(target);
    p.onChangeEnd(target);
  }, []);

  // Web keyboard. Keys are ignored when the slider is disabled.
  const onKeyDown = (e: { key?: string; preventDefault?: () => void }) => {
    const p = propsRef.current;
    let handled = true;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        nudge(1);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        nudge(-1);
        break;
      case 'PageUp':
        nudge(PAGE_STEPS);
        break;
      case 'PageDown':
        nudge(-PAGE_STEPS);
        break;
      case 'Home':
        jumpTo(p.min);
        break;
      case 'End':
        jumpTo(p.max);
        break;
      default:
        handled = false;
    }
    if (handled) e.preventDefault?.();
  };

  // Props React Native's View types do not list but React Native Web passes to the page.
  const webProps = (Platform.OS === 'web'
    ? { onKeyDown, onFocus, onBlur }
    : {}) as object;

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View
      ref={boxRef}
      accessible
      focusable={!disabled}
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'increment') nudge(1);
        if (e.nativeEvent.actionName === 'decrement') nudge(-1);
      }}
      onLayout={onLayout}
      style={[styles.touchArea, webTouchAction, ringStyle(colors.accent), disabled && styles.disabled]}
      {...webProps}
      {...panResponder.panHandlers}
    >
      <View
        pointerEvents="none"
        style={[
          styles.track,
          { backgroundColor: colors.border, left: sliderSize.thumb / 2, right: sliderSize.thumb / 2 },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.track,
          { backgroundColor: colors.accent, left: sliderSize.thumb / 2, width: thumbX },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.thumb,
          {
            backgroundColor: colors.accent,
            borderColor: dragging ? colors.text : colors.surface,
            transform: [{ translateX: thumbX }],
          },
        ]}
      />
    </View>
  );
}

// Lets the page scroll up and down from the slider, while sideways drags belong to it (web).
const webTouchAction = (Platform.OS === 'web' ? { touchAction: 'pan-y' } : undefined) as
  | ViewStyle
  | undefined;

const styles = StyleSheet.create({
  /** The whole control: tapMin tall so a thumb is easy to hit. */
  touchArea: {
    height: tapMin,
    width: '100%',
  },
  /** Grey track and the accent part up to the thumb share this. left and width/right are set inline. */
  track: {
    position: 'absolute',
    top: (tapMin - sliderSize.trackHeight) / 2,
    height: sliderSize.trackHeight,
    borderRadius: sliderSize.trackHeight / 2,
  },
  /** The round handle. translateX is set inline. */
  thumb: {
    position: 'absolute',
    top: (tapMin - sliderSize.thumb) / 2,
    left: 0,
    width: sliderSize.thumb,
    height: sliderSize.thumb,
    borderRadius: sliderSize.thumb / 2,
    borderWidth: borderWidth.thick,
  },
  disabled: { opacity: opacity.disabled },
});
