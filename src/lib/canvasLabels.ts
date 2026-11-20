// Canvas UI labels are painted with ctx.fillText, so the DOM translator can
// never see them. This module translates the fixed, developer-authored labels
// (never user-entered text) by patching CanvasRenderingContext2D once and
// looking translations up from the same static/cache store the DOM uses.
//
// The label list is an allowlist on purpose: game canvases also draw player
// answers and journal letters, and those must never be sent to the translator.
import { getCached } from "@/lib/translateCache";
import { getStatic } from "@/lib/i18n";

/** Literal labels drawn by game/analytics canvases. */
export const CANVAS_LABELS: ReadonlySet<string> = new Set([
  "ACTION",
  "ACTUAL",
  "ANCESTOR",
  "APPEARANCE",
  "DESCENDANT",
  "DON'T",
  "FRUIT",
  "GONE",
  "GRIP",
  "GRIP AFTER",
  "GRIP BEFORE",
  "HARDER",
  "LOCI",
  "LOVE IS ASKING",
  "MIRROR",
  "neutral",
  "PRESS",
  "RELEASED",
  "SEALED",
  "skillful",
  "unskillful",
  "WEIGHT AFTER",
  "WEIGHT BEFORE",
  "YOU",
]);

export const CANVAS_LABEL_LIST: readonly string[] = [...CANVAS_LABELS];

let activeLanguage = "en";

/** Called by the language runtime whenever the active language changes. */
export function setCanvasLanguage(language: string) {
  activeLanguage = language || "en";
}

/** Translation for a canvas label, or the original when not ready yet. */
export function canvasLabel(text: string): string {
  if (activeLanguage === "en") return text;
  const key = text.trim();
  if (!CANVAS_LABELS.has(key)) return text;
  return getStatic(activeLanguage, key) ?? getCached(activeLanguage, key) ?? text;
}

let installed = false;

/** Patches fillText/strokeText once so canvas labels follow the UI language. */
export function installCanvasTranslation() {
  if (installed || typeof CanvasRenderingContext2D === "undefined") return;
  installed = true;
  const proto = CanvasRenderingContext2D.prototype;

  const fill = proto.fillText;
  proto.fillText = function (
    this: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth?: number,
  ) {
    return fill.call(this, canvasLabel(String(text)), x, y, maxWidth);
  };

  const stroke = proto.strokeText;
  if (typeof stroke === "function") {
    proto.strokeText = function (
      this: CanvasRenderingContext2D,
      text: string,
      x: number,
      y: number,
      maxWidth?: number,
    ) {
      return stroke.call(this, canvasLabel(String(text)), x, y, maxWidth);
    };
  }
}
