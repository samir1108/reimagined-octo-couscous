import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { type EmployeeProfile, type Team } from "@/hooks/useEnterprise";
import { Grid3X3 } from "lucide-react";

function getBandColor(band: number): string {
  if (band <= 0) return "bg-muted/30";
  if (band < 2) return "bg-red-500/60";
  if (band < 4) return "bg-orange-500/50";
  if (band < 6) return "bg-yellow-500/50";
  if (band < 8) return "bg-green-500/50";
  return "bg-purple-500/60";
}

function getBandLabel(band: number): string {
  if (band <= 0) return "No data";
  if (band < 2) return "Beginning";
  if (band < 4) return "Developing";
  if (band < 6) return "Growing";
  if (band < 8) return "Flourishing";
  return "Transcending";
}

export default function ConsciousnessHeatMap({ profiles, teams }: { profiles: EmployeeProfile[]; teams: Team[] }) {
  const navigate = useNavigate();

  const teamGroups = teams.map((team) => ({
    team,
    members: profiles.filter((p) => p.member.team_id === team.id),
  }));

  const unassigned = profiles.filter((p) => !p.member.team_id);
  if (unassigned.length > 0) {
    teamGroups.push({ team: { id: "unassigned", org_id: "", name: "Unassigned", description: null, created_at: "" }, members: unassigned });
  }

  if (profiles.length === 0) return null;

  return (
    <motion.div
      className="glass-card rounded-2xl border border-border/20 p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">Consciousness Heat Map</h3>
          <p className="text-xs text-muted-foreground font-body">Click any cell to view employee details</p>
        </div>
        <Grid3X3 className="w-5 h-5 text-primary" />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {[
          { color: "bg-red-500/60", label: "0-2" },
          { color: "bg-orange-500/50", label: "2-4" },
          { color: "bg-yellow-500/50", label: "4-6" },
          { color: "bg-green-500/50", label: "6-8" },
          { color: "bg-purple-500/60", label: "8-10" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-sm ${l.color}`} />
            <span className="text-[10px] text-muted-foreground font-body">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="space-y-4">
        {teamGroups.map(({ team, members }) => (
          <div key={team.id}>
            <p className="text-xs font-body font-semibold text-muted-foreground mb-2 uppercase tracking-wider">{team.name}</p>
            <div className="flex flex-wrap gap-1.5">
              {members.map((ep) => {
                const band = ep.consciousness?.overall_band || 0;
                return (
                  <button
                    key={ep.member.id}
                    onClick={() => ep.member.user_id && navigate(`/enterprise/employees/${ep.member.user_id}`)}
                    className={`w-8 h-8 rounded-md ${getBandColor(band)} hover:ring-2 hover:ring-primary/50 transition-all relative group`}
                    title={`${ep.profile?.display_name || ep.member.email || "Unknown"} — Band ${band.toFixed(1)}`}
                  >
                    <span className="text-[8px] font-bold text-foreground/80">
                      {(ep.profile?.display_name?.[0] || ep.member.email?.[0] || "?").toUpperCase()}
                    </span>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20">
                      <div className="bg-card border border-border rounded-lg px-2 py-1 text-[10px] font-body whitespace-nowrap shadow-lg">
                        <p className="font-medium text-foreground">{ep.profile?.display_name || ep.member.email || "Unknown"}</p>
                        <p className="text-muted-foreground">Band {band.toFixed(1)} • {getBandLabel(band)}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
              {members.length === 0 && (
                <span className="text-[10px] text-muted-foreground font-body italic">No members</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
