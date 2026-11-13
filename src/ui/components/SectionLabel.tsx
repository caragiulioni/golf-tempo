// Reuse check: AppText (label variant, text2 color) and theme labelLetterSpacing.
import React from 'react';
import type { TextProps } from 'react-native';
import { labelLetterSpacing } from '../../theme';
import { AppText } from './AppText';

export function SectionLabel({ children, style, ...rest }: TextProps) {
  return (
    <AppText
      variant="label"
      size="label"
      color="text2"
      {...rest}
      style={[{ textTransform: 'uppercase', letterSpacing: labelLetterSpacing }, style]}
    >
      {children}
    </AppText>
  );
}
