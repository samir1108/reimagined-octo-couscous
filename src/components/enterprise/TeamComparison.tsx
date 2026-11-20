import { useState } from "react";
import { BarChart3, ArrowLeftRight } from "lucide-react";
import { motion } from "framer-motion";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import type { EmployeeProfile } from "@/hooks/useEnterprise";

interface TeamComparisonProps {
  teamStats: any[];
  profiles: EmployeeProfile[];
  teams: any[];
}

const INDUSTRY_BENCHMARKS = {
  band: 3.5,
  streak: 7,
  engagement: 45,
  sessions: 15,
};

export default function TeamComparison({ teamStats, profiles, teams }: TeamComparisonProps) {
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  if (teamStats.length === 0) return null;

  // Auto-select first 2 teams if none selected
  const compareTeams = selectedTeams.length >= 2
    ? selectedTeams.slice(0, 2)
    : teamStats.slice(0, 2).map((ts) => ts.team.id);

  // Build radar data for dimension comparison
  const dimensions = ["awareness", "thought", "emotion", "body"];
  const radarData = dimensions.map((dim) => {
    const entry: Record<string, any> = { dimension: dim.charAt(0).toUpperCase() + dim.slice(1) };

    compareTeams.forEach((teamId, idx) => {
      const teamMembers = profiles.filter((p) => p.member.team_id === teamId && p.consciousness);
      const avg = teamMembers.length > 0
        ? teamMembers.reduce((s, p) => {
            const bands = p.consciousness?.dimension_bands as Record<string, number> | undefined;
            return s + (bands?.[dim] || 0);
          }, 0) / teamMembers.length
        : 0;
      const team = teams.find((t: any) => t.id === teamId);
      entry[`team${idx + 1}`] = Number(avg.toFixed(1));
      entry[`team${idx + 1}Name`] = team?.name || `Team ${idx + 1}`;
    });

    entry.benchmark = INDUSTRY_BENCHMARKS.band;
    return entry;
  });

  // Bar chart: comparison metrics
  const barData = compareTeams.map((teamId) => {
    const stat = teamStats.find((ts) => ts.team.id === teamId);
    const team = teams.find((t: any) => t.id === teamId);
    return {
      name: team?.name?.slice(0, 15) || "Unknown",
      band: stat?.avgBand || 0,
      streak: stat?.avgStreak || 0,
      sessions: stat?.totalSessions || 0,
      members: stat?.memberCount || 0,
    };
  });

  // Leaderboard
  const leaderboard = [...teamStats]
    .sort((a, b) => b.avgBand - a.avgBand)
    .map((ts, i) => ({ ...ts, rank: i + 1 }));

  // Percentile calculation
  const allBands = profiles.filter((p) => p.consciousness).map((p) => p.consciousness?.overall_band || 0).sort((a, b) => a - b);

  const toggleTeam = (id: string) => {
    setSelectedTeams((prev) => {
      if (prev.includes(id)) return prev.filter((t) => t !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  return (
    <motion.div
      className="glass-card rounded-2xl border border-border/20 overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <div className="px-5 py-4 border-b border-border/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
            <h3 className="font-display text-sm font-semibold text-foreground">Team Comparison & Benchmarks</h3>
          </div>
        </div>
        {/* Team selector chips */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {teamStats.map((ts) => (
            <button
              key={ts.team.id}
              onClick={() => toggleTeam(ts.team.id)}
              className={`text-[10px] px-2.5 py-1 rounded-full font-body font-medium transition-colors ${
                compareTeams.includes(ts.team.id)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {ts.team.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Radar Chart */}
        {compareTeams.length >= 2 && (
          <div>
            <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider mb-3">Dimension Comparison</p>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" opacity={0.3} />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} />
                <Radar name={radarData[0]?.team1Name} dataKey="team1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                <Radar name={radarData[0]?.team2Name} dataKey="team2" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Industry Benchmark" dataKey="benchmark" stroke="hsl(var(--chart-4))" strokeDasharray="4 4" fill="none" strokeWidth={1.5} />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bar comparison */}
        {barData.length >= 2 && (
          <div>
            <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider mb-3">Metrics Comparison</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                <Bar dataKey="band" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Avg Band" />
                <Bar dataKey="streak" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Avg Streak" />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Leaderboard */}
        <div>
          <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider mb-3">Team Leaderboard</p>
          <div className="space-y-2">
            {leaderboard.map((ts) => (
              <div key={ts.team.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/10 border border-border/10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-display ${
                  ts.rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
                  ts.rank === 2 ? "bg-muted text-muted-foreground" :
                  "bg-muted/50 text-muted-foreground"
                }`}>
                  #{ts.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-medium text-foreground truncate">{ts.team.name}</p>
                  <p className="text-[10px] text-muted-foreground font-body">{ts.memberCount} members • {ts.totalSessions} sessions</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-display font-bold text-primary">{ts.avgBand}</p>
                  <p className="text-[9px] text-muted-foreground font-body">avg band</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Benchmark */}
        <div className="p-4 rounded-xl bg-muted/10 border border-border/10">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-chart-4" />
            <span className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-wider">Industry Benchmarks</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-muted-foreground font-body">Avg Band</p>
              <p className="text-sm font-display font-bold text-foreground">{INDUSTRY_BENCHMARKS.band}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-body">Avg Streak</p>
              <p className="text-sm font-display font-bold text-foreground">{INDUSTRY_BENCHMARKS.streak}d</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-body">Engagement</p>
              <p className="text-sm font-display font-bold text-foreground">{INDUSTRY_BENCHMARKS.engagement}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-body">Sessions/mo</p>
              <p className="text-sm font-display font-bold text-foreground">{INDUSTRY_BENCHMARKS.sessions}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
