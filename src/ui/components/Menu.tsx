import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { ReactNode } from 'react';
import { borderWidth, radius, spacing, useTheme } from '../../theme';
import { Overlay } from './Overlay';

// Minimal shape of the DOM nodes we touch on web. Kept local so no DOM types are needed.
type WebNode = {
  querySelector?: (selector: string) => { focus?: () => void } | null;
};

const IS_WEB = Platform.OS === 'web';
const FOCUSABLE = 'button,[role="button"],[tabindex],a[href]';
const FIRST_ITEM = '[role="menuitem"]';
const MENU_MIN_WIDTH = 200;
const GAP = spacing.xs;

type TriggerArgs = {
  onPress: () => void;
  /** True while the menu is open. Use for the trigger's expanded/collapsed state. */
  expanded: boolean;
};

type MenuProps = {
  open: boolean;
  onClose: () => void;
  /** Called by the trigger's onPress to open the menu. */
  onOpen: () => void;
  /** Renders the button that opens the menu. The menu anchors below it, right-aligned. */
  trigger: (args: TriggerArgs) => ReactNode;
  children: ReactNode;
};

type Anchor = { bottom: number; right: number };

export function Menu({ open, onClose, onOpen, trigger, children }: MenuProps) {
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const triggerRef = useRef<React.ComponentRef<typeof View>>(null);
  const menuRef = useRef<React.ComponentRef<typeof View>>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const wasOpen = useRef(false);

  // Measure the trigger each time the menu opens (and when the window width changes).
  useEffect(() => {
    if (!open) return;
    triggerRef.current?.measureInWindow((x, y, w, h) => {
      setAnchor({ bottom: y + h + GAP, right: Math.max(0, windowWidth - (x + w)) });
    });
  }, [open, windowWidth]);

  // Web focus: first item on open, back to the trigger on close. Native: best effort (none).
  useEffect(() => {
    if (!IS_WEB) {
      wasOpen.current = open;
      return;
    }
    if (open && anchor) {
      const id = setTimeout(() => {
        (menuRef.current as unknown as WebNode | null)?.querySelector?.(FIRST_ITEM)?.focus?.();
      }, 0);
      return () => clearTimeout(id);
    }
    if (!open && wasOpen.current) {
      (triggerRef.current as unknown as WebNode | null)?.querySelector?.(FOCUSABLE)?.focus?.();
    }
    wasOpen.current = open;
  }, [open, anchor]);

  useEffect(() => {
    if (!open) setAnchor(null);
  }, [open]);

  const handleOpen = useCallback(() => onOpen(), [onOpen]);

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        {trigger({ onPress: handleOpen, expanded: open })}
      </View>
      <Overlay visible={open} onClose={onClose}>
        {anchor && (
          <View
            ref={menuRef}
            role="menu"
            style={[
              styles.menu,
              {
                top: anchor.bottom,
                right: anchor.right,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {children}
          </View>
        )}
      </Overlay>
    </>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    minWidth: MENU_MIN_WIDTH,
    borderWidth: borderWidth.thin,
    borderRadius: radius.chip,
    overflow: 'hidden',
  },
});
