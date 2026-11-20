/**
 * Personalization types — birth-chart-derived insights for the
 * astrology / numerology / Vedic-rhythm engines.
 *
 * Pure data; no I/O. See:
 *   numerology.ts  – Pythagorean numerology (life path, expression, etc.)
 *   astrology.ts   – Western tropical sun sign + element/modality
 *   vedic.ts       – Sidereal Rashi, Nakshatra, Tithi, Vimshottari Mahadasha
 *   rhythm.ts      – Brahma muhurta, Rahu kalam, Abhijit muhurta windows
 *   index.ts       – orchestrator: computePersonalProfile(chart, name)
 */

export interface BirthChart {
  date_of_birth?: string;   // YYYY-MM-DD
  time_of_birth?: string;   // HH:MM (24h, local)
  time_unknown?: boolean;
  place_of_birth?: string;  // free-text "City, Country"
  /** Optional, set if we ever resolve the place to coordinates. */
  latitude?: number;
  longitude?: number;
  /** Optional IANA tz; if absent we fall back to the user's device tz. */
  timezone?: string;
}

export interface NumerologyProfile {
  lifePath: number;            // 1-9, 11, 22, 33
  birthday: number;            // 1-31
  expression?: number;         // 1-9, 11, 22, 33 (from name)
  soulUrge?: number;           // 1-9, 11, 22, 33 (vowels of name)
  personality?: number;        // 1-9, 11, 22, 33 (consonants)
  personalYear: number;        // 1-9 for the current calendar year
  personalDay: number;         // 1-9 for today
}

export type WesternSign =
  | "aries" | "taurus" | "gemini" | "cancer" | "leo" | "virgo"
  | "libra" | "scorpio" | "sagittarius" | "capricorn" | "aquarius" | "pisces";

export type Element = "fire" | "earth" | "air" | "water";
export type Modality = "cardinal" | "fixed" | "mutable";

export interface AstrologyProfile {
  sunSign: WesternSign;
  element: Element;
  modality: Modality;
  rulingPlanet: string;
}

export type Rashi =
  | "mesha" | "vrishabha" | "mithuna" | "karka" | "simha" | "kanya"
  | "tula" | "vrischika" | "dhanu" | "makara" | "kumbha" | "meena";

export type Nakshatra =
  | "ashwini" | "bharani" | "krittika" | "rohini" | "mrigashira" | "ardra"
  | "punarvasu" | "pushya" | "ashlesha" | "magha" | "purva_phalguni" | "uttara_phalguni"
  | "hasta" | "chitra" | "swati" | "vishakha" | "anuradha" | "jyeshtha"
  | "mula" | "purva_ashadha" | "uttara_ashadha" | "shravana" | "dhanishta" | "shatabhisha"
  | "purva_bhadrapada" | "uttara_bhadrapada" | "revati";

export type DashaLord =
  | "ketu" | "venus" | "sun" | "moon" | "mars" | "rahu" | "jupiter" | "saturn" | "mercury";

export interface VedicProfile {
  /** Sidereal sun-sign. Approximate (no real ephemeris). */
  rashi: Rashi;
  /** Moon-mansion derived from Moon longitude approximation. Approximate. */
  nakshatra: Nakshatra;
  /** Padam 1-4 within the nakshatra. */
  pada: 1 | 2 | 3 | 4;
  /** Lunar day at birth, 1-30. Approximate. */
  tithi: number;
  /** Bright (shukla) or dark (krishna) fortnight. */
  paksha: "shukla" | "krishna";
  /** Current Vimshottari Mahadasha lord. */
  currentDashaLord: DashaLord;
  /** Years remaining in current Mahadasha. */
  dashaYearsRemaining: number;
}

export interface RhythmWindow {
  /** Local clock time HH:MM. */
  start: string;
  end: string;
  label: string;
  kind: "auspicious" | "inauspicious" | "neutral";
}

export interface DailyRhythm {
  /** Sunrise / sunset estimated for the user's date+coords (or fallback). */
  sunrise: string;
  sunset: string;
  brahmaMuhurta: RhythmWindow;
  abhijitMuhurta: RhythmWindow;
  rahuKalam: RhythmWindow;
}

export interface PersonalProfile {
  numerology: NumerologyProfile;
  astrology?: AstrologyProfile;
  vedic?: VedicProfile;
  rhythm?: DailyRhythm;
  /** A short, one-line phrase the engines vote on for the day. */
  todayInsight: string;
  /** Confidence flags so the UI can hide low-confidence claims. */
  confidence: {
    numerology: "high" | "low";
    astrology: "high" | "low" | "none";
    vedic: "high" | "low" | "none";
    rhythm: "high" | "low" | "none";
  };
}
