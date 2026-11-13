import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../../theme';
import { IconButton } from './IconButton';
import { Wordmark } from './Wordmark';

type Props = {
  onMenuPress: () => void;
  /** Whether the menu is open. Sent to screen readers as expanded state. */
  menuExpanded?: boolean;
};

export function Header({ onMenuPress, menuExpanded }: Props) {
  return (
    <View style={styles.row}>
      <Wordmark />
      <IconButton
        icon="menu"
        onPress={onMenuPress}
        accessibilityLabel="Menu"
        expanded={menuExpanded}
      />
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
