import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Heart, Eye, Shield, Compass, Sparkles, AlertTriangle, TrendingUp, Flame, Target, ChevronDown } from "lucide-react";
import type { ConsciousnessProfile, EnginePlan } from "@/hooks/useConsciousnessEngine";

const spring = { type: "spring", stiffness: 300, damping: 30 } as const;

// ═══════════════════════════════════════════
// BAND-SPECIFIC STATE DESCRIPTIONS
// ═══════════════════════════════════════════

interface BandInsight {
  stateDescription: string;
  howYouThink: string;
  howYouReact: string;
  whatToExpect: string;
  patience: string;
  currentChallenge: string;
  hiddenStrength: string;
  practiceAdvice: string;
}

const BAND_INSIGHTS: Record<number, BandInsight> = {
  0: {
    stateDescription: "You're currently operating on autopilot — most thoughts, reactions, and choices happen without your conscious awareness. This isn't a flaw; it's simply where the journey begins. Everyone starts here.",
    howYouThink: "Thoughts run in automatic loops. You may believe your thoughts ARE you. Inner dialogue often goes unnoticed — it just feels like 'reality.' Most mental patterns are inherited from conditioning, culture, and past experiences.",
    howYouReact: "Reactions feel instantaneous and justified. There's little gap between stimulus and response. Emotions seem to 'happen to you' rather than move through you. You may frequently feel overwhelmed, frustrated, or stuck without understanding why.",
    whatToExpect: "The first shift is simply noticing. You'll start catching yourself mid-reaction. This can feel uncomfortable at first — like suddenly seeing something that was always there. That discomfort IS progress.",
    patience: "This is the most important phase. Don't rush. Every master was once a complete beginner. The fact that you're here, reading this, means the awakening has already begun. Be gentle with yourself.",
    currentChallenge: "Breaking free from the illusion that your automatic patterns define who you are. The mind resists observation because it threatens the identity built on unconscious habits.",
    hiddenStrength: "You have beginner's eyes — the ability to see everything fresh. This curiosity is your most powerful tool right now.",
    practiceAdvice: "Start with just 2 minutes of sitting quietly each day. Notice your breath. When your mind wanders (it will), gently return. This simple act is revolutionary.",
  },
  1: {
    stateDescription: "Something has stirred within you. You've begun to question the automatic nature of your life. This questioning energy is precious — it's the first real crack in the unconscious armor.",
    howYouThink: "You're starting to notice patterns in your thinking. 'Why do I always react this way?' becomes a recurring question. The mind oscillates between old autopilot mode and new moments of clarity.",
    howYouReact: "You catch reactions slightly after they happen. There's a growing awareness that says 'I did it again.' This retrospective awareness is building the muscle for real-time observation.",
    whatToExpect: "Expect ups and downs. Some days you'll feel incredibly aware, others you'll slip back into old patterns. This oscillation is completely normal and part of the integration process.",
    patience: "You're in the curiosity phase. Let questions be more important than answers. The seeking itself is transforming you. Don't try to 'fix' yourself — just keep watching.",
    currentChallenge: "Maintaining consistency when motivation fluctuates. The initial excitement of self-discovery can wane, and the real work of daily practice begins.",
    hiddenStrength: "Your willingness to question is rare. Most people never reach this point. Your curiosity is already dissolving unconscious patterns.",
    practiceAdvice: "Build one small daily ritual. Use the Guide to explore what resonates. Journal your observations — writing crystallizes awareness.",
  },
  2: {
    stateDescription: "Doubt has become your doorway. You're actively questioning assumptions, beliefs, and patterns. The Observer in you is growing stronger. You can sometimes watch your own mind without getting swept away.",
    howYouThink: "Thinking is becoming more reflective. You notice loops — the same worries, the same narratives playing on repeat. You're beginning to distinguish between useful thinking and mental noise.",
    howYouReact: "A tiny gap is forming between trigger and reaction. Sometimes you catch yourself before reacting. Other times, you react and then observe what happened. Both are valuable.",
    whatToExpect: "This phase can feel destabilizing. Old certainties crumble. You may question relationships, career, beliefs. This 'creative destruction' is making space for authentic living.",
    patience: "The questioning phase can feel endless. Trust that each question dissolves a layer of unconsciousness. You're not lost — you're finding your true ground.",
    currentChallenge: "Not getting trapped in intellectual analysis. The mind loves to turn observation into another thinking exercise. True observation is beyond thought.",
    hiddenStrength: "Your developing discernment — the ability to see what's real vs. what's conditioned — is becoming sharper with each observation.",
    practiceAdvice: "Practice the gap. Before responding to anything, take one conscious breath. This micro-pause is where transformation lives.",
  },
  3: {
    stateDescription: "Discipline is forging your awareness. You've committed to regular practice. The Observer is becoming a stable presence rather than occasional flashes. You're building the foundation for lasting transformation.",
    howYouThink: "You can watch thoughts arise and pass without always following them. Mental patterns are becoming transparent — you see the mechanism, not just the content. Metacognition is developing.",
    howYouReact: "Reactions are slowing down. You have more choice in how you respond. Emotional triggers still fire, but you have growing capacity to hold the emotion without acting on it impulsively.",
    whatToExpect: "Plateaus are normal here. Growth may feel invisible for weeks, then a sudden insight shifts everything. Trust the process even when nothing seems to be happening.",
    patience: "You've proven your commitment. Now deepen it. The practice isn't about achieving states — it's about returning again and again to presence. Consistency over intensity.",
    currentChallenge: "Avoiding spiritual bypassing — using awareness to escape rather than integrate difficult emotions. Everything must be felt, not just observed from a distance.",
    hiddenStrength: "Your discipline is rare. The willingness to show up daily is creating neural pathways of awareness that will serve you for life.",
    practiceAdvice: "Explore the dimension where you score lowest. Growth happens at the edges of comfort. Let the Guide take you into unfamiliar territory.",
  },
  4: {
    stateDescription: "You're learning to watch without becoming. The Observer is stabilizing — you can hold awareness of thoughts, emotions, and body sensations simultaneously. This is a significant shift in consciousness.",
    howYouThink: "Thoughts are seen as events in awareness, not as truth. You can examine a belief without believing it. The thinking mind becomes a tool you use rather than a force that uses you.",
    howYouReact: "There's genuine choice in your responses. Old triggers may still arise, but they've lost much of their power. You can feel an emotion fully without it controlling your behavior.",
    whatToExpect: "Deeper layers of conditioning surface for integration. Childhood patterns, cultural programming, and ancestral imprints may emerge. This isn't regression — it's healing at deeper levels.",
    patience: "You've developed real capacity. Now use it to go deeper, not wider. One fully observed loop dissolved at its root is worth more than superficial awareness of a hundred patterns.",
    currentChallenge: "Maintaining humility. A sense of 'I'm more aware than others' can arise. This subtle spiritual ego is itself a pattern to observe.",
    hiddenStrength: "Your witness capacity allows you to be with difficult experiences without fragmenting. This is emotional and psychological resilience at its finest.",
    practiceAdvice: "Begin tracking loops deeply. When a pattern arises, trace it to its root. Use shadow work and inner child modes in the Guide.",
  },
  5: {
    stateDescription: "All parts are becoming whole. You're integrating the fragments — shadow, light, body, mind, emotion. The boundaries between 'inner work' and 'daily life' are dissolving. Practice is becoming life itself.",
    howYouThink: "Thinking serves awareness rather than the other way around. You can hold paradox — two contradictory truths simultaneously. Mental flexibility is high.",
    howYouReact: "Reactions are increasingly conscious responses. When old patterns do fire, there's immediate recognition and often humor. You're friends with your patterns rather than at war with them.",
    whatToExpect: "Integration can feel like losing yourself before finding a deeper self. Old identities may feel hollow. New ways of being emerge organically, not through effort.",
    patience: "You're in the deep work now. Let integration happen at its own pace. Forcing wholeness creates another split. Hold space for everything that arises.",
    currentChallenge: "Letting go of the 'spiritual identity.' Even the identity of being 'someone who does inner work' must eventually be released.",
    hiddenStrength: "Your ability to hold complexity without collapsing into simplistic narratives is a gift. Use it to navigate life's paradoxes with grace.",
    practiceAdvice: "Focus on integration — how does awareness live in your relationships, work, creativity? The cushion is training; life is the real practice.",
  },
  6: {
    stateDescription: "Pure seeing is emerging — awareness beyond the seer. The witness is becoming effortless. You don't 'practice' awareness; awareness practices through you. This is the burning away of the separate self.",
    howYouThink: "Thought arises in spacious awareness. There's no identification with the thinker. Intelligence operates cleanly, without the distortion of ego-based narrative.",
    howYouReact: "Responses arise from presence rather than pattern. There's a quality of appropriateness — the right response naturally emerges for each situation without deliberation.",
    whatToExpect: "Periods of profound peace interspersed with deep cleansing. Very old, very subtle patterns surface. The 'dark night' at this level is about releasing the last veils of separation.",
    patience: "Trust the process completely. You've earned this depth through dedicated practice. Let awareness do its work. Your only job now is to not interfere.",
    currentChallenge: "The subtlety of remaining patterns. At this level, the obstacles are so refined they're almost invisible — a whisper of preference, a ghost of identity.",
    hiddenStrength: "Your presence itself is transformative — for you and for those around you. Simply being aware in a room changes the quality of interaction.",
    practiceAdvice: "Less technique, more being. Meditation becomes your natural state. Use the Guide for exploration rather than development.",
  },
  7: {
    stateDescription: "Wisdom flows effortlessly through you. The distinction between observer and observed is thinning. Life is recognized as consciousness expressing itself in infinite forms.",
    howYouThink: "Thought is transparent — arising and dissolving in awareness without leaving a trace. Insight comes from silence rather than analysis.",
    howYouReact: "There is no reactor — only response. Action arises from wholeness, not from a fragment trying to control the whole.",
    whatToExpect: "Continuous deepening. There is no 'arrival point.' Each moment reveals new depths of being. Ordinary life becomes extraordinarily alive.",
    patience: "Patience has become your nature, not a practice. You understand that everything unfolds in its own timing, including your own evolution.",
    currentChallenge: "Staying engaged with the relative world while resting in the absolute. The pull of transcendence must be balanced with embodied presence.",
    hiddenStrength: "Your very existence is a teaching. The quality of your awareness inspires without effort.",
    practiceAdvice: "Follow what calls. At this level, inner guidance is reliable. Serve others — the overflow of awareness naturally wants to share itself.",
  },
  8: {
    stateDescription: "Being itself. Awareness recognizes its own nature. The journey reveals itself to have been a play of consciousness — the seeker and the sought were always one.",
    howYouThink: "Thought is a dance, not a taskmaster. The mind is a beautiful instrument, used with precision and released with ease.",
    howYouReact: "Response is spontaneous and compassionate. There's no calculation, only clarity.",
    whatToExpect: "The extraordinary ordinariness of awakened life. Chopping wood, carrying water — with infinite presence.",
    patience: "Patience and impatience are both recognized as movements in awareness. Neither is resisted.",
    currentChallenge: "Communicating the ineffable. Sharing this understanding without creating another concept to cling to.",
    hiddenStrength: "You are the strength that underlies all experience.",
    practiceAdvice: "Life is the practice. Each moment is both the path and the destination.",
  },
};

