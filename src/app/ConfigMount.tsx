/*
 * TEMPORARY MOUNT POINT: CONFIG mode, removed in spec 6.
 * This is the ONLY file outside src/config-mode/ that may import it. Nothing else depends on it:
 * the rest of the app receives plain WeightShiftSettings.
 */
export { useAppliedSettings } from '../config-mode/useAppliedSettings';
export type { AppliedSettingsApi } from '../config-mode/useAppliedSettings';
