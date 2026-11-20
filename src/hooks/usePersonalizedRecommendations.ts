import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getPersonalizedRecommendations, type RecommendationContext } from "@/lib/content-library";
import { useConsciousnessEngine, type ConsciousnessProfile } from "./useConsciousnessEngine";

function getWeakDimensions(profile: ConsciousnessProfile): string[] {
  const bands = profile.dimension_bands;
  const entries = Object.entries(bands) as [string, number][];
  const sorted = entries.sort((a, b) => a[1] - b[1]);
  return sorted.slice(0, 3).map(([dim]) => dim);
}

function getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 22) return "evening";
  return "night";
}

function getEnergyLevel(profile: ConsciousnessProfile): "low" | "medium" | "high" {
  const avgBand = Object.values(profile.dimension_bands).reduce((a, b) => a + b, 0) / Object.keys(profile.dimension_bands).length;
  if (avgBand < 3) return "low";
  if (avgBand < 6) return "medium";
  return "high";
}

async function getCompletedItemIds(userId: string): Promise<string[]> {
  try {
    const { data } = await supabase
      .from("user_library_progress")
      .select("item_id")
      .eq("user_id", userId)
      .eq("status", "completed");
    return (data || []).map((d) => d.item_id);
  } catch {
    return [];
  }
}

async function getFavoritedItemIds(userId: string): Promise<string[]> {
  try {
    const { data } = await supabase
      .from("user_favorites")
      .select("item_id")
      .eq("user_id", userId);
    return (data || []).map((d) => d.item_id);
  } catch {
    return [];
  }
}

export function usePersonalizedRecommendations(limit: number = 4) {
  const { data: engineData } = useConsciousnessEngine();
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [favoritedIds, setFavoritedIds] = useState<string[]>([]);
  const [context, setContext] = useState<RecommendationContext | null>(null);

  useEffect(() => {
    if (!engineData?.profile) return;
    
    const profile = engineData.profile;
    const userId = profile.user_id;
    
    getCompletedItemIds(userId).then(setCompletedIds);
    getFavoritedItemIds(userId).then(setFavoritedIds);
    
    const weakDims = getWeakDimensions(profile);
    
    setContext({
      user_id: userId,
      time_of_day: getTimeOfDay(),
      day_of_week: new Date().getDay(),
      available_minutes: 20,
      energy_level: getEnergyLevel(profile),
      recent_emotions: [],
      current_program_id: undefined,
      current_band: profile.overall_band,
      completed_item_ids: completedIds,
      favorited_item_ids: favoritedIds,
      weak_dimensions: weakDims,
      current_journey_day: profile.journey_day,
    });
  }, [engineData?.profile]);

  useEffect(() => {
    if (context) {
      setContext((prev) => prev ? { ...prev, completed_item_ids: completedIds, favorited_item_ids: favoritedIds } : null);
    }
  }, [completedIds, favoritedIds]);

  const recommendations = useQuery({
    queryKey: ["personalized-recommendations", context, limit],
    queryFn: () => {
      if (!context) return [];
      return getPersonalizedRecommendations(context, limit);
    },
    enabled: !!context,
    staleTime: 1000 * 60 * 10,
  });

  return {
    recommendations: recommendations.data || [],
    isLoading: recommendations.isLoading,
    error: recommendations.error,
    context,
    refetch: recommendations.refetch,
  };
}