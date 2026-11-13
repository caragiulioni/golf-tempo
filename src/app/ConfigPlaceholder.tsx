// Reuse check: IconButton (icon 'back'), AppText, theme tokens. Nothing new.
// Replaced by config-mode in spec 5.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { maxContentWidth, spacing, useTheme } from '../theme';
import { AppText, IconButton } from '../ui/components';

export function ConfigPlaceholder({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.page}>
        <View style={styles.titleRow}>
          <IconButton icon="back" onPress={onBack} accessibilityLabel="Back" />
          <AppText variant="brand" size="title" accessibilityRole="header">
            Config
          </AppText>
        </View>
        <AppText color="text2">Config arrives in a later step.</AppText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /** Whole screen. backgroundColor is set inline (theme). */
  screen: { flex: 1 },
  /** Centred, width-limited column. */
  page: {
    width: '100%',
    maxWidth: maxContentWidth,
    alignSelf: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  /** Back button and "Config" title. */
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
