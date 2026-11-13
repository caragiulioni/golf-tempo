// Reuse check: layout only, no text or color of its own. Spacing tokens only.
import React from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../../theme';

type Props<T> = {
  items: ReadonlyArray<T>;
  /** 5 for Long Game, 3 for Short Game. Extra items wrap into new rows. */
  columns: 3 | 5;
  keyOf: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  accessibilityLabel?: string;
};

export function PresetGrid<T>({ items, columns, keyOf, renderItem, accessibilityLabel }: Props<T>) {
  // Gap is made from padding on each cell, so percentage widths always add up to 100%.
  const half = (columns >= 5 ? spacing.xs : spacing.sm) / 2;
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.grid, { margin: -half }]}
    >
      {items.map((item) => (
        <View
          key={keyOf(item)}
          style={{ flexBasis: `${100 / columns}%`, maxWidth: `${100 / columns}%`, padding: half }}
        >
          {renderItem(item)}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
