// Generates today's personal practice rhythm from kundli + lifestyle slots + Vedic windows.
// Mixes in-app cues (open Witness, breath) with off-app micro-practices (sip water,
// sun-gaze 30s, mantra, gratitude). Anchored to user's wake/lunch/sunset/sleep + planet of day.
import { createClient } from "../_shared/supabase-client.ts";
import { corsHeaders } from "../_shared/cors.ts";

type Entry = {
  scheduled_at: string;
  title: string;
  description: string;
  category: string;       // mantra | breath | walk | gratitude | water | gaze | observation | rest
  location: "in_app" | "off_app";
  source: string;         // mahadasha | nakshatra | brahma_muhurta | abhijit | sunset | slot | weekday
  duration_min: number;
  notify: boolean;
  payload?: Record<string, unknown>;
};

const PLANET_PRACTICE: Record<string, { mantra: string; element: string }> = {
  Sun: { mantra: "Om Suryaya Namah", element: "fire — confidence & clarity" },
  Moon: { mantra: "Om Chandraya Namah", element: "water — calm the heart" },
  Mars: { mantra: "Om Mangalaya Namah", element: "fire — channel anger into action" },
  Mercury: { mantra: "Om Budhaya Namah", element: "earth/air — sharpen mind" },
  Jupiter: { mantra: "Om Gurave Namah", element: "ether — wisdom & growth" },
  Venus: { mantra: "Om Shukraya Namah", element: "water — beauty & love" },
  Saturn: { mantra: "Om Shanaye Namah", element: "earth — patience & discipline" },
  Rahu: { mantra: "Om Rahave Namah", element: "shadow — release obsession" },
  Ketu: { mantra: "Om Ketave Namah", element: "shadow — surrender & detach" },
};

const NADI_BREATH: Record<string, string> = {
  Vata: "Nadi Shodhana (alternate nostril) — 9 slow rounds. Grounds nervous system.",
  Pitta: "Sheetali (cooling tongue-curl breath) — 9 rounds. Releases heat.",
  Kapha: "Kapalbhati (skull-shining breath) — 30 quick exhales. Lifts heaviness.",
};

const WEEKDAY_LORD = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"];

// NOAA-ish sunrise/sunset
function julian(d: Date) { return d.getTime() / 86400000 + 2440587.5; }
function sunTimes(date: Date, lat: number, lon: number) {
  const rad = Math.PI / 180;
  const n = Math.floor(julian(date) - 2451545.0 + 0.0008);
  const Jstar = n - lon / 360;
  const M = (357.5291 + 0.98560028 * Jstar) % 360;
  const C = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad);
  const lambda = (M + C + 180 + 102.9372) % 360;
  const Jtransit = 2451545 + Jstar + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * lambda * rad);
  const delta = Math.asin(Math.sin(lambda * rad) * Math.sin(23.44 * rad));
  const cosH = (Math.sin(-0.83 * rad) - Math.sin(lat * rad) * Math.sin(delta)) / (Math.cos(lat * rad) * Math.cos(delta));
  if (cosH < -1 || cosH > 1) return null;
  const H = Math.acos(cosH) / rad;
  const Jset = Jtransit + H / 360;
  const Jrise = Jtransit - H / 360;
  return {
    sunrise: new Date((Jrise - 2440587.5) * 86400000),
    sunset: new Date((Jset - 2440587.5) * 86400000),
    noon: new Date((Jtransit - 2440587.5) * 86400000),
  };
}

