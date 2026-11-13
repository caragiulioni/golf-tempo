// Reuse check: AppText (num/label variants), useLayout, badgeHeight and spacing tokens.
import React from 'react';
import { View } from 'react-native';
import { badgeHeight, borderWidth, spacing, useTheme } from '../../theme';
import { AppText } from './AppText';
import { useLayout } from '../hooks/useLayout';

type Props =
  | { variant: 'tempo'; back: number; down: number }
  | { variant: 'ratio'; text: string };

export function Badge(props: Props) {
  const { colors } = useTheme();
  const { layout } = useLayout();

  if (props.variant === 'tempo') {
    const label = `${props.back} / ${props.down}`;
    return (
      <AppText
        variant="num"
        size="tempo"
        accessibilityLabel={label}
        style={{ fontWeight: '700', includeFontPadding: false }}
        numberOfLines={1}
      >
        {props.back}
        <AppText variant="num" size="tempo" color="accent" style={{ paddingHorizontal: spacing.xs }}>
          {' / '}
        </AppText>
        {props.down}
      </AppText>
    );
  }

  return (
    <View
      style={{
        height: badgeHeight[layout],
        paddingHorizontal: spacing.md,
        borderRadius: badgeHeight[layout] / 2,
        borderWidth: borderWidth.thin,
        borderColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AppText variant="label" size="caption" color="accent" numberOfLines={1}>
        {props.text}
      </AppText>
    </View>
  );
}
