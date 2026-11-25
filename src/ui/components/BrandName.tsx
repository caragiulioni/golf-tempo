import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { TextStyle } from 'react-native';
import { fontFamily, fonts, introNameStacked } from '../../theme';
import { APP_NAME } from '../brand';

// Handoff .brand b: Michroma, letter-spacing .26em; the second word (the <i>) in accent.
const LETTER_SPACING_EM = 0.26;

type Props = {
  /** Colors are props, not useTheme, so the intro can use this before the provider is ready. */
  textColor: string;
  accentColor: string;
  fontSize: number;
  style?: TextStyle;
  /** Letter spacing in em. Default 0.26 (the handoff's). The phone header uses less, so the longer name fits (V2-24). */
  letterSpacingEm?: number;
  /** Each word on its own line (V2-18, phone intro screen), at the sizes in `introNameStacked`. `fontSize` is then ignored. */
  stacked?: boolean;
};

/** APP_NAME in Michroma: first word in text color, the rest in accent. One word: no split. */
export function BrandName({ textColor, accentColor, fontSize, style, stacked, letterSpacingEm = LETTER_SPACING_EM }: Props) {
  const [first, ...rest] = APP_NAME.toUpperCase().split(' ');
  const base = {
    fontFamily: fontFamily(fonts.brand),
    fontSize,
    letterSpacing: fontSize * letterSpacingEm,
  };
  if (stacked) {
    const line = (size: number): TextStyle => ({
      fontFamily: base.fontFamily,
      fontSize: size,
      letterSpacing: size * introNameStacked.letterSpacingEm,
      lineHeight: size * introNameStacked.lineHeightEm,
    });
    return (
      <View accessible accessibilityRole="header" accessibilityLabel={APP_NAME}>
        <Text numberOfLines={1} style={[styles.text, styles.stackedLine, line(introNameStacked.firstSize), { color: textColor }, style]}>
          {first}
        </Text>
        {rest.length > 0 ? (
          <Text numberOfLines={1} style={[styles.text, styles.stackedLine, line(introNameStacked.restSize), { color: accentColor }, style]}>
            {rest.join(' ')}
          </Text>
        ) : null}
      </View>
    );
  }
  return (
    <Text
      style={[
        styles.text,
        { color: textColor, fontFamily: fontFamily(fonts.brand), fontSize, letterSpacing: fontSize * letterSpacingEm },
        style,
      ]}
    >
      {first}
      {rest.length > 0 ? <Text style={{ color: accentColor }}> {rest.join(' ')}</Text> : null}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { fontWeight: '400' },
  /** Stacked lines are centred on each other. */
  stackedLine: { textAlign: 'center' },
});
