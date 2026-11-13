import React, { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../../theme';
import { IconButton } from './IconButton';
import { Menu } from './Menu';
import { Wordmark } from './Wordmark';

type Props = {
  /** Menu rows. Receives `close` so each item can close the menu after it acts. */
  menu: (close: () => void) => ReactNode;
};

export function Header({ menu }: Props) {
  const [open, setOpen] = useState(false);
  const onOpen = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <View style={styles.row}>
      <Wordmark />
      <Menu
        open={open}
        onOpen={onOpen}
        onClose={close}
        trigger={({ onPress, expanded }) => (
          <IconButton icon="menu" onPress={onPress} accessibilityLabel="Menu" expanded={expanded} />
        )}
      >
        {menu(close)}
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
});
