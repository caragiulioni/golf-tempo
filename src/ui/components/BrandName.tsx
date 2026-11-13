import React from 'react';
import { StyleSheet, Text } from 'react-native';
import type { TextStyle } from 'react-native';
import { fontFamily, fonts } from '../../theme';
import { APP_NAME } from '../brand';

// Handoff .brand b: Michroma, letter-spacing .26em; the second word (the <i>) in accent.
const LETTER_SPACING_EM = 0.26;

type Props = {
  /** Colors are props, not useTheme, so the intro can use this before the provider is ready. */
  textColor: string;
  accentColor: string;
  fontSize: number;
  style?: TextStyle;
};

/** APP_NAME in Michroma: first word in text color, the rest in accent. One word: no split. */
export function BrandName({ textColor, accentColor, fontSize, style }: Props) {
  const [first, ...rest] = APP_NAME.toUpperCase().split(' ');
  return (
    <Text
      style={[
        styles.text,
        { color: textColor, fontFamily: fontFamily(fonts.brand), fontSize, letterSpacing: fontSize * LETTER_SPACING_EM },
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
});
