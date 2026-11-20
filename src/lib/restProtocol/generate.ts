/**
 * REST LINE GENERATOR — deterministic, sleep-safe, validated.
 */

import { BANNED_MEDICAL_TERMS } from "@/lib/knowledge";
import {
  REST_AUDIENCES,
  REST_CAPACITY,
  REST_DOSES,
  REST_LEVELS,
  REST_PHRASINGS,
  REST_PROTOCOLS,
  REST_TAILS,
} from "./catalog";
import type { RestLine, RestValidation } from "./types";

export interface RestLineOptions {
  protocolId?: string;
  count?: number;
  start?: number;
}

export function generateRestLineAt(index: number, options: RestLineOptions = {}): RestLine {
  const safeIndex = Math.max(0, Math.floor(index));
  const protocol =
    (options.protocolId
      ? REST_PROTOCOLS.find((item) => item.id === options.protocolId)
      : undefined) ??
    REST_PROTOCOLS[safeIndex % REST_PROTOCOLS.length];

  let cursor = safeIndex;
  const phrasing = REST_PHRASINGS[cursor % REST_PHRASINGS.length];
  cursor = Math.floor(cursor / REST_PHRASINGS.length);
  const level = REST_LEVELS[cursor % REST_LEVELS.length];
  cursor = Math.floor(cursor / REST_LEVELS.length);
  const dose = REST_DOSES[cursor % REST_DOSES.length];
  cursor = Math.floor(cursor / REST_DOSES.length);
  const audience = REST_AUDIENCES[cursor % REST_AUDIENCES.length];
  cursor = Math.floor(cursor / REST_AUDIENCES.length);
  const tail = REST_TAILS[cursor % REST_TAILS.length];

  const text = `${audience}${dose}${phrasing.replace("{text}", protocol.instruction)}${tail}`
    .replace(/\s+/g, " ")
    .trim();

  return {
    id: `rest:${protocol.id}:${level}:${safeIndex}`,
    index: safeIndex,
    protocolId: protocol.id,
    text,
  };
}

export function generateRestLines(options: RestLineOptions = {}): RestLine[] {
  const count = Math.max(1, Math.min(5000, options.count ?? 50));
  const start = Math.max(0, options.start ?? 0);
  const out: RestLine[] = [];
  const seen = new Set<string>();
  let index = start;

  while (out.length < count && index < REST_CAPACITY + start + 2000) {
    const line = generateRestLineAt(index, options);
    if (!seen.has(line.text)) {
      seen.add(line.text);
      out.push(line);
    }
    index += 1;
  }

  return out;
}

export function validateRestLines(lines: RestLine[]): RestValidation {
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    if (line.text.length < 20) errors.push(`${line.id}: too short`);
    if (line.text.length > 320) errors.push(`${line.id}: too long`);
    if (seen.has(line.text)) errors.push(`${line.id}: duplicate text`);
    seen.add(line.text);

    const lower = line.text.toLowerCase();
    if (lower.includes("meditat")) {
      errors.push(`${line.id}: offers meditation to a rest protocol`);
    }
    for (const term of BANNED_MEDICAL_TERMS) {
      if (lower.includes(term)) errors.push(`${line.id}: contains "${term}"`);
    }
    if (line.text.includes("{text}")) errors.push(`${line.id}: unresolved placeholder`);
  }

  return { ok: errors.length === 0, errors };
}

export function restCapacity(): number {
  return REST_CAPACITY;
}
