import type { DesignTokens } from "./colors";

/**
 * Applies a theme token set to a root element as CSS custom properties.
 *
 * The property names here mirror the variables consumed by `tailwind.config.ts`
 * and `src/index.css`, so a theme swap updates color, glass, sacred, elevation,
 * gradient, slot, typography and radius tokens in one pass.
 */
export function applyDesignTokens(root: HTMLElement, tokens: DesignTokens): void {
  const entries: Record<string, string> = {
    "--background": tokens.colors.background,
    "--foreground": tokens.colors.foreground,
    "--card": tokens.colors.card,
    "--card-foreground": tokens.colors.cardForeground,
    "--popover": tokens.colors.popover,
    "--popover-foreground": tokens.colors.popoverForeground,
    "--primary": tokens.colors.primary,
    "--primary-foreground": tokens.colors.primaryForeground,
    "--secondary": tokens.colors.secondary,
    "--secondary-foreground": tokens.colors.secondaryForeground,
    "--muted": tokens.colors.muted,
    "--muted-foreground": tokens.colors.mutedForeground,
    "--accent": tokens.colors.accent,
    "--accent-foreground": tokens.colors.accentForeground,
    "--destructive": tokens.colors.destructive,
    "--destructive-foreground": tokens.colors.destructiveForeground,
    "--border": tokens.colors.border,
    "--input": tokens.colors.input,
    "--ring": tokens.colors.ring,
    "--sidebar-background": tokens.colors.sidebarBackground,
    "--sidebar-foreground": tokens.colors.sidebarForeground,
    "--sidebar-primary": tokens.colors.sidebarPrimary,
    "--sidebar-primary-foreground": tokens.colors.sidebarPrimaryForeground,
    "--sidebar-accent": tokens.colors.sidebarAccent,
    "--sidebar-accent-foreground": tokens.colors.sidebarAccentForeground,
    "--sidebar-border": tokens.colors.sidebarBorder,
    "--sidebar-ring": tokens.colors.sidebarRing,
    "--glass-bg": tokens.glass.bg,
    "--glass-border": tokens.glass.border,
    "--glass-highlight": tokens.glass.highlight,
    "--glass-nav-bg": tokens.glass.navBg,
    "--glass-subtle-bg": tokens.glass.subtleBg,
    "--glass-subtle-border": tokens.glass.subtleBorder,
    "--shadow-card-color": tokens.glass.shadowColor,
    "--skeleton-from": tokens.glass.skeletonFrom,
    "--skeleton-via": tokens.glass.skeletonVia,
    "--ambient-opacity": tokens.glass.ambientOpacity,
    "--void": tokens.sacred.void,
    "--void-deep": tokens.sacred.voidDeep,
    "--sunrise": tokens.sacred.sunrise,
    "--golden": tokens.sacred.golden,
    "--golden-soft": tokens.sacred.goldenSoft,
    "--golden-deep": tokens.sacred.goldenDeep,
    "--gold-leaf": tokens.sacred.goldLeaf,
    "--gold-ember": tokens.sacred.goldEmber,
    "--glow-orange": tokens.sacred.glowOrange,
    "--glow-gold": tokens.sacred.glowGold,
    "--shadow-glow": tokens.elevation.shadowGlow,
    "--shadow-glow-strong": tokens.elevation.shadowGlowStrong,
    "--shadow-golden": tokens.elevation.shadowGolden,
    "--shadow-gilt": tokens.elevation.shadowGilt,
    "--shadow-card": tokens.elevation.shadowCard,
    "--shadow-elevated": tokens.elevation.shadowElevated,
    "--gradient-sunrise": tokens.gradients.sunrise,
    "--gradient-void": tokens.gradients.void,
    "--gradient-horizon": tokens.gradients.horizon,
    "--gradient-gold-leaf": tokens.gradients.goldLeaf,
    "--gradient-gilt": tokens.gradients.gilt,
    "--gradient-altar": tokens.gradients.altar,
    "--slot-morning-sky": tokens.slots.morningSky,
    "--slot-midday-sky": tokens.slots.middaySky,
    "--slot-evening-sky": tokens.slots.eveningSky,
    "--slot-night-sky": tokens.slots.nightSky,
    "--slot-morning-accent": tokens.slots.morningAccent,
    "--slot-midday-accent": tokens.slots.middayAccent,
    "--slot-evening-accent": tokens.slots.eveningAccent,
    "--slot-night-accent": tokens.slots.nightAccent,
    "--font-display": tokens.typography.fontDisplay,
    "--font-body": tokens.typography.fontBody,
    "--font-sacred": tokens.typography.fontSacred,
    "--radius": tokens.radius,
  };

  Object.entries(entries).forEach(([key, value]) => {
    if (typeof value === "string" && value.length > 0) {
      root.style.setProperty(key, value);
    }
  });
}
