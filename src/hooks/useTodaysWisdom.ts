"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getCurrentGateForSchedule } from "@/lib/consciousness/dailyGates";
import { useConsciousnessEngine } from "@/hooks/useConsciousnessEngine";
import { useUserTimeProfile } from "@/hooks/useUserTimeProfile";
import { useDailyMissions } from "@/hooks/useDailyMissions";
import { generateTodaysWisdom, type TodaysWisdom, type WisdomCard } from "@/lib/consciousness/dailyWisdom";

export function useTodaysWisdom() {
  const currentSlot = getCurrentGateForSchedule(new Date());
  const { data: engineData } = useConsciousnessEngine(currentSlot);
  const { data: userTimeProfile } = useUserTimeProfile(engineData?.profile?.user_id);
  const { completedToday } = useDailyMissions(engineData?.profile?.user_id);
  const currentGate = getCurrentGateForSchedule(new Date(), userTimeProfile?.wakeTime, userTimeProfile?.sleepTime);

  const profile = engineData?.profile;
  const activeSessionCount = engineData?.activeSessionCount ?? 0;

  const { data: wisdom, isLoading } = useQuery({
    queryKey: ["todays-wisdom", profile?.user_id, currentGate, completedToday, activeSessionCount],
    queryFn: async () => {
      if (!profile) return null;
      return generateTodaysWisdom(
        {
          vLevel: profile.v_level ?? 0,
          weakestDimension: profile.weakest_dimension,
          activeLoops: profile.active_loops ?? [],
          bypassingRisk: profile.bypassing_risk ?? 0,
          dimensionBands: profile.dimension_bands,
          circadianType: userTimeProfile?.circadianType ?? "normal",
          journeyDay: profile.journey_day,
          loopSeverity: profile.loop_severity,
        },
        currentGate,
        userTimeProfile ?? undefined,
        completedToday,
        activeSessionCount
      );
    },
    enabled: !!profile,
    staleTime: 5 * 60 * 1000,
  });

  return {
    wisdom,
    isLoading,
    currentGate,
  };
}

export function useWisdomCard(category: keyof TodaysWisdom) {
  const { wisdom, isLoading } = useTodaysWisdom();
  const card = wisdom?.[category] ?? null;
  return { card, isLoading };
}

export function useAllWisdomCards(): WisdomCard[] {
  const { wisdom, isLoading } = useTodaysWisdom();
  if (!wisdom || isLoading) return [];
  
  return Object.values(wisdom).filter((card): card is WisdomCard => card !== null);
}

export function useTodaysPotholes() {
  return useWisdomCard("potholes");
}

export function useTodaysChallenges() {
  return useWisdomCard("challenges");
}

export function useTodaysObservations() {
  return useWisdomCard("observations");
}

export function useTodaysShadowSignal() {
  return useWisdomCard("shadowSignal");
}

export function useTodaysIntegrationKey() {
  return useWisdomCard("integrationKey");
}

export function useTodaysEveningMetabolization() {
  return useWisdomCard("eveningMetabolization");
}

export function useTodaysWhisper() {
  return useWisdomCard("whisper");
}

export function useTodaysGuruInsight() {
  return useWisdomCard("guruInsight");
}

export function useTodaysInquiry() {
  return useWisdomCard("inquiry");
}

export function useTodaysTheme() {
  return useWisdomCard("theme");
}