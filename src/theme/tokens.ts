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

// Card inner padding per layout. Smaller on phones so the hero timeline gets more width.
export const cardPadding: Record<Layout, number> = {
  phone: spacing.md,
  tablet: spacing.xl,
  laptop: spacing.xxl,
};

// Breakpoints on window width: phone < 700, tablet 700 to 1099, laptop >= 1100.
export const breakpoints = { tablet: 700, laptop: 1100 } as const;

export function layoutForWidth(width: number): Layout {
  if (width >= breakpoints.laptop) return 'laptop';
  if (width >= breakpoints.tablet) return 'tablet';
  return 'phone';
}

export const layoutSizes: Record<Layout, { playButton: number; cardRadius: number }> = {
  phone: { playButton: 75, cardRadius: radius.card },
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
  brand: 'Michroma_400Regular', // wordmark text only
  system: 'System',
} as const;

// Set once by App when the bundled fonts fail to load or are too slow (R8.4, R9.7).
// Never reset in a session, so text does not switch fonts back and forth.
let systemFontOnly = false;
export function setSystemFontOnly(): void {
  systemFontOnly = true;
}
/** Resolves a font token to the family to use now: the system font after a font failure. */
export function fontFamily(name: string): string {
  return systemFontOnly ? fonts.system : name;
}
export const FONT_FLOOR = 12; // smallest text anywhere
export const PHASE_LABEL_FLOOR = 12; // timeline phase labels

// Sizes are a step above the handoff on phones; tablet and laptop go larger.
export const typeSizes: Record<
  'caption' | 'phaseLabel' | 'label' | 'body' | 'title' | 'tempo' | 'display' | 'wordmark',
  Record<Layout, number>
> = {
  wordmark: { phone: 12, tablet: 15, laptop: 15 }, // Michroma; handoff is 11, R7.5 floor is 12
  caption: { phone: 12, tablet: 13, laptop: 13 },
  phaseLabel: { phone: 12, tablet: 13, laptop: 14 },
  label: { phone: 13, tablet: 14, laptop: 14 },
  body: { phone: 16, tablet: 17, laptop: 17 },
  title: { phone: 20, tablet: 22, laptop: 24 },
  tempo: { phone: 60, tablet: 120, laptop: 120 },
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

// Timeline measurements (points). Handoff .track/.dot/.diamond/.bar/.names, scaled up a little.
export const timelineSizes = {
  gridSize: 5, // 1px lines every 5px (R5.5)
  gridLineWidth: 1,
  paddingX: 24, // track inset: marker radius plus room so edge markers are not clipped
  paddingY: 16,
  marker: 20, // circle diameter
  diamond: 18, // side of the square before the 45 degree rotation
  diamondRadius: 3,
  markerBorder: 2,
  barHeight: 4,
  trackHeight: 28,
  phaseGap: 8, // between the phase label rows and the track, and between the two phases
  phaseUnderline: 1,
  phaseLetterSpacing: 1.2,
  phaseLetterSpacingMin: 0.2, // tightest phase label spacing before using the short form
  nameMinGap: 6, // smallest gap between neighbouring marker names
  nameGap: 8, // between track and the marker names
  nameBoxWidth: 104, // layout box for a centered marker name
  nameHeight: 20,
  phaseHeight: 24,
  litScale: 1.3, // a lit marker is drawn this much larger (R5.8: at least 1.25)
  playheadWidth: 2,
  pulseMs: 300, // weight shift pulse length (R5.12)
  pulseScale: 2, // the pulse ring grows from 1x to this size while fading out
  pulseOpacity: 0.8, // ring opacity at the start of the pulse
  easeBackMarginMs: 80, // the fill finishes easing back this long before the next beat 1 (R5.4)
  easeBackMinMs: 150, // shortest ease-back, so very short pauses still animate
} as const;

// For the intro screen, which renders before ThemeProvider is ready.
// Takes the device scheme (useColorScheme() result, may be null/undefined).
export function introColors(
  scheme: 'light' | 'dark' | 'unspecified' | null | undefined,
): Colors {
  return scheme === 'light' ? colors.light : colors.dark;
}

// Logo mark gradient stops, from _references/DESIGN/logo/logo-mark-*.svg.
// Brand art, so they are fixed per mode (the mark for dark mode is light, and the reverse).
export const logoGradient: Record<ThemeMode, { offset: number; color: string }[]> = {
  dark: [
    { offset: 0, color: '#C9DEC3' },
    { offset: 0.35, color: '#A5C6A0' },
    { offset: 0.65, color: '#86AE8C' },
    { offset: 1, color: '#5A8668' },
  ],
  light: [
    { offset: 0, color: '#1B2E23' },
    { offset: 0.4, color: '#34523D' },
    { offset: 0.7, color: '#4F7358' },
    { offset: 1, color: '#7BA283' },
  ],
};

// Ratio pill height (R3.9) and the letter spacing for small uppercase labels.
export const badgeHeight: Record<Layout, number> = { phone: 28, tablet: 36, laptop: 36 };
export const labelLetterSpacing = 1.5;

// Shared literal values for borders, focus ring, opacity, icon stroke and the switch.
export const borderWidth = { thin: 1, thick: 2 } as const;
export const focusRing = { width: 2, offset: 2 } as const;
export const opacity = { disabled: 0.5, pressed: 0.85 } as const;
export const iconStrokeWidth = 2.5;
// Handoff .sw: 52 x 32 track, 24 knob, 3 inset, 20 travel.
export const switchSize = {
  trackWidth: 52,
  trackHeight: 32,
  knob: 24,
  inset: 3,
  travel: 20,
  rowHeight: 56,
  rowRadius: 16,
} as const;
// Main screen layout: page max width (handoff .app) and the empty timeline slot height.
export const maxContentWidth = 1440;
export const timelineSlotMinHeight: Record<Layout, number> = { phone: 120, tablet: 160, laptop: 200 };
// Laptop column weights (handoff grid-template-columns: 1.45fr 1fr).
export const laptopColumns = { hero: 1.45, controls: 1 } as const;
