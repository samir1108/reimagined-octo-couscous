import { useState } from "react";
import { useSignalConsents, type SignalSource } from "@/hooks/useSignalConsents";
import { Switch } from "@/design-system";
import { Button } from "@/design-system";
import { Card } from "@/design-system";
import { Badge } from "@/design-system";
import { Input } from "@/design-system";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/design-system";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { syncHealthBridge, isHealthBridgeAvailable } from "@/lib/healthBridge";
import {
  Activity,
  Watch,
  Heart,
  Camera,
  Mic,
  Calendar,
  MessageSquare,
  Smartphone,
  Monitor,
  Keyboard,
  Trash2,
  Link as LinkIcon,
  RefreshCw,
} from "lucide-react";

type ConnectKind = "oauth_wearable" | "connector" | "github" | "health_native" | "device" | "ambient";

interface SourceDef {
  source: SignalSource;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "Wearables" | "Ambient" | "Work" | "Device";
  connect?: ConnectKind;
  oauthProvider?: "oura" | "fitbit" | "whoop";
}

const SOURCES: SourceDef[] = [
  { source: "healthkit", name: "Apple Health", desc: "HRV, sleep, RHR (iOS native build)", icon: Heart, group: "Wearables", connect: "health_native" },
  { source: "google_fit", name: "Google Fit", desc: "Activity & heart rate (Android native)", icon: Activity, group: "Wearables", connect: "health_native" },
  { source: "oura", name: "Oura Ring", desc: "Readiness, sleep, HRV", icon: Watch, group: "Wearables", connect: "oauth_wearable", oauthProvider: "oura" },
  { source: "fitbit", name: "Fitbit", desc: "Sleep, HRV, stress", icon: Watch, group: "Wearables", connect: "oauth_wearable", oauthProvider: "fitbit" },
  { source: "whoop", name: "Whoop", desc: "Strain & recovery", icon: Watch, group: "Wearables", connect: "oauth_wearable", oauthProvider: "whoop" },
  { source: "garmin", name: "Garmin", desc: "Body Battery, HRV (manual export)", icon: Watch, group: "Wearables" },
  { source: "polar_ble", name: "Polar / BLE strap", desc: "Live HRV during meditation", icon: Heart, group: "Wearables" },
  { source: "muse", name: "Muse / EEG", desc: "Brainwave focus & calm", icon: Heart, group: "Wearables" },

  { source: "camera_posture", name: "Camera posture", desc: "On-device — frames never leave", icon: Camera, group: "Ambient", connect: "ambient" },
  { source: "webcam_rppg", name: "Webcam breath rate", desc: "Derived BPM only, on device", icon: Camera, group: "Ambient", connect: "ambient" },
  { source: "mic_meeting_tone", name: "Meeting tone analyzer", desc: "On-device, audio discarded", icon: Mic, group: "Ambient", connect: "ambient" },

  { source: "google_calendar", name: "Google Calendar", desc: "Pre & post-meeting nudges", icon: Calendar, group: "Work", connect: "connector" },
  { source: "outlook", name: "Outlook", desc: "Calendar + mail tone", icon: Calendar, group: "Work", connect: "connector" },
  { source: "slack", name: "Slack", desc: "Tone (n≥5 only)", icon: MessageSquare, group: "Work", connect: "connector" },
  { source: "teams", name: "Microsoft Teams", desc: "DND + tone aggregates", icon: MessageSquare, group: "Work", connect: "connector" },
  { source: "gmail", name: "Gmail", desc: "Inbox-tone trend, private", icon: MessageSquare, group: "Work", connect: "connector" },
  { source: "linear", name: "Linear", desc: "Workload signal", icon: MessageSquare, group: "Work", connect: "connector" },
  { source: "github", name: "GitHub", desc: "Late-night code = burnout signal", icon: MessageSquare, group: "Work", connect: "github" },

  { source: "ios_screentime", name: "iOS Screen Time", desc: "Categories only", icon: Smartphone, group: "Device", connect: "device" },
  { source: "android_usage", name: "Android Usage", desc: "Categories only", icon: Smartphone, group: "Device", connect: "device" },
  { source: "chrome_ext", name: "Browser watcher", desc: "Tab velocity, focus blocks", icon: Monitor, group: "Device", connect: "device" },
  { source: "desktop_sentinel", name: "Desktop Sentinel", desc: "Active app & idle (optional)", icon: Monitor, group: "Device", connect: "device" },
  { source: "keyboard_cadence", name: "Typing cadence", desc: "Anxiety/flow detection", icon: Keyboard, group: "Device", connect: "device" },
];

const GROUPS: SourceDef["group"][] = ["Wearables", "Ambient", "Work", "Device"];

const CONNECTOR_ASK: Record<string, string> = {
  google_calendar: "Connect my Google Calendar",
  outlook: "Connect my Outlook account",
  slack: "Connect my Slack workspace",
  teams: "Connect my Microsoft Teams account",
  gmail: "Connect my Gmail account",
  linear: "Connect my Linear workspace",
};

