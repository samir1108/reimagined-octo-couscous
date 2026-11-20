"use client";

import { useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  DailyMission,
  MissionState,
  generateAllDailyMissions,
  getCurrentGateMission,
  getMissionStatus,
  ConsciousnessProfile,
  UserTimeProfile,
} from "@/lib/consciousness/dailyMissions";
import { getCurrentGateForSchedule } from "@/lib/consciousness/dailyGates";
import { useConsciousnessEngine } from "@/hooks/useConsciousnessEngine";
import { useUserTimeProfile } from "@/hooks/useUserTimeProfile";

const TODAY_KEY = (userId: string) => `daily-missions-${userId}-${new Date().toISOString().split("T")[0]}`;

export function useDailyMissions(userId?: string) {
  const queryClient = useQueryClient();
  const currentSlot = getCurrentGateForSchedule(new Date());
  const { data: engineData } = useConsciousnessEngine(currentSlot);
  const { data: userTimeProfile } = useUserTimeProfile(userId);

  const profile = useMemo((): ConsciousnessProfile => ({
    vLevel: engineData?.profile?.v_level ?? 0,
    weakestDimension: engineData?.profile?.weakest_dimension,
    activeLoops: engineData?.activeLoopDetails?.map((l) => l.id) ?? engineData?.profile?.active_loops ?? [],
    bypassingRisk: engineData?.profile?.bypassing_risk ?? 0,
    dimensionBands: engineData?.profile?.dimension_bands,
    circadianType: userTimeProfile?.circadianType ?? "normal",
    speedProfile: "adaptive",
  }), [engineData, userTimeProfile]);

  const generatedMissions = useMemo(
    () => generateAllDailyMissions(profile, userTimeProfile ?? undefined),
    [profile, userTimeProfile]
  );

  const currentGate = getCurrentGateForSchedule(new Date(), userTimeProfile?.wakeTime, userTimeProfile?.sleepTime);
  const currentGateMission = getCurrentGateMission(generatedMissions, currentGate);

  const { data: storedMissions, isLoading } = useQuery({
    queryKey: ["daily-missions", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("daily_missions")
        .select("*")
        .eq("user_id", userId)
        .eq("date", new Date().toISOString().split("T")[0]);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const missionStates = useMemo((): Record<string, MissionState> => {
    const states: Record<string, MissionState> = {};
    storedMissions?.forEach((m) => {
      states[m.mission_id] = {
        mission: null,
        status: m.status as MissionState["status"],
        startedAt: m.started_at ? new Date(m.started_at).getTime() : undefined,
        completedAt: m.completed_at ? new Date(m.completed_at).getTime() : undefined,
        reflection: m.reflection,
      };
    });
    return states;
  }, [storedMissions]);

  const missionsWithStatus = useMemo(() => {
    return generatedMissions.map((mission) => {
      const stored = missionStates[mission.id];
      const status = getMissionStatus(mission, stored);
      return {
        ...mission,
        status,
        startedAt: stored?.startedAt,
        completedAt: stored?.completedAt,
        reflection: stored?.reflection,
      };
    });
  }, [generatedMissions, missionStates]);

  const currentMissionWithStatus = useMemo(() => {
    if (!currentGateMission) return null;
    const stored = missionStates[currentGateMission.id];
    const status = getMissionStatus(currentGateMission, stored);
    return {
      ...currentGateMission,
      status,
      startedAt: stored?.startedAt,
      completedAt: stored?.completedAt,
      reflection: stored?.reflection,
    };
  }, [currentGateMission, missionStates]);

  const completedToday = useMemo(
    () => missionsWithStatus.filter((m) => m.status === "completed").length,
    [missionsWithStatus]
  );

  const startMissionMutation = useMutation({
    mutationFn: async (missionId: string) => {
      if (!userId) throw new Error("No user");
      const mission = generatedMissions.find((m) => m.id === missionId);
      if (!mission) throw new Error("Mission not found");

      const { error } = await supabase.from("daily_missions").upsert({
        user_id: userId,
        date: new Date().toISOString().split("T")[0],
        gate_id: mission.gateId,
        mission_id: mission.id,
        type: mission.type,
        title: mission.title,
        description: mission.description,
        duration_minutes: mission.durationMinutes,
        difficulty: mission.difficulty,
        reward_karma: mission.reward.karmaPoints,
        reward_streak_protection: mission.reward.streakProtection ?? false,
        reward_whisper_unlock: mission.reward.whisperUnlock ?? false,
        reward_loop_antidote_progress: mission.reward.loopAntidoteProgress ?? null,
        adaptation_reason: mission.adaptationReason,
        status: "in_progress",
        started_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-missions", userId] });
    },
  });

  const completeMissionMutation = useMutation({
    mutationFn: async ({
      missionId,
      reflection,
    }: {
      missionId: string;
      reflection?: string;
    }) => {
      if (!userId) throw new Error("No user");
      const mission = generatedMissions.find((m) => m.id === missionId);
      if (!mission) throw new Error("Mission not found");

      const { error } = await supabase.from("daily_missions").upsert({
        user_id: userId,
        date: new Date().toISOString().split("T")[0],
        gate_id: mission.gateId,
        mission_id: mission.id,
        type: mission.type,
        title: mission.title,
        description: mission.description,
        duration_minutes: mission.durationMinutes,
        difficulty: mission.difficulty,
        reward_karma: mission.reward.karmaPoints,
        reward_streak_protection: mission.reward.streakProtection ?? false,
        reward_whisper_unlock: mission.reward.whisperUnlock ?? false,
        reward_loop_antidote_progress: mission.reward.loopAntidoteProgress ?? null,
        adaptation_reason: mission.adaptationReason,
        status: "completed",
        completed_at: new Date().toISOString(),
        reflection: reflection ?? null,
      });
      if (error) throw error;

      if (mission.reward.karmaPoints > 0) {
        const { error: karmaError } = await supabase.rpc("add_karma", {
          p_user_id: userId,
          p_points: mission.reward.karmaPoints,
          p_source: "daily_mission",
          p_reference_id: mission.id,
        });
        if (karmaError) console.warn("Karma add failed:", karmaError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-missions", userId] });
      queryClient.invalidateQueries({ queryKey: ["karma", userId] });
    },
  });

  const startMission = useCallback(
    (missionId: string) => startMissionMutation.mutate(missionId),
    [startMissionMutation]
  );

  const completeMission = useCallback(
    (missionId: string, reflection?: string) => completeMissionMutation.mutate({ missionId, reflection }),
    [completeMissionMutation]
  );

  return {
    missions: missionsWithStatus,
    currentGateMission: currentMissionWithStatus,
    currentGate,
    completedToday,
    isLoading,
    startMission,
    completeMission,
    isStarting: startMissionMutation.isPending,
    isCompleting: completeMissionMutation.isPending,
    generatedMissions,
  };
}