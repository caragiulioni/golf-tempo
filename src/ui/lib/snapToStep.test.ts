import { describe, expect, it } from 'vitest';
import { snapToStep } from './snapToStep';

describe('snapToStep (weight shift slider: 0.05 to 0.95, step 0.01)', () => {
  const snap = (v: number) => snapToStep(v, 0.05, 0.95, 0.01);

  it('snaps to the nearest step', () => {
    expect(snap(0.504)).toBe(0.5);
    expect(snap(0.506)).toBe(0.51);
  });
  it('gives clean decimals, no float noise', () => {
    expect(snap(0.07 + 0.01)).toBe(0.08);
    expect(snap(0.1 + 0.2)).toBe(0.3);
  });
  it('clamps to the ends', () => {
    expect(snap(-3)).toBe(0.05);
    expect(snap(0)).toBe(0.05);
    expect(snap(1)).toBe(0.95);
    expect(snap(99)).toBe(0.95);
  });
  it('keeps the exact ends', () => {
    expect(snap(0.05)).toBe(0.05);
    expect(snap(0.95)).toBe(0.95);
  });
  it('NaN gives the minimum', () => {
    expect(snap(Number.NaN)).toBe(0.05);
  });
  it('works with whole-number steps', () => {
    expect(snapToStep(7.4, 0, 10, 1)).toBe(7);
  });
});
