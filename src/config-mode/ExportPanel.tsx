// Reuse check: Card, SectionLabel, Button, AppText, StatusMessage, theme colors, radius, spacing.
// Nothing new is created.
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { borderWidth, radius, spacing, useTheme } from '../theme';
import { AppText, Button, Card, SectionLabel, StatusMessage } from '../ui/components';
import type { AppliedState } from './appliedSettings';
import { buildExportText } from './exportText';
import { copyToClipboard, deviceUserAgent } from './exportDevice';

const COPIED_TEXT = 'Copied. Paste it into a message to send it.';
const COPY_FAILED_TEXT = 'Could not copy automatically. Press and hold the text above, select it and copy it.';
const UNAPPLIED_NOTE =
  'EXPORT sends your saved values only. Slider changes you have not applied are not included.';

type Props = {
  /** The saved values. Never the slider positions. */
  applied: AppliedState;
  /** True when either category has slider changes that are not applied. */
  hasUnapplied: boolean;
  /** Called after the export text or a copy message appears, so the screen can scroll it into view. */
  onRevealed?: () => void;
};

export function ExportPanel({ applied, hasUnapplied, onRevealed }: Props) {
  const { colors } = useTheme();
  const [exportedAt, setExportedAt] = useState<Date | null>(null);
  const [copyStatus, setCopyStatus] = useState<'none' | 'copied' | 'failed'>('none');

  // A new APPLY changes what would be exported, so the old text goes away.
  useEffect(() => {
    setExportedAt(null);
    setCopyStatus('none');
  }, [applied]);

  // The export appears below the button, often off screen. Tell the screen to scroll down to it.
  // The copy message appears below the Copy button, so it asks again.
  useEffect(() => {
    if (!exportedAt && copyStatus === 'none') return;
    onRevealed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportedAt, copyStatus]);

  const text = exportedAt ? buildExportText(applied, exportedAt, deviceUserAgent()) : null;

  const copy = async () => {
    if (!text) return;
    setCopyStatus((await copyToClipboard(text)) ? 'copied' : 'failed');
  };

  return (
    <Card accessibilityLabel="Export" style={styles.card}>
      <SectionLabel>Export</SectionLabel>
      <Button
        label="EXPORT"
        onPress={() => {
          setExportedAt(new Date());
          setCopyStatus('none');
        }}
        accessibilityLabel="Export saved values"
      />
      {hasUnapplied ? <AppText size="caption" color="text2">{UNAPPLIED_NOTE}</AppText> : null}
      {text ? (
        <>
          <View style={[styles.textBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <AppText size="caption" selectable accessibilityLabel="Export text">
              {text}
            </AppText>
          </View>
          <Button label="Copy" variant="primary" onPress={copy} accessibilityLabel="Copy export text" />
          {copyStatus === 'copied' ? <StatusMessage variant="hint" text={COPIED_TEXT} /> : null}
          {copyStatus === 'failed' ? <StatusMessage variant="info" text={COPY_FAILED_TEXT} /> : null}
        </>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  /** The selectable JSON. Colors are set inline (theme). */
  textBox: {
    borderWidth: borderWidth.thin,
    borderRadius: radius.chip,
    padding: spacing.md,
  },
});
