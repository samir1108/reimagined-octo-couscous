import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// Types
export interface CommunityObservation {
  id: string;
  user_id: string;
  content: string;
  display_mode: "anonymous" | "seeker" | "real";
  tags: string[];
  created_at: string;
  reaction_counts?: { acknowledged: number; witnessed: number };
  user_reactions?: string[];
  display_name?: string;
}

export interface JourneyGroup {
  id: string;
  name: string;
  description: string;
  type: string;
  max_members: number;
  duration_days: number;
  starts_at: string;
  status: string;
  created_by: string;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
}

export interface WitnessCircle {
  id: string;
  name: string;
  description: string;
  max_members: number;
  schedule: Record<string, unknown>;
  next_session_at: string | null;
  status: string;
  created_by: string;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
}

export interface CollectiveMeditation {
  id: string;
  title: string;
  description: string;
  type: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  participant_count: number;
  created_at: string;
  is_joined?: boolean;
}

// Observations
export function useObservations() {
  return useQuery({
    queryKey: ["community-observations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: observations, error } = await supabase
        .from("community_observations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get reactions for these observations
      const obsIds = (observations || []).map((o: any) => o.id);
      const { data: reactions } = obsIds.length
        ? await supabase
            .from("community_reactions")
            .select("*")
            .in("observation_id", obsIds)
        : { data: [] as any[] };

      // Get profiles for real-name display
      const userIds = [...new Set((observations || []).filter((o: any) => o.display_mode === "real").map((o: any) => o.user_id))];
      const { data: profiles } = userIds.length
        ? await supabase.from("profiles").select("user_id, display_name").in("user_id", userIds)
        : { data: [] };

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p.display_name]));

      return (observations || []).map((obs: any) => {
        const obsReactions = (reactions || []).filter((r: any) => r.observation_id === obs.id);
        return {
          ...obs,
          tags: obs.tags || [],
          reaction_counts: {
            acknowledged: obsReactions.filter((r: any) => r.reaction_type === "acknowledged").length,
            witnessed: obsReactions.filter((r: any) => r.reaction_type === "witnessed").length,
          },
          user_reactions: obsReactions.filter((r: any) => r.user_id === user.id).map((r: any) => r.reaction_type),
          display_name: obs.display_mode === "real" ? profileMap.get(obs.user_id) || "Seeker" : undefined,
        } as CommunityObservation;
      });
    },
  });
}

export function usePostObservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ content, display_mode, tags }: { content: string; display_mode: string; tags: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("community_observations").insert({
        user_id: user.id,
        content,
        display_mode,
        tags,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community-observations"] }),
  });
}

export function useToggleReaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ observationId, type }: { observationId: string; type: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if already reacted
      const { data: existing } = await supabase
        .from("community_reactions")
        .select("id")
        .eq("observation_id", observationId)
        .eq("user_id", user.id)
        .eq("reaction_type", type)
        .maybeSingle();

      if (existing) {
        await supabase.from("community_reactions").delete().eq("id", existing.id);
      } else {
        const { error } = await supabase.from("community_reactions").insert({
          observation_id: observationId,
          user_id: user.id,
          reaction_type: type,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community-observations"] }),
  });
}

// Consciousness Map — aggregate tags from today
export function useConsciousnessMap() {
  return useQuery({
    queryKey: ["consciousness-map"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("community_observations")
        .select("tags")
        .gte("created_at", today);

      if (error) throw error;

      const counts: Record<string, number> = {};
      (data || []).forEach((obs: any) => {
        const tags = obs.tags || [];
        tags.forEach((tag: string) => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
      });

      return Object.entries(counts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);
    },
    refetchInterval: 30000,
  });
}

// Journey Groups
export function useJourneyGroups() {
  return useQuery({
    queryKey: ["journey-groups"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: groups, error } = await supabase
        .from("journey_groups")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const groupIds = (groups || []).map((g: any) => g.id);
      const { data: members } = groupIds.length
        ? await supabase
            .from("journey_group_members")
            .select("group_id, user_id")
            .in("group_id", groupIds)
        : { data: [] as any[] };

      return (groups || []).map((g: any) => {
        const gMembers = (members || []).filter((m: any) => m.group_id === g.id);
        return {
          ...g,
          member_count: gMembers.length,
          is_member: gMembers.some((m: any) => m.user_id === user.id),
        } as JourneyGroup;
      });
    },
  });
}

export function useJoinGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("journey_group_members").insert({ group_id: groupId, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journey-groups"] }),
  });
}

export function useLeaveGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("journey_group_members").delete().eq("group_id", groupId).eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journey-groups"] }),
  });
}

// Witness Circles
export function useWitnessCircles() {
  return useQuery({
    queryKey: ["witness-circles"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: circles, error } = await supabase
        .from("witness_circles")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const circleIds = (circles || []).map((c: any) => c.id);
      const { data: members } = circleIds.length
        ? await supabase
            .from("witness_circle_members")
            .select("circle_id, user_id")
            .in("circle_id", circleIds)
        : { data: [] as any[] };

      return (circles || []).map((c: any) => {
        const cMembers = (members || []).filter((m: any) => m.circle_id === c.id);
        return {
          ...c,
          member_count: cMembers.length,
          is_member: cMembers.some((m: any) => m.user_id === user.id),
        } as WitnessCircle;
      });
    },
  });
}

export function useJoinCircle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (circleId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("witness_circle_members").insert({ circle_id: circleId, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["witness-circles"] }),
  });
}

export function useLeaveCircle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (circleId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("witness_circle_members").delete().eq("circle_id", circleId).eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["witness-circles"] }),
  });
}

// Collective Meditations
export function useCollectiveMeditations() {
  return useQuery({
    queryKey: ["collective-meditations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: meditations, error } = await supabase
        .from("collective_meditations")
        .select("*")
        .order("scheduled_at", { ascending: true });

      if (error) throw error;

      const medIds = (meditations || []).map((m: any) => m.id);
      const { data: participants } = medIds.length
        ? await supabase
            .from("collective_meditation_participants")
            .select("meditation_id, user_id")
            .in("meditation_id", medIds)
        : { data: [] as any[] };

      return (meditations || []).map((m: any) => ({
        ...m,
        participant_count: (participants || []).filter((p: any) => p.meditation_id === m.id).length,
        is_joined: (participants || []).some((p: any) => p.meditation_id === m.id && p.user_id === user.id),
      })) as CollectiveMeditation[];
    },
  });
}

export function useJoinMeditation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (meditationId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("collective_meditation_participants").insert({ meditation_id: meditationId, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collective-meditations"] }),
  });
}

export function useLeaveMeditation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (meditationId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("collective_meditation_participants").delete().eq("meditation_id", meditationId).eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collective-meditations"] }),
  });
}
