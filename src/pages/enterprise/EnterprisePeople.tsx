import { useMemo, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain, Send, Sparkles, TrendingUp, AlertTriangle, Briefcase, Users2, Loader2, Search, Filter,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  useOrgMembers, useOrgTeams, useOrgEmployeeProfiles,
  type Organization, type OrgMember,
} from "@/hooks/useEnterprise";
import { Input } from "@/design-system";
import { Textarea } from "@/design-system";
import { Button } from "@/design-system";
import { Badge } from "@/design-system";
import { Slider } from "@/design-system";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type Decision = "promote" | "at_risk" | "project" | "team_fit" | "general";

interface Candidate {
  user_id: string;
  name: string;
  score: number;
  reason: string;
}
interface AIResult {
  summary: string;
  candidates: Candidate[];
  caveats?: string;
  roster_size?: number;
}

const DECISIONS: { key: Decision; label: string; icon: any; hint: string }[] = [
  { key: "promote", label: "Promote", icon: TrendingUp, hint: "Who should I promote next quarter?" },
  { key: "at_risk", label: "At Risk", icon: AlertTriangle, hint: "Who is at risk of burnout or leaving?" },
  { key: "project", label: "Project", icon: Briefcase, hint: "Best 5 people for our Mumbai launch?" },
  { key: "team_fit", label: "Team Fit", icon: Users2, hint: "Build a balanced 6-person task force." },
];

export default function EnterprisePeople() {
  const { membership, org } = useOutletContext<{ membership: OrgMember; org: Organization | null }>();
  const orgId = membership?.org_id;

  const { data: members = [] } = useOrgMembers(orgId);
  const { data: teams = [] } = useOrgTeams(orgId);
  const { data: profiles = [] } = useOrgEmployeeProfiles(orgId);

  const [decision, setDecision] = useState<Decision>("promote");
  const [question, setQuestion] = useState("");
  const [projectContext, setProjectContext] = useState("");
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [bandRange, setBandRange] = useState<[number, number]>([0, 10]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);

  // Apply filters to roster
  const filtered = useMemo(() => {
    return profiles.filter((ep) => {
      const m = ep.member;
      if (!m.user_id) return false;
      if (teamFilter && m.team_id !== teamFilter) return false;
      if (roleFilter && m.role !== roleFilter) return false;
      const band = ep.consciousness?.overall_band ?? 0;
      if (band < bandRange[0] || band > bandRange[1]) return false;
      if (search) {
        const name = (ep.profile?.display_name || m.email || "").toLowerCase();
        if (!name.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [profiles, teamFilter, roleFilter, bandRange, search]);

  const ask = async () => {
    if (!orgId) return;
    if (!question.trim() && decision === "general") {
      toast.error("Type a question or pick a decision type.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const candidate_ids = filtered.map((ep) => ep.member.user_id).filter(Boolean) as string[];
      const { data, error } = await supabase.functions.invoke("enterprise-people-intelligence", {
        body: {
          org_id: orgId,
          question: question || DECISIONS.find((d) => d.key === decision)?.hint || "",
          decision,
          project_context: projectContext,
          candidate_ids,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult(data as AIResult);
    } catch (e: any) {
      toast.error(e?.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const pickDecision = (d: Decision) => {
    setDecision(d);
    if (!question.trim()) {
      setQuestion(DECISIONS.find((x) => x.key === d)?.hint || "");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <Brain className="w-7 h-7 text-primary" />
          People Intelligence
        </h1>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Ask anything about your {profiles.length} employees — promotions, risks, project staffing, team composition.
        </p>
      </div>

      {/* Decision chips */}
      <div className="flex flex-wrap gap-2">
        {DECISIONS.map((d) => {
          const Icon = d.icon;
          const active = decision === d.key;
          return (
            <button
              key={d.key}
              onClick={() => pickDecision(d.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-body border transition-all ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/30 text-foreground border-border/40 hover:border-primary/40"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Chat box */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl border border-border/20 p-5 space-y-3"
      >
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={DECISIONS.find((d) => d.key === decision)?.hint || "Ask anything…"}
          className="min-h-[80px] bg-background/40 border-border/40 font-body text-sm resize-none"
        />
        {decision === "project" && (
          <Textarea
            value={projectContext}
            onChange={(e) => setProjectContext(e.target.value)}
            placeholder="Optional: describe the project (timeline, skills needed, intensity)…"
            className="min-h-[60px] bg-background/40 border-border/40 font-body text-xs resize-none"
          />
        )}
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground font-body">
            {filtered.length} of {profiles.length} employees in scope (filters applied below)
          </p>
          <Button onClick={ask} disabled={loading} size="sm" className="gap-2">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {loading ? "Analyzing…" : "Ask"}
          </Button>
        </div>
      </motion.div>

      {/* AI result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl border border-primary/30 p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-display text-sm font-semibold text-foreground">AI Recommendation</h3>
          </div>
          {result.summary && (
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 font-body">
              <ReactMarkdown>{result.summary}</ReactMarkdown>
            </div>
          )}
          {result.candidates?.length > 0 && (
            <div className="space-y-2">
              {result.candidates.map((c, i) => (
                <Link
                  key={c.user_id + i}
                  to={`/enterprise/employees/${c.user_id}`}
                  className="block rounded-xl border border-border/30 bg-background/40 p-3 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground w-5">#{i + 1}</span>
                        <span className="font-body text-sm font-semibold text-foreground truncate">{c.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-body mt-1 ml-7">{c.reason}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {Math.round(c.score)}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {result.caveats && (
            <p className="text-[11px] text-muted-foreground font-body italic border-t border-border/20 pt-2">
              {result.caveats}
            </p>
          )}
        </motion.div>
      )}

      {/* Filters */}
      <div className="glass-card rounded-2xl border border-border/20 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-display text-sm font-semibold text-foreground">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="pl-9 bg-background/40 border-border/40 text-sm"
            />
          </div>

          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="bg-background/40 border border-border/40 rounded-md px-3 py-2 text-sm text-foreground font-body"
          >
            <option value="">All teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-background/40 border border-border/40 rounded-md px-3 py-2 text-sm text-foreground font-body"
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>

          <div className="space-y-1">
            <p className="text-[11px] text-muted-foreground font-body">
              Band {bandRange[0]}–{bandRange[1]}
            </p>
            <Slider
              min={0} max={10} step={1}
              value={bandRange}
              onValueChange={(v) => setBandRange([v[0], v[1]] as [number, number])}
            />
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground font-body">
          Showing {filtered.length} of {profiles.length}. AI uses this filtered set as candidates.
        </p>
      </div>
    </div>
  );
}