export default function SignalConsentCenter() {
  const { consents, loading, setConsent, setMeta, purgeSource } = useSignalConsents();
  const [busy, setBusy] = useState<string | null>(null);
  const [ghOpen, setGhOpen] = useState(false);
  const [ghValue, setGhValue] = useState("");

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading consent center…</div>;
  }

  const startWearableOAuth = async (provider: "oura" | "fitbit" | "whoop", source: SignalSource) => {
    setBusy(source);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess?.session?.access_token;
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wearable?action=oauth-start&provider=${provider}`;
      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const j = await r.json();
      if (!r.ok || !j.redirect) {
        toast.error(j.error || "Provider not configured. Add OAuth client secrets first.");
        return;
      }
      await setConsent(source, true);
      window.location.href = j.redirect;
    } catch (e: any) {
      toast.error(e?.message || "Could not start OAuth");
    } finally {
      setBusy(null);
    }
  };

  const syncHealth = async (provider: "healthkit" | "google_fit", source: SignalSource) => {
    setBusy(source);
    try {
      const native = await isHealthBridgeAvailable();
      if (!native) {
        toast.info("HealthKit / Health Connect only runs in the native iOS / Android build.");
        return;
      }
      await setConsent(source, true);
      const n = await syncHealthBridge(provider);
      toast.success(n ? `Synced ${n} samples.` : "No new samples in the last 24h.");
    } finally {
      setBusy(null);
    }
  };

  const askToConnect = (s: SourceDef) => {
    const ask = CONNECTOR_ASK[s.source] ?? `Connect my ${s.name}`;
    navigator.clipboard?.writeText(ask).catch(() => {});
    toast.success(`Type in chat: "${ask}"`, {
      description: "I copied the prompt to your clipboard.",
      duration: 6000,
    });
  };

  const openGithub = () => {
    setGhValue(((consents.github?.meta as any)?.github_username as string) ?? "");
    setGhOpen(true);
  };

  const saveGithub = async () => {
    const u = ghValue.trim().replace(/^@/, "");
    if (!u) return;
    await setMeta("github", { github_username: u });
    await setConsent("github", true);
    setGhOpen(false);
    toast.success(`GitHub linked as @${u}. The next watcher run picks it up.`);
  };

  const renderConnect = (s: SourceDef) => {
    const c = consents[s.source];
    const linked =
      s.connect === "github" ? !!(c?.meta as any)?.github_username : c?.enabled;

    if (s.connect === "oauth_wearable" && s.oauthProvider) {
      return (
        <Button
          size="sm"
          variant={linked ? "outline" : "default"}
          disabled={busy === s.source}
          onClick={() => startWearableOAuth(s.oauthProvider!, s.source)}
        >
          <LinkIcon className="w-3.5 h-3.5 mr-1" />
          {linked ? "Reconnect" : "Connect"}
        </Button>
      );
    }
    if (s.connect === "health_native") {
      return (
        <Button
          size="sm"
          variant="outline"
          disabled={busy === s.source}
          onClick={() => syncHealth(s.source as "healthkit" | "google_fit", s.source)}
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          Sync now
        </Button>
      );
    }
    if (s.connect === "connector") {
      return (
        <Button size="sm" variant="outline" onClick={() => askToConnect(s)}>
          <LinkIcon className="w-3.5 h-3.5 mr-1" />
          Connect
        </Button>
      );
    }
    if (s.connect === "github") {
      return (
        <Button size="sm" variant={linked ? "outline" : "default"} onClick={openGithub}>
          <LinkIcon className="w-3.5 h-3.5 mr-1" />
          {linked ? `@${(c?.meta as any).github_username}` : "Add username"}
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 p-4 max-w-3xl mx-auto pb-24">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Sentient Companion — Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Every source is off by default. Toggle only what you want. Camera & mic always process on
          device — raw frames and audio never leave your phone.
        </p>
      </div>

      {GROUPS.map((group) => (
        <Card key={group} className="p-4 space-y-3 bg-card/60 backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">{group}</h2>
            <Badge variant="outline" className="text-xs">
              {SOURCES.filter((s) => s.group === group && consents[s.source]?.enabled).length} on
            </Badge>
          </div>
          <div className="divide-y divide-border/40">
            {SOURCES.filter((s) => s.group === group).map((s) => {
              const c = consents[s.source];
              const Icon = s.icon;
              return (
                <div key={s.source} className="flex items-center gap-2 py-3">
                  <Icon className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{s.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.desc}</div>
                  </div>
                  {renderConnect(s)}
                  {c?.enabled && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      onClick={async () => {
                        await purgeSource(s.source);
                        toast.success(`${s.name} data purged`);
                      }}
                      aria-label={`Purge ${s.name} data`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Switch
                    checked={!!c?.enabled}
                    onCheckedChange={async (v) => {
                      await setConsent(s.source, v);
                      toast.success(`${s.name} ${v ? "enabled" : "disabled"}`);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      <Card className="p-4 text-xs text-muted-foreground bg-card/40">
        <p className="mb-1 font-medium text-foreground">Privacy promises</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Camera & microphone processing happens on your device only.</li>
          <li>Raw signals are kept ≤ 24h then aggregated; raw rows are dropped.</li>
          <li>Per-source purge button deletes everything we have from that source.</li>
          <li>Enterprise rollups always require ≥5 people in a cohort (no de-anonymization).</li>
        </ul>
      </Card>

      <Dialog open={ghOpen} onOpenChange={setGhOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link your GitHub username</DialogTitle>
            <DialogDescription>
              We use this to count late-night commits as a burnout signal. Only the username is
              stored — never your code.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="octocat"
            value={ghValue}
            onChange={(e) => setGhValue(e.target.value)}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setGhOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveGithub} disabled={!ghValue.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
