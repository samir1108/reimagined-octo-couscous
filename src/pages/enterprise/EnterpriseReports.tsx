import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FileDown, Users, BarChart3, Activity, FileText } from "lucide-react";
import { motion } from "framer-motion";
import {
  useOrgMembers, useOrgTeams, useOrgEmployeeProfiles, useOrgTeamStats, useOrgSessionTrends,
  exportToCSV,
  type Organization, type OrgMember,
} from "@/hooks/useEnterprise";
import QuarterlyReport from "@/components/enterprise/QuarterlyReport";

export default function EnterpriseReports() {
  const { membership, org } = useOutletContext<{ membership: OrgMember; org: Organization | null }>();
  const { data: members = [] } = useOrgMembers(membership?.org_id);
  const { data: teams = [] } = useOrgTeams(membership?.org_id);
  const { data: profiles = [] } = useOrgEmployeeProfiles(membership?.org_id);
  const { data: teamStats = [] } = useOrgTeamStats(membership?.org_id);
  const { data: sessionTrends = [] } = useOrgSessionTrends(membership?.org_id);
  const [showQuarterly, setShowQuarterly] = useState(false);

  const handleExportEmployees = () => {
    const rows = profiles.map((ep) => {
      const team = teams.find((t) => t.id === ep.member.team_id);
      return {
        name: ep.profile?.display_name || ep.member.email || "Unknown",
        email: ep.member.email || "",
        role: ep.member.role,
        team: team?.name || "Unassigned",
        status: ep.member.status,
        band: ep.consciousness?.overall_band || 0,
        streak: ep.consciousness?.streak_current || 0,
        total_sessions: ep.consciousness?.total_sessions || 0,
        journal_entries: ep.consciousness?.total_journal_entries || 0,
        journey_phase: ep.consciousness?.journey_phase || "",
        v_level: ep.consciousness?.v_level_current || 0,
        witness_depth: ep.consciousness?.witness_depth || 0,
      };
    });
    exportToCSV(rows, `employees-report-${new Date().toISOString().split("T")[0]}`);
  };

  const handleExportTeams = () => {
    const rows = teamStats.map((ts: any) => ({
      team: ts.team.name,
      members: ts.memberCount,
      avg_band: ts.avgBand,
      avg_streak: ts.avgStreak,
      total_sessions: ts.totalSessions,
    }));
    exportToCSV(rows, `teams-report-${new Date().toISOString().split("T")[0]}`);
  };

  const handleExportSessions = () => {
    const rows = sessionTrends.map((s: any) => ({
      date: s.session_date,
      user_id: s.user_id,
    }));
    exportToCSV(rows, `sessions-report-${new Date().toISOString().split("T")[0]}`);
  };

  const reports = [
    {
      title: "Employee Report",
      description: "Full employee directory with consciousness data, streaks, bands, and journey phase.",
      icon: Users,
      count: `${profiles.length} employees`,
      onExport: handleExportEmployees,
    },
    {
      title: "Team Performance",
      description: "Team-level aggregated stats: avg band, avg streak, total sessions.",
      icon: BarChart3,
      count: `${teamStats.length} teams`,
      onExport: handleExportTeams,
    },
    {
      title: "Session Activity",
      description: "Raw session data for the last 30 days — dates and user IDs.",
      icon: Activity,
      count: `${sessionTrends.length} sessions`,
      onExport: handleExportSessions,
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <FileDown className="w-7 h-7 text-primary" />
          Reports & Export
        </h1>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Download CSV reports for stakeholders and analysis
        </p>
      </div>

      <div className="space-y-4">
        {reports.map((report, i) => (
          <motion.div
            key={report.title}
            className="glass-card rounded-2xl border border-border/20 p-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <report.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground">{report.title}</h3>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">{report.description}</p>
                  <p className="text-[10px] text-muted-foreground font-body mt-1">{report.count}</p>
                </div>
              </div>
              <button
                onClick={report.onExport}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-body text-xs hover:opacity-90 transition-opacity"
              >
                <FileDown className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </motion.div>
        ))}

        {/* Quarterly Report */}
        <motion.div
          className="glass-card rounded-2xl border border-border/20 p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-foreground">Quarterly Consciousness Report</h3>
                <p className="text-xs text-muted-foreground font-body mt-0.5">Visual report with team comparisons, dimensions, and engagement trends.</p>
              </div>
            </div>
            <button
              onClick={() => setShowQuarterly(!showQuarterly)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-body text-xs hover:opacity-90 transition-opacity"
            >
              <FileText className="w-3.5 h-3.5" />
              {showQuarterly ? "Hide" : "Generate"}
            </button>
          </div>
        </motion.div>
      </div>

      {showQuarterly && (
        <QuarterlyReport
          profiles={profiles}
          teamStats={teamStats}
          sessionTrends={sessionTrends}
          orgName={org?.name}
        />
      )}
    </div>
  );
}
