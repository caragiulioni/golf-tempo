/** Decimal places in `step`, so snapped values print cleanly (0.01 gives 2). */
function decimalsOf(step: number): number {
  const text = String(step);
  const dot = text.indexOf('.');
  return dot === -1 ? 0 : text.length - dot - 1;
}

/** Snaps to the nearest step counted from `min`, and keeps the result inside min..max. */
export function snapToStep(raw: number, min: number, max: number, step: number): number {
  if (Number.isNaN(raw)) return min;
  const clamped = Math.min(max, Math.max(min, raw));
  const snapped = min + Math.round((clamped - min) / step) * step;
  return Number(Math.min(max, snapped).toFixed(decimalsOf(step)));
}
