import { useState } from "react";
import { Building2, Flame, Brain, Target, Activity, TrendingUp, Users, Trophy, Medal } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useOutletContext } from "react-router-dom";
import { type Organization, type OrgMember, useOrgTeams, useOrgEmployeeProfiles } from "@/hooks/useEnterprise";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subDays } from "date-fns";
import MoodPulseWidget from "@/components/enterprise/MoodPulseWidget";
import WorkplaceLoopsLibrary from "@/components/enterprise/WorkplaceLoopsLibrary";

export default function EmployeePortal() {
  const { membership, org } = useOutletContext<{ membership: OrgMember; org: Organization | null }>();

  const { data: teams = [] } = useOrgTeams(membership?.org_id);
  const myTeam = teams.find((t) => t.id === membership?.team_id);

  // Fetch own consciousness data + sessions timeline
  const { data: myData } = useQuery({
    queryKey: ["my-consciousness"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const [profileRes, consciousnessRes, sessionsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_consciousness_profile").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("sessions").select("id, session_date").eq("user_id", user.id).gte("session_date", subDays(new Date(), 30).toISOString().split("T")[0]),
      ]);
      return {
        profile: profileRes.data,
        consciousness: consciousnessRes.data,
        sessions: sessionsRes.data || [],
        sessionCount: sessionsRes.data?.length || 0,
      };
    },
  });

  // Team averages (if team exists)
  const { data: teamProfiles = [] } = useOrgEmployeeProfiles(membership?.org_id);
  const myTeamProfiles = teamProfiles.filter((p) => p.member.team_id === membership?.team_id);
  const teamAvgBand = myTeamProfiles.length > 0
    ? myTeamProfiles.reduce((s, p) => s + (p.consciousness?.overall_band || 0), 0) / myTeamProfiles.length
    : 0;
  const teamAvgStreak = myTeamProfiles.length > 0
    ? myTeamProfiles.reduce((s, p) => s + (p.consciousness?.streak_current || 0), 0) / myTeamProfiles.length
    : 0;

  // Percentile rank
  const myBand = myData?.consciousness?.overall_band || 0;
  const belowMe = myTeamProfiles.filter((p) => (p.consciousness?.overall_band || 0) < myBand).length;
  const percentile = myTeamProfiles.length > 1 ? Math.round((belowMe / (myTeamProfiles.length - 1)) * 100) : 50;

  // Sessions timeline chart
  const sessionsChartData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const count = (myData?.sessions || []).filter((s: any) => s.session_date === dateStr).length;
    return { date: format(date, "MMM d"), sessions: count };
  });

  // Streak leaderboard within team
  const teamLeaderboard = [...myTeamProfiles]
    .filter((p) => p.consciousness)
    .sort((a, b) => (b.consciousness?.streak_current || 0) - (a.consciousness?.streak_current || 0))
    .slice(0, 5);

  const c = myData?.consciousness;
  const dimensions = ["awareness", "thought", "emotion", "body"];
  const dimBands = c?.dimension_bands as Record<string, number> | undefined;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <Building2 className="w-7 h-7 text-primary" />
          My Dashboard
        </h1>
        <p className="text-sm text-muted-foreground font-body mt-1">
          {org?.name} • {myTeam?.name || "No team assigned"}
        </p>
      </div>

      {/* Personal Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Brain, label: "Band", value: c?.overall_band?.toFixed(1) || "—", color: "bg-primary/10 text-primary" },
          { icon: Flame, label: "Streak", value: `${c?.streak_current || 0}d`, color: "bg-orange-500/10 text-orange-500" },
          { icon: Target, label: "Sessions", value: String(myData?.sessionCount || 0), color: "bg-chart-2/10 text-chart-2" },
          { icon: Activity, label: "V-Level", value: c?.v_level_current?.toFixed(1) || "—", color: "bg-chart-4/10 text-chart-4" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="glass-card rounded-2xl p-4 border border-border/20"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-display font-bold text-foreground mt-1">{stat.value}</p>
              </div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Percentile Rank */}
      {myTeam && myTeamProfiles.length > 1 && (
        <motion.div
          className="glass-card rounded-2xl border border-border/20 p-5 bg-gradient-to-br from-primary/5 to-transparent"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-3">
            <Medal className="w-6 h-6 text-primary" />
            <div>
              <p className="text-sm font-body font-medium text-foreground">
                You're in the <span className="text-primary font-bold">top {100 - percentile}%</span> of your team
              </p>
              <p className="text-xs text-muted-foreground font-body">Based on consciousness band within {myTeam.name}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sessions Timeline */}
      <motion.div
        className="glass-card rounded-2xl border border-border/20 p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-display text-base font-semibold text-foreground mb-3">Your Activity (30 days)</h3>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={sessionsChartData}>
            <defs>
              <linearGradient id="gradMySession" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={6} />
            <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={20} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
            <Area type="monotone" dataKey="sessions" stroke="hsl(var(--primary))" fill="url(#gradMySession)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Dimensions */}
      {dimBands && (
        <motion.div
          className="glass-card rounded-2xl border border-border/20 p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h3 className="font-display text-base font-semibold text-foreground mb-4">Your Dimensions</h3>
          <div className="space-y-3">
            {dimensions.map((dim) => (
              <div key={dim}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-body text-muted-foreground capitalize">{dim}</span>
                  <span className="text-xs font-body font-medium text-foreground">{(dimBands[dim] || 0).toFixed(1)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((dimBands[dim] || 0) * 10, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Team Comparison + Streak Leaderboard */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Team Comparison */}
        {myTeam && (
          <motion.div
            className="glass-card rounded-2xl border border-border/20 p-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-display text-base font-semibold text-foreground">Team: {myTeam.name}</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground font-body">Your Band</p>
                <p className="text-xl font-display font-bold text-foreground">{c?.overall_band?.toFixed(1) || "—"}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground font-body">Team Avg</p>
                <p className="text-xl font-display font-bold text-muted-foreground">{teamAvgBand.toFixed(1)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground font-body">Streak Avg</p>
                <p className="text-xl font-display font-bold text-muted-foreground">{Math.round(teamAvgStreak)}d</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Streak Leaderboard */}
        {myTeam && teamLeaderboard.length > 0 && (
          <motion.div
            className="glass-card rounded-2xl border border-border/20 p-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="font-display text-sm font-semibold text-foreground">Streak Leaderboard</h3>
            </div>
            <div className="space-y-2">
              {teamLeaderboard.map((ep, i) => (
                <div key={ep.member.id} className="flex items-center gap-2 py-1.5 border-b border-border/5 last:border-0">
                  <span className={`text-[10px] font-bold font-display w-5 text-center ${
                    i === 0 ? "text-yellow-500" : "text-muted-foreground"
                  }`}>{i + 1}</span>
                  <span className="text-xs font-body text-foreground flex-1 truncate">
                    {ep.profile?.display_name || ep.member.email || "Unknown"}
                    {ep.member.user_id === membership.user_id && " (You)"}
                  </span>
                  <span className="text-xs font-display font-bold text-foreground">{ep.consciousness?.streak_current || 0}d</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Mood Pulse Widget */}
      <MoodPulseWidget orgId={membership.org_id} />
      <div className="mt-6">
        <h3 className="font-display text-sm font-semibold text-foreground mb-3">Workplace Loops Library</h3>
        <WorkplaceLoopsLibrary orgId={membership.org_id} teamId={membership.team_id ?? undefined} department={(membership as any).department ?? undefined} />
      </div>

      {/* Journey Info */}
      <motion.div
        className="glass-card rounded-2xl border border-border/20 p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="font-display text-base font-semibold text-foreground mb-3">Journey</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground font-body">Phase</p>
            <p className="text-sm font-body font-medium text-foreground capitalize">{c?.journey_phase || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-body">Day</p>
            <p className="text-sm font-body font-medium text-foreground">{c?.journey_day || 1}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-body">Longest Streak</p>
            <p className="text-sm font-body font-medium text-foreground">{c?.streak_longest || 0}d</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-body">Witness Depth</p>
            <p className="text-sm font-body font-medium text-foreground">{c?.witness_depth?.toFixed(1) || "—"}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