function setLocalTime(base: Date, hh: number, mm: number) {
  const d = new Date(base); d.setHours(hh, mm, 0, 0); return d;
}
function parseHHMM(s: string | undefined, fallback: [number, number]): [number, number] {
  if (!s || !/^\d{1,2}:\d{2}$/.test(s)) return fallback;
  const [h, m] = s.split(":").map(Number); return [h, m];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: ud } = await supabase.auth.getUser();
    const user = ud?.user;
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const replace: boolean = body.replace ?? true;

    const today = new Date();
    const dayDate = today.toISOString().slice(0, 10);

    // Pull kundli + profile lifestyle
    const [{ data: kundli }, { data: profile }] = await Promise.all([
      supabase.from("user_kundli").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("profiles").select("lifestyle, display_name").eq("user_id", user.id).maybeSingle(),
    ]);

    const lifestyle = (profile?.lifestyle as Record<string, any>) || {};
    const slots = (lifestyle.slots as Record<string, string>) || {};
    const [wakeH, wakeM] = parseHHMM(slots.wake_time || slots.morning, [6, 30]);
    const [lunchH, lunchM] = parseHHMM(slots.lunch || slots.midday, [13, 0]);
    const [eveH, eveM] = parseHHMM(slots.evening, [18, 30]);
    const [sleepH, sleepM] = parseHHMM(slots.sleep || slots.night, [22, 30]);

    const lat = Number(kundli?.latitude) || 0;
    const lon = Number(kundli?.longitude) || 0;
    const sun = lat ? sunTimes(today, lat, lon) : null;
    const sunrise = sun?.sunrise ?? setLocalTime(today, 6, 0);
    const sunset = sun?.sunset ?? setLocalTime(today, 18, 30);
    const noon = sun?.noon ?? setLocalTime(today, 12, 0);
    const brahmaMuhurta = new Date(sunrise.getTime() - 96 * 60_000); // ~1h36m before sunrise
    const abhijit = new Date(noon.getTime() - 24 * 60_000);

    const dasha = (kundli?.current_mahadasha as string) || WEEKDAY_LORD[today.getDay()];
    const planet = PLANET_PRACTICE[dasha] || PLANET_PRACTICE.Moon;
    const nadi = (kundli?.nadi as string) || "Vata";
    const yoni = (kundli?.yoni as string) || "";
    const nakshatra = (kundli?.nakshatra as string) || "";

    const entries: Entry[] = [];
    const future = (d: Date) => d.getTime() > today.getTime() - 5 * 60_000; // include current ~5m

    // 1. Brahma Muhurta — silent witness (off-app: just sit, no screen)
    if (brahmaMuhurta && future(brahmaMuhurta)) {
      entries.push({
        scheduled_at: brahmaMuhurta.toISOString(),
        title: "Brahma Muhurta — sit in silence",
        description: "Off-app. Sit upright wherever you wake. Eyes closed. 10 slow breaths. No phone. The mind is naturally clear right now.",
        category: "observation",
        location: "off_app",
        source: "brahma_muhurta",
        duration_min: 10,
        notify: true,
      });
    }

    // 2. Wake mantra (planet-of-dasha)
    const wake = setLocalTime(today, wakeH, wakeM);
    if (future(wake)) {
      entries.push({
        scheduled_at: wake.toISOString(),
        title: `Morning mantra — ${planet.mantra}`,
        description: `Your current ${dasha} Mahadasha rules this season of life. Repeat ${planet.mantra} 11× aloud. ${planet.element}.`,
        category: "mantra",
        location: "off_app",
        source: "mahadasha",
        duration_min: 3,
        notify: true,
      });
    }

    // 3. Sunrise — water + sun gaze
    if (future(sunrise)) {
      entries.push({
        scheduled_at: sunrise.toISOString(),
        title: "Sunrise — water + soft sun-gaze",
        description: "Off-app. Drink a glass of warm water. Step outside (or to a window) and softly gaze at the rising sun for 30 seconds. Resets circadian rhythm.",
        category: "water",
        location: "off_app",
        source: "sunrise",
        duration_min: 2,
        notify: true,
      });
    }

    // 4. Mid-morning breath (nadi-balancing)
    const midMorning = new Date(wake.getTime() + 2.5 * 60 * 60_000);
    if (future(midMorning)) {
      entries.push({
        scheduled_at: midMorning.toISOString(),
        title: `Breath for ${nadi} constitution`,
        description: NADI_BREATH[nadi] || NADI_BREATH.Vata,
        category: "breath",
        location: "in_app",
        source: "nakshatra",
        duration_min: 5,
        notify: true,
      });
    }

    // 5. Abhijit Muhurta — auspicious mid-day window for any important task
    if (future(abhijit)) {
      entries.push({
        scheduled_at: abhijit.toISOString(),
        title: "Abhijit Muhurta — do the hardest thing now",
        description: "The 48 minutes around true noon are universally auspicious. Begin your hardest task in this window — Vedic tradition says it cannot fail.",
        category: "observation",
        location: "off_app",
        source: "abhijit",
        duration_min: 48,
        notify: true,
      });
    }

    // 6. Lunch — mindful eating
    const lunch = setLocalTime(today, lunchH, lunchM);
    if (future(lunch)) {
      entries.push({
        scheduled_at: lunch.toISOString(),
        title: "Lunch — three silent breaths first",
        description: "Off-app. Before the first bite, three slow breaths. Notice colour, smell, temperature. Chew the first mouthful 20 times. Phone face-down.",
        category: "gratitude",
        location: "off_app",
        source: "slot",
        duration_min: 5,
        notify: true,
      });
    }

    // 7. Afternoon walk
    const afternoon = new Date(lunch.getTime() + 2 * 60 * 60_000);
    if (future(afternoon)) {
      entries.push({
        scheduled_at: afternoon.toISOString(),
        title: "Walking meditation — 7 minutes",
        description: "Off-app. Walk slowly anywhere. Match breath to steps: inhale 4 steps, exhale 6 steps. Look up at the sky once.",
        category: "walk",
        location: "off_app",
        source: "slot",
        duration_min: 7,
        notify: true,
      });
    }

    // 8. Sunset — gratitude
    if (future(sunset)) {
      entries.push({
        scheduled_at: sunset.toISOString(),
        title: "Sunset — three gratitudes",
        description: "Off-app. Step outside if possible. Name three things from today you are grateful for, out loud. Yoni: " + (yoni || "—"),
        category: "gratitude",
        location: "off_app",
        source: "sunset",
        duration_min: 3,
        notify: true,
      });
    }

    // 9. Evening — open the app for guided witness / journal
    const eve = setLocalTime(today, eveH, eveM);
    if (future(eve)) {
      entries.push({
        scheduled_at: eve.toISOString(),
        title: "Evening Witness — 8-min sit",
        description: "Open the app for your guided Witness practice. " + (nakshatra ? `${nakshatra} energy supports inward attention now.` : ""),
        category: "observation",
        location: "in_app",
        source: "slot",
        duration_min: 8,
        notify: true,
      });
    }

    // 10. Pre-sleep — release & sankalpa
    const sleep = setLocalTime(today, sleepH, sleepM);
    const preSleep = new Date(sleep.getTime() - 30 * 60_000);
    if (future(preSleep)) {
      entries.push({
        scheduled_at: preSleep.toISOString(),
        title: "Wind-down — release the day",
        description: "Off-app. Phone in another room. Lie on back. Body scan from feet to crown. End with a single sankalpa (intention) for tomorrow.",
        category: "rest",
        location: "off_app",
        source: "slot",
        duration_min: 15,
        notify: true,
      });
    }

    if (replace) {
      await supabase.from("personal_practice_schedule").delete()
        .eq("user_id", user.id).eq("day_date", dayDate);
    }

    const rows = entries.map((e) => ({ ...e, user_id: user.id, day_date: dayDate }));
    if (rows.length) {
      const { error } = await supabase.from("personal_practice_schedule").insert(rows);
      if (error) throw error;
    }

    return new Response(JSON.stringify({ ok: true, count: rows.length, entries: rows }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-personal-rhythm", e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
