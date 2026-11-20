"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCurrentGateForSchedule } from "@/lib/timeSlots";

export interface TimeBlock {
  gate: "morning" | "midday" | "evening" | "night";
  label: string;
  icon: string;
  startTime: string;
  endTime: string;
  session?: {
    id: string;
    completed: boolean;
    title?: string;
    duration?: number;
    quality?: number;
    status?: string;
  };
  recommended?: {
    practice: string;
    duration: number;
    reason: string;
  };
  isCurrent: boolean;
  isPast: boolean;
}

export interface DayMission {
  date: string;
  wakeTime: string;
  sleepTime: string;
  theme: string;
  intention: string;
  vLevel: number;
  blocks: TimeBlock[];
  arc?: {
    title: string;
    day: number;
    total: number;
    phase: string;
  } | null;
  adaptiveInsight?: {
    type: "loop" | "dimension" | "arc" | "celebration" | "crisis";
    message: string;
    action?: string;
  } | null;
  completionRate: number;
  totalSessions: number;
  totalMinutes: number;
}

interface UseDayMissionOptions {
  userId: string;
  userTimeProfile: { wakeTime?: string; sleepTime?: string } | undefined;
  vLevel: number;
  activeLoops: string[];
  journeyDay: number;
  streak: number;
  sessionsToday: any[];
  engineData: any;
}

export function useDayMission({
  userId,
  userTimeProfile,
  vLevel,
  activeLoops,
  journeyDay,
  streak,
  sessionsToday,
  engineData,
}: UseDayMissionOptions) {
  const [mission, setMission] = useState<DayMission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const buildMission = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const wakeTime = userTimeProfile?.wakeTime || "06:00";
      const sleepTime = userTimeProfile?.sleepTime || "22:00";
      const now = new Date();
      const currentGate = getCurrentGateForSchedule(now, wakeTime, sleepTime);

      const themeTitle = engineData?.todayCard?.title || "Presence";
      const themeDesc = engineData?.todayCard?.description || "Be where you are. Notice what is.";

      // Get session details for today
      const today = new Date().toISOString().split("T")[0];
      const { data: todaySessions } = await supabase
        .from("sessions")
        .select("id, started_at, ended_at, type, status, summary, quality_score, time_slot")
        .eq("user_id", userId)
        .gte("started_at", `${today}T00:00:00`)
        .lt("started_at", `${today}T23:59:59`)
        .order("started_at", { ascending: true });

      // Build time blocks
      const gateOrder: ("morning" | "midday" | "evening" | "night")[] = ["morning", "midday", "evening", "night"];
      const gateLabels = { morning: "Morning", midday: "Midday", evening: "Evening", night: "Night" };
      const gateIcons = { morning: "☀️", midday: "⚡", evening: "🧠", night: "🌙" };
      const gateTimes = {
        morning: { start: wakeTime, end: "12:00" },
        midday: { start: "12:00", end: "17:00" },
        evening: { start: "17:00", end: "21:00" },
        night: { start: "21:00", end: sleepTime },
      };

      const recommendedPractices = {
        morning: { practice: "Breath Activation", duration: 15, reason: "Fresh mind, clear energy — prime for breathwork" },
        midday: { practice: "Micro Reset", duration: 5, reason: "World is noisy — brief anchor to center" },
        evening: { practice: "Self-Inquiry", duration: 20, reason: "Day's dust settles — go inward" },
        night: { practice: "Yoga Nidra", duration: 15, reason: "Deep rest prepares tomorrow's clarity" },
      };

      const currentGateIndex = gateOrder.indexOf(currentGate);

      const blocks: TimeBlock[] = gateOrder.map((gate, idx) => {
        const sessionData = todaySessions?.find(s => s.time_slot === gate) || 
          sessionsToday.find(s => s.gate === gate);
        
        const session = sessionData ? {
          id: sessionData.id,
          completed: sessionData.status === "completed",
          title: sessionData.summary ? JSON.parse(sessionData.summary).intent || "Session" : "Session",
          duration: sessionData.ended_at && sessionData.started_at 
            ? Math.round((new Date(sessionData.ended_at).getTime() - new Date(sessionData.started_at).getTime()) / 60000)
            : undefined,
          quality: sessionData.quality_score,
          status: sessionData.status,
        } : undefined;

        return {
          gate,
          label: gateLabels[gate],
          icon: gateIcons[gate],
          startTime: gateTimes[gate].start,
          endTime: gateTimes[gate].end,
          session,
          recommended: recommendedPractices[gate],
          isCurrent: idx === currentGateIndex,
          isPast: idx < currentGateIndex,
        };
      });

      // Arc data
      const arc = engineData?.activeArc ? {
        title: engineData.activeArc.title,
        day: engineData.activeArc.current_day,
        total: engineData.activeArc.duration_days,
        phase: engineData.activeArc.current_phase,
      } : null;

      // Adaptive insight
      let adaptiveInsight: DayMission["adaptiveInsight"] = null;
      if (activeLoops.length > 0) {
        adaptiveInsight = {
          type: "loop",
          message: `Active: ${activeLoops.slice(0, 2).join(", ")}`,
          action: "Today's sessions auto-target these patterns",
        };
      } else if (vLevel > 0 && vLevel < 2) {
        adaptiveInsight = {
          type: "dimension",
          message: "Building foundation — consistency over depth",
          action: "Short daily sessions recommended",
        };
      } else if (streak >= 7) {
        adaptiveInsight = {
          type: "celebration",
          message: `${streak} day streak — momentum is real`,
          action: "Consider extending one session by 5 min",
        };
      } else if (engineData?.adaptiveDecision?.edgeCases?.includes("crisis")) {
        adaptiveInsight = {
          type: "crisis",
          message: "Distress signals detected — prioritize grounding",
          action: "Open Guide for immediate support",
        };
      }

      // Completion stats
      const completedSessions = todaySessions?.filter(s => s.status === "completed") || [];
      const totalSessions = todaySessions?.length || 0;
      const totalMinutes = completedSessions.reduce((sum, s) => {
        if (s.ended_at && s.started_at) {
          return sum + Math.round((new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60000);
        }
        return sum;
      }, 0);

      const newMission: DayMission = {
        date: new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
        wakeTime,
        sleepTime,
        theme: themeTitle,
        intention: themeDesc,
        vLevel,
        blocks,
        arc,
        adaptiveInsight,
        completionRate: totalSessions > 0 ? completedSessions.length / totalSessions : 0,
        totalSessions,
        totalMinutes,
      };

      setMission(newMission);
    } catch (e) {
      console.error("[useDayMission] Error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [userId, userTimeProfile, vLevel, activeLoops, journeyDay, streak, sessionsToday, engineData]);

  useEffect(() => {
    buildMission();
  }, [buildMission]);

  return { mission, isLoading, refetch: buildMission };
}