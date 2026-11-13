// Reuse check: AppText (num/label variants), useLayout, badgeHeight and spacing tokens.
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { badgeHeight, borderWidth, spacing, typeSizes, useTheme } from '../../theme';
import { AppText } from './AppText';
import { useLayout } from '../hooks/useLayout';
import { measureStyles } from './measureStyles';

type Props =
  | { variant: 'tempo'; back: number; down: number }
  | { variant: 'ratio'; text: string };

// Tempo numbers shrink only when the space is too small (adjustsFontSizeToFit does not work
// on web). A hidden copy at the full token size gives the natural width; the visible copy
// is scaled down by available / natural.
function TempoText({ back, down, fontSize }: { back: number; down: number; fontSize?: number }) {
  const fs = fontSize === undefined ? undefined : { fontSize };
  return (
    <AppText
      variant="num"
      size="tempo"
      accessibilityLabel={`${back} / ${down}`}
      style={[styles.tempoNumbers, fs]}
      numberOfLines={1}
    >
      {back}
      <AppText variant="num" size="tempo" color="accent" style={[styles.tempoSlash, fs]}>
        {' / '}
      </AppText>
      {down}
    </AppText>
  );
}

function TempoBadge({ back, down }: { back: number; down: number }) {
  const { layout } = useLayout();
  const [avail, setAvail] = useState<number | null>(null);
  const [natural, setNatural] = useState<number | null>(null);
  const base = typeSizes.tempo[layout];
  const scale = avail !== null && natural !== null && natural > avail ? avail / natural : 1;
  return (
    <View
      style={styles.tempoBadge}
      onLayout={(e) => setAvail(Math.floor(e.nativeEvent.layout.width))}
    >
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={measureStyles.measureCopy}
        onLayout={(e) => setNatural(Math.ceil(e.nativeEvent.layout.width))}
      >
        <TempoText back={back} down={down} />
      </View>
      <TempoText back={back} down={down} fontSize={scale < 1 ? Math.floor(base * scale) : undefined} />
    </View>
  );
}

export function Badge(props: Props) {
  const { colors } = useTheme();
  const { layout } = useLayout();

  if (props.variant === 'tempo') {
    return <TempoBadge back={props.back} down={props.down} />;
  }

  return (
    <View
      style={[
        styles.ratioPill,
        { height: badgeHeight[layout], borderRadius: badgeHeight[layout] / 2, borderColor: colors.accent },
      ]}
    >
      <AppText variant="label" size="caption" color="accent" numberOfLines={1}>
        {props.text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  /** Wrapper that measures the room available to the tempo numbers. */
  tempoBadge: { alignSelf: 'stretch' },
  /** The "18 / 6" text. */
  tempoNumbers: { fontWeight: '700', includeFontPadding: false },
  /** The " / " between the numbers. */
  tempoSlash: { paddingHorizontal: spacing.xs },
  /** Outlined pill. height, radius and colour are set inline (layout / theme). */
  ratioPill: {
    paddingHorizontal: spacing.md,
    borderWidth: borderWidth.thin,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
