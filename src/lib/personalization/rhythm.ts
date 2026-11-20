/**
 * Daily-rhythm engine — Brahma muhurta, Abhijit muhurta, Rahu kalam.
 *
 * If we have lat/lon, we compute true sunrise/sunset using NOAA's solar
 * algorithm. Otherwise we fall back to a sane default (06:15 / 18:30) and
 * mark confidence as "low" upstream.
 */
import type { BirthChart, DailyRhythm, RhythmWindow } from "./types";

function fmt(mins: number): string {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// ── NOAA-style solar calculation ──────────────────────────────────────────

function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  return Math.floor((d.getTime() - start) / 86400000);
}

/**
 * Returns sunrise + sunset minutes (local solar time, then offset to local
 * civil clock using the device timezone offset for the given date).
 * Approximation good to ±2 min for most temperate latitudes.
 */
function solarTimes(lat: number, lon: number, date: Date): { sunrise: number; sunset: number } {
  const N = dayOfYear(date);
  const lngHour = lon / 15;
  const compute = (rising: boolean) => {
    const t = N + ((rising ? 6 : 18) - lngHour) / 24;
    const M = (0.9856 * t) - 3.289;
    let L = M + 1.916 * Math.sin((Math.PI / 180) * M)
              + 0.020 * Math.sin((Math.PI / 180) * 2 * M) + 282.634;
    L = ((L % 360) + 360) % 360;
    let RA = (180 / Math.PI) * Math.atan(0.91764 * Math.tan((Math.PI / 180) * L));
    RA = ((RA % 360) + 360) % 360;
    const Lq = Math.floor(L / 90) * 90;
    const RAq = Math.floor(RA / 90) * 90;
    RA = (RA + (Lq - RAq)) / 15;
    const sinDec = 0.39782 * Math.sin((Math.PI / 180) * L);
    const cosDec = Math.cos(Math.asin(sinDec));
    const zenith = 90.833;
    const cosH = (Math.cos((Math.PI / 180) * zenith) - sinDec * Math.sin((Math.PI / 180) * lat))
               / (cosDec * Math.cos((Math.PI / 180) * lat));
    if (cosH > 1 || cosH < -1) return rising ? 6 * 60 : 18 * 60; // polar fallback
    const H = rising
      ? 360 - (180 / Math.PI) * Math.acos(cosH)
      : (180 / Math.PI) * Math.acos(cosH);
    const T = H / 15 + RA - (0.06571 * t) - 6.622;
    let UT = T - lngHour;
    UT = ((UT % 24) + 24) % 24;
    // Local clock offset (minutes east of UTC; JS gives minutes west).
    const offsetMin = -date.getTimezoneOffset();
    return Math.round(UT * 60 + offsetMin);
  };
  return { sunrise: compute(true), sunset: compute(false) };
}

// ── Rahu kalam — fixed weekday segment of the day ─────────────────────────
// Order from Sunday (0) through Saturday (6).
const RAHU_SEGMENT: number[] = [8, 2, 7, 5, 6, 4, 3]; // 1-indexed segment, of 8

function rahuKalam(sunrise: number, sunset: number, weekday: number): RhythmWindow {
  const dayLen = sunset - sunrise;
  const seg = dayLen / 8;
  const idx = RAHU_SEGMENT[weekday] - 1;
  const start = sunrise + seg * idx;
  const end = start + seg;
  return { start: fmt(start), end: fmt(end), label: "Rahu Kalam", kind: "inauspicious" };
}

function brahmaMuhurta(sunrise: number): RhythmWindow {
  // 1.5 muhurta (~96 minutes) before sunrise; window length 48 min.
  const start = sunrise - 96;
  const end = start + 48;
  return { start: fmt(start), end: fmt(end), label: "Brahma Muhurta", kind: "auspicious" };
}

function abhijitMuhurta(sunrise: number, sunset: number): RhythmWindow {
  const noon = (sunrise + sunset) / 2;
  return { start: fmt(noon - 24), end: fmt(noon + 24), label: "Abhijit Muhurta", kind: "auspicious" };
}

export function computeDailyRhythm(chart: BirthChart, today = new Date()): DailyRhythm {
  let sr = toMinutes("06:15");
  let ss = toMinutes("18:30");
  if (typeof chart.latitude === "number" && typeof chart.longitude === "number") {
    const t = solarTimes(chart.latitude, chart.longitude, today);
    sr = t.sunrise;
    ss = t.sunset;
  }
  return {
    sunrise: fmt(sr),
    sunset: fmt(ss),
    brahmaMuhurta: brahmaMuhurta(sr),
    abhijitMuhurta: abhijitMuhurta(sr, ss),
    rahuKalam: rahuKalam(sr, ss, today.getDay()),
  };
}
