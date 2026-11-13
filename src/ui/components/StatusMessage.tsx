// Reuse check: read AppText and theme tokens. Built on AppText; no existing
// message component. One component serves paused, could-not-start and hint.
import React from 'react';
import { StyleSheet } from 'react-native';
import { AppText } from './AppText';

type Props = {
  /** 'info' is announced to screen readers (alert). 'hint' is quiet, secondary text. */
  variant: 'info' | 'hint';
  text: string;
};

export function StatusMessage({ variant, text }: Props) {
  return (
    <AppText
      accessibilityRole={variant === 'info' ? 'alert' : undefined}
      size={variant === 'info' ? 'body' : 'caption'}
      color={variant === 'info' ? 'text' : 'text2'}
      style={styles.messageText}
    >
      {text}
    </AppText>
  );
}

const styles = StyleSheet.create({
  messageText: { textAlign: 'center' },
});
