// Reuse check: listed src/ui/components and src/theme. Reuses Overlay (extracted from Menu),
// Button, AppText, theme colors, radius, spacing, borderWidth.
// Created: ConfirmDialog. Added tokens: scrim, dialogMaxWidth.
import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { borderWidth, dialogMaxWidth, radius, scrim, spacing, useTheme } from '../../theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Overlay } from './Overlay';

type Props = {
  visible: boolean;
  title: string;
  confirmLabel: string;
  cancelLabel: string;
  /** The user chose the confirm button. */
  onConfirm: () => void;
  /** The cancel button, outside tap, Escape or the system back button. */
  onCancel: () => void;
};

// Minimal shape of the DOM node we touch on web (same idea as Menu).
type WebNode = {
  querySelector?: (selector: string) => { focus?: () => void } | null;
};

export function ConfirmDialog({ visible, title, confirmLabel, cancelLabel, onConfirm, onCancel }: Props) {
  const { colors } = useTheme();
  const cardRef = useRef<React.ComponentRef<typeof View>>(null);

  // Web: move focus to the first button (the cancel button, the safe choice) when it opens.
  // The modal returns focus to what had it before when it closes.
  useEffect(() => {
    if (Platform.OS !== 'web' || !visible) return;
    const id = setTimeout(() => {
      (cardRef.current as unknown as WebNode | null)?.querySelector?.('[role="button"],button')?.focus?.();
    }, 0);
    return () => clearTimeout(id);
  }, [visible]);

  return (
    <Overlay visible={visible} onClose={onCancel}>
      <View style={[StyleSheet.absoluteFill, styles.dim]} pointerEvents="none" />
      <View style={styles.center} pointerEvents="box-none">
        <View
          ref={cardRef}
          role="alertdialog"
          aria-modal
          aria-label={title}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <AppText variant="label" size="body" accessibilityRole="header">
            {title}
          </AppText>
          <View style={styles.buttons}>
            <View style={styles.buttonBox}>
              <Button label={cancelLabel} onPress={onCancel} />
            </View>
            <View style={styles.buttonBox}>
              <Button label={confirmLabel} onPress={onConfirm} variant="primary" />
            </View>
          </View>
        </View>
      </View>
    </Overlay>
  );
}

const styles = StyleSheet.create({
  /** Dims the page behind the dialog. */
  dim: { backgroundColor: scrim },
  /** Centres the card. Taps outside the card fall through to the Overlay backdrop. */
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: {
    width: '100%',
    maxWidth: dialogMaxWidth,
    borderWidth: borderWidth.thin,
    borderRadius: radius.card,
    padding: spacing.xl,
    gap: spacing.xl,
  },
  /** Cancel then confirm, side by side, equal width. */
  buttons: { flexDirection: 'row', gap: spacing.md },
  buttonBox: { flex: 1 },
});
