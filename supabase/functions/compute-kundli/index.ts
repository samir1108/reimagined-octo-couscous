// Compute Vedic kundli (sidereal) from dob/time/place.
// Sun & Moon use Meeus low-precision; Mars/Mercury/Jupiter/Venus/Saturn use mean
// elements. Sufficient for sign placement, Nakshatra (Moon), Yoni/Gana/Nadi/Varna,
// Tithi, Karana, Yoga, Vimshottari Mahadasha, Lagna.
import { createClient } from "npm:@supabase/supabase-js@2.95.0";
import { corsHeaders } from "../_shared/cors.ts";

const SIGNS = ["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya","Tula","Vrishchika","Dhanu","Makara","Kumbha","Meena"];
const SIGN_LORDS = ["Mars","Venus","Mercury","Moon","Sun","Mercury","Venus","Mars","Jupiter","Saturn","Saturn","Jupiter"];
const NAKSHATRAS = [
  ["Ashwini","Ketu","Horse","Deva","Vata","Kshatriya"],
  ["Bharani","Venus","Elephant","Manushya","Pitta","Mleccha"],
  ["Krittika","Sun","Sheep","Rakshasa","Kapha","Brahmin"],
  ["Rohini","Moon","Serpent","Manushya","Kapha","Shudra"],
  ["Mrigashira","Mars","Serpent","Deva","Pitta","Kshatriya"],
  ["Ardra","Rahu","Dog","Manushya","Vata","Shudra"],
  ["Punarvasu","Jupiter","Cat","Deva","Vata","Vaishya"],
  ["Pushya","Saturn","Sheep","Deva","Pitta","Kshatriya"],
  ["Ashlesha","Mercury","Cat","Rakshasa","Kapha","Mleccha"],
  ["Magha","Ketu","Rat","Rakshasa","Kapha","Shudra"],
  ["Purva Phalguni","Venus","Rat","Manushya","Pitta","Brahmin"],
  ["Uttara Phalguni","Sun","Cow","Manushya","Vata","Kshatriya"],
  ["Hasta","Moon","Buffalo","Deva","Vata","Vaishya"],
  ["Chitra","Mars","Tiger","Rakshasa","Pitta","Shudra"],
  ["Swati","Rahu","Buffalo","Deva","Kapha","Butcher"],
  ["Vishakha","Jupiter","Tiger","Rakshasa","Kapha","Mleccha"],
  ["Anuradha","Saturn","Deer","Deva","Pitta","Shudra"],
  ["Jyeshtha","Mercury","Deer","Rakshasa","Vata","Servant"],
  ["Mula","Ketu","Dog","Rakshasa","Vata","Butcher"],
  ["Purva Ashadha","Venus","Monkey","Manushya","Pitta","Brahmin"],
  ["Uttara Ashadha","Sun","Mongoose","Manushya","Kapha","Kshatriya"],
  ["Shravana","Moon","Monkey","Deva","Kapha","Mleccha"],
  ["Dhanishta","Mars","Lion","Rakshasa","Pitta","Farmer"],
  ["Shatabhisha","Rahu","Horse","Rakshasa","Vata","Butcher"],
  ["Purva Bhadrapada","Jupiter","Lion","Manushya","Vata","Brahmin"],
  ["Uttara Bhadrapada","Saturn","Cow","Manushya","Pitta","Kshatriya"],
  ["Revati","Mercury","Elephant","Deva","Kapha","Shudra"],
];
const VIM_LORDS = ["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"];
const VIM_YEARS = [7,20,6,10,7,18,16,19,17];
const NAK_LORD_INDEX: Record<string, number> = { Ketu:0, Venus:1, Sun:2, Moon:3, Mars:4, Rahu:5, Jupiter:6, Saturn:7, Mercury:8 };
const VARNA_BY_SIGN = ["Kshatriya","Vaishya","Shudra","Brahmin","Kshatriya","Vaishya","Shudra","Brahmin","Kshatriya","Vaishya","Shudra","Brahmin"];
const VASHYA_BY_SIGN = ["Chatushpada","Chatushpada","Manushya","Jalachara","Vanachara","Manushya","Manushya/Jalachara","Keeta","Chatushpada/Manushya","Jalachara/Chatushpada","Manushya","Jalachara"];
const KARANAS = ["Bava","Balava","Kaulava","Taitila","Garaja","Vanija","Vishti"];
const FIXED_KARANAS = ["Shakuni","Chatushpada","Naga","Kimstughna"];
const YOGAS = ["Vishkambha","Priti","Ayushman","Saubhagya","Shobhana","Atiganda","Sukarma","Dhriti","Shula","Ganda","Vriddhi","Dhruva","Vyaghata","Harshana","Vajra","Siddhi","Vyatipata","Variyana","Parigha","Shiva","Siddha","Sadhya","Shubha","Shukla","Brahma","Indra","Vaidhriti"];
const TITHI_NAMES = ["Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Purnima/Amavasya"];

