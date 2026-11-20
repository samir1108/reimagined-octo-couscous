"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useConsciousnessEngine } from "@/hooks/useConsciousnessEngine";
import { getCurrentTimeSlot } from "@/lib/timeSlots";

export interface CosmicWeather {
  clarityScore: number;
  emotionalTurbulence: "low" | "medium" | "high";
  loopWind: Record<string, number>;
  witnessTemperature: number;
  lunarPhase: string;
  lunarNudge: string;
  season: string;
  seasonalNudge: string;
  forecast: Record<string, { predictedLoops: string[]; recommendation: string }>;
  date: string;
}

interface UseCosmicWeatherOptions {
  userId: string;
  userTimeProfile: { wakeTime?: string; sleepTime?: string } | undefined;
  vLevel: number;
  activeLoops: string[];
}

export function useCosmicWeather({
  userId,
  userTimeProfile,
  vLevel,
  activeLoops,
}: UseCosmicWeatherOptions) {
  const [weather, setWeather] = useState<CosmicWeather | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { data: engineData } = useConsciousnessEngine(getCurrentTimeSlot());

  const fetchWeather = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    try {
      setIsLoading(true);
      
      // Try to get today's weather from DB
      const today = new Date().toISOString().split("T")[0];
      const { data: existing } = await supabase
        .from("consciousness_weather")
        .select("*")
        .eq("user_id", userId)
        .eq("forecast_date", today)
        .maybeSingle();

      if (existing && !signal.aborted) {
        setWeather({
          clarityScore: existing.clarity_score,
          emotionalTurbulence: existing.emotional_turbulence,
          loopWind: existing.loop_wind,
          witnessTemperature: existing.witness_temperature,
          lunarPhase: "",
          lunarNudge: "",
          season: "",
          seasonalNudge: "",
          forecast: existing.forecast || {},
          date: today,
        });
        setIsLoading(false);
        return;
      }

      // Compute fresh weather
      const computed = await computeWeather(userId, userTimeProfile, vLevel, activeLoops);
      
      if (!signal.aborted) {
        setWeather(computed);
        
        // Save to DB (fire-and-forget)
        supabase.from("consciousness_weather").upsert({
          user_id: userId,
          forecast_date: today,
          clarity_score: computed.clarityScore,
          emotional_turbulence: computed.emotionalTurbulence,
          loop_wind: computed.loopWind,
          witness_temperature: computed.witnessTemperature,
          forecast: computed.forecast,
        })
          .then(
            () => undefined,
            () => undefined,
          );
      }
    } catch (e) {
      if (!signal.aborted) {
        setError(e as Error);
      }
    } finally {
      if (!signal.aborted) setIsLoading(false);
    }
  }, [userId, userTimeProfile, vLevel, activeLoops]);

  useEffect(() => {
    fetchWeather();
    return () => abortRef.current?.abort();
  }, [fetchWeather]);

  return { weather, isLoading, error, refetch: fetchWeather };
}

async function computeWeather(
  userId: string,
  userTimeProfile: { wakeTime?: string; sleepTime?: string } | undefined,
  vLevel: number,
  activeLoops: string[]
): Promise<CosmicWeather> {
  const { data: loops } = await supabase
    .from("active_loops")
    .select("loop_id, severity")
    .eq("user_id", userId)
    .eq("is_active", true);

  const { data: recentSessions } = await supabase
    .from("sessions")
    .select("quality_score, ended_at, type")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("ended_at", { ascending: false })
    .limit(7);

  const { data: profile } = await supabase
    .from("user_consciousness_profile")
    .select("witness_stability, witness_depth, witness_gap, dimension_bands")
    .eq("user_id", userId)
    .maybeSingle();

  // Lunar phase calculation
  const refNew = Date.UTC(2000, 0, 6);
  const today = new Date().getTime();
  const synodic = 29.530588853 * 86400000;
  const age = ((today - refNew) % synodic + synodic) % synodic;
  const dayInCycle = age / 86400000;
  
  let lunarPhase = "waning_crescent";
  let lunarNudge = "Waning crescent — rest, release, prepare for the new.";
  if (dayInCycle < 2) { lunarPhase = "new_moon"; lunarNudge = "New moon — release, plant intention, begin."; }
  else if (dayInCycle > 13.5 && dayInCycle < 15.5) { lunarPhase = "full_moon"; lunarNudge = "Full moon — reveal, integrate, harvest insight."; }
  else if (dayInCycle < 7) { lunarPhase = "waxing_crescent"; lunarNudge = "Waxing — build, expand, take small action."; }
  else if (dayInCycle < 13.5) { lunarPhase = "waxing_gibbous"; lunarNudge = "Waxing gibbous — refine, near completion."; }
  else if (dayInCycle < 22) { lunarPhase = "waning_gibbous"; lunarNudge = "Waning gibbous — share, distribute, give."; }

  // Seasonal
  const month = new Date().getUTCMonth();
  let season = "winter", seasonalNudge = "Winter — retreat, silence, deep restoration.";
  if ([2,3,4].includes(month)) { season = "spring"; seasonalNudge = "Spring — expansion, new beginnings, opening."; }
  else if ([5,6,7].includes(month)) { season = "summer"; seasonalNudge = "Summer — fullness, action, embodiment."; }
  else if ([8,9,10].includes(month)) { season = "autumn"; seasonalNudge = "Autumn — release, gratitude, letting fall what is done."; }

  // Loop wind intensity
  const loopWind: Record<string, number> = {};
  for (const loop of loops || []) {
    loopWind[loop.loop_id] = Math.min(1, (loop.severity || 0) / 5);
  }

  // Clarity score (0-100)
  const avgQuality = recentSessions?.length
    ? recentSessions.reduce((a, s) => a + (s.quality_score || 0), 0) / recentSessions.length
    : 0.5;
  const witnessStability = profile?.witness_stability || 0;
  const activeLoopCount = activeLoops.length;
  const clarityScore = Math.round(
    (avgQuality * 40) + (witnessStability * 30) + (Math.max(0, 1 - activeLoopCount * 0.15) * 30)
  );

  // Emotional turbulence
  const acuteLoops = (loops || []).filter(l => l.severity >= 4).length;
  let emotionalTurbulence: "low" | "medium" | "high" = "low";
  if (acuteLoops >= 2) emotionalTurbulence = "high";
  else if (acuteLoops >= 1 || activeLoopCount >= 3) emotionalTurbulence = "medium";

  // Hourly forecast
  const forecast: Record<string, { predictedLoops: string[]; recommendation: string }> = {};
  const hours = ["06", "09", "12", "15", "18", "21"];
  for (const hour of hours) {
    const predictedLoops = activeLoops.slice(0, 2);
    let recommendation = "Continue current practice";
    if (hour === "06") recommendation = "Morning clarity — front-load depth work";
    if (hour === "12") recommendation = "Midday reset — micro practice";
    if (hour === "18") recommendation = "Evening settle — inquiry or body";
    if (hour === "21") recommendation = "Night wind-down — nidra or journal";
    forecast[hour] = { predictedLoops, recommendation };
  }

  return {
    clarityScore,
    emotionalTurbulence,
    loopWind,
    witnessTemperature: Math.round(vLevel * 10) / 10,
    lunarPhase,
    lunarNudge,
    season,
    seasonalNudge,
    forecast,
    date: new Date().toISOString().split("T")[0],
  };
}