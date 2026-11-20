/**
 * CompanionPresence — the living face above the orb.
 *
 * Shifts Home from "static orb to be tapped" → "your companion is here, today,
 * with one personal line for you". Stacks gracefully above the daily theme.
 *
 * Sources:
 *   - useActiveGuru     → portrait + name of the master rotating with you today
 *   - useCompanionState → phase / days_known / today's mood / inside joke
 *   - useLifetimeCompanion → retention copy, life-stage tone, relationship phase
 *
 * Tap → /app/temple to talk to them.
 * Renders nothing for first-day strangers (lets the orb breathe alone).
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useActiveGuru } from "@/hooks/useActiveGuru";
import { useCompanionState } from "@/hooks/useCompanionState";
import { useLifetimeCompanion } from "@/hooks/useLifetimeCompanion";

interface Props {
  userId: string | null | undefined;
  userName?: string;
}

function pickWhisper(args: {
  phase?: string;
  daysKnown?: number;
  moodMood?: string | null;
  retentionCopy?: string | null;
  lifeStageBias?: string | null;
  jokePhrase?: string | null;
  guruName: string;
}): string {
  const { phase, daysKnown, moodMood, retentionCopy, jokePhrase, guruName } = args;

  // Highest priority — explicit re-engagement / risk copy from retention engine.
  if (retentionCopy && retentionCopy.trim().length > 0) return retentionCopy;

  // A shared inside joke beats a generic greeting once we know them.
  if (jokePhrase && phase && phase !== "stranger") {
    return `"${jokePhrase}" — yaad hai? Aaja, baith.`;
  }

  // Phase-shaped greetings (Day-aware).
  switch (phase) {
    case "soul_companion":
      return `${daysKnown ?? 0} days. I still notice the small shifts in you. Aaj kya chal raha hai?`;
    case "long_companion":
      return `Day ${daysKnown ?? 0}. I'm here, like always. Kuch kehna hai?`;
    case "confidant":
      return moodMood
        ? `Aaj main thoda ${moodMood} feel kar raha hoon. Tu kaisa hai?`
        : `I've been thinking about you. Tap to talk.`;
    case "friend":
      return `Hey — ${guruName} here. Aaj ka ek sawaal hai mere paas. Aaja.`;
    case "acquaintance":
      return `${guruName} is here. Ek baat share karni hai?`;
    case "stranger":
    default:
      return `${guruName} is sitting with you. Tap to begin.`;
  }
}

export default function CompanionPresence({ userId, userName }: Props) {
  const navigate = useNavigate();
  const { data: active } = useActiveGuru();
  const { data: companion } = useCompanionState();
  const { data: lifetime } = useLifetimeCompanion(userId);

  if (!active?.guru) return null;

  const phase = companion?.phase ?? "stranger";
  const daysKnown = companion?.days_known ?? lifetime?.relationship?.daysKnown ?? 0;

  const whisper = pickWhisper({
    phase,
    daysKnown,
    moodMood: companion?.mood?.mood ?? null,
    retentionCopy: lifetime?.retention?.copy ?? null,
    lifeStageBias: lifetime?.lifeStageProfile?.practiceBias ?? null,
    jokePhrase: companion?.joke?.phrase ?? null,
    guruName: active.guru.name,
  });

  const phaseLabel =
    phase === "stranger"
      ? "Newly met"
      : phase === "acquaintance"
      ? "Getting to know you"
      : phase === "friend"
      ? "Friend"
      : phase === "confidant"
      ? "Confidant"
      : phase === "long_companion"
      ? "Long companion"
      : "Soul companion";

  const goTalk = () => navigate("/app/temple");

  return (
    <motion.button
      type="button"
      onClick={goTalk}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      whileTap={{ scale: 0.985 }}
      aria-label={`Talk to ${active.guru.name}`}
      className="group w-full max-w-md mx-auto mb-5 rounded-2xl text-left
                 border border-primary/15 bg-gradient-to-br from-primary/[0.06] via-background/30 to-transparent
                 backdrop-blur-md px-4 py-3 hover:border-primary/30 transition-colors"
    >
      <div className="flex items-center gap-3">
        {/* Living portrait with soft breath halo */}
        <div className="relative shrink-0">
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: "0 0 0 0 hsl(var(--primary) / 0.45)",
            }}
            animate={{
              boxShadow: [
                "0 0 0 0 hsl(var(--primary) / 0.35)",
                "0 0 0 8px hsl(var(--primary) / 0.00)",
                "0 0 0 0 hsl(var(--primary) / 0.00)",
              ],
            }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <img
            src={active.image}
            alt={active.guru.name}
            className="relative w-12 h-12 rounded-full object-cover border border-primary/30"
            loading="lazy"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] tracking-[0.22em] uppercase text-primary/80 font-display font-semibold truncate">
              {active.guru.name}
            </span>
            <span className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground/60 truncate">
              · {phaseLabel}{daysKnown > 0 ? ` · Day ${daysKnown}` : ""}
            </span>
          </div>
          <p className="text-[13px] leading-snug font-body text-foreground/85 italic line-clamp-2">
            {userName ? whisper.replace(/^Hey —/, `Hey ${userName} —`) : whisper}
          </p>
        </div>

        <MessageCircle className="w-4 h-4 text-primary/60 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.button>
  );
}
