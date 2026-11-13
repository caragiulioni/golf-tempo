// Design tokens. Ported from _references/DESIGN/tokens.css, amended by
// docs/design-brief.md section 12. No hard-coded values outside this folder.

export type ThemeMode = 'light' | 'dark';
export type Layout = 'phone' | 'tablet' | 'laptop';

export type Colors = {
  bg: string;
  surface: string;
  hero: string;
  border: string;
  text: string;
  text2: string;
  accent: string;
  accentMuted: string;
  onAccent: string;
  gold: string;
  switchKnob: string;
};

export const colors: Record<ThemeMode, Colors> = {
  dark: {
    bg: '#0A0C0A',
    surface: '#1A1F1C',
    hero: '#14201A',
    border: '#2E3731',
    text: '#F0F1EA',
    text2: '#A8B3AB',
    accent: '#8FB78F',
    accentMuted: '#4E6B58',
    onAccent: '#0A0C0A',
    gold: '#E0B84E',
    switchKnob: '#A8B3AB',
  },
  light: {
    bg: '#F4F3EE',
    surface: '#E6E8E1',
    hero: '#DCE6DA',
    border: '#C3C9BD',
    text: '#1B2A21',
    text2: '#455548',
    accent: '#3D5C45',
    accentMuted: '#8FA895',
    onAccent: '#FFFFFF',
    gold: '#8C6A0E',
    switchKnob: '#455548',
  },
};

export const radius = {
  chip: 14,
  card: 28,
  cardTablet: 40,
} as const;

export const tapMin = 44;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// Breakpoints on window width: phone < 700, tablet 700 to 1099, laptop >= 1100.
export const breakpoints = { tablet: 700, laptop: 1100 } as const;

export function layoutForWidth(width: number): Layout {
  if (width >= breakpoints.laptop) return 'laptop';
  if (width >= breakpoints.tablet) return 'tablet';
  return 'phone';
}

export const layoutSizes: Record<Layout, { playButton: number; cardRadius: number }> = {
  phone: { playButton: 96, cardRadius: radius.card },
  tablet: { playButton: 120, cardRadius: radius.cardTablet },
  laptop: { playButton: 128, cardRadius: radius.cardTablet },
};

// Font family names match the keys of @expo-google-fonts/inter and
// @expo-google-fonts/space-grotesk. `system` is the fallback when fonts fail.
export const fonts = {
  ui: 'Inter_400Regular',
  uiMedium: 'Inter_500Medium',
  uiSemiBold: 'Inter_600SemiBold',
  uiBold: 'Inter_700Bold',
  num: 'SpaceGrotesk_500Medium',
  numBold: 'SpaceGrotesk_700Bold',
  system: 'System',
} as const;

export const FONT_FLOOR = 12; // smallest text anywhere
export const PHASE_LABEL_FLOOR = 13; // timeline phase labels

// Sizes are a step above the handoff on phones; tablet and laptop go larger.
export const typeSizes: Record<
  'caption' | 'phaseLabel' | 'label' | 'body' | 'title' | 'tempo' | 'display',
  Record<Layout, number>
> = {
  caption: { phone: 12, tablet: 13, laptop: 13 },
  phaseLabel: { phone: 13, tablet: 13, laptop: 14 },
  label: { phone: 13, tablet: 14, laptop: 14 },
  body: { phone: 16, tablet: 17, laptop: 17 },
  title: { phone: 20, tablet: 22, laptop: 24 },
  tempo: { phone: 40, tablet: 48, laptop: 56 },
  display: { phone: 32, tablet: 40, laptop: 44 },
};

// Timeline tokens. Same in both modes except the container background (R5.9).
//
// Backswing bar #80B38C: contrast on the light container #3D5C45 is 3.11:1
// (8.17:1 on the dark container #0A0C0A). The downswing bar #8FB78F is 3.3:1
// on the light container; the two bars differ mainly by hue/label, not contrast.
export const timeline = {
  containerBg: { light: '#3D5C45', dark: '#0A0C0A' } as Record<ThemeMode, string>,
  gridLine: 'rgba(255, 255, 255, 0.1)',
  gold: '#EEC967',
  label: '#F0F1EA',
  markerOutline: '#A8B3AB',
  downswingBar: '#8FB78F',
  backswingBar: '#80B38C',
} as const;

// For the intro screen, which renders before ThemeProvider is ready.
// Takes the device scheme (useColorScheme() result, may be null/undefined).
export function introColors(
  scheme: 'light' | 'dark' | 'unspecified' | null | undefined,
): Colors {
  return scheme === 'light' ? colors.light : colors.dark;
}
