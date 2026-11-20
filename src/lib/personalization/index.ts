/**
 * Personalization orchestrator.
 *
 * computePersonalProfile(chart, name)
 *   → numerology + western + Vedic + daily rhythm + a single voted "today insight".
 *
 * All sub-engines are pure and deterministic. No network calls, no AI.
 */
import type { BirthChart, PersonalProfile } from "./types";
import {
  computeNumerology, lifePathDescription, personalDayPrompt,
} from "./numerology";
import { computeWesternAstrology, sunSignEssence } from "./astrology";
import {
  computeVedic, dashaTheme, RASHI_LABEL, NAKSHATRA_LABEL, DASHA_LABEL,
} from "./vedic";
import { computeDailyRhythm } from "./rhythm";

export * from "./types";
export * from "./numerology";
export * from "./astrology";
export * from "./vedic";
export * from "./rhythm";

export function computePersonalProfile(
  chart: BirthChart | null | undefined,
  name?: string,
  today = new Date(),
): PersonalProfile | null {
  if (!chart?.date_of_birth) return null;

  const numerology = computeNumerology(chart.date_of_birth, name, today);
  const astrology = computeWesternAstrology(chart.date_of_birth);
  const vedic = computeVedic(chart, today);
  const rhythm = computeDailyRhythm(chart, today);

  // Today's voted insight: rotate among numerology / sun-sign / dasha to
  // keep it fresh day-over-day.
  const dayOfYear = Math.floor(
    (today.getTime() - Date.UTC(today.getFullYear(), 0, 0)) / 86400000,
  );
  const candidates = [
    personalDayPrompt(numerology.personalDay),
    sunSignEssence(astrology.sunSign),
    vedic ? dashaTheme(vedic.currentDashaLord) : null,
  ].filter((s): s is string => Boolean(s));
  const todayInsight = candidates[dayOfYear % candidates.length];

  return {
    numerology,
    astrology,
    vedic,
    rhythm,
    todayInsight,
    confidence: {
      numerology: "high",
      astrology: "high",
      vedic: chart.time_unknown || !chart.time_of_birth ? "low" : "high",
      rhythm: typeof chart.latitude === "number" ? "high" : "low",
    },
  };
}

/** Friendly one-line "you are…" headline for the home screen. */
export function profileHeadline(p: PersonalProfile): string {
  const lp = p.numerology.lifePath;
  const sun = p.astrology?.sunSign ?? "";
  const sunCap = sun ? sun[0].toUpperCase() + sun.slice(1) : "";
  return `Life Path ${lp} · ${sunCap} · ${lifePathDescription(lp).split(".")[0]}.`;
}

/** Pretty Vedic line — e.g. "Mesha • Rohini · pada 2 · Jupiter dasha (3.4y left)". */
export function vedicLine(p: PersonalProfile): string | null {
  if (!p.vedic) return null;
  const v = p.vedic;
  return `${RASHI_LABEL[v.rashi]} • ${NAKSHATRA_LABEL[v.nakshatra]} (pada ${v.pada}) • ${DASHA_LABEL[v.currentDashaLord]} dasha (${v.dashaYearsRemaining}y)`;
}

export * from "./threads";

