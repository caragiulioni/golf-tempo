// Builds the EXPORT text. Pure. It takes the applied (saved) state only, so an unapplied
// slider position cannot end up in it.
import type { AppliedState } from './appliedSettings';

export const EXPORT_VERSION = 1;

/**
 * JSON text to send back to the developer.
 * `device` is the browser's user agent on web, left out elsewhere.
 * `applied` false means the value is still the default, not a choice.
 */
export function buildExportText(state: AppliedState, now: Date, device?: string): string {
  const data: Record<string, unknown> = {
    configVersion: EXPORT_VERSION,
    exportedAt: now.toISOString(),
  };
  if (device) data.device = device;
  data.longGame = { weightShiftPosition: state.settings.long, applied: state.applied.long };
  data.shortGame = { weightShiftPosition: state.settings.short, applied: state.applied.short };
  return JSON.stringify(data, null, 2);
}
