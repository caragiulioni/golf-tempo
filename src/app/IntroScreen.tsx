import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, useColorScheme } from 'react-native';
import { fontFamily, fonts, introColors, spacing, typeSizes } from '../theme';
import { BrandName, LogoMark } from '../ui/components';
import { TAGLINE } from '../ui/brand';
import { useLayout } from '../ui/hooks/useLayout';

export const INTRO_FADE_MS = 200;
const INTRO_LOGO_SIZE = 96;

type Props = {
  /** Tap on the screen. App decides what it means (R9.5, R9.6). */
  onTap: () => void;
  /** True once the main screen is mounted underneath: fade out, then call onFadeEnd. */
  leaving: boolean;
  onFadeEnd: () => void;
  reduceMotion: boolean;
};

// Renders before ThemeProvider is ready, so colors come from the device scheme
// through introColors and it uses plain Text instead of AppText. No buttons, no audio.
export function IntroScreen({ onTap, leaving, onFadeEnd, reduceMotion }: Props) {
  const scheme = useColorScheme();
  const colors = introColors(scheme);
  const { layout } = useLayout();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!leaving) return;
    if (reduceMotion) {
      onFadeEnd();
      return;
    }
    Animated.timing(opacity, {
      toValue: 0,
      duration: INTRO_FADE_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onFadeEnd();
    });
  }, [leaving, reduceMotion, opacity, onFadeEnd]);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { opacity, backgroundColor: colors.bg }]}
      pointerEvents={leaving ? 'none' : 'auto'}
    >
      <Pressable accessible={false} onPress={onTap} style={styles.fill}>
        <LogoMark mode={scheme === 'light' ? 'light' : 'dark'} size={INTRO_LOGO_SIZE} />
        <BrandName
          textColor={colors.text}
          accentColor={colors.accent}
          fontSize={typeSizes.title[layout]}
          style={styles.name}
        />
        <Text
          style={[
            styles.tagline,
            {
              color: colors.text2,
              fontFamily: fontFamily(fonts.ui),
              fontSize: typeSizes.body[layout],
            },
          ]}
        >
          {TAGLINE}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  name: { textAlign: 'center' },
  tagline: { textAlign: 'center' },
});
