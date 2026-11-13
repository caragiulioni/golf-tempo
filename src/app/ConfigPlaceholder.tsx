// Reuse check: IconButton (icon 'back'), AppText, theme tokens. Nothing new.
// Replaced by config-mode in spec 5.
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { maxContentWidth, spacing, useTheme } from '../theme';
import { AppText, IconButton } from '../ui/components';

export function ConfigPlaceholder({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        style={{
          width: '100%',
          maxWidth: maxContentWidth,
          alignSelf: 'center',
          padding: spacing.lg,
          gap: spacing.lg,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
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
