// Reuse check: IconButton (icon 'back'), AppText, theme tokens. Nothing new.
// Replaced by config-mode in spec 5.
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { maxContentWidth, spacing, useTheme } from '../theme';
import { AppText, Button, ConfirmDialog, IconButton, Slider } from '../ui/components';

export function ConfigPlaceholder({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  // TEMPORARY DEMO (spec 5, Wave 5.3). Deleted with this file in Wave 5.4.
  const [demo, setDemo] = useState(0.5);
  const [changes, setChanges] = useState(0);
  const [ends, setEnds] = useState(0);
  const [dialog, setDialog] = useState(false);
  const [answer, setAnswer] = useState('none yet');
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.page}>
        <View style={styles.titleRow}>
          <IconButton icon="back" onPress={onBack} accessibilityLabel="Back" />
          <AppText variant="brand" size="title" accessibilityRole="header">
            Config
          </AppText>
        </View>
        <AppText color="text2">Config arrives in a later step.</AppText>
        {/* TEMPORARY DEMO: Slider check. */}
        <AppText>Slider demo: {Math.round(demo * 100)} % ({demo})</AppText>
        <Slider
          value={demo}
          min={0.05}
          max={0.95}
          step={0.01}
          onChange={(v) => {
            setDemo(v);
            setChanges((n) => n + 1);
          }}
          onChangeEnd={() => setEnds((n) => n + 1)}
          accessibilityLabel="Weight shift position"
          valueText={`${Math.round(demo * 100)} percent`}
        />
        <AppText color="text2">
          onChange calls: {changes}. onChangeEnd calls (releases): {ends}.
        </AppText>
        <View style={styles.demoRow}>
          <IconButton icon="minus" onPress={() => setDemo((v) => Math.max(0.05, Number((v - 0.01).toFixed(2))))} accessibilityLabel="Earlier by one step" />
          <IconButton icon="plus" onPress={() => setDemo((v) => Math.min(0.95, Number((v + 0.01).toFixed(2))))} accessibilityLabel="Later by one step" />
        </View>
        <View style={styles.demoRow}>
          <Button label="Apply" variant="primary" onPress={() => setAnswer('Apply pressed')} />
          <Button label="Reset" onPress={() => setAnswer('Reset pressed')} />
          <Button label="Disabled" variant="primary" disabled onPress={() => setAnswer('BUG: disabled pressed')} />
        </View>
        <Button label="Show dialog" onPress={() => setDialog(true)} />
        <AppText color="text2">Last action: {answer}</AppText>
        <ConfirmDialog
          visible={dialog}
          title="You have changes you haven't applied. Leave without applying?"
          confirmLabel="Yes"
          cancelLabel="No"
          onConfirm={() => {
            setDialog(false);
            setAnswer('Yes');
          }}
          onCancel={() => {
            setDialog(false);
            setAnswer('No');
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /** Whole screen. backgroundColor is set inline (theme). */
  screen: { flex: 1 },
  /** Centred, width-limited column. */
  page: {
    width: '100%',
    maxWidth: maxContentWidth,
    alignSelf: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  /** Back button and "Config" title. */
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  /** TEMPORARY DEMO row. */
  demoRow: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
});
