/**
 * Pythagorean numerology.
 * Pure functions over a date-of-birth and (optionally) a name.
 *
 * Master numbers (11, 22, 33) are preserved per standard convention.
 */
import type { NumerologyProfile } from "./types";

const LETTER_VALUES: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

function reduce(n: number, keepMaster = true): number {
  if (keepMaster && (n === 11 || n === 22 || n === 33)) return n;
  while (n > 9) {
    let s = 0;
    for (const ch of String(n)) s += parseInt(ch, 10);
    n = s;
    if (keepMaster && (n === 11 || n === 22 || n === 33)) return n;
  }
  return n;
}

function reduceDigits(digits: number[]): number {
  return reduce(digits.reduce((a, b) => a + b, 0));
}

/** Life Path: reduce-each-component approach (preserves master numbers). */
export function lifePathFromDob(iso: string): number {
  // iso = YYYY-MM-DD
  const [y, m, d] = iso.split("-").map((s) => parseInt(s, 10));
  const yr = reduce(y);
  const mo = reduce(m);
  const da = reduce(d);
  return reduce(yr + mo + da);
}

export function birthdayNumber(iso: string): number {
  const day = parseInt(iso.split("-")[2], 10);
  return reduce(day);
}

function nameDigits(name: string, filter: (ch: string) => boolean): number[] {
  const out: number[] = [];
  for (const ch of name.toLowerCase()) {
    const v = LETTER_VALUES[ch];
    if (v && filter(ch)) out.push(v);
  }
  return out;
}

export function expressionNumber(name: string): number {
  return reduceDigits(nameDigits(name, () => true));
}

export function soulUrgeNumber(name: string): number {
  return reduceDigits(nameDigits(name, (ch) => VOWELS.has(ch)));
}

export function personalityNumber(name: string): number {
  return reduceDigits(nameDigits(name, (ch) => !VOWELS.has(ch)));
}

/**
 * Personal year = reduce(month + day + currentYear).
 * Personal day = reduce(personalYear + currentMonth + currentDay).
 * Both use NON-master reduction (1-9) by convention.
 */
export function personalYear(iso: string, today = new Date()): number {
  const [, m, d] = iso.split("-").map((s) => parseInt(s, 10));
  const sum = reduce(m, false) + reduce(d, false) + reduce(today.getFullYear(), false);
  return reduce(sum, false);
}

export function personalDay(iso: string, today = new Date()): number {
  const py = personalYear(iso, today);
  const sum = py + reduce(today.getMonth() + 1, false) + reduce(today.getDate(), false);
  return reduce(sum, false);
}

export function computeNumerology(dob: string, name?: string, today = new Date()): NumerologyProfile {
  return {
    lifePath: lifePathFromDob(dob),
    birthday: birthdayNumber(dob),
    expression: name ? expressionNumber(name) : undefined,
    soulUrge: name ? soulUrgeNumber(name) : undefined,
    personality: name ? personalityNumber(name) : undefined,
    personalYear: personalYear(dob, today),
    personalDay: personalDay(dob, today),
  };
}

/** Short interpretation of a life-path number. */
export function lifePathDescription(n: number): string {
  const map: Record<number, string> = {
    1: "Initiator. Walks alone first, then leads.",
    2: "Bridge-builder. Power lives in your gentleness.",
    3: "Expressor. Creativity is your prayer.",
    4: "Builder. Discipline becomes freedom for you.",
    5: "Wanderer. You learn through change itself.",
    6: "Caregiver. Love is your responsibility and reward.",
    7: "Seeker. The unseen interests you more than the seen.",
    8: "Steward. You are here to handle real-world power.",
    9: "Servant of the whole. You release more than you keep.",
    11: "Channel. You feel what others cannot name.",
    22: "Master builder. Vision meets the world through you.",
    33: "Teacher of love. Your practice serves many lives.",
  };
  return map[n] ?? "A path uniquely yours.";
}

/** Short reflection prompt for today based on personalDay 1-9. */
export function personalDayPrompt(n: number): string {
  const map: Record<number, string> = {
    1: "Begin one small thing today. The smallest seed matters.",
    2: "Listen more than you speak. A relationship needs you.",
    3: "Express something true — write, sing, draw, share.",
    4: "Tend the foundation: a small order, a kept promise.",
    5: "Say yes to one unfamiliar thing.",
    6: "Care for someone — including yourself — fully.",
    7: "Withdraw a little. Sit with the question, not the answer.",
    8: "Move a real-world thing. Money, body, work, status.",
    9: "Release something. A habit, a thought, an old story.",
  };
  return map[n] ?? "Notice today's quiet quality.";
}
