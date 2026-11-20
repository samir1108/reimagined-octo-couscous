import { useEffect, useState } from "react";
import { Card } from "@/design-system";
import { Badge } from "@/design-system";
import { supabase } from "@/lib/supabase";
import { Sparkles, History, Target, Compass } from "lucide-react";
import { getLoopName } from "@/lib/onboarding/getLoopName";
import { mergeOnboardingLoops } from "@/lib/analytics/onboardingLoops";

interface Attribution {
  id: string;
  loop_id: string;
  loop_name: string | null;
  window_label: "3h" | "7d";
  confidence: number;
  sources: string[];
  rationale: string | null;
  created_at: string;
}

interface PastNudge {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  status: string;
  attribution: any;
  created_at: string;
}

interface UserLoop {
  id: string;
  loop_id: string;
  status: string;
  awareness_score: number | null;
  severity: string | null;
  first_detected_at: string | null;
  last_activated_at: string | null;
}

export function LoopAttributionPanel() {
  const [attrs, setAttrs] = useState<Attribution[]>([]);
  const [userLoops, setUserLoops] = useState<UserLoop[]>([]);
  const [history, setHistory] = useState<PastNudge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const since = new Date(Date.now() - 7 * 24 * 3600_000).toISOString();
      const [{ data: a }, { data: n }, { data: ul }, { data: dna }] = await Promise.all([
        supabase.from("loop_attributions")
          .select("*").eq("user_id", user.id)
          .gte("created_at", since)
          .order("confidence", { ascending: false }).limit(20),
        supabase.from("nudge_queue")
          .select("id,kind,title,body,status,attribution,created_at")
          .eq("user_id", user.id)
          .gte("created_at", since)
          .order("created_at", { ascending: false }).limit(20),
        supabase.from("user_loops")
          .select("id,loop_id,status,awareness_score,severity,first_detected_at,last_activated_at")
          .eq("user_id", user.id)
          .order("last_activated_at", { ascending: false, nullsFirst: false })
          .limit(30),
        supabase.from("spiritual_dna_assessments")
          .select("assessment_conversation, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      setAttrs((a ?? []) as any);
      setHistory((n ?? []) as any);
      setUserLoops(mergeOnboardingLoops((ul ?? []) as any[], dna as any) as any);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-sm text-muted-foreground">Loading signals…</div>;

  return (
    <div className="space-y-6">
      {/* Your detected loops (from onboarding + sessions) */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Compass className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Your Loops</h3>
          <Badge variant="secondary" className="text-[10px] ml-auto">{userLoops.length}</Badge>
        </div>
        {userLoops.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            None mapped yet. Complete onboarding or run the Loop Map mirror to seed yours.
          </p>
        ) : (
          <ul className="space-y-2">
            {userLoops.map((l) => (
              <li key={l.id} className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-medium text-foreground">{getLoopName(l.loop_id)}</span>
                <Badge variant="outline" className="text-[10px]">{l.loop_id}</Badge>
                {l.severity && (
                  <Badge variant="secondary" className="text-[10px] capitalize">{l.severity}</Badge>
                )}
                {typeof l.awareness_score === "number" && (
                  <span className="text-[10px] text-muted-foreground">
                    awareness {Math.round((l.awareness_score ?? 0) * 100)}%
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-semibold">Active Loop Patterns (last 7d)</h3>
        </div>
        {attrs.length === 0 ? (
          <p className="text-xs text-muted-foreground">No patterns detected this week from live sessions yet.</p>
        ) : (
          <ul className="space-y-3">
            {attrs.map(a => {
              const ageMs = Date.now() - new Date(a.created_at).getTime();
              const justDetected = ageMs < 24 * 3600_000;
              return (
                <li key={a.id} className="border-l-2 border-violet-500/40 pl-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{a.loop_name ?? getLoopName(a.loop_id)}</span>
                    <Badge variant="outline" className="text-[10px]">{a.window_label}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{Math.round(a.confidence * 100)}%</Badge>
                    {justDetected && (
                      <Badge className="text-[10px] bg-primary/20 text-primary border border-primary/30 hover:bg-primary/25">
                        Just detected
                      </Badge>
                    )}
                  </div>
                  {a.rationale && <p className="text-xs text-muted-foreground mt-1">{a.rationale}</p>}
                  {a.sources?.length > 0 && (
                    <div className="text-[10px] text-muted-foreground/70 mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      From: {a.sources.join(" + ")}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold">Recent Nudges</h3>
        </div>
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground">No nudges yet.</p>
        ) : (
          <ul className="space-y-2">
            {history.map(n => (
              <li key={n.id} className="text-xs border-b border-border/30 pb-2 last:border-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] uppercase">{n.kind}</Badge>
                  <Badge variant={n.status === "acted" ? "default" : "secondary"} className="text-[9px]">{n.status}</Badge>
                  <span className="text-muted-foreground/70 text-[10px]">{new Date(n.created_at).toLocaleString()}</span>
                </div>
                <div className="mt-1 text-foreground">{n.title}</div>
                {n.body && <div className="text-muted-foreground">{n.body}</div>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
