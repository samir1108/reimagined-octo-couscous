import { useLayoutEffect } from "react";
import { LANDING_DARK_TOKENS } from "@/design-system/tokens/values";
import { useTheme } from "@/contexts/ThemeContext";
import { applyDesignTokens } from "@/design-system/tokens/apply";

/**
 * Temporarily forces sacred-dark (gold) theme on mount,
 * restores the user's theme on unmount via context flag.
 */
export function useForceDarkMode() {
  const { setForcedOverride } = useTheme();

  useLayoutEffect(() => {
    const root = document.documentElement;

    setForcedOverride(true);
    applyDesignTokens(root, LANDING_DARK_TOKENS);
    root.classList.add("dark");
    root.classList.remove("light");

    return () => {
      setForcedOverride(false);
    };
  }, [setForcedOverride]);
}
