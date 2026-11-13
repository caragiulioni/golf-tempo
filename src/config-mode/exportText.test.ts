import { describe, expect, it } from 'vitest';
import { DEFAULT_WEIGHT_SHIFT_POSITIONS } from '../engine';
import { emptyApplied, withApplied } from './appliedSettings';
import { EXPORT_VERSION, buildExportText } from './exportText';

const NOW = new Date('2026-11-14T10:30:00.000Z');

describe('buildExportText', () => {
  it('is valid JSON with version, time and both categories', () => {
    const data = JSON.parse(buildExportText(emptyApplied(), NOW));
    expect(data.configVersion).toBe(EXPORT_VERSION);
    expect(data.exportedAt).toBe('2026-11-14T10:30:00.000Z');
    expect(Object.keys(data)).toEqual(
      expect.arrayContaining(['configVersion', 'exportedAt', 'longGame', 'shortGame']),
    );
  });

  it('a never-applied category shows the default with applied false', () => {
    const data = JSON.parse(buildExportText(emptyApplied(), NOW));
    expect(data.longGame).toEqual({
      weightShiftPosition: DEFAULT_WEIGHT_SHIFT_POSITIONS.long,
      applied: false,
    });
    expect(data.shortGame).toEqual({
      weightShiftPosition: DEFAULT_WEIGHT_SHIFT_POSITIONS.short,
      applied: false,
    });
  });

  it('applied values come out with applied true, per category', () => {
    const state = withApplied(emptyApplied(), 'long', 0.53);
    const data = JSON.parse(buildExportText(state, NOW));
    expect(data.longGame).toEqual({ weightShiftPosition: 0.53, applied: true });
    expect(data.shortGame.applied).toBe(false);
  });

  it('includes device only when given', () => {
    expect(JSON.parse(buildExportText(emptyApplied(), NOW)).device).toBeUndefined();
    expect(JSON.parse(buildExportText(emptyApplied(), NOW, '')).device).toBeUndefined();
    expect(JSON.parse(buildExportText(emptyApplied(), NOW, 'Pixel 6 Chrome')).device).toBe(
      'Pixel 6 Chrome',
    );
  });

  it('is readable text, not one long line', () => {
    expect(buildExportText(emptyApplied(), NOW).split('\n').length).toBeGreaterThan(5);
  });
});
