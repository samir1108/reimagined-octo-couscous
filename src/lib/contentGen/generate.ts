/**
 * LINE GENERATOR — deterministic, bounded, validated.
 * ──────────────────────────────────────────────────
 * The catalog is generated on demand from authored atoms; it is not a giant
 * static file. Every line is traceable to a concept and a form, and medical
 * claims are rejected before they can ship.
 */

import { CONCEPTS } from "@/lib/needEngine";
import { ARCS } from "@/lib/arcs";
import { MYTH_CARDS } from "@/lib/prescription/myths";
import { BANNED_MEDICAL_TERMS } from "@/lib/knowledge";
import {
  AUDIENCE_PREFIX,
  AUDIENCE_PREFIX_HI,
  DOSE_PREFIX,
  DOSE_PREFIX_HI,
  HINDI_BASE,
  LINE_CAPACITY,
  LINE_CONCEPTS,
  LINE_FORMS,
  LINE_LEVELS,
  LINE_TAILS,
  LINE_TAILS_HI,
  PHRASINGS,
  PHRASINGS_HI,
} from "./catalog";
import type {
  GenerateLineOptions,
  GeneratedLine,
  LineForm,
  LineLanguage,
  LineValidation,
} from "./types";

interface ConceptSource {
  label: string;
  teaching: string;
  practice: string;
  question: string;
  carry: string;
  trap?: string;
}

function sourceFor(concept: string): ConceptSource {
  const known = CONCEPTS[concept as keyof typeof CONCEPTS];
  if (known) {
    return {
      label: known.label,
      teaching: known.teaching,
      practice: known.taste,
      question: known.question,
      carry: known.carry,
      trap: "Do not force the practice; adjust the dose or stop.",
    };
  }

  const arcSit = ARCS.flatMap((arc) => arc.sits).find((sit) => sit.concept === concept);
  if (arcSit) {
    return {
      label: concept.replace(/_/g, " "),
      teaching: arcSit.teaching,
      practice: arcSit.practiceText,
      question: arcSit.question,
      carry: arcSit.carry,
      trap: arcSit.trap,
    };
  }

  return {
    label: concept.replace(/_/g, " "),
    teaching: "Start where you actually are, not where you think you should be.",
    practice: "Sit for one minute and notice what is already happening.",
    question: "What did you notice?",
    carry: "Return once today.",
  };
}

function baseText(concept: string, form: LineForm, level: number, language: LineLanguage): string {
  const hindi = language === "hi" ? HINDI_BASE[concept] : undefined;
  if (hindi) {
    switch (form) {
      case "teaching":
        return hindi.teaching;
      case "instruction":
        return hindi.practice;
      case "question":
        return hindi.question;
      case "carry":
        return hindi.carry;
      case "myth":
        return "मेडिटेशन का मतलब सोच बंद करना नहीं। विचार आते हैं; तुम उन्हें नोटिस करते हो।";
      case "warning":
        return "अभ्यास को ज़बरदस्ती मत करो; डोज़ बदलो या रुक जाओ।";
    }
  }

  const source = sourceFor(concept);
  switch (form) {
    case "teaching":
      return source.teaching;
    case "instruction":
      return source.practice;
    case "question":
      return source.question;
    case "carry":
      return source.carry;
    case "myth":
      return MYTH_CARDS[(level - 1) % MYTH_CARDS.length].fact;
    case "warning":
      return source.trap ?? "Do not force the practice; adjust the dose or stop.";
    default:
      return source.teaching;
  }
}

export function generateLineAt(index: number, options: GenerateLineOptions = {}): GeneratedLine {
  const safeIndex = Math.max(0, Math.floor(index));
  const language: LineLanguage = options.language ?? "en";
  const hi = language === "hi";
  const phrasings = hi ? PHRASINGS_HI : PHRASINGS;
  const doses = hi ? DOSE_PREFIX_HI : DOSE_PREFIX;
  const audiences = hi ? AUDIENCE_PREFIX_HI : AUDIENCE_PREFIX;
  const tails = hi ? LINE_TAILS_HI : LINE_TAILS;

  const concept =
    options.concept ?? LINE_CONCEPTS[safeIndex % LINE_CONCEPTS.length];

  let cursor = safeIndex;
  const form = LINE_FORMS[cursor % LINE_FORMS.length];
  cursor = Math.floor(cursor / LINE_FORMS.length);
  const phrasing = phrasings[cursor % phrasings.length];
  cursor = Math.floor(cursor / phrasings.length);
  const level = LINE_LEVELS[cursor % LINE_LEVELS.length];
  cursor = Math.floor(cursor / LINE_LEVELS.length);
  const dose = doses[cursor % doses.length];
  cursor = Math.floor(cursor / doses.length);
  const audience = audiences[cursor % audiences.length];
  cursor = Math.floor(cursor / audiences.length);
  const tail = tails[cursor % tails.length];

  const text = `${audience}${dose}${phrasing.replace("{text}", baseText(concept, form, level, language))}${tail}`
    .replace(/\s+/g, " ")
    .trim();

  return {
    id: `line:${language}:${concept}:${form}:${safeIndex}`,
    index: safeIndex,
    concept,
    form,
    level,
    language,
    text,
  };
}

export function generateLines(options: GenerateLineOptions = {}): GeneratedLine[] {
  const count = Math.max(1, Math.min(5000, options.count ?? 50));
  const start = Math.max(0, options.start ?? 0);
  const out: GeneratedLine[] = [];
  const seen = new Set<string>();
  let index = start;

  while (out.length < count && index < LINE_CAPACITY + start + 2000) {
    const line = generateLineAt(index, options);
    if (options.level != null && line.level !== options.level) {
      index += 1;
      continue;
    }
    if (!seen.has(line.text)) {
      seen.add(line.text);
      out.push(line);
    }
    index += 1;
  }

  return out;
}

export function validateLines(lines: GeneratedLine[]): LineValidation {
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    if (line.text.length < 20) errors.push(`${line.id}: too short`);
    if (line.text.length > 320) errors.push(`${line.id}: too long`);
    if (seen.has(line.text)) errors.push(`${line.id}: duplicate text`);
    seen.add(line.text);

    const lower = line.text.toLowerCase();
    for (const term of BANNED_MEDICAL_TERMS) {
      if (lower.includes(term)) errors.push(`${line.id}: contains "${term}"`);
    }
    if (line.text.includes("{text}")) errors.push(`${line.id}: unresolved placeholder`);
  }

  return { ok: errors.length === 0, errors };
}

export function lineCapacity(): number {
  return LINE_CAPACITY;
}
