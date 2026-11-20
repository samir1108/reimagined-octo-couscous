import { beforeEach, describe, expect, it } from "vitest";
import {
  detectBrowserLanguage,
  getStoredLanguage,
  hasChosenLanguage,
  languageDirection,
  markLanguageChosen,
  resolveLanguageCode,
  setStoredLanguage,
} from "@/lib/languagePreference";

describe("languagePreference", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("resolves exact and base BCP-47 tags", () => {
    expect(resolveLanguageCode("hi")).toBe("hi");
    expect(resolveLanguageCode("pt-BR")).toBe("pt");
    expect(resolveLanguageCode("en_GB")).toBe("en");
    expect(resolveLanguageCode("zh-Hant-HK")).toBe("zh-TW");
    expect(resolveLanguageCode("zh-CN")).toBe("zh");
  });

  it("returns null for unsupported tags", () => {
    expect(resolveLanguageCode("xx-YY")).toBeNull();
    expect(resolveLanguageCode("")).toBeNull();
    expect(resolveLanguageCode(null)).toBeNull();
  });

  it("persists the choice and marks first run complete", () => {
    expect(hasChosenLanguage()).toBe(false);
    setStoredLanguage("ta");
    expect(getStoredLanguage()).toBe("ta");
    expect(hasChosenLanguage()).toBe(true);
  });

  it("can mark first run complete without changing language", () => {
    markLanguageChosen();
    expect(getStoredLanguage()).toBe("en");
    expect(hasChosenLanguage()).toBe(true);
  });

  it("detects the browser language", () => {
    Object.defineProperty(window.navigator, "languages", {
      configurable: true,
      value: ["fr-CA", "en-US"],
    });
    Object.defineProperty(window.navigator, "language", {
      configurable: true,
      value: "fr-CA",
    });
    expect(detectBrowserLanguage()).toBe("fr");
  });

  it("knows text direction", () => {
    expect(languageDirection("ar")).toBe("rtl");
    expect(languageDirection("ur")).toBe("rtl");
    expect(languageDirection("hi")).toBe("ltr");
  });
});
