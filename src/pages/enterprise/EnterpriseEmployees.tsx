import { useOutletContext, useNavigate } from "react-router-dom";
import { Users, Search, Eye, MoreVertical, Shield, Trash2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useOrgMembers, useOrgEmployeeProfiles, useOrgTeams, useUpdateMemberRole, useRemoveMember, useAssignTeam, type Organization, type OrgMember } from "@/hooks/useEnterprise";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/design-system";
import { toast } from "sonner";

export default function EnterpriseEmployees() {
  const navigate = useNavigate();
  const { membership, org } = useOutletContext<{ membership: OrgMember; org: Organization | null }>();
  const { data: members = [] } = useOrgMembers(membership?.org_id);
  const { data: profiles = [] } = useOrgEmployeeProfiles(membership?.org_id);
  const { data: teams = [] } = useOrgTeams(membership?.org_id);
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();
  const assignTeam = useAssignTeam();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterTeam, setFilterTeam] = useState<string>("all");

  const filtered = profiles.filter((ep) => {
    const name = ep.profile?.display_name?.toLowerCase() || "";
    const email = ep.member.email?.toLowerCase() || "";
    const q = search.toLowerCase();
    const matchSearch = name.includes(q) || email.includes(q);
    const matchRole = filterRole === "all" || ep.member.role === filterRole;
    const matchTeam = filterTeam === "all" || ep.member.team_id === filterTeam || (filterTeam === "unassigned" && !ep.member.team_id);
    return matchSearch && matchRole && matchTeam;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <Users className="w-7 h-7 text-primary" />
            Employees
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-1">
            {members.filter((m) => m.status === "active").length} active · {members.filter((m) => m.status === "invited").length} invited
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/30 border border-border/20 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-muted/30 border border-border/20 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
        </select>
        <select
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-muted/30 border border-border/20 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Teams</option>
          <option value="unassigned">Unassigned</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Employee Table */}
      <div className="glass-card rounded-2xl border border-border/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/10">
                {["Employee", "Role", "Team", "Band", "Streak", "Sessions", "Phase", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-body font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-sm text-muted-foreground font-body">
                    No employees found
                  </td>
                </tr>
              ) : (
                filtered.map((ep) => {
                  const team = teams.find((t) => t.id === ep.member.team_id);
                  return (
                    <tr
                      key={ep.member.id}
                      className="border-b border-border/5 hover:bg-muted/10 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <button
                          onClick={() => ep.member.user_id && navigate(`/enterprise/employees/${ep.member.user_id}`)}
                          className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
                        >
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-sm">
                            {(ep.profile?.display_name?.[0] || ep.member.email?.[0] || "?").toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-body font-medium text-foreground">
                              {ep.profile?.display_name || ep.member.email || "Unknown"}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{ep.member.email}</p>
                          </div>
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-body font-medium px-2 py-0.5 rounded-full ${
                          ep.member.role === "admin" ? "bg-primary/10 text-primary" :
                          ep.member.role === "manager" ? "bg-chart-4/10 text-chart-4" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {ep.member.role}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {membership.role === "admin" ? (
                          <select
                            value={ep.member.team_id || ""}
                            onChange={(e) => assignTeam.mutate({
                              memberId: ep.member.id,
                              teamId: e.target.value || null,
                              orgId: membership.org_id,
                            })}
                            className="text-xs font-body bg-transparent border-none text-foreground focus:outline-none cursor-pointer"
                          >
                            <option value="">No team</option>
                            {teams.map((t) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs font-body text-muted-foreground">{team?.name || "—"}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm font-display font-bold text-foreground">
                        {ep.consciousness?.overall_band?.toFixed(1) || "—"}
                      </td>
                      <td className="px-5 py-3 text-sm font-body text-foreground">
                        {ep.consciousness?.streak_current || 0}d
                      </td>
                      <td className="px-5 py-3 text-sm font-body text-foreground">
                        {ep.consciousness?.total_sessions || 0}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-body text-muted-foreground capitalize">
                          {ep.consciousness?.journey_phase || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => ep.member.user_id && navigate(`/enterprise/employees/${ep.member.user_id}`)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                            title="View profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {membership.role === "admin" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="glass-card rounded-xl border-border/30">
                                <DropdownMenuItem onClick={() => {
                                  const newRole = ep.member.role === "manager" ? "employee" : "manager";
                                  updateRole.mutate({ memberId: ep.member.id, role: newRole, orgId: membership.org_id });
                                  toast.success(`Role updated to ${newRole}`);
                                }}>
                                  <Shield className="w-4 h-4 mr-2" />
                                  {ep.member.role === "manager" ? "Demote to Employee" : "Promote to Manager"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    removeMember.mutate({ memberId: ep.member.id, orgId: membership.org_id });
                                    toast.success("Member removed");
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
