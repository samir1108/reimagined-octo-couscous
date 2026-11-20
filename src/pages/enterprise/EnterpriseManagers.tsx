import { useOutletContext } from "react-router-dom";
import { UserCog, Users, Flame, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { useOrgMembers, useOrgTeams, useOrgEmployeeProfiles, type Organization, type OrgMember } from "@/hooks/useEnterprise";

export default function EnterpriseManagers() {
  const { membership } = useOutletContext<{ membership: OrgMember; org: Organization | null }>();
  const { data: members = [] } = useOrgMembers(membership?.org_id);
  const { data: teams = [] } = useOrgTeams(membership?.org_id);
  const { data: profiles = [] } = useOrgEmployeeProfiles(membership?.org_id);

  const managers = members.filter((m) => m.role === "manager" && m.status === "active");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <UserCog className="w-7 h-7 text-primary" />
          Managers
        </h1>
        <p className="text-sm text-muted-foreground font-body mt-1">{managers.length} managers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {managers.length === 0 ? (
          <div className="col-span-full glass-card rounded-2xl p-8 text-center border border-border/20">
            <UserCog className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-body">
              No managers yet. Promote employees from the Employees tab.
            </p>
          </div>
        ) : (
          managers.map((mgr) => {
            const mgrProfile = profiles.find((p) => p.member.id === mgr.id);
            const mgrTeam = teams.find((t) => t.id === mgr.team_id);
            const teamMembers = mgr.team_id
              ? members.filter((m) => m.team_id === mgr.team_id && m.status === "active")
              : [];

            return (
              <motion.div
                key={mgr.id}
                className="glass-card rounded-2xl border border-border/20 p-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-chart-4/10 flex items-center justify-center text-chart-4 font-display font-bold text-base">
                    {(mgrProfile?.profile?.display_name?.[0] || mgr.email?.[0] || "?").toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-semibold text-foreground">
                      {mgrProfile?.profile?.display_name || mgr.email || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground font-body">{mgr.email}</p>
                    {mgrTeam && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-body font-medium mt-1 inline-block">
                        {mgrTeam.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="text-center">
                    <Users className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                    <p className="text-sm font-display font-bold text-foreground">{teamMembers.length}</p>
                    <p className="text-[10px] text-muted-foreground font-body">Members</p>
                  </div>
                  <div className="text-center">
                    <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                    <p className="text-sm font-display font-bold text-foreground">
                      {mgrProfile?.consciousness?.streak_current || 0}d
                    </p>
                    <p className="text-[10px] text-muted-foreground font-body">Streak</p>
                  </div>
                  <div className="text-center">
                    <Brain className="w-4 h-4 text-chart-4 mx-auto mb-1" />
                    <p className="text-sm font-display font-bold text-foreground">
                      {mgrProfile?.consciousness?.overall_band?.toFixed(1) || "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-body">Band</p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
