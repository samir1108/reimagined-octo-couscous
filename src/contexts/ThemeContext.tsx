import { createContext, useContext, useState, useLayoutEffect, ReactNode } from "react";
import type { ThemeName, ThemeMode, DesignTokens } from "@/design-system/tokens/colors";
import { THEME_TOKEN_MAP, LANDING_DARK_TOKENS } from "@/design-system/tokens/values";
import { THEME_METADATA } from "@/design-system/tokens/colors";

export interface ThemeContextType {
  theme: ThemeName;
  mode: ThemeMode;
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: ThemeMode) => void;
  forcedOverride: boolean;
  setForcedOverride: (v: boolean) => void;
  syncFromProfile: (dbTheme: string) => void;
  tokens: DesignTokens;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const MIGRATION_MAP: Record<string, ThemeName> = {
  sunrise: "gold",
  midnight: "gold",
  ocean: "gold",
  aurora: "gold",
  obsidian: "gold",
  abyss: "gold",
  sakura: "gold",
  terra: "gold",
  nebula: "gold",
  cosmic: "gold",
  sacred: "gold",
  zen: "gold",
  minimal: "gold",
  mystical: "gold",
  gold: "gold",
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem("hope-app-theme") as ThemeName;
    if (saved && saved in MIGRATION_MAP) return MIGRATION_MAP[saved];
    return (saved as ThemeName) || "gold";
  });

  const [mode, setModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem("hope-app-mode") as ThemeMode) || "dark";
  });

  const [forcedOverride, setForcedOverride] = useState(false);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem("hope-app-theme", t);
  };

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem("hope-app-mode", m);
  };

  const syncFromProfile = (dbTheme: string) => {
    const mapped = MIGRATION_MAP[dbTheme] || dbTheme;
    if (mapped && mapped !== theme && Object.keys(THEME_TOKEN_MAP).includes(mapped)) {
      setTheme(mapped as ThemeName);
    }
  };

  const isLandingRoute = () => {
    if (typeof window === "undefined") return true;
    const pathname = window.location.pathname;
    return (
      pathname === "/" ||
      pathname === "/hope-preview" ||
      pathname === "/launch" ||
      pathname === "/app-intro" ||
      pathname.startsWith("/experience") ||
      pathname === "/temple" ||
      pathname === "/handbook" ||
      pathname === "/auth" ||
      pathname.startsWith("/blog") ||
      pathname.startsWith("/knowledge") ||
      pathname.startsWith("/loops") ||
      pathname === "/journey" ||
      pathname === "/inner-llms" ||
      pathname.startsWith("/enterprise/auth") ||
      pathname.startsWith("/enterprise/create") ||
      pathname.startsWith("/enterprise/contact") ||
      pathname.startsWith("/enterprise/privacy")
    );
  };

  useLayoutEffect(() => {
    if (forcedOverride) return;
    const root = document.documentElement;
    if (isLandingRoute()) {
      applyTokens(root, LANDING_DARK_TOKENS);
    } else {
      const tokens = THEME_TOKEN_MAP[theme]?.[mode] || THEME_TOKEN_MAP.gold.dark;
      applyTokens(root, tokens);
    }
    if (mode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme, mode, forcedOverride]);

  useLayoutEffect(() => {
    const apply = () => {
      const root = document.documentElement;
      if (isLandingRoute()) {
        applyTokens(root, LANDING_DARK_TOKENS);
      } else {
        const tokens = THEME_TOKEN_MAP[theme]?.[mode] || THEME_TOKEN_MAP.gold.dark;
        applyTokens(root, tokens);
      }
    };
    apply();
    window.addEventListener("popstate", apply);
    return () => window.removeEventListener("popstate", apply);
  }, [theme, mode]);

  const tokens = THEME_TOKEN_MAP[theme]?.[mode] || THEME_TOKEN_MAP.gold.dark;

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode, forcedOverride, setForcedOverride, syncFromProfile, tokens }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyTokens(root: HTMLElement, tokens: DesignTokens) {
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
    root.style.setProperty(key, value);
  });
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export { THEME_METADATA as themeInfo };
export type { ThemeName };
