import { useFusedSignals } from "@/hooks/useFusedSignals";
import { useMeetingNudges } from "@/hooks/useMeetingNudges";
import { Card } from "@/design-system";
import { Button } from "@/design-system";
import { Badge } from "@/design-system";
import { Progress } from "@/design-system";
import { Activity, Brain, Flame, CalendarClock, Sparkles, X, Heart, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { syncHealthBridge, isHealthBridgeAvailable } from "@/lib/healthBridge";
import { toast } from "sonner";
import { useState } from "react";

function pct(v: number | null | undefined) {
  if (v == null) return 0;
  return Math.max(0, Math.min(100, Math.round(v * 100)));
}

export default function SentientDashboard() {
  const { latest, rows, loading } = useFusedSignals(12);
  const { nudges, dismiss } = useMeetingNudges();
  const [healthBusy, setHealthBusy] = useState(false);

  const authorizeExtension = async () => {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    if (!session) {
      toast.error("Sign in first to authorize the extension.");
      return;
    }
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
    const cfg = {
      kind: "sentinel-config",
      endpoint: `https://${projectId}.functions.supabase.co/ingest-signal`,
      token: session.access_token,
      anon: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(cfg));
      toast.success("Config copied. Open the extension Options tab → 'Import from clipboard'.");
    } catch {
      toast.error("Clipboard blocked. Use manual paste in extension Options.");
    }
  };

  const syncHealth = async () => {
    setHealthBusy(true);
    try {
      const native = await isHealthBridgeAvailable();
      if (!native) {
        toast.info("HealthKit / Health Connect only runs in the native iOS / Android build.");
        return;
      }
      const n = await syncHealthBridge("healthkit");
      toast.success(n ? `Synced ${n} samples from Health.` : "No new Health samples.");
    } finally {
      setHealthBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-6 max-w-2xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> Sentient Companion
        </h1>
        <p className="text-sm text-muted-foreground">
          Live read of your body, calendar and device — fused every 5 minutes.
        </p>
      </header>

      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Right now</h2>
          {latest && (
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(latest.window_end), { addSuffix: true })}
            </span>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Reading signals…</p>
        ) : !latest ? (
          <div className="text-sm text-muted-foreground space-y-2">
            <p>No fused readings yet. Connect a wearable or enable a watcher to begin.</p>
            <Button asChild size="sm" variant="outline">
              <Link to="/app/integrations">Open consent center</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Metric icon={Flame} label="Stress" value={pct(latest.stress_norm)} tone="stress" />
            <Metric icon={Brain} label="Focus" value={pct(latest.focus_norm)} tone="focus" />
            <Metric icon={Activity} label="Burnout risk" value={pct(latest.burnout_risk)} tone="burnout" />
            {latest.detected_loops?.length ? (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {latest.detected_loops.map((l) => (
                  <Badge key={l} variant="secondary" className="text-xs">
                    {l}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <CalendarClock className="h-4 w-4" /> Meeting nudges
        </h2>
        {nudges.length === 0 ? (
          <Card className="p-4 text-sm text-muted-foreground">
            No upcoming meeting nudges. Connect Google Calendar to enable pre/post nudges.
          </Card>
        ) : (
          nudges.map((n) => (
            <Card key={n.id} className="p-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant={n.nudge_type === "pre" ? "default" : "secondary"} className="text-[10px] uppercase">
                    {n.nudge_type}
                  </Badge>
                  <p className="text-sm font-medium truncate">{n.title || "Meeting"}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(n.starts_at), { addSuffix: true })}
                </p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => dismiss(n.id)}>
                <X className="h-4 w-4" />
              </Button>
            </Card>
          ))
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Recent windows</h2>
        <Card className="p-3">
          <ul className="divide-y divide-border/50">
            {rows.slice(0, 8).map((r) => (
              <li key={r.id} className="py-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {new Date(r.window_end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="flex gap-3">
                  <span>S {pct(r.stress_norm)}</span>
                  <span>F {pct(r.focus_norm)}</span>
                  <span>B {pct(r.burnout_risk)}</span>
                </span>
              </li>
            ))}
            {rows.length === 0 && <li className="py-2 text-xs text-muted-foreground">Awaiting first fusion run.</li>}
          </ul>
        </Card>
      </section>

      <Card className="p-4 space-y-3">
        <h2 className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> Desktop watcher
        </h2>
        <p className="text-xs text-muted-foreground">
          Install the Sentinel Chrome extension to feed focus / scatter / context-switch signals from your browser.
        </p>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-4">
          <li>Download the ZIP and unzip it.</li>
          <li>Open <code>chrome://extensions</code>, enable Developer mode, click <b>Load unpacked</b>, pick the folder.</li>
          <li>Click <b>Authorize extension</b> below, then in the extension's Options tab click <b>Import from clipboard</b>.</li>
        </ol>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              fetch("/sentinel-extension.zip")
                .then((r) => r.blob())
                .then((b) => {
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(b);
                  a.download = "sentinel-extension.zip";
                  a.click();
                  URL.revokeObjectURL(a.href);
                });
            }}
          >
            Download extension
          </Button>
          <Button size="sm" onClick={authorizeExtension}>
            <KeyRound className="h-4 w-4 mr-1" /> Authorize extension
          </Button>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <h2 className="text-sm font-medium flex items-center gap-2">
          <Heart className="h-4 w-4 text-primary" /> Apple Health / Health Connect
        </h2>
        <p className="text-xs text-muted-foreground">
          On the native iOS/Android build, pull HRV, resting heart rate and sleep score from HealthKit / Health Connect.
          In the web preview this is a no-op.
        </p>
        <Button size="sm" variant="outline" onClick={syncHealth} disabled={healthBusy}>
          {healthBusy ? "Syncing…" : "Sync now"}
        </Button>
      </Card>


      <div className="text-center pt-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/app/integrations">Manage integrations & consent</Link>
        </Button>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: "stress" | "focus" | "burnout";
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {label}
        </span>
        <span className="text-sm font-mono">{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}
