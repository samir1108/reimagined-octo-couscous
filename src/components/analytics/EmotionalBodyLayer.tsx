import { motion } from "framer-motion";
import { Heart, Shield, Waves, Link2 } from "lucide-react";
import { Progress } from "@/design-system";
import { ProgressRing } from "./ProgressRing";

const spring = { type: "spring", stiffness: 300, damping: 30 } as const;

const ATTACHMENT_INFO: Record<string, { label: string; emoji: string; desc: string; color: string }> = {
  secure: { label: "Secure", emoji: "🏠", desc: "Comfortable with intimacy and independence", color: "hsl(150 60% 50%)" },
  anxious: { label: "Anxious", emoji: "💓", desc: "Seeking closeness, fear of abandonment", color: "hsl(330 70% 60%)" },
  avoidant: { label: "Avoidant", emoji: "🏔️", desc: "Valuing independence, discomfort with closeness", color: "hsl(210 60% 60%)" },
  disorganized: { label: "Disorganized", emoji: "🌀", desc: "Conflicting desires for and fear of closeness", color: "hsl(30 70% 55%)" },
};

const DEFENSE_INFO: Record<string, { emoji: string; desc: string }> = {
  projection: { emoji: "🪞", desc: "Attributing your feelings to others" },
  denial: { emoji: "🙈", desc: "Refusing to accept reality" },
  intellectualization: { emoji: "📚", desc: "Using logic to avoid feeling" },
  spiritual_bypassing: { emoji: "🌈", desc: "Using spirituality to avoid emotions" },
  suppression: { emoji: "🫁", desc: "Pushing feelings down consciously" },
  rationalization: { emoji: "⚙️", desc: "Making excuses for behavior" },
  displacement: { emoji: "🎯", desc: "Redirecting emotions to safer targets" },
  sublimation: { emoji: "🎨", desc: "Channeling urges into productive activity" },
  regression: { emoji: "👶", desc: "Reverting to earlier coping patterns" },
  humor: { emoji: "😂", desc: "Using jokes to deflect pain" },
};

interface Props {
  psycheData: any;
}

export function EmotionalBodyLayer({ psycheData }: Props) {
  const emotional = psycheData?.emotional_signatures || {
    baseline_state: null, emotional_range: 0, suppressed_emotions: [],
    emotional_maturity: 0, dominant_emotions: []
  };
  const attachment = psycheData?.attachment || {
    primary_style: null, secondary_style: null, evolution: [],
    relational_triggers: [], secure_percentage: 0
  };
  const defenses = psycheData?.defenses || {
    active_defenses: [], trigger_defense_map: {},
    primary_defense: null, defense_awareness: 0
  };

  const primaryAttach = ATTACHMENT_INFO[attachment.primary_style] || null;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring}>
        <h2 className="text-lg font-display font-bold text-foreground">Emotional Body</h2>
        <p className="text-sm text-muted-foreground font-body">Your emotional landscape, attachment patterns, and defense mechanisms</p>
      </motion.div>

      {/* Emotional Signatures */}
      <motion.div
        className="glass-card rounded-2xl p-5 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.05 }}
      >
        <div className="flex items-center gap-2">
          <Waves className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">Emotional Signature</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center gap-2">
            <ProgressRing value={Number(emotional.emotional_maturity)} max={10} size={70} strokeWidth={5}>
              <span className="text-sm font-display font-bold text-foreground">{Number(emotional.emotional_maturity).toFixed(1)}</span>
            </ProgressRing>
            <span className="text-[10px] font-body text-muted-foreground">Maturity</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ProgressRing value={Number(emotional.emotional_range)} max={10} size={70} strokeWidth={5} color="hsl(330 70% 60%)">
              <span className="text-sm font-display font-bold text-foreground">{Number(emotional.emotional_range).toFixed(1)}</span>
            </ProgressRing>
            <span className="text-[10px] font-body text-muted-foreground">Range</span>
          </div>
        </div>

        {emotional.baseline_state && (
          <div className="text-center">
            <span className="text-[10px] font-body text-muted-foreground">Baseline State: </span>
            <span className="text-xs font-display font-medium text-foreground capitalize">{emotional.baseline_state}</span>
          </div>
        )}

        {emotional.dominant_emotions?.length > 0 && (
          <div>
            <span className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">Dominant Emotions</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {emotional.dominant_emotions.map((e: string, i: number) => (
                <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-body capitalize">{e}</span>
              ))}
            </div>
          </div>
        )}

        {emotional.suppressed_emotions?.length > 0 && (
          <div>
            <span className="text-[10px] font-body uppercase tracking-wider text-destructive/70">Suppressed</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {emotional.suppressed_emotions.map((e: string, i: number) => (
                <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-destructive/10 text-destructive font-body capitalize">{e}</span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Attachment Style */}
      <motion.div
        className="glass-card rounded-2xl p-5 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.15 }}
      >
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">Attachment Style</h3>
        </div>

        {primaryAttach ? (
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: `${primaryAttach.color}10` }}>
              <span className="text-3xl">{primaryAttach.emoji}</span>
              <div>
                <p className="text-base font-display font-bold text-foreground">{primaryAttach.label}</p>
                <p className="text-[10px] text-muted-foreground font-body">{primaryAttach.desc}</p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-body text-muted-foreground">
                <span>Secure Attachment %</span>
                <span>{Math.round(Number(attachment.secure_percentage) * 100)}%</span>
              </div>
              <Progress value={Number(attachment.secure_percentage) * 100} className="h-1.5" />
            </div>

            {attachment.relational_triggers?.length > 0 && (
              <div>
                <span className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">Relational Triggers</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {attachment.relational_triggers.map((t: string, i: number) => (
                    <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-muted text-foreground font-body">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center">
            <span className="text-3xl">💝</span>
            <p className="text-xs text-muted-foreground font-body italic mt-2">Your attachment style will emerge through relational patterns in your journey.</p>
          </div>
        )}
      </motion.div>

      {/* Defense Mechanisms */}
      <motion.div
        className="glass-card rounded-2xl p-5 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.25 }}
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">Defense Mechanisms</h3>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-body text-muted-foreground">
            <span>Defense Awareness</span>
            <span>{Math.round(Number(defenses.defense_awareness) * 100)}%</span>
          </div>
          <Progress value={Number(defenses.defense_awareness) * 100} className="h-1.5" />
        </div>

        {defenses.primary_defense && (
          <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
            <span className="text-[10px] font-body text-muted-foreground">Primary Defense</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg">{DEFENSE_INFO[defenses.primary_defense]?.emoji || "🛡️"}</span>
              <div>
                <p className="text-sm font-display font-medium text-foreground capitalize">{defenses.primary_defense.replace(/_/g, " ")}</p>
                <p className="text-[10px] text-muted-foreground font-body">{DEFENSE_INFO[defenses.primary_defense]?.desc || ""}</p>
              </div>
            </div>
          </div>
        )}

        {defenses.active_defenses?.length > 0 ? (
          <div className="space-y-2">
            {defenses.active_defenses.map((d: string, i: number) => {
              const info = DEFENSE_INFO[d] || { emoji: "🛡️", desc: "" };
              return (
                <div key={i} className="flex items-center gap-2 text-xs font-body">
                  <span>{info.emoji}</span>
                  <span className="text-foreground capitalize">{d.replace(/_/g, " ")}</span>
                  <span className="text-muted-foreground text-[10px]">— {info.desc}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground font-body italic">Defense patterns will be identified as the AI observes your coping strategies.</p>
        )}
      </motion.div>
    </div>
  );
}
