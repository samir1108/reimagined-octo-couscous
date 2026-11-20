/**
 * Vedic / Jyotish engine.
 *
 * IMPORTANT — accuracy disclaimer:
 *   We do not bundle a full astronomical ephemeris. Sun longitude is derived
 *   from a tropical→sidereal shift using Lahiri ayanamsa (a good
 *   approximation, ±1° around birth date). Moon longitude uses a simplified
 *   mean-motion model anchored to a known epoch — accurate enough to land in
 *   the correct nakshatra ~80% of the time, off by one neighbor otherwise.
 *
 * UI rule: anything from this engine should be presented as "approximate".
 * The PersonalProfile.confidence flags signal this.
 */
import type {
  BirthChart, DashaLord, Nakshatra, Rashi, VedicProfile,
} from "./types";
import { sunSignFromDob } from "./astrology";

const RASHIS: Rashi[] = [
  "mesha", "vrishabha", "mithuna", "karka", "simha", "kanya",
  "tula", "vrischika", "dhanu", "makara", "kumbha", "meena",
];

// Tropical sun-sign → sidereal Rashi. Most births fall one sign earlier.
const TROPICAL_TO_RASHI: Record<string, Rashi> = {
  aries: "meena", taurus: "mesha", gemini: "vrishabha", cancer: "mithuna",
  leo: "karka", virgo: "simha", libra: "kanya", scorpio: "tula",
  sagittarius: "vrischika", capricorn: "dhanu", aquarius: "makara", pisces: "kumbha",
};

const NAKSHATRAS: Nakshatra[] = [
  "ashwini", "bharani", "krittika", "rohini", "mrigashira", "ardra",
  "punarvasu", "pushya", "ashlesha", "magha", "purva_phalguni", "uttara_phalguni",
  "hasta", "chitra", "swati", "vishakha", "anuradha", "jyeshtha",
  "mula", "purva_ashadha", "uttara_ashadha", "shravana", "dhanishta", "shatabhisha",
  "purva_bhadrapada", "uttara_bhadrapada", "revati",
];

// Vimshottari order with years.
const DASHA_SEQ: Array<{ lord: DashaLord; years: number }> = [
  { lord: "ketu", years: 7 },
  { lord: "venus", years: 20 },
  { lord: "sun", years: 6 },
  { lord: "moon", years: 10 },
  { lord: "mars", years: 7 },
  { lord: "rahu", years: 18 },
  { lord: "jupiter", years: 16 },
  { lord: "saturn", years: 19 },
  { lord: "mercury", years: 17 },
];

// Each nakshatra is ruled by one of the 9 dasha lords, in repeating order.
const NAKSHATRA_TO_LORD: DashaLord[] = [
  "ketu", "venus", "sun", "moon", "mars", "rahu", "jupiter", "saturn", "mercury",
];

function nakshatraLord(nIdx: number): DashaLord {
  return NAKSHATRA_TO_LORD[nIdx % 9];
}

// ── Astronomy helpers (approximate) ───────────────────────────────────────

/**
 * Days since J2000.0 epoch (2000-01-01 12:00 TT, treated as UT here).
 * Time-of-day defaults to noon if not provided.
 */
function julianDays(dob: string, tob?: string): number {
  const [y, m, d] = dob.split("-").map((s) => parseInt(s, 10));
  const [hh, mm] = (tob || "12:00").split(":").map((s) => parseInt(s, 10));
  // Build UTC date — local-tz error of a few hours is tolerable here.
  const ms = Date.UTC(y, m - 1, d, hh, mm, 0);
  const j2000Ms = Date.UTC(2000, 0, 1, 12, 0, 0);
  return (ms - j2000Ms) / 86400000;
}

/** Lahiri ayanamsa in degrees ≈ 23.85° at J2000, increasing 50.29″/yr. */
function ayanamsa(jd: number): number {
  return 23.85 + (jd / 365.25) * (50.29 / 3600);
}

/** Sidereal Sun longitude (°), 0 = sidereal Aries / Mesha start. */
function siderealSunLongitude(jd: number): number {
  // Mean tropical sun longitude — close enough for sign+nakshatra purposes.
  const tropical = (280.46 + 0.9856474 * jd) % 360;
  return ((tropical - ayanamsa(jd)) % 360 + 360) % 360;
}

/** Sidereal Moon longitude (°). Mean motion only — no perturbations. */
function siderealMoonLongitude(jd: number): number {
  const tropical = (218.32 + 13.176396 * jd) % 360;
  return ((tropical - ayanamsa(jd)) % 360 + 360) % 360;
}

// ── Public ────────────────────────────────────────────────────────────────

export function rashiFromDob(dob: string): Rashi {
  // Prefer the simple lookup (sun-sign cusp accurate) for stable Rashi.
  return TROPICAL_TO_RASHI[sunSignFromDob(dob)] ?? "mesha";
}

export interface NakshatraResult {
  nakshatra: Nakshatra;
  pada: 1 | 2 | 3 | 4;
  index: number;          // 0-26
  lord: DashaLord;
  /** Fractional progress (0-1) through this nakshatra. */
  fraction: number;
}

export function nakshatraFromBirth(dob: string, tob?: string): NakshatraResult {
  const jd = julianDays(dob, tob);
  const moonLon = siderealMoonLongitude(jd);
  const span = 360 / 27; // 13.333…°
  const idx = Math.floor(moonLon / span) % 27;
  const within = (moonLon - idx * span) / span; // 0-1
  const pada = (Math.floor(within * 4) + 1) as 1 | 2 | 3 | 4;
  return {
    nakshatra: NAKSHATRAS[idx],
    pada,
    index: idx,
    lord: nakshatraLord(idx),
    fraction: within,
  };
}

