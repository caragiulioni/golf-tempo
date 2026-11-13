/*
 * TEMPORARY MOUNT POINT: CONFIG mode, removed in spec 6.
 * This is the ONLY file outside src/config-mode/ that may import it. Nothing else depends on it:
 * the rest of the app receives plain WeightShiftSettings.
 */
import React from 'react';
import type { Category } from '../engine';
import { ConfigScreen } from '../config-mode/ConfigScreen';
import type { AppliedSettingsApi } from '../config-mode/useAppliedSettings';

export { useAppliedSettings } from '../config-mode/useAppliedSettings';
export type { AppliedSettingsApi } from '../config-mode/useAppliedSettings';

type Props = {
  category: Category;
  presetByCategory: Record<Category, number>;
  applied: AppliedSettingsApi;
  onBack: () => void;
};

export function ConfigMount({ category, presetByCategory, applied, onBack }: Props) {
  return (
    <ConfigScreen
      initialCategory={category}
      initialPresetIndex={presetByCategory}
      applied={applied.state}
      onBack={onBack}
    />
  );
}
