import { motion } from "framer-motion";
import { Crown, AlertTriangle, ArrowRight, Sparkles, BookOpen, MessageCircle, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { getLoopById } from "@/data/loops";
import { getLoopName } from "@/lib/onboarding/getLoopName";
import type { ConsciousnessProfile, EnginePlan } from "@/hooks/useConsciousnessEngine";

const spring = { type: "spring", stiffness: 300, damping: 30 } as const;

interface Props {
  profile?: ConsciousnessProfile;
  plan?: EnginePlan;
  loops: any[];
  sessions: any[];
  journals: any[];
}

/**
 * Elder's Take — a synthesized read of where the user is right now,
 * which loops are alive, and the next 3 most useful moves.
 * Pulls only from data already loaded in the analytics layer (no extra fetch).
 */
export function ElderTake({ profile, plan, loops, sessions, journals }: Props) {
  const band = Math.round(plan?.band ?? profile?.overall_band ?? 0);
  const phase = plan?.phase ?? profile?.journey_phase ?? "assessment";
  const state = profile?.state ?? "normal";
  const witnessGap = profile?.witness_gap ?? 0;
  const integration = profile?.integration_score ?? 0;
  const bypassing = profile?.bypassing_risk ?? 0;
  const streak = profile?.streak_current ?? 0;

  // Active loops (from user_loops table — already loaded)
  const activeLoops = (loops || [])
    .filter((l: any) => l.status === "active" || l.is_active || l.source === "onboarding")
    .slice(0, 3)
    .map((l: any) => {
      const def = getLoopById(l.loop_id);
      return {
        id: l.loop_id,
        name: def?.name || getLoopName(l.loop_id || "Pattern"),
        severity: severityToLevel(l.severity ?? l.intensity),
        path: def?.dissolution_path,
      };
    });

  // Recent activity signal
  const recent7 = sessions.filter(
    (s: any) => new Date(s.created_at).getTime() > Date.now() - 7 * 24 * 3600 * 1000
  ).length;
  const journals7 = journals.filter(
    (j: any) => new Date(j.created_at).getTime() > Date.now() - 7 * 24 * 3600 * 1000
  ).length;

  // ── Elder's read (one paragraph, contextual) ──
  let elderRead = "";
  if (state === "dark_night") {
    elderRead = `You're moving through a dark night — old structures are crumbling so a truer self can emerge. This isn't regression. It's deep work. Be gentle, stay close to ground, don't try to fix anything yet.`;
  } else if (state === "breakthrough") {
    elderRead = `Something's opening. A breakthrough is alive in you right now. Don't rush past it — let it land in the body before reaching for the next thing.`;
  } else if (state === "bypassing") {
    elderRead = `I'm noticing you may be using awareness to skip over what needs to be felt. The medicine is to descend — into body, into the difficult emotion, not above it.`;
  } else if (band <= 1) {
    elderRead = `You're at the very beginning — and that's a powerful place. The work right now is just noticing. Don't try to change anything. Watch your reactions like you'd watch weather.`;
  } else if (band <= 3) {
    elderRead = `You're building the muscle of observation. The gap between trigger and reaction is starting to widen. Keep showing up — consistency matters more than intensity now.`;
  } else if (band <= 5) {
    elderRead = `You're integrating. The Observer is becoming stable. Your next edge is depth — not new techniques, but going deeper into what you already know.`;
  } else {
    elderRead = `You're operating from real presence. The work now is subtle — releasing the identity of "the one who is aware." Let awareness live you, not the other way around.`;
  }

  if (recent7 === 0 && journals7 === 0) {
    elderRead += ` It's been quiet this week — when you're ready, even one small return is enough.`;
  }

  // ── Next 3 moves (concrete, contextual, deep-link to actions) ──
  type Move = { icon: any; label: string; sub: string; to: string };
  const moves: Move[] = [];

  // Move 1: Address dominant loop
  if (activeLoops.length > 0) {
    moves.push({
      icon: Target,
      label: `Sit with "${activeLoops[0].name}"`,
      sub: activeLoops[0].path?.split(".")[0] || "Notice when it activates today, without trying to fix it.",
      to: `/app/journal?prompt=${encodeURIComponent(`When did "${activeLoops[0].name}" show up today? What was it protecting?`)}`,
    });
  }

  // Move 2: Address weakest dimension
  const dims = profile?.dimension_bands as unknown as Record<string, number> | undefined;
  if (dims) {
    const lowest = Object.entries(dims).sort((a, b) => a[1] - b[1])[0];
    if (lowest) {
      const tip: Record<string, string> = {
        body: "Drop into a 5-minute body scan. Where is tension hiding?",
        emotion: "Name three emotions you've felt today. Did you let them move through you?",
        thought: "Observe one repeating thought without engaging it. Just watch.",
        awareness: "Set a phone alarm. When it rings — pause and ask: where was I?",
      };
      moves.push({
        icon: Sparkles,
        label: `Strengthen ${lowest[0]}`,
        sub: tip[lowest[0]] || `Bring focused practice to your ${lowest[0]} dimension.`,
        to: `/app/guide`,
      });
    }
  }

  // Move 3: Bypassing or integration
  if (bypassing > 5) {
    moves.push({
      icon: BookOpen,
      label: "Descend into feeling",
      sub: "Write about something difficult you've been observing-but-not-feeling.",
      to: `/app/journal?prompt=${encodeURIComponent("What have I been observing from a distance instead of feeling?")}`,
    });
  } else if (integration < 5 && band >= 2) {
    moves.push({
      icon: BookOpen,
      label: "Integrate today",
      sub: "Journal one moment from today where awareness met action.",
      to: `/app/journal?prompt=${encodeURIComponent("Where did awareness meet action today?")}`,
    });
  } else {
    moves.push({
      icon: MessageCircle,
      label: "Talk it through",
      sub: "Open a session with the Guide — explore what's most alive right now.",
      to: `/app/guide`,
    });
  }

  return (
    <motion.div
      className="glass-card rounded-2xl p-5 space-y-5 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

      {/* Header */}
      <div className="relative flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Crown className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-display font-bold text-foreground">Elder's Take</h3>
          <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">
            Where you are · what's alive · what's next
          </p>
        </div>
      </div>

      {/* Elder's Read */}
      <div className="relative">
        <p className="text-[13px] font-body text-foreground/85 leading-relaxed italic border-l-2 border-primary/30 pl-3">
          {elderRead}
        </p>
      </div>

      {/* Active Loops */}
      {activeLoops.length > 0 && (
        <div className="relative space-y-2">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-orange-400" />
            <h4 className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider">
              What's alive in you ({activeLoops.length})
            </h4>
          </div>
          <div className="space-y-1.5">
            {activeLoops.map((l) => (
              <div
                key={l.id}
                className="glass-subtle rounded-lg px-3 py-2 flex items-center justify-between"
              >
                <span className="text-xs font-display capitalize text-foreground">{l.name}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-3 rounded-full ${
                        i < Math.round((l.severity / 10) * 5)
                          ? "bg-orange-400/70"
                          : "bg-muted-foreground/15"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Moves */}
      <div className="relative space-y-2">
        <div className="flex items-center gap-1.5">
          <ArrowRight className="w-3 h-3 text-primary" />
          <h4 className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider">
            What to do next
          </h4>
        </div>
        <div className="space-y-1.5">
          {moves.map((m, i) => {
            const Icon = m.icon;
            return (
              <Link
                key={i}
                to={m.to}
                className="block glass-subtle rounded-xl px-3 py-2.5 hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-display font-semibold text-foreground">{m.label}</p>
                    <p className="text-[11px] text-muted-foreground font-body leading-snug mt-0.5">{m.sub}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function severityToLevel(severity: unknown) {
  if (typeof severity === "number") return severity;
  const levels: Record<string, number> = {
    dormant: 1,
    mild: 2,
    emerging: 2,
    moderate: 3,
    active: 4,
    strong: 4,
    intense: 5,
    dominant: 5,
  };
  return levels[String(severity ?? "").toLowerCase()] ?? 3;
}
