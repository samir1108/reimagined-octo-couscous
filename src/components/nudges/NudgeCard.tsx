import { Card } from "@/design-system";
import { Button } from "@/design-system";
import { Sparkles, X, Calendar, Activity, Repeat, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Nudge } from "@/hooks/useNudgeQueue";

interface Props {
  nudge: Nudge;
  onAct: (id: string) => void;
  onDismiss: (id: string) => void;
}

const KIND_META: Record<string, { icon: any; tint: string; label: string }> = {
  instant:    { icon: Zap,      tint: "text-amber-400",  label: "Right now" },
  pre_event:  { icon: Calendar, tint: "text-sky-400",    label: "Before next" },
  post_event: { icon: Activity, tint: "text-emerald-400", label: "Just now" },
  pattern:    { icon: Repeat,   tint: "text-violet-400",  label: "Pattern" },
};

export function NudgeCard({ nudge, onAct, onDismiss }: Props) {
  const navigate = useNavigate();
  const meta = KIND_META[nudge.kind] ?? KIND_META.instant;
  const Icon = meta.icon;
  const sources: string[] = nudge.attribution?.sources ?? [];

  const handleAct = () => {
    onAct(nudge.id);
    switch (nudge.cta_action) {
      case "open_witness":
        navigate(`/app/witness?duration=${nudge.cta_payload?.duration_sec ?? 60}`);
        break;
      case "open_breath":
        navigate(`/app/practice/breath?pattern=${nudge.cta_payload?.pattern ?? "box"}`);
        break;
      case "open_guru":
        navigate(`/app/guide?loop=${nudge.cta_payload?.loop_id ?? ""}`);
        break;
      case "open_reflection":
        navigate(`/app/journal?seed=${encodeURIComponent(nudge.cta_payload?.seed ?? "")}`);
        break;
      default:
        navigate("/app");
    }
  };

  return (
    <Card className="relative overflow-hidden border-white/10 bg-black/40 backdrop-blur-xl p-4 mb-3">
      <button
        onClick={() => onDismiss(nudge.id)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${meta.tint}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-[10px] uppercase tracking-wider ${meta.tint} mb-1`}>{meta.label}</div>
          <div className="text-sm font-medium text-foreground leading-snug">{nudge.title}</div>
          {nudge.body && (
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{nudge.body}</div>
          )}
          {sources.length > 0 && (
            <div className="text-[10px] text-muted-foreground/70 mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>From: {sources.join(" + ")}</span>
            </div>
          )}
          {nudge.cta_label && (
            <Button
              size="sm"
              variant="secondary"
              className="mt-3"
              onClick={handleAct}
            >
              {nudge.cta_label}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
