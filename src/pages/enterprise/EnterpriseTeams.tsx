import { useOutletContext, useNavigate } from "react-router-dom";
import { UsersRound, Plus, Users, Brain, Flame, TrendingUp, X, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useOrgTeams, useOrgMembers, useCreateTeam, useOrgTeamStats, useAssignTeam, useOrgEmployeeProfiles, type Organization, type OrgMember } from "@/hooks/useEnterprise";
import { toast } from "sonner";

export default function EnterpriseTeams() {
  const navigate = useNavigate();
  const { membership } = useOutletContext<{ membership: OrgMember; org: Organization | null }>();
  const { data: teams = [] } = useOrgTeams(membership?.org_id);
  const { data: members = [] } = useOrgMembers(membership?.org_id);
  const { data: teamStats = [] } = useOrgTeamStats(membership?.org_id);
  const { data: profiles = [] } = useOrgEmployeeProfiles(membership?.org_id);
  const createTeam = useCreateTeam();
  const assignTeam = useAssignTeam();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showAssign, setShowAssign] = useState(false);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createTeam.mutate(
      { orgId: membership.org_id, name: newName, description: newDesc },
      {
        onSuccess: () => {
          toast.success("Team created!");
          setNewName("");
          setNewDesc("");
          setShowCreate(false);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleAssign = (memberId: string, teamId: string | null) => {
    assignTeam.mutate(
      { memberId, teamId, orgId: membership.org_id },
      {
        onSuccess: () => toast.success("Member assigned!"),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const selectedTeamData = selectedTeam ? teamStats.find((ts) => ts.team.id === selectedTeam) : null;
  const selectedTeamMembers = selectedTeam
    ? members.filter((m) => m.team_id === selectedTeam && m.status === "active")
    : [];
  const unassignedMembers = members.filter((m) => !m.team_id && m.status === "active");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <UsersRound className="w-7 h-7 text-primary" />
            Teams
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-1">
            {teams.length} teams • {unassignedMembers.length} unassigned members
          </p>
        </div>
        <div className="flex gap-2">
          {membership.role === "admin" && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-body text-sm hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              New Team
            </button>
          )}
        </div>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="glass-card rounded-2xl border border-border/20 p-5 space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <input
              type="text"
              placeholder="Team name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border/20 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border/20 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || createTeam.isPending}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-body text-sm hover:opacity-90 disabled:opacity-50"
              >
                {createTeam.isPending ? "Creating..." : "Create Team"}
              </button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl bg-muted text-muted-foreground font-body text-sm hover:bg-muted/80">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-6">
        {/* Teams grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.length === 0 ? (
              <div className="col-span-full glass-card rounded-2xl p-8 text-center border border-border/20">
                <UsersRound className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-body">No teams yet. Create your first team.</p>
              </div>
            ) : (
              teams.map((team) => {
                const stats = teamStats.find((ts) => ts.team.id === team.id);
                const teamMembers = members.filter((m) => m.team_id === team.id && m.status === "active");
                const isSelected = selectedTeam === team.id;

                return (
                  <motion.button
                    key={team.id}
                    onClick={() => setSelectedTeam(isSelected ? null : team.id)}
                    className={`text-left glass-card rounded-2xl border p-5 transition-all ${
                      isSelected ? "border-primary/30 bg-primary/5" : "border-border/20 hover:border-border/40"
                    }`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-display font-semibold text-foreground">{team.name}</h3>
                        {team.description && (
                          <p className="text-xs text-muted-foreground font-body mt-0.5">{team.description}</p>
                        )}
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 rounded-lg bg-muted/10">
                        <p className="text-lg font-display font-bold text-foreground">{stats?.memberCount || 0}</p>
                        <p className="text-[9px] text-muted-foreground font-body">Members</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/10">
                        <p className="text-lg font-display font-bold text-foreground">{stats?.avgBand || 0}</p>
                        <p className="text-[9px] text-muted-foreground font-body">Avg Band</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/10">
                        <p className="text-lg font-display font-bold text-foreground">{stats?.avgStreak || 0}d</p>
                        <p className="text-[9px] text-muted-foreground font-body">Avg Streak</p>
                      </div>
                    </div>

                    {/* Member avatars */}
                    <div className="flex -space-x-2 mt-3">
                      {teamMembers.slice(0, 6).map((m) => (
                        <div
                          key={m.id}
                          className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-body font-bold text-muted-foreground"
                        >
                          {(m.email?.[0] || "?").toUpperCase()}
                        </div>
                      ))}
                      {teamMembers.length > 6 && (
                        <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-body text-muted-foreground">
                          +{teamMembers.length - 6}
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* Team Detail Panel */}
        <AnimatePresence>
          {selectedTeam && (
            <motion.div
              className="w-80 shrink-0 glass-card rounded-2xl border border-border/20 p-5 h-fit sticky top-6 space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-foreground">
                  {teams.find((t) => t.id === selectedTeam)?.name}
                </h3>
                <button onClick={() => setSelectedTeam(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Team Stats */}
              {selectedTeamData && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <Brain className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-lg font-display font-bold text-foreground">{selectedTeamData.avgBand}</p>
                    <p className="text-[9px] text-muted-foreground font-body">Avg Band</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                    <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                    <p className="text-lg font-display font-bold text-foreground">{selectedTeamData.avgStreak}d</p>
                    <p className="text-[9px] text-muted-foreground font-body">Avg Streak</p>
                  </div>
                </div>
              )}

              {/* Members */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider">Members</p>
                  {membership.role === "admin" && (
                    <button
                      onClick={() => setShowAssign(!showAssign)}
                      className="text-[10px] text-primary font-body hover:underline flex items-center gap-1"
                    >
                      <UserPlus className="w-3 h-3" />
                      Assign
                    </button>
                  )}
                </div>

                {/* Assign dropdown */}
                <AnimatePresence>
                  {showAssign && (
                    <motion.div
                      className="mb-3 p-3 rounded-xl bg-muted/20 border border-border/20 space-y-1 max-h-40 overflow-y-auto"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <p className="text-[10px] text-muted-foreground font-body mb-1">Unassigned members:</p>
                      {unassignedMembers.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground font-body">All members assigned</p>
                      ) : (
                        unassignedMembers.map((m) => {
                          const ep = profiles.find((p) => p.member.id === m.id);
                          return (
                            <button
                              key={m.id}
                              onClick={() => handleAssign(m.id, selectedTeam)}
                              className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/30 transition-colors text-left"
                            >
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                                {(ep?.profile?.display_name?.[0] || m.email?.[0] || "?").toUpperCase()}
                              </div>
                              <span className="text-xs font-body text-foreground truncate">
                                {ep?.profile?.display_name || m.email || "Unknown"}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-1">
                  {selectedTeamMembers.map((m) => {
                    const ep = profiles.find((p) => p.member.id === m.id);
                    return (
                      <div
                        key={m.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/10 transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {(ep?.profile?.display_name?.[0] || m.email?.[0] || "?").toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-body font-medium text-foreground truncate">
                            {ep?.profile?.display_name || m.email || "Unknown"}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-body capitalize">{m.role}</p>
                        </div>
                        {membership.role === "admin" && (
                          <button
                            onClick={() => handleAssign(m.id, null)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                            title="Remove from team"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {selectedTeamMembers.length === 0 && (
                    <p className="text-xs text-muted-foreground font-body text-center py-3">No members in this team</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