const norm = (d: number) => ((d % 360) + 360) % 360;
const rad = (d: number) => d * Math.PI / 180;

// Julian Day from UTC
function julianDay(y: number, m: number, d: number, h: number): number {
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + h / 24 + B - 1524.5;
}

// Lahiri ayanamsa approx (degrees)
function lahiriAyanamsa(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return 23.85 + 0.0137 * (jd - 2451545.0) / 365.25 - 0; // simple linear ~23.85° at J2000 +50.3"/yr
}

// Sun longitude (Meeus low precision)
function sunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T;
  const M = 357.52911 + 35999.05029 * T;
  const Mr = rad(norm(M));
  const C = (1.914602 - 0.004817 * T) * Math.sin(Mr) + 0.019993 * Math.sin(2 * Mr) + 0.000289 * Math.sin(3 * Mr);
  return norm(L0 + C);
}

// Moon longitude (simplified Meeus, accurate ~0.1°)
function moonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const Lp = 218.3164477 + 481267.88123421 * T;
  const D = 297.8501921 + 445267.1114034 * T;
  const M = 357.5291092 + 35999.0502909 * T;
  const Mp = 134.9633964 + 477198.8675055 * T;
  const F = 93.272095 + 483202.0175233 * T;
  const Dr = rad(norm(D)), Mr = rad(norm(M)), Mpr = rad(norm(Mp)), Fr = rad(norm(F));
  let lon = Lp;
  lon += 6.288774 * Math.sin(Mpr);
  lon += 1.274027 * Math.sin(2 * Dr - Mpr);
  lon += 0.658314 * Math.sin(2 * Dr);
  lon += 0.213618 * Math.sin(2 * Mpr);
  lon -= 0.185116 * Math.sin(Mr);
  lon -= 0.114332 * Math.sin(2 * Fr);
  lon += 0.058793 * Math.sin(2 * Dr - 2 * Mpr);
  lon += 0.057066 * Math.sin(2 * Dr - Mr - Mpr);
  lon += 0.053322 * Math.sin(2 * Dr + Mpr);
  return norm(lon);
}

// Crude planet (mean longitudes — sign-level only)
function meanPlanet(jd: number, L0: number, n: number): number {
  return norm(L0 + n * (jd - 2451545.0));
}

// Local Sidereal Time -> Ascendant
function ascendant(jd: number, lat: number, lon: number, ayan: number): number {
  const T = (jd - 2451545.0) / 36525;
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + T * T * 0.000387933;
  const lst = norm(gmst + lon);
  const eps = 23.4392911;
  const lstR = rad(lst), epsR = rad(eps), latR = rad(lat);
  const ascR = Math.atan2(Math.cos(lstR), -(Math.sin(epsR) * Math.tan(latR) + Math.cos(epsR) * Math.sin(lstR)));
  let asc = norm(ascR * 180 / Math.PI);
  asc = norm(asc - ayan);
  return asc;
}

function nakshatraInfo(moonLon: number) {
  const idx = Math.floor(moonLon / (360 / 27));
  const within = moonLon - idx * (360 / 27);
  const pada = Math.floor(within / ((360 / 27) / 4)) + 1;
  const n = NAKSHATRAS[idx];
  return { index: idx, name: n[0], lord: n[1], yoni: n[2], gana: n[3], nadi: n[4], varna: n[5], pada };
}

function tithiInfo(sun: number, moon: number) {
  const diff = norm(moon - sun);
  const t = Math.floor(diff / 12);
  const paksha = t < 15 ? "Shukla" : "Krishna";
  const num = t % 15;
  const name = num === 14 ? (t < 15 ? "Purnima" : "Amavasya") : TITHI_NAMES[num];
  return { tithi: `${paksha} ${name}`, index: t };
}