const CHITTA_VRITTI_LABELS: Record<string, { name: string; description: string }> = {
  kshipta: { name: "Scattered", description: "Mind is restless, jumping from thought to thought like a monkey" },
  mudha: { name: "Dull", description: "Mind feels heavy, foggy, resistant to engagement" },
  vikshipta: { name: "Oscillating", description: "Mind alternates between moments of clarity and distraction" },
  ekagra: { name: "Focused", description: "Mind can sustain single-pointed attention with increasing ease" },
  niruddha: { name: "Mastered", description: "Mind is still, transparent, a clear mirror of awareness" },
};

const PHASE_DESCRIPTIONS: Record<string, string> = {
  assessment: "Your system is still learning about you. Each interaction refines the AI's understanding of your unique consciousness patterns.",
  entry: "You're in the foundational phase — building awareness muscles that will support everything that follows.",
  integration: "You're weaving insights into daily life. The gap between 'knowing' and 'being' is closing.",
  mastery: "Advanced patterns are integrating. Your practice has depth and consistency.",
};

// ═══════════════════════════════════════════
// SECTIONS
// ═══════════════════════════════════════════

interface SectionProps {
  icon: any;
  title: string;
  children: React.ReactNode;
  delay?: number;
  accent?: string;
}

function InsightSection({ icon: Icon, title, children, delay = 0, accent }: SectionProps) {
  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...spring, delay }}
    >
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent || 'bg-primary/10'}`}>
          <Icon className="w-3.5 h-3.5 text-primary" />
        </div>
        <h4 className="text-sm font-display font-semibold text-foreground">{title}</h4>
      </div>
      <div className="ml-9 text-xs text-muted-foreground font-body leading-relaxed">
        {children}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════

interface Props {
  profile?: ConsciousnessProfile;
  plan?: EnginePlan;
}

export function CurrentStateInsight({ profile, plan }: Props) {
  const band = Math.round(plan?.band ?? profile?.overall_band ?? 0);
  const insight = BAND_INSIGHTS[Math.min(band, 8)] || BAND_INSIGHTS[0];
  const phase = plan?.phase ?? profile?.journey_phase ?? "assessment";
  const phaseDesc = PHASE_DESCRIPTIONS[phase] || PHASE_DESCRIPTIONS.assessment;
  const chittaKey = profile?.chitta_vritti || "vikshipta";
  const chitta = CHITTA_VRITTI_LABELS[chittaKey] || CHITTA_VRITTI_LABELS.vikshipta;

  const dimensions = profile?.dimension_bands as unknown as Record<string, number> | undefined;
  const lowestDim = dimensions
    ? Object.entries(dimensions).sort((a, b) => a[1] - b[1])[0]
    : null;
  const highestDim = dimensions
    ? Object.entries(dimensions).sort((a, b) => b[1] - a[1])[0]
    : null;

  const witnessGap = profile?.witness_gap ?? 0;
  const integrationScore = profile?.integration_score ?? 0;

  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="glass-card rounded-2xl relative overflow-hidden cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.02 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-secondary/3 pointer-events-none" />

      {/* Collapsed Header — always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wider">
            Your Current State — Decoded
          </h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="relative px-5 pb-5 space-y-5">
              <InsightSection icon={Eye} title="Where You Are" delay={0.04}>
                <p>{insight.stateDescription}</p>
              </InsightSection>

              <InsightSection icon={Brain} title={`Mind State: ${chitta.name}`} delay={0.08} accent="bg-secondary/10">
                <p>{chitta.description}</p>
                {phase && (
                  <p className="mt-2 text-primary/80 italic">{phaseDesc}</p>
                )}
              </InsightSection>

              <InsightSection icon={Brain} title="How You Think" delay={0.12}>
                <p>{insight.howYouThink}</p>
              </InsightSection>

              <InsightSection icon={Heart} title="How You React" delay={0.16}>
                <p>{insight.howYouReact}</p>
              </InsightSection>

              {dimensions && lowestDim && highestDim && (
                <InsightSection icon={Compass} title="Your Dimensions" delay={0.2} accent="bg-accent/10">
                  <div className="space-y-1.5">
                    <p>
                      <span className="text-foreground font-medium capitalize">{highestDim[0]}</span> is your strongest dimension at{" "}
                      <span className="text-primary font-semibold">{highestDim[1].toFixed(1)}</span>
                    </p>
                    <p>
                      <span className="text-foreground font-medium capitalize">{lowestDim[0]}</span> needs the most attention at{" "}
                      <span className="text-primary font-semibold">{lowestDim[1].toFixed(1)}</span>
                    </p>
                    {witnessGap > 3 && (
                      <p className="text-destructive/80 flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        Witness gap is high ({witnessGap.toFixed(1)}) — awareness and lived experience are misaligned
                      </p>
                    )}
                    {integrationScore < 4 && (
                      <p className="text-muted-foreground/80 mt-1">
                        Integration is low — knowledge hasn't fully become embodied yet. This is normal early in the journey.
                      </p>
                    )}
                  </div>
                </InsightSection>
              )}

              <InsightSection icon={TrendingUp} title="What to Expect" delay={0.24}>
                <p>{insight.whatToExpect}</p>
              </InsightSection>

              <InsightSection icon={Shield} title="Your Current Challenge" delay={0.28} accent="bg-destructive/10">
                <p>{insight.currentChallenge}</p>
              </InsightSection>

              <InsightSection icon={Flame} title="Your Hidden Strength" delay={0.32} accent="bg-primary/10">
                <p className="text-primary/90">{insight.hiddenStrength}</p>
              </InsightSection>

              <InsightSection icon={Heart} title="A Word on Patience" delay={0.36}>
                <p className="italic">{insight.patience}</p>
              </InsightSection>

              <InsightSection icon={Target} title="What to Do Next" delay={0.4} accent="bg-secondary/10">
                <p>{insight.practiceAdvice}</p>
              </InsightSection>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
