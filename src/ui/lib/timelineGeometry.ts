import { beatTimes, weightShiftTime, type Preset } from '../../engine';

export type TimelineMarkerType = 'beat1' | 'weightShift' | 'beat2' | 'beat3';

export type TimelineMarker = {
  type: TimelineMarkerType;
  /** Seconds from beat 1. */
  t: number;
  /** Position along the bar, 0..1. */
  x: number;
};

export type TimelineGeometry = {
  /** Seconds from beat 1 to beat 3. */
  total: number;
  /** In time order: beat1, weightShift, beat2, beat3. */
  markers: TimelineMarker[];
  /** x of beat 2: backswing | downswing. */
  splitX: number;
  backLabel: string;
  downLabel: string;
};

/**
 * Marker positions for the beat timeline, from the engine's beat times.
 * Returns null when the engine gives no usable beat times.
 */
export function timelineGeometry(
  preset: Preset,
  weightShiftPosition: number,
): TimelineGeometry | null {
  const beats = beatTimes(preset);
  const total = beats.beat3 - beats.beat1;
  if (
    !Number.isFinite(total) ||
    total <= 0 ||
    !Number.isFinite(beats.beat2) ||
    beats.beat2 <= beats.beat1 ||
    beats.beat2 >= beats.beat3
  ) {
    return null;
  }

  const shiftT = weightShiftTime(preset, weightShiftPosition);
  const at = (type: TimelineMarkerType, t: number): TimelineMarker => ({
    type,
    t,
    x: (t - beats.beat1) / total,
  });

  const markers = [
    at('beat1', beats.beat1),
    at('weightShift', shiftT),
    at('beat2', beats.beat2),
    at('beat3', beats.beat3),
  ];

  return {
    total,
    markers,
    splitX: markers[2].x,
    backLabel: `BACKSWING · ${preset.backFrames}`,
    downLabel: `DOWN · ${preset.downFrames}`,
  };
}

/**
 * True when any neighbouring pair of labels (centered on `xs`, in pixels,
 * with pixel `widths`) overlaps or is closer than `minGap`. Input order is free.
 */
export function labelsOverlap(widths: number[], xs: number[], minGap = 4): boolean {
  const boxes = xs
    .map((x, i) => ({ left: x - widths[i] / 2, right: x + widths[i] / 2, x }))
    .sort((a, b) => a.x - b.x);
  for (let i = 1; i < boxes.length; i++) {
    if (boxes[i].left - boxes[i - 1].right < minGap) return true;
  }
  return false;
}

/** Short form of the weight shift label, used when labels would overlap. */
export function weightShiftLabel(overlaps: boolean): 'Weight shift' | 'Shift' {
  return overlaps ? 'Shift' : 'Weight shift';
}
