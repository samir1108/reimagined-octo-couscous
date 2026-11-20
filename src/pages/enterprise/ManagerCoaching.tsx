import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { UserCog, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  type Organization, type OrgMember,
  useOrgEmployeeProfiles, useOrgTeams,
} from "@/hooks/useEnterprise";
import CoachingTalkingPoints from "@/components/enterprise/CoachingTalkingPoints";

export default function ManagerCoaching() {
  const { membership } = useOutletContext<{ membership: OrgMember; org: Organization | null }>();
  const { data: profiles = [] } = useOrgEmployeeProfiles(membership?.org_id);
  const { data: teams = [] } = useOrgTeams(membership?.org_id);

  // Filter direct reports (same team for managers, all for admin)
  const directReports = membership.role === "manager"
    ? profiles.filter((p) => p.member.team_id === membership.team_id && p.member.user_id !== membership.user_id)
    : profiles.filter((p) => p.member.role === "employee");

  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [talkingPoints, setTalkingPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedProfile = directReports.find((p) => p.member.user_id === selectedEmployee);

  const handlePrepare = async (userId: string) => {
    setSelectedEmployee(userId);
    setLoading(true);
    setTalkingPoints([]);

    const ep = directReports.find((p) => p.member.user_id === userId);
    if (!ep) return;

    try {
      const { data, error } = await supabase.functions.invoke("manager-coaching", {
        body: {
          employeeName: ep.profile?.display_name || ep.member.email || "Employee",
          consciousnessData: {
            band: ep.consciousness?.overall_band || 0,
            streak: ep.consciousness?.streak_current || 0,
            totalSessions: ep.consciousness?.total_sessions || 0,
            journeyPhase: ep.consciousness?.journey_phase || "unknown",
            vLevel: ep.consciousness?.v_level_current || 0,
            witnessDepth: ep.consciousness?.witness_depth || 0,
            bypassingRisk: ep.consciousness?.bypassing_risk || 0,
            dimensionBands: ep.consciousness?.dimension_bands || {},
          },
        },
      });
      if (error) throw error;
      setTalkingPoints(data?.talkingPoints || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate coaching notes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <UserCog className="w-7 h-7 text-primary" />
          1-on-1 Coaching
        </h1>
        <p className="text-sm text-muted-foreground font-body mt-1">
          AI-prepared talking points for meaningful conversations with your team
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Employee List */}
        <div className="lg:col-span-2 space-y-2">
          <h2 className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">Direct Reports</h2>
          {directReports.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body text-center py-8">No direct reports found</p>
          ) : directReports.map((ep, i) => {
            const team = teams.find((t) => t.id === ep.member.team_id);
            const isSelected = selectedEmployee === ep.member.user_id;
            return (
              <motion.div
                key={ep.member.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected ? "border-primary bg-primary/5" : "border-border/20 hover:border-primary/30"
                }`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedEmployee(ep.member.user_id)}
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-xs">
                  {(ep.profile?.display_name?.[0] || ep.member.email?.[0] || "?").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-medium text-foreground truncate">
                    {ep.profile?.display_name || ep.member.email || "Unknown"}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-body">
                    Band {ep.consciousness?.overall_band?.toFixed(1) || "—"} • {team?.name || "No team"}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrepare(ep.member.user_id!);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-body font-medium hover:bg-primary/20 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  Prepare
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Coaching Notes */}
        <div className="lg:col-span-3">
          <CoachingTalkingPoints
            points={talkingPoints}
            loading={loading}
            employeeName={selectedProfile?.profile?.display_name || selectedProfile?.member.email || "Employee"}
          />
        </div>
      </div>
    </div>
  );
}
