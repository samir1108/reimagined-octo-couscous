/**
 * COSMIC WEATHER — the sky's quiet context for the day.
 *
 * Pure client-side port of the arc engine's lunar/seasonal flavor
 * (supabase/functions/_shared/arcEngine.ts) so Home can speak it without a
 * network call. Cheap synodic-month approximation: new moon at 2000-01-06.
 */

export interface CosmicWeather {
  /** e.g. "Waxing crescent" */
  moonPhase: string;
  /** Short behavioral nudge, e.g. "build, expand, take small action" */
  moonNudge: string;
  /** e.g. "Autumn" */
  season: string;
  /** Short seasonal nudge, e.g. "release, gratitude, letting fall what is done" */
  seasonNudge: string;
}

const SYNODIC_DAYS = 29.530588853;
const REF_NEW_MOON_MS = Date.UTC(2000, 0, 6);

export function getCosmicWeather(now: Date = new Date()): CosmicWeather {
  // ── Moon ──
  const age = (((now.getTime() - REF_NEW_MOON_MS) % (SYNODIC_DAYS * 86400000)) +
    SYNODIC_DAYS * 86400000) % (SYNODIC_DAYS * 86400000);
  const dayInCycle = age / 86400000;

  let moonPhase = "Waxing crescent";
  let moonNudge = "build, expand, take small action";
  if (dayInCycle < 2) {
    moonPhase = "New moon";
    moonNudge = "release, plant an intention, begin";
  } else if (dayInCycle > 13.5 && dayInCycle < 15.5) {
    moonPhase = "Full moon";
    moonNudge = "reveal, integrate, harvest insight";
  } else if (dayInCycle >= 7 && dayInCycle < 13.5) {
    moonPhase = "Waxing gibbous";
    moonNudge = "refine, come near completion";
  } else if (dayInCycle >= 15.5 && dayInCycle < 22) {
    moonPhase = "Waning gibbous";
    moonNudge = "share, distribute, give";
  } else if (dayInCycle >= 22) {
    moonPhase = "Waning crescent";
    moonNudge = "rest, release, prepare for the new";
  }

  // ── Season (northern-hemisphere rhythm, same as the arc engine) ──
  const month = now.getMonth();
  let season = "Winter";
  let seasonNudge = "retreat, silence, deep restoration";
  if ([2, 3, 4].includes(month)) {
    season = "Spring";
    seasonNudge = "expansion, new beginnings, opening";
  } else if ([5, 6, 7].includes(month)) {
    season = "Summer";
    seasonNudge = "fullness, action, embodiment";
  } else if ([8, 9, 10].includes(month)) {
    season = "Autumn";
    seasonNudge = "release, gratitude, letting fall what is done";
  }

  return { moonPhase, moonNudge, season, seasonNudge };
}
