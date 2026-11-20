/**
 * Western tropical sun-sign engine.
 * Pure date-of-birth → sign + element + modality + ruling planet.
 *
 * Cusp dates use the standard tropical convention (close enough for daily UX
 * — exact cusps vary by year/longitude and would require an ephemeris).
 */
import type { AstrologyProfile, Element, Modality, WesternSign } from "./types";

const SIGN_RANGES: Array<{ sign: WesternSign; from: [number, number]; to: [number, number] }> = [
  { sign: "capricorn",   from: [12, 22], to: [1, 19] },
  { sign: "aquarius",    from: [1, 20],  to: [2, 18] },
  { sign: "pisces",      from: [2, 19],  to: [3, 20] },
  { sign: "aries",       from: [3, 21],  to: [4, 19] },
  { sign: "taurus",      from: [4, 20],  to: [5, 20] },
  { sign: "gemini",      from: [5, 21],  to: [6, 20] },
  { sign: "cancer",      from: [6, 21],  to: [7, 22] },
  { sign: "leo",         from: [7, 23],  to: [8, 22] },
  { sign: "virgo",       from: [8, 23],  to: [9, 22] },
  { sign: "libra",       from: [9, 23],  to: [10, 22] },
  { sign: "scorpio",     from: [10, 23], to: [11, 21] },
  { sign: "sagittarius", from: [11, 22], to: [12, 21] },
];

const META: Record<WesternSign, { element: Element; modality: Modality; ruler: string }> = {
  aries:       { element: "fire",  modality: "cardinal", ruler: "Mars" },
  taurus:      { element: "earth", modality: "fixed",    ruler: "Venus" },
  gemini:      { element: "air",   modality: "mutable",  ruler: "Mercury" },
  cancer:      { element: "water", modality: "cardinal", ruler: "Moon" },
  leo:         { element: "fire",  modality: "fixed",    ruler: "Sun" },
  virgo:       { element: "earth", modality: "mutable",  ruler: "Mercury" },
  libra:       { element: "air",   modality: "cardinal", ruler: "Venus" },
  scorpio:     { element: "water", modality: "fixed",    ruler: "Mars / Pluto" },
  sagittarius: { element: "fire",  modality: "mutable",  ruler: "Jupiter" },
  capricorn:   { element: "earth", modality: "cardinal", ruler: "Saturn" },
  aquarius:    { element: "air",   modality: "fixed",    ruler: "Saturn / Uranus" },
  pisces:      { element: "water", modality: "mutable",  ruler: "Jupiter / Neptune" },
};

export function sunSignFromDob(iso: string): WesternSign {
  const [, m, d] = iso.split("-").map((s) => parseInt(s, 10));
  for (const r of SIGN_RANGES) {
    const [fM, fD] = r.from;
    const [tM, tD] = r.to;
    if (fM === tM) {
      if (m === fM && d >= fD && d <= tD) return r.sign;
    } else {
      // Range crosses month boundary
      if ((m === fM && d >= fD) || (m === tM && d <= tD)) return r.sign;
    }
  }
  // Defensive default — shouldn't happen for valid dates.
  return "capricorn";
}

export function computeWesternAstrology(dob: string): AstrologyProfile {
  const sun = sunSignFromDob(dob);
  const meta = META[sun];
  return {
    sunSign: sun,
    element: meta.element,
    modality: meta.modality,
    rulingPlanet: meta.ruler,
  };
}

const SIGN_ESSENCE: Record<WesternSign, string> = {
  aries:       "Initiating fire. Begin clean. Don't dim yourself to fit a room.",
  taurus:      "Steady earth. Slowness is your magic. Sense the body first.",
  gemini:      "Curious air. Choose one thread today and follow it.",
  cancer:      "Tender water. Belonging is a practice, not a place.",
  leo:         "Generous fire. Be seen on purpose. Hide nothing important.",
  virgo:       "Refining earth. Imperfection is the doorway, not the wall.",
  libra:       "Balancing air. Choose. The right thing rarely feels even.",
  scorpio:     "Depth water. Whatever you face, faces you back.",
  sagittarius: "Wide fire. Make room. Truth is bigger than your last opinion.",
  capricorn:   "Building earth. Long arc. Honor today's small disciplined act.",
  aquarius:    "Future air. The new thing you see is real — keep seeing it.",
  pisces:      "Vast water. Boundaries are kind. Devotion is direction.",
};

export function sunSignEssence(sign: WesternSign): string {
  return SIGN_ESSENCE[sign];
}
