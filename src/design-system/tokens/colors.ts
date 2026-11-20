export type ThemeName = "gold";
export type ThemeMode = "dark" | "light";

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface ThemeColorTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
}

export interface GlassTokens {
  bg: string;
  border: string;
  highlight: string;
  navBg: string;
  subtleBg: string;
  subtleBorder: string;
  shadowColor: string;
  skeletonFrom: string;
  skeletonVia: string;
  ambientOpacity: string;
}

export interface SlotTokens {
  morningSky: string;
  middaySky: string;
  eveningSky: string;
  nightSky: string;
  morningAccent: string;
  middayAccent: string;
  eveningAccent: string;
  nightAccent: string;
}

export interface SacredTokens {
  void: string;
  voidDeep: string;
  sunrise: string;
  golden: string;
  goldenSoft: string;
  goldenDeep: string;
  goldLeaf: string;
  goldEmber: string;
  glowOrange: string;
  glowGold: string;
}

export interface ElevationTokens {
  shadowGlow: string;
  shadowGlowStrong: string;
  shadowGolden: string;
  shadowGilt: string;
  shadowCard: string;
  shadowElevated: string;
}

export interface GradientTokens {
  sunrise: string;
  void: string;
  horizon: string;
  goldLeaf: string;
  gilt: string;
  altar: string;
}

export interface TypographyTokens {
  fontDisplay: string;
  fontBody: string;
  fontSacred: string;
  display2xl: { size: string; lineHeight: string; letterSpacing: string; fontWeight: string };
  displayXl: { size: string; lineHeight: string; letterSpacing: string; fontWeight: string };
  displayLg: { size: string; lineHeight: string; letterSpacing: string; fontWeight: string };
  displayMd: { size: string; lineHeight: string; letterSpacing: string; fontWeight: string };
  displaySm: { size: string; lineHeight: string; letterSpacing: string; fontWeight: string };
  eyebrow: { size: string; lineHeight: string; letterSpacing: string; fontWeight: string };
}

export interface SpacingTokens {
  sectionSm: string;
  section: string;
  sectionLg: string;
  sectionXl: string;
  gutter: string;
  gutterLg: string;
}

export interface MotionTokens {
  easeOut: string;
  easeInOut: string;
  spring: string;
  durationFast: string;
  durationNormal: string;
  durationSlow: string;
  durationBreath: string;
}

export interface DesignTokens {
  colors: ThemeColorTokens;
  glass: GlassTokens;
  slots: SlotTokens;
  sacred: SacredTokens;
  elevation: ElevationTokens;
  gradients: GradientTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  motion: MotionTokens;
  radius: string;
}

export interface ThemeTokens {
  label: string;
  emoji: string;
  color: string;
  dark: DesignTokens;
  light: DesignTokens;
}

export const THEME_METADATA: Record<ThemeName, { label: string; emoji: string; color: string }> = {
  gold: { label: "Gold", emoji: "✨", color: "hsl(40, 90%, 61%)" },
};
