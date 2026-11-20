import { Switch } from "@/design-system";
import { Zap, Calendar, Activity, Repeat } from "lucide-react";
import { useNudgePrefs, type NudgePrefs } from "@/hooks/useNudgePrefs";

const ROWS: { key: keyof NudgePrefs; label: string; desc: string; Icon: any }[] = [
  { key: "instant",    label: "Instant pulses",   desc: "Acute spikes — charged messages, low HRV right now",   Icon: Zap },
  { key: "pre_event",  label: "Before meetings",  desc: "10-min pre-call grounding cards",                        Icon: Calendar },
  { key: "post_event", label: "After meetings",   desc: "Reflection prompts when an event ends",                  Icon: Activity },
  { key: "pattern",    label: "Pattern alerts",   desc: "3-hour & 7-day loop detection from your integrations",   Icon: Repeat },
];

export function NudgeSettingsCard() {
  const { prefs, update } = useNudgePrefs();
  return (
    <div>
      <h3 className="font-display font-semibold text-foreground text-sm mb-1">Integration nudges</h3>
      <p className="text-xs text-muted-foreground font-body mb-4">
        Cards that appear on Home, driven by signals from your connected integrations.
      </p>
      <div className="space-y-4">
        {ROWS.map(({ key, label, desc, Icon }) => (
          <div key={key} className="flex items-start gap-3">
            <Icon className="w-4 h-4 mt-0.5 text-primary/70 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">{label}</div>
              <div className="text-xs text-muted-foreground leading-snug">{desc}</div>
            </div>
            <Switch checked={prefs[key]} onCheckedChange={(v) => update(key, v)} />
          </div>
        ))}
      </div>
    </div>
  );
}

