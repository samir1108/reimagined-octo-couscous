"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Samskara {
  rootWound: string;
  depth: number;
  loops: string[];
  firstSeen: string;
  healingTrajectory: {
    sessionsTargeting: number;
    dissolutionRate: number;
    projectedResolutionDay: number;
    onTrack: boolean;
  };
  insight: string;
}

export function useSamskaraArchaeology(userId: string) {
  const [samskaras, setSamskaras] = useState<Samskara[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSamskaras = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get consciousness fingerprint
      const { data: fingerprint } = await supabase
        .from("consciousness_fingerprint")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!fingerprint?.samskara_depth) {
        setSamskaras([]);
        return;
      }

      const samskaraDepth = fingerprint.samskara_depth as Record<string, any>;
      const loopConstellation = fingerprint.loop_constellation as Record<string, any> || {};

      // Get session outcomes for healing trajectory
      const { data: outcomes } = await supabase
        .from("session_outcomes")
        .select("loops_touched, quality_score, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100);

      const samskarasList: Samskara[] = [];

      for (const [rootWound, data] of Object.entries(samskaraDepth)) {
        const loops = data.loops || [];
        const count = data.count || 0;
        const depth = Math.min(1, count / 20);

        // Calculate healing trajectory from outcomes
        let sessionsTargeting = 0;
        let totalQuality = 0;
        let qualityCount = 0;
        
        for (const outcome of outcomes || []) {
          const hasTargetLoop = loops.some((l: string) => outcome.loops_touched?.includes(l));
          if (hasTargetLoop) {
            sessionsTargeting++;
            if (outcome.quality_score) {
              totalQuality += outcome.quality_score;
              qualityCount++;
            }
          }
        }

        const avgQuality = qualityCount > 0 ? totalQuality / qualityCount : 0.5;
        const dissolutionRate = avgQuality * 5; // % per session
        const projectedResolutionDay = dissolutionRate > 0 
          ? Math.round((1 - depth) / dissolutionRate * 100) 
          : 999;
        const onTrack = dissolutionRate > 2 && projectedResolutionDay < 365;

        // Generate insight based on wound type
        const insights: Record<string, string> = {
          unworthiness: "Each time you notice the pleasing, the wound shrinks.",
          unsafety: "Safety is not found in control — it's found in witness.",
          inner_void: "The void is not empty — it's full of presence waiting to be met.",
          abandonment: "You are the one who stays. The witness never leaves.",
          repression: "What you resist persists. What you witness dissolves.",
          identity_fixation: "You are not the pattern. You are the one seeing it.",
          disconnection: "The body is the portal. Return to sensation.",
        };

        samskarasList.push({
          rootWound,
          depth,
          loops,
          firstSeen: data.firstSeen || new Date().toISOString().split("T")[0],
          healingTrajectory: {
            sessionsTargeting,
            dissolutionRate,
            projectedResolutionDay,
            onTrack,
          },
          insight: insights[rootWound] || "Every session targeting this wound moves you toward freedom.",
        });
      }

      setSamskaras(samskarasList);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchSamskaras();
  }, [userId, fetchSamskaras]);

  return { samskaras, isLoading, error, refetch: fetchSamskaras };
}

export interface LoopResonance {
  relatedUserId: string;
  relatedUserName: string;
  relationshipType: string;
  resonanceScore: number;
  sharedLoops: Array<{
    loopId: string;
    userSeverity: number;
    otherSeverity: number;
    resonanceScore: number;
  }>;
  status: "active" | "resolved" | "archived";
}

export function useLoopResonance(userId: string) {
  const [resonances, setResonances] = useState<LoopResonance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchResonances = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data } = await supabase
        .from("loop_resonance")
        .select("*")
        .or(`user_a.eq.${userId},user_b.eq.${userId}`)
        .eq("status", "active");

      if (data) {
        const formatted: LoopResonance[] = data.map(r => ({
          relatedUserId: r.user_a === userId ? r.user_b : r.user_a,
          relatedUserName: "Connection", // Would fetch from profiles
          relationshipType: r.relationship_type,
          resonanceScore: r.resonance_score,
          sharedLoops: Object.entries(r.resonance_loops || {}).map(([loopId, v]: [string, any]) => ({
            loopId,
            userSeverity: v.userA_severity || 0,
            otherSeverity: v.userB_severity || 0,
            resonanceScore: v.resonance_score || 0,
          })),
          status: r.status as "active" | "resolved" | "archived",
        }));
        setResonances(formatted);
      }
    } catch (e) {
      console.error("[useLoopResonance] Error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchResonances();
  }, [userId, fetchResonances]);

  return { resonances, isLoading, refetch: fetchResonances };
}

export interface SacredMoment {
  id: string;
  date: string;
  title: string;
  description: string;
  loopId: string;
  practice: string;
  duration: number;
  quality: number;
  breakthrough: boolean;
  arcHarvest: boolean;
}

export function useSacredMoments(userId: string) {
  const [moments, setMoments] = useState<SacredMoment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMoments = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data } = await supabase
        .from("session_outcomes")
        .select("id, created_at, quality_score, loops_touched, breakthrough_detected")
        .eq("user_id", userId)
        .eq("breakthrough_detected", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) {
        const formatted: SacredMoment[] = data.map(d => ({
          id: d.id,
          date: new Date(d.created_at).toLocaleDateString(),
          title: `Breakthrough: ${d.loops_touched?.[0] || "Pattern"}`,
          description: `Quality: ${Math.round((d.quality_score || 0) * 100)}%`,
          loopId: d.loops_touched?.[0] || "",
          practice: "Session",
          duration: 0,
          quality: d.quality_score || 0,
          breakthrough: d.breakthrough_detected,
          arcHarvest: false,
        }));
        setMoments(formatted);
      }
    } catch (e) {
      console.error("[useSacredMoments] Error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchMoments();
  }, [userId, fetchMoments]);

  return { moments, isLoading, refetch: fetchMoments };
}