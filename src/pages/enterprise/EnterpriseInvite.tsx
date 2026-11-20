import { useOutletContext } from "react-router-dom";
import { PlusCircle, Mail, Send, Clock, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useInviteMember, useOrgInvites, useOrgTeams, type Organization, type OrgMember } from "@/hooks/useEnterprise";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function EnterpriseInvite() {
  const { membership } = useOutletContext<{ membership: OrgMember; org: Organization | null }>();
  const { data: invites = [] } = useOrgInvites(membership?.org_id);
  const { data: teams = [] } = useOrgTeams(membership?.org_id);
  const inviteMember = useInviteMember();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
  const [teamId, setTeamId] = useState("");
  const [bulkEmails, setBulkEmails] = useState("");
  const [mode, setMode] = useState<"single" | "bulk">("single");

  const handleInvite = () => {
    if (!email.trim()) return;
    inviteMember.mutate(
      { orgId: membership.org_id, email: email.trim(), role, teamId: teamId || undefined },
      {
        onSuccess: () => {
          toast.success(`Invited ${email}`);
          setEmail("");
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleBulkInvite = () => {
    const emails = bulkEmails.split(/[\n,;]+/).map((e) => e.trim()).filter((e) => e.includes("@"));
    if (emails.length === 0) return;

    let count = 0;
    emails.forEach((em) => {
      inviteMember.mutate(
        { orgId: membership.org_id, email: em, role, teamId: teamId || undefined },
        {
          onSuccess: () => {
            count++;
            if (count === emails.length) {
              toast.success(`Invited ${count} employees`);
              setBulkEmails("");
            }
          },
        }
      );
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <PlusCircle className="w-7 h-7 text-primary" />
          Invite Members
        </h1>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Add employees, managers to your organization
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("single")}
          className={`px-4 py-2 rounded-xl font-body text-sm transition-all ${
            mode === "single" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Single Invite
        </button>
        <button
          onClick={() => setMode("bulk")}
          className={`px-4 py-2 rounded-xl font-body text-sm transition-all ${
            mode === "bulk" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Bulk Invite
        </button>
      </div>

      {/* Invite form */}
      <motion.div
        className="glass-card rounded-2xl border border-border/20 p-5 space-y-4"
        key={mode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {mode === "single" ? (
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="employee@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/30 border border-border/20 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        ) : (
          <div>
            <textarea
              placeholder="Paste emails separated by commas or new lines...&#10;john@company.com&#10;jane@company.com"
              value={bulkEmails}
              onChange={(e) => setBulkEmails(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/20 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <p className="text-[10px] text-muted-foreground mt-1 font-body">
              {bulkEmails.split(/[\n,;]+/).filter((e) => e.trim().includes("@")).length} emails detected
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-muted/30 border border-border/20 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-muted/30 border border-border/20 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">No team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button
            onClick={mode === "single" ? handleInvite : handleBulkInvite}
            disabled={inviteMember.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-body text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Send className="w-4 h-4" />
            {inviteMember.isPending ? "Sending..." : "Send Invite"}
          </button>
        </div>
      </motion.div>

      {/* Pending invites */}
      <div>
        <h2 className="font-display text-base font-semibold text-foreground mb-3">Pending Invites</h2>
        {invites.length === 0 ? (
          <div className="glass-card rounded-2xl p-6 text-center border border-border/20">
            <p className="text-sm text-muted-foreground font-body">No pending invites</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="glass-card rounded-xl border border-border/20 px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-body text-foreground">{inv.email}</p>
                    <p className="text-[10px] text-muted-foreground font-body capitalize">{inv.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(inv.created_at), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
