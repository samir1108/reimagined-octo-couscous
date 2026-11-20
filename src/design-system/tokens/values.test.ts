import { describe, expect, it } from "vitest";
import { applyDesignTokens } from "./apply";
import { THEME_TOKEN_MAP } from "./values";

describe("theme token map", () => {
  it("keeps the gold brand primary consistent across themes and modes", () => {
    for (const modes of Object.values(THEME_TOKEN_MAP)) {
      expect(modes.dark.colors.primary).toBe("40 90% 61%");
      expect(modes.light.colors.primary).toBe("38 76% 42%");
      expect(modes.dark.colors.ring).toBe(modes.dark.colors.primary);
      expect(modes.light.colors.ring).toBe(modes.light.colors.primary);
    }
  });

  it("preserves distinct light and dark surfaces for each theme", () => {
    for (const modes of Object.values(THEME_TOKEN_MAP)) {
      expect(modes.dark.colors.background).not.toBe(modes.light.colors.background);
      expect(modes.dark.colors.foreground).not.toBe(modes.light.colors.foreground);
      expect(modes.light.colors.card).toBe("0 0% 100%");
      expect(modes.light.colors.foreground).toBe("30 24% 12%");
      expect(modes.dark.colors.background).toBe("24 25% 4%");
    }
  });

  it("applies the selected palette and glass surface tokens to the document root", () => {
    const root = document.createElement("html");
    const tokens = THEME_TOKEN_MAP.sacred.light;
    applyDesignTokens(root, tokens);

    expect(root.style.getPropertyValue("--background")).toBe(tokens.colors.background);
    expect(root.style.getPropertyValue("--primary")).toBe(tokens.colors.primary);
    expect(root.style.getPropertyValue("--glass-bg")).toBe(tokens.glass.bg);
    expect(root.style.getPropertyValue("--glass-nav-bg")).toBe(tokens.glass.navBg);
    expect(root.style.getPropertyValue("--font-editorial")).toBe(tokens.typography.fontSacred);
  });
});
