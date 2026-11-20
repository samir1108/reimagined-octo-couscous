/**
 * CONTENT GEN — lines from atoms, not from a model.
 * ────────────────────────────────────────────────
 * A line is a deterministic composition of concept × form × phrasing × level ×
 * dose × audience × tail. The same index always produces the same line, so a
 * 100k catalog can exist without storing 100k rows up front.
 */

export type LineForm = "teaching" | "instruction" | "question" | "carry" | "myth" | "warning";

export type LineLanguage = "en" | "hi";

export interface GeneratedLine {
  id: string;
  index: number;
  concept: string;
  form: LineForm;
  level: number;
  language: LineLanguage;
  text: string;
}

export interface GenerateLineOptions {
  concept?: string;
  level?: number;
  count?: number;
  start?: number;
  language?: LineLanguage;
}

export interface LineValidation {
  ok: boolean;
  errors: string[];
}
