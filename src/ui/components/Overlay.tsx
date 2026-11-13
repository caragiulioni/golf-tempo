// Extracted from Menu.tsx (spec 5, Wave 5.3) so the confirm dialog can share it. Behavior unchanged.
import React, { useEffect } from 'react';
import { Modal, Platform, Pressable, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';

const IS_WEB = Platform.OS === 'web';

/**
 * Full-screen overlay: transparent backdrop that closes on outside tap,
 * Escape on web, and the Android back button (via onRequestClose).
 * Shared by Menu and ConfirmDialog.
 */
export function Overlay({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!IS_WEB || !visible) return;
    const doc = (globalThis as { document?: { addEventListener: Function; removeEventListener: Function } })
      .document;
    if (!doc) return;
    const onKeyDown = (e: { key?: string }) => {
      if (e.key === 'Escape') onClose();
    };
    doc.addEventListener('keydown', onKeyDown);
    return () => doc.removeEventListener('keydown', onKeyDown);
  }, [visible, onClose]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        accessible={false}
        importantForAccessibility="no"
      />
      {children}
    </Modal>
  );
}