function karanaInfo(sun: number, moon: number) {
  const diff = norm(moon - sun);
  const k = Math.floor(diff / 6);
  if (k === 0) return FIXED_KARANAS[3]; // Kimstughna at start
  if (k >= 57) return FIXED_KARANAS[k - 57]; // last 3
  return KARANAS[(k - 1) % 7];
}

function yogaInfo(sun: number, moon: number) {
  const sum = norm(sun + moon);
  return YOGAS[Math.floor(sum / (360 / 27))];
}

// Vimshottari mahadasha at birth
function currentMahadasha(jd: number, moonLon: number): { lord: string; endJd: number } {
  const segment = 360 / 27;
  const idx = Math.floor(moonLon / segment);
  const lord = NAKSHATRAS[idx][1];
  const lordIdx = NAK_LORD_INDEX[lord];
  const within = moonLon - idx * segment;
  const fraction = within / segment;
  const totalDays = VIM_YEARS[lordIdx] * 365.2425;
  const remaining = totalDays * (1 - fraction);
  let endJd = jd + remaining;
  // Walk forward to find current dasha at "today"
  const today = nowJd();
  let curLord = lord;
  let i = lordIdx;
  while (endJd < today) {
    i = (i + 1) % 9;
    curLord = VIM_LORDS[i];
    endJd += VIM_YEARS[i] * 365.2425;
  }
  return { lord: curLord, endJd };
}

function nowJd(): number {
  const d = new Date();
  return julianDay(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(),
    d.getUTCHours() + d.getUTCMinutes()/60);
}

function jdToDate(jd: number): string {
  const ms = (jd - 2440587.5) * 86400000;
  return new Date(ms).toISOString().slice(0, 10);
}

// Pythagorean numerology
function lifePath(dob: string): number {
  const digits = dob.replace(/\D/g, "").split("").map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) sum = String(sum).split("").reduce((a, b) => a + Number(b), 0);
  return sum;
}

