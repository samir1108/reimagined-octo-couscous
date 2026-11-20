import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/i18n", () => ({
  getStatic: (lang: string, source: string) =>
    lang === "hi" && source === "ACTION" ? "कर्म" : undefined,
}));

vi.mock("@/lib/translateCache", () => ({
  getCached: (lang: string, source: string) =>
    lang === "hi" && source === "FRUIT" ? "फल" : undefined,
}));

import {
  CANVAS_LABELS,
  canvasLabel,
  installCanvasTranslation,
  setCanvasLanguage,
} from "@/lib/canvasLabels";

class FakeContext {
  drawn: string[] = [];
  fillText(text: string) {
    this.drawn.push(text);
  }
  strokeText(text: string) {
    this.drawn.push(text);
  }
}

afterEach(() => {
  setCanvasLanguage("en");
});

describe("canvas labels", () => {
  it("only exposes developer-authored labels", () => {
    expect(CANVAS_LABELS.has("GRIP BEFORE")).toBe(true);
    expect(CANVAS_LABELS.has("my private answer")).toBe(false);
  });

  it("returns English until a language is selected", () => {
    setCanvasLanguage("en");
    expect(canvasLabel("ACTION")).toBe("ACTION");
    expect(canvasLabel("FRUIT")).toBe("FRUIT");
  });

  it("translates allowlisted labels from static + cache", () => {
    setCanvasLanguage("hi");
    expect(canvasLabel("ACTION")).toBe("कर्म");
    expect(canvasLabel("FRUIT")).toBe("फल");
  });

  it("never translates user-drawn text", () => {
    setCanvasLanguage("hi");
    expect(canvasLabel("I feel afraid of silence")).toBe("I feel afraid of silence");
  });

  it("patches fillText/strokeText for canvas painting", () => {
    vi.stubGlobal("CanvasRenderingContext2D", FakeContext);
    installCanvasTranslation();

    setCanvasLanguage("hi");
    const ctx = new FakeContext();
    (ctx as unknown as CanvasRenderingContext2D).fillText("ACTION", 10, 10);
    (ctx as unknown as CanvasRenderingContext2D).strokeText("FRUIT", 10, 20);
    (ctx as unknown as CanvasRenderingContext2D).fillText("my private answer", 10, 30);

    expect(ctx.drawn).toEqual(["कर्म", "फल", "my private answer"]);
    vi.unstubAllGlobals();
  });
});
