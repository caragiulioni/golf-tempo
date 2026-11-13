import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { logoGradient, spacing, useTheme } from '../../theme';
import type { ThemeMode } from '../../theme';
import { APP_NAME } from '../brand';
import { AppText } from './AppText';

// Mark outline, shared by both modes. From _references/DESIGN/logo/logo-mark-*.svg (512 x 512).
const MARK_PATH =
  'M399.7,56.9C375.1,53.1 338.6,62.1 314.7,69.1C241.3,90.4 171.9,133.4 116.4,185.5C97.4,203.3 75.1,225.6 63.5,249.2C58.3,259.7 54.1,274.0 62.9,283.9C68.9,290.7 78.9,292.5 87.5,293.0C106.9,294.0 126.1,289.1 144.6,283.7C157.4,280.0 170.0,275.4 182.7,271.1C215.0,260.4 247.8,250.2 281.4,244.8C300.9,241.7 327.2,238.4 345.9,246.1C361.6,252.5 362.7,266.9 356.5,280.9C347.0,302.0 326.1,323.5 309.7,339.5C259.4,388.8 197.5,427.1 129.3,445.7C116.0,449.2 102.4,451.5 88.7,452.5C81.1,453.0 73.3,452.6 65.9,454.3C88.2,459.7 132.5,451.5 155.6,446.7C240.8,429.0 320.9,386.9 386.4,330.0C407.0,312.1 431.2,288.2 445.8,265.2C452.8,254.2 458.1,238.9 450.6,226.8C437.3,205.2 394.5,206.7 372.5,208.9C326.4,213.6 281.4,226.4 235.9,235.0C220.1,237.9 182.5,243.0 168.0,237.3C156.3,232.8 157.9,220.7 162.0,211.2C170.5,191.9 184.7,174.7 199.1,159.5C237.1,119.7 283.2,85.5 336.1,68.9C349.4,64.7 363.3,61.9 377.2,60.1C384.6,59.1 392.3,58.6 399.7,56.9Z';

const MARK_SIZE = 32;
const WORDMARK_LETTER_SPACING = 2;

type LogoMarkProps = {
  /** Which mark to draw. A prop (not useTheme) so the intro can use it before the provider is ready. */
  mode: ThemeMode;
  size?: number;
};

export function LogoMark({ mode, size = MARK_SIZE }: LogoMarkProps) {
  const gradientId = `logo-gradient-${mode}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" accessible={false}>
      <Defs>
        <LinearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="120" y1="90" x2="400" y2="430">
          {logoGradient[mode].map((stop) => (
            <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
          ))}
        </LinearGradient>
      </Defs>
      <Path d={MARK_PATH} fill={`url(#${gradientId})`} />
    </Svg>
  );
}

export function Wordmark() {
  const { mode } = useTheme();
  return (
    <View style={styles.row} accessible accessibilityRole="header" accessibilityLabel={APP_NAME}>
      <LogoMark mode={mode} />
      <AppText variant="brand" style={styles.text}>
        {APP_NAME.toUpperCase()}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  text: { letterSpacing: WORDMARK_LETTER_SPACING },
});