async function geocode(place: string): Promise<{ lat: number; lon: number; tz: string } | null> {
  try {
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=en&format=json`);
    const j = await r.json();
    const hit = j?.results?.[0];
    if (!hit) return null;
    return { lat: hit.latitude, lon: hit.longitude, tz: hit.timezone || "UTC" };
  } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json();
    const dob: string | undefined = body.date_of_birth;
    const tob: string | undefined = body.time_of_birth;
    const timeUnknown: boolean = !!body.time_unknown || !tob;
    const place: string | undefined = body.place_of_birth;
    if (!dob) return new Response(JSON.stringify({ error: "date_of_birth required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    let lat = 0, lon = 0, tz = "UTC";
    if (place) {
      const geo = await geocode(place);
      if (geo) { lat = geo.lat; lon = geo.lon; tz = geo.tz; }
    }

    // Use noon local if time unknown (reduces moon error to ~6°)
    const [y, m, d] = dob.split("-").map(Number);
    const [hh, mm] = (timeUnknown ? "12:00" : tob!).split(":").map(Number);
    // Approx UTC offset from longitude when timezone db not resolved
    const offsetHours = lon ? lon / 15 : 0;
    const localHours = hh + mm / 60;
    const utcHours = localHours - offsetHours;
    const jd = julianDay(y, m, d, utcHours);

    const ayan = lahiriAyanamsa(jd);
    const sunTrop = sunLongitude(jd);
    const moonTrop = moonLongitude(jd);
    const sunSid = norm(sunTrop - ayan);
    const moonSid = norm(moonTrop - ayan);

    // Mean planets (tropical) → sidereal
    const planets: Record<string, { longitude: number; sign: string; signLord: string }> = {};
    const make = (name: string, lonTrop: number) => {
      const l = norm(lonTrop - ayan);
      const s = Math.floor(l / 30);
      planets[name] = { longitude: +l.toFixed(2), sign: SIGNS[s], signLord: SIGN_LORDS[s] };
    };
    make("Sun", sunTrop);
    make("Moon", moonTrop);
    make("Mars", meanPlanet(jd, 355.45332, 0.524033)); // mean motion deg/day
    make("Mercury", meanPlanet(jd, 252.25084, 4.092339));
    make("Jupiter", meanPlanet(jd, 34.40438, 0.083091));
    make("Venus", meanPlanet(jd, 181.97973, 1.602136));
    make("Saturn", meanPlanet(jd, 50.07747, 0.033494));
    // Rahu (mean lunar node, retrograde)
    const rahuTrop = norm(125.04452 - 0.05295376 * (jd - 2451545.0));
    make("Rahu", rahuTrop);
    make("Ketu", norm(rahuTrop + 180));

    const moonSignIdx = Math.floor(moonSid / 30);
    const sunSignIdx = Math.floor(sunSid / 30);
    const nak = nakshatraInfo(moonSid);
    const tithi = tithiInfo(sunTrop, moonTrop);
    const karana = karanaInfo(sunTrop, moonTrop);
    const yoga = yogaInfo(sunTrop, moonTrop);
    const dasha = currentMahadasha(jd, moonSid);

    let asc: number | null = null;
    let ascSign: string | null = null;
    if (!timeUnknown && (lat || lon)) {
      asc = ascendant(jd, lat, lon, ayan);
      ascSign = SIGNS[Math.floor(asc / 30)];
    }

    // Houses (whole-sign from ascendant or moon if no time)
    const houseAnchor = asc !== null ? Math.floor(asc / 30) : moonSignIdx;
    const houses: Record<string, string[]> = {};
    for (let i = 0; i < 12; i++) houses[`H${i + 1}`] = [SIGNS[(houseAnchor + i) % 12]];
    for (const [name, p] of Object.entries(planets)) {
      const sIdx = SIGNS.indexOf(p.sign);
      const h = ((sIdx - houseAnchor + 12) % 12) + 1;
      houses[`H${h}`].push(name);
    }

    const numerology = {
      life_path: lifePath(dob),
      birth_day: Number(dob.slice(8, 10)),
    };

    const insights = {
      summary: `Moon in ${SIGNS[moonSignIdx]} (${nak.name}) — Yoni: ${nak.yoni}, Gana: ${nak.gana}, Nadi: ${nak.nadi}. Sun in ${SIGNS[sunSignIdx]}. Currently in ${dasha.lord} Mahadasha.`,
      strengths: [
        `${nak.gana} temperament — ${nak.gana === "Deva" ? "harmonious & graceful" : nak.gana === "Manushya" ? "balanced human qualities" : "intense & transformative"}`,
        `${nak.yoni} yoni — animal nature shaping intimacy & instinct`,
        `${nak.nadi} dosha constitution — guides diet & energy work`,
      ],
      practice_recommendations: [
        nak.nadi === "Vata" ? "Grounding pranayama (Nadi Shodhana, slow Brahmari)" :
        nak.nadi === "Pitta" ? "Cooling practices (Sheetali, Chandra Bhedana, moon gazing)" :
        "Energising kapha-balancing (Kapalbhati, Surya Bhedana, brisk movement)",
        `Honour your ${nak.lord} ruler — ${nak.lord === "Moon" ? "lunar rituals" : nak.lord === "Sun" ? "solar salutations" : `${nak.lord}-mantra on its weekday`}`,
      ],
    };

    const row = {
      user_id: user.id,
      date_of_birth: dob,
      time_of_birth: timeUnknown ? null : tob,
      time_unknown: timeUnknown,
      place_of_birth: place || null,
      latitude: lat || null,
      longitude: lon || null,
      timezone: tz,
      ayanamsa: +ayan.toFixed(4),
      sun_longitude: +sunSid.toFixed(2),
      moon_longitude: +moonSid.toFixed(2),
      ascendant_longitude: asc !== null ? +asc.toFixed(2) : null,
      rashi: SIGNS[moonSignIdx],
      rashi_lord: SIGN_LORDS[moonSignIdx],
      nakshatra: nak.name,
      nakshatra_lord: nak.lord,
      pada: nak.pada,
      yoni: nak.yoni,
      gana: nak.gana,
      nadi: nak.nadi,
      varna: VARNA_BY_SIGN[moonSignIdx],
      vashya: VASHYA_BY_SIGN[moonSignIdx],
      tithi: tithi.tithi,
      karana,
      nitya_yoga: yoga,
      current_mahadasha: dasha.lord,
      current_mahadasha_end: jdToDate(dasha.endJd),
      planets,
      houses,
      numerology,
      insights,
      confidence: timeUnknown ? 0.55 : (lat ? 0.9 : 0.7),
      computed_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("user_kundli").upsert(row, { onConflict: "user_id" });
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, kundli: row }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("compute-kundli error", e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
