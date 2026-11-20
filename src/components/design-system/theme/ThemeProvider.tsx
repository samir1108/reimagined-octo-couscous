import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

export type ColorMode = "dark" | "light" | "system";
export type Density = "comfortable" | "compact" | "spacious";
export type OrbSize = "auto" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type AIPersonality = "guru" | "coach" | "companion" | "scientist";

export interface ThemeContextValue {
  // Color mode
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  resolvedMode: "dark" | "light";

  // Reduced motion
  reducedMotion: boolean;

  // High contrast
  highContrast: boolean;

  // Density
  density: Density;
  setDensity: (d: Density) => void;

  // Orb size preference
  orbSize: OrbSize;
  setOrbSize: (size: OrbSize) => void;

  // AI personality
  aiPersonality: AIPersonality;
  setAIPersonality: (p: AIPersonality) => void;

  // Language
  language: string;
  setLanguage: (lang: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getHighContrast(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-contrast: high)").matches;
}

export function ThemeProvider({
  children,
  defaultMode = "system",
  defaultDensity = "comfortable",
  defaultOrbSize = "auto",
  defaultAIPersonality = "guru",
  defaultLanguage = "en",
}: {
  children: ReactNode;
  defaultMode?: ColorMode;
  defaultDensity?: Density;
  defaultOrbSize?: OrbSize;
  defaultAIPersonality?: AIPersonality;
  defaultLanguage?: string;
}) {
  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    if (typeof window === "undefined") return defaultMode;
    return (localStorage.getItem("cos:color-mode") as ColorMode) || defaultMode;
  });

  const [resolvedMode, setResolvedMode] = useState<"dark" | "light">("dark");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const [density, setDensityState] = useState<Density>(() => {
    if (typeof window === "undefined") return defaultDensity;
    return (localStorage.getItem("cos:density") as Density) || defaultDensity;
  });

  const [orbSize, setOrbSizeState] = useState<OrbSize>(() => {
    if (typeof window === "undefined") return defaultOrbSize;
    return (localStorage.getItem("cos:orb-size") as OrbSize) || defaultOrbSize;
  });

  const [aiPersonality, setAIPersonalityState] = useState<AIPersonality>(() => {
    if (typeof window === "undefined") return defaultAIPersonality;
    return (localStorage.getItem("cos:ai-personality") as AIPersonality) || defaultAIPersonality;
  });

  const [language, setLanguageState] = useState<string>(() => {
    if (typeof window === "undefined") return defaultLanguage;
    return localStorage.getItem("cos:language") || defaultLanguage;
  });

  // Resolve color mode
  const resolved = colorMode === "system" ? getSystemTheme() : colorMode;

  // Apply to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(resolved);
    root.style.colorScheme = resolved;
    localStorage.setItem("cos:color-mode", colorMode);
  }, [colorMode, resolved]);

  // Sync resolved mode
  useEffect(() => {
    setResolvedMode(resolved);
  }, [resolved]);

  // Media query listeners
  useEffect(() => {
    const colorSchemeMQ = window.matchMedia("(prefers-color-scheme: dark)");
    const motionMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
    const contrastMQ = window.matchMedia("(prefers-contrast: high)");

    const handleColorScheme = () => {
      if (colorMode === "system") {
        setResolvedMode(getSystemTheme());
      }
    };
    const handleMotion = () => setReducedMotion(getReducedMotion());
    const handleContrast = () => setHighContrast(getHighContrast());

    colorSchemeMQ.addEventListener("change", handleColorScheme);
    motionMQ.addEventListener("change", handleMotion);
    contrastMQ.addEventListener("change", handleContrast);

    setReducedMotion(getReducedMotion());
    setHighContrast(getHighContrast());

    return () => {
      colorSchemeMQ.removeEventListener("change", handleColorScheme);
      motionMQ.removeEventListener("change", handleMotion);
      contrastMQ.removeEventListener("change", handleContrast);
    };
  }, [colorMode]);

  // Apply density
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("density-comfortable", "density-compact", "density-spacious");
    root.classList.add(`density-${density}`);
    localStorage.setItem("cos:density", density);
  }, [density]);

  // Apply orb size
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(
      "orb-auto", "orb-xs", "orb-sm", "orb-md", "orb-lg", "orb-xl", "orb-2xl"
    );
    root.classList.add(`orb-${orbSize}`);
    localStorage.setItem("cos:orb-size", orbSize);
  }, [orbSize]);

  // Apply AI personality
  useEffect(() => {
    localStorage.setItem("cos:ai-personality", aiPersonality);
  }, [aiPersonality]);

  // Apply language
  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem("cos:language", language);
  }, [language]);

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode);
  }, []);

  const setDensity = useCallback((d: Density) => {
    setDensityState(d);
  }, []);

  const setOrbSize = useCallback((size: OrbSize) => {
    setOrbSizeState(size);
  }, []);

  const setAIPersonality = useCallback((p: AIPersonality) => {
    setAIPersonalityState(p);
  }, []);

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
  }, []);

  const value: ThemeContextValue = {
    colorMode,
    setColorMode,
    resolvedMode,
    reducedMotion,
    highContrast,
    density,
    setDensity,
    orbSize,
    setOrbSize,
    aiPersonality,
    setAIPersonality,
    language,
    setLanguage,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Hook for color mode only
export function useColorMode() {
  const { colorMode, setColorMode, resolvedMode } = useTheme();
  return { colorMode, setColorMode, resolvedMode };
}

// Hook for density
export function useDensity() {
  const { density, setDensity } = useTheme();
  return { density, setDensity };
}

// Hook for reduced motion
export function useReducedMotion() {
  const { reducedMotion } = useTheme();
  return reducedMotion;
}

// Hook for high contrast
export function useHighContrast() {
  const { highContrast } = useTheme();
  return highContrast;
}

// Hook for orb size
export function useOrbSize() {
  const { orbSize, setOrbSize } = useTheme();
  return { orbSize, setOrbSize };
}

// Hook for AI personality
export function useAIPersonality() {
  const { aiPersonality, setAIPersonality } = useTheme();
  return { aiPersonality, setAIPersonality };
}

// Hook for language
export function useLanguage() {
  const { language, setLanguage } = useTheme();
  return { language, setLanguage };
}