import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Trophy, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type Organization, type OrgMember,
  useOrgTeams, useOrgEmployeeProfiles,
} from "@/hooks/useEnterprise";
import ChallengeCard from "@/components/enterprise/ChallengeCard";
import ChallengeLeaderboard from "@/components/enterprise/ChallengeLeaderboard";

function useOrgChallenges(orgId?: string) {
  return useQuery({
    queryKey: ["org-challenges", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("wellness_challenges" as any)
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId,
  });
}

function useChallengeParticipants(challengeId?: string) {
  return useQuery({
    queryKey: ["challenge-participants", challengeId],
    queryFn: async () => {
      if (!challengeId) return [];
      const { data, error } = await supabase
        .from("challenge_participants" as any)
        .select("*")
        .eq("challenge_id", challengeId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!challengeId,
  });
}

export default function EnterpriseChallenges() {
  const { membership } = useOutletContext<{ membership: OrgMember; org: Organization | null }>();
  const qc = useQueryClient();
  const { data: challenges = [] } = useOrgChallenges(membership?.org_id);
  const { data: profiles = [] } = useOrgEmployeeProfiles(membership?.org_id);
  const { data: teams = [] } = useOrgTeams(membership?.org_id);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const { data: participants = [] } = useChallengeParticipants(selectedChallenge || undefined);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [challengeType, setChallengeType] = useState("streak");
  const [targetValue, setTargetValue] = useState(7);
  const [durationDays, setDurationDays] = useState(7);
  const [badge, setBadge] = useState("🏆");

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);
      const { error } = await supabase.from("wellness_challenges" as any).insert({
        org_id: membership.org_id,
        title,
        description,
        challenge_type: challengeType,
        target_value: targetValue,
        end_date: endDate.toISOString().split("T")[0],
        created_by: user.id,
        rewards_badge: badge,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Challenge created!");
      setShowCreate(false);
      setTitle("");
      setDescription("");
      qc.invalidateQueries({ queryKey: ["org-challenges"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const joinMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("challenge_participants" as any).insert({
        challenge_id: challengeId,
        user_id: user.id,
        team_id: membership.team_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Joined challenge!");
      qc.invalidateQueries({ queryKey: ["challenge-participants"] });
      qc.invalidateQueries({ queryKey: ["org-challenges"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Enrich challenges with participant counts
  const enrichedChallenges = challenges.map((c: any) => ({
    ...c,
    participantCount: 0, // Will be loaded per challenge
    joined: false,
    myProgress: 0,
  }));

  const activeChallenges = enrichedChallenges.filter((c: any) => c.status === "active");
  const pastChallenges = enrichedChallenges.filter((c: any) => c.status !== "active");

  // Leaderboard entries
  const leaderboardEntries = participants.map((p: any) => {
    const ep = profiles.find((pr) => pr.member.user_id === p.user_id);
    const team = teams.find((t) => t.id === p.team_id);
    return {
      name: ep?.profile?.display_name || ep?.member.email || "Unknown",
      value: p.current_value || 0,
      teamName: team?.name,
      completed: p.completed || false,
    };
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <Trophy className="w-7 h-7 text-primary" />
            Wellness Challenges
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-1">
            Team challenges for streaks, sessions, and mindfulness minutes
          </p>
        </div>
        {(membership.role === "admin" || membership.role === "manager") && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-body text-xs hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Challenge
          </button>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="glass-card rounded-2xl border border-border/20 p-5"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-sm font-semibold text-foreground">Create Challenge</h3>
              <button onClick={() => setShowCreate(false)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Challenge title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-2 px-3 py-2 rounded-xl bg-muted/30 border border-border/20 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-2 px-3 py-2 rounded-xl bg-muted/30 border border-border/20 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <select
                value={challengeType}
                onChange={(e) => setChallengeType(e.target.value)}
                className="px-3 py-2 rounded-xl bg-muted/30 border border-border/20 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="streak">🔥 Streak Days</option>
                <option value="sessions">🧘 Sessions</option>
                <option value="minutes">⏱️ Minutes</option>
              </select>
              <input
                type="number"
                placeholder="Target"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="px-3 py-2 rounded-xl bg-muted/30 border border-border/20 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                type="number"
                placeholder="Duration (days)"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="px-3 py-2 rounded-xl bg-muted/30 border border-border/20 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                type="text"
                placeholder="Badge emoji"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="px-3 py-2 rounded-xl bg-muted/30 border border-border/20 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              onClick={() => createMutation.mutate()}
              disabled={!title.trim() || createMutation.isPending}
              className="mt-3 w-full py-2 rounded-xl bg-primary text-primary-foreground font-body text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {createMutation.isPending ? "Creating..." : "Create Challenge"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Challenges */}
      <div>
        <h2 className="text-sm font-display font-semibold text-foreground mb-3">Active Challenges</h2>
        {activeChallenges.length === 0 ? (
          <p className="text-sm text-muted-foreground font-body text-center py-8 glass-card rounded-2xl border border-border/20">
            No active challenges. Create one to boost team engagement!
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {activeChallenges.map((c: any, i: number) => (
              <div key={c.id} onClick={() => setSelectedChallenge(c.id)} className="cursor-pointer">
                <ChallengeCard challenge={c} onJoin={(id) => joinMutation.mutate(id)} index={i} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard */}
      {selectedChallenge && (
        <ChallengeLeaderboard
          entries={leaderboardEntries}
          targetValue={(challenges as any[]).find((c: any) => c.id === selectedChallenge)?.target_value || 7}
          type={(challenges as any[]).find((c: any) => c.id === selectedChallenge)?.challenge_type || "streak"}
        />
      )}

      {/* Past Challenges */}
      {pastChallenges.length > 0 && (
        <div>
          <h2 className="text-sm font-display font-semibold text-muted-foreground mb-3">Past Challenges</h2>
          <div className="grid md:grid-cols-2 gap-4 opacity-60">
            {pastChallenges.map((c: any, i: number) => (
              <ChallengeCard key={c.id} challenge={c} onJoin={() => {}} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