/** Tithi 1-30. Bright fortnight 1-15, dark 16-30. */
export function tithiFromBirth(dob: string, tob?: string): { tithi: number; paksha: "shukla" | "krishna" } {
  const jd = julianDays(dob, tob);
  const diff = ((siderealMoonLongitude(jd) - siderealSunLongitude(jd)) % 360 + 360) % 360;
  const t = Math.floor(diff / 12) + 1; // 1-30
  return { tithi: t, paksha: t <= 15 ? "shukla" : "krishna" };
}

/**
 * Vimshottari Mahadasha at "today", computed from the birth nakshatra.
 * Uses fraction-elapsed within the birth nakshatra to seed the first dasha.
 */
export function currentMahadasha(
  dob: string,
  tob: string | undefined,
  today = new Date(),
): { lord: DashaLord; yearsRemaining: number } {
  const nk = nakshatraFromBirth(dob, tob);
  const seqStart = DASHA_SEQ.findIndex((d) => d.lord === nk.lord);
  const first = DASHA_SEQ[seqStart];
  const initialRemaining = first.years * (1 - nk.fraction);

  const birthMs = Date.parse(`${dob}T${tob || "12:00"}:00Z`);
  if (!isFinite(birthMs)) {
    return { lord: first.lord, yearsRemaining: initialRemaining };
  }
  const yearsLived = (today.getTime() - birthMs) / (365.2425 * 86400000);

  const cursor = initialRemaining;
  if (yearsLived <= cursor) {
    return { lord: first.lord, yearsRemaining: cursor - yearsLived };
  }
  let elapsed = cursor;
  for (let i = 1; i < 200; i++) {
    const d = DASHA_SEQ[(seqStart + i) % DASHA_SEQ.length];
    if (yearsLived <= elapsed + d.years) {
      return { lord: d.lord, yearsRemaining: elapsed + d.years - yearsLived };
    }
    elapsed += d.years;
  }
  // Should never reach.
  return { lord: first.lord, yearsRemaining: 0 };
}

export function computeVedic(chart: BirthChart, today = new Date()): VedicProfile | undefined {
  if (!chart.date_of_birth) return undefined;
  const tob = chart.time_unknown ? undefined : chart.time_of_birth;
  const nk = nakshatraFromBirth(chart.date_of_birth, tob);
  const t = tithiFromBirth(chart.date_of_birth, tob);
  const dasha = currentMahadasha(chart.date_of_birth, tob, today);
  return {
    rashi: rashiFromDob(chart.date_of_birth),
    nakshatra: nk.nakshatra,
    pada: nk.pada,
    tithi: t.tithi,
    paksha: t.paksha,
    currentDashaLord: dasha.lord,
    dashaYearsRemaining: Math.round(dasha.yearsRemaining * 10) / 10,
  };
}

// ── Friendly labels ───────────────────────────────────────────────────────

export const RASHI_LABEL: Record<Rashi, string> = {
  mesha: "Mesha (Aries)",
  vrishabha: "Vrishabha (Taurus)",
  mithuna: "Mithuna (Gemini)",
  karka: "Karka (Cancer)",
  simha: "Simha (Leo)",
  kanya: "Kanya (Virgo)",
  tula: "Tula (Libra)",
  vrischika: "Vrischika (Scorpio)",
  dhanu: "Dhanu (Sagittarius)",
  makara: "Makara (Capricorn)",
  kumbha: "Kumbha (Aquarius)",
  meena: "Meena (Pisces)",
};

export const NAKSHATRA_LABEL: Record<Nakshatra, string> = {
  ashwini: "Ashwini", bharani: "Bharani", krittika: "Krittika", rohini: "Rohini",
  mrigashira: "Mrigashira", ardra: "Ardra", punarvasu: "Punarvasu", pushya: "Pushya",
  ashlesha: "Ashlesha", magha: "Magha", purva_phalguni: "Purva Phalguni",
  uttara_phalguni: "Uttara Phalguni", hasta: "Hasta", chitra: "Chitra",
  swati: "Swati", vishakha: "Vishakha", anuradha: "Anuradha", jyeshtha: "Jyeshtha",
  mula: "Mula", purva_ashadha: "Purva Ashadha", uttara_ashadha: "Uttara Ashadha",
  shravana: "Shravana", dhanishta: "Dhanishta", shatabhisha: "Shatabhisha",
  purva_bhadrapada: "Purva Bhadrapada", uttara_bhadrapada: "Uttara Bhadrapada",
  revati: "Revati",
};

export const DASHA_LABEL: Record<DashaLord, string> = {
  ketu: "Ketu", venus: "Venus (Shukra)", sun: "Sun (Surya)", moon: "Moon (Chandra)",
  mars: "Mars (Mangal)", rahu: "Rahu", jupiter: "Jupiter (Guru)",
  saturn: "Saturn (Shani)", mercury: "Mercury (Budha)",
};

export function dashaTheme(lord: DashaLord): string {
  const map: Record<DashaLord, string> = {
    ketu: "Letting go. Detachment, mysticism, endings becoming doors.",
    venus: "Beauty, relationship, art, sensual life. Soft expansion.",
    sun: "Self, authority, purpose. Stand in your light.",
    moon: "Feeling, mother, home, the inner tide.",
    mars: "Action, courage, conflict, focused will.",
    rahu: "Hunger for the new. Worldly ambition. Smoke and mirrors test you.",
    jupiter: "Wisdom, teachers, expansion, dharma.",
    saturn: "Discipline, time, karma, the long road that finally arrives.",
    mercury: "Mind, communication, business, learning.",
  };
  return map[lord];
}
