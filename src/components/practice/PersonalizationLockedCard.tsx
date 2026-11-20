/**
 * PersonalizationLockedCard
 * ─────────────────────────
 * Shown inside For You / Off-App / Rituals tabs when the user hasn't yet
 * generated enough signal for personalization. Two clear next steps:
 *   • Complete one session
 *   • Complete one mirror
 * Each step shows a check when done.
 */
import { motion } from "framer-motion";
import { Lock, Check, Sparkles, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  tabLabel: string;
  needsSession: boolean;
  needsMirror: boolean;
  sessionsCompleted: number;
  mirrorsCompleted: number;
}

export default function PersonalizationLockedCard({
  tabLabel,
  needsSession,
  needsMirror,
  sessionsCompleted,
  mirrorsCompleted,
}: Props) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/30 bg-card/30 p-6 space-y-5"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Lock className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-lg text-foreground">
            {tabLabel} unlocks with you
          </h3>
          <p className="mt-1 text-sm font-body text-muted-foreground leading-relaxed">
            This page is built from your data — not a generic list. Complete the two steps below and it opens, shaped by who you are.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Step
          done={!needsSession}
          icon={<Sparkles className="w-3.5 h-3.5" />}
          title="Finish one session"
          subtitle={
            needsSession
              ? "Any guided session — that's how we learn your rhythm. Even 5 minutes counts."
              : `${sessionsCompleted} session${sessionsCompleted === 1 ? "" : "s"} complete`
          }
          actionLabel={needsSession ? "Start" : undefined}
          onAction={() => navigate("/app/home")}
        />
        <Step
          done={!needsMirror}
          icon={<Compass className="w-3.5 h-3.5" />}
          title="Complete one mirror"
          subtitle={
            needsMirror
              ? "A mirror reveals what no quiz can — your inner shape. It takes about 10 minutes."
              : `${mirrorsCompleted} mirror${mirrorsCompleted === 1 ? "" : "s"} complete`
          }
          actionLabel={needsMirror ? "Open" : undefined}
          onAction={() => navigate("/app/pre-journey")}
        />
      </div>

      <p className="text-[11px] font-body text-muted-foreground/70 italic pt-1">
        We'd rather show you nothing than show you something generic. Everything here will be made for you.
      </p>
    </motion.div>
  );
}

function Step({
  done,
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  done: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3 py-3 transition-colors ${
        done
          ? "border-primary/30 bg-primary/5"
          : "border-border/30 bg-background/40"
      }`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
          done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? <Check className="w-3.5 h-3.5" /> : icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display text-sm text-foreground">{title}</div>
        <div className="text-[11px] font-body text-muted-foreground leading-snug">
          {subtitle}
        </div>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="shrink-0 text-[11px] font-display tracking-wide uppercase px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
