import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Check, Moon, Sparkles, Star, Sunrise } from "lucide-react";
import StreakFlame from "@/components/StreakFlame";
import GetTaskButton from "@/components/GetTaskButton";


interface EveningSandhyaProps {
  userName: string;
  streak: number;
  sessionsCompleted: number;
  tasksCompleted: number;
  totalTasks: number;
  journalEntries: number;
  tomorrowTheme?: { title: string; affirmation: string } | null;
  eveningQuestions?: string[];
  onReflectWithGuide: () => void;
  onNavigateJournal: () => void;
  onSelfInquiryPrompt?: (prompt: string) => void;
  /** Late bloomer mode — user missed morning, arrived in evening */
  lateBloomer?: boolean;
  journeyDay?: number;
  /** Personalized self-inquiry prompts from engine */
  selfInquiryPrompts?: string[];
  /** Whether the evening session has been completed */
  eveningDone?: boolean;
  /** Handler when flame is clicked */
  onFlameClick?: () => void;
}

const EVENING_INSIGHTS = [
  // Week 1: WHY
  { title: "Did you notice the mind today?", body: "Even a single moment of catching yourself lost in thought is progress. That gap between you and the thought — that's consciousness growing." },
  { title: "The resistance is the teacher", body: "If you felt resistance today — to practice, to journaling, to slowing down — that's not failure. That IS the pattern becoming visible." },
  { title: "Rewiring takes time", body: "Your brain built its current patterns over decades. New neural pathways don't form in a day. Be patient with yourself — you're doing invisible, powerful work." },
  { title: "Autopilot moments", body: "How many moments today were on autopilot? Eating without tasting, walking without feeling, talking without listening? Each one you noticed is a win." },
  { title: "Body awareness check", body: "Did you notice any sensations in the body today — tension, warmth, tightness? The body speaks constantly. Today you started listening." },
  { title: "Knowledge vs. experience", body: "What did you EXPERIENCE today, not just understand? One moment of genuine awareness is worth a thousand concepts." },
  { title: "You showed up again", body: "In a world pulling you toward unconsciousness, you opened this app for 7 days. That's not small. That's the beginning of a revolution inside you." },
  // Week 2: HOW
  { title: "Did you catch a loop?", body: "A repeating thought, a familiar reaction, a pattern you've run before — if you noticed it even once today, you've stepped outside the loop. That's how they dissolve." },
  { title: "The same trigger, different response?", body: "Did anything trigger you today? Did you react the old way, or did you pause? Even a half-second pause is a victory over decades of conditioning." },
  { title: "Comfort zone inventory", body: "What did you avoid today because it felt uncomfortable? That avoidance is the comfort zone protecting itself. Name it. That's how the prison walls become visible." },
  { title: "Dopamine audit", body: "How many times did you reach for your phone, for food, for distraction — not from need, but from habit? Each time you noticed: that's awareness winning over autopilot." },
  { title: "What story played today?", body: "Did you hear the 'I'm not enough' story? The 'they don't understand me' story? The 'I'll never change' story? Just noticing the narrative is the first step to rewriting it." },
  { title: "Self-sabotage check", body: "Did anything good happen today that you then undermined? Picking a fight after a compliment, procrastinating after progress? That's the upper limit. You saw it." },
  { title: "Two weeks of awareness", body: "14 days of choosing consciousness over comfort. Your brain is building new pathways even when it doesn't feel like it. The foundation is being laid right now." },
  // Week 3: WHAT
  { title: "The gap is measurable now", body: "Think of a moment today where you almost reacted but didn't. That pause — even if tiny — didn't exist two weeks ago. It's proof of neurological change." },
  { title: "Your brain rewired today", body: "Every time you chose awareness over autopilot today, you strengthened new neural connections. This isn't metaphor — it's measurable neuroscience." },
  { title: "Did an emotion pass quickly?", body: "If you let a feeling move through you without the story today — anger without 'how dare they,' sadness without 'why always me' — you experienced the 90-second truth." },
  { title: "Body intelligence check", body: "Did your body give you a signal today — a tightness, a warmth, a gut feeling? Did you listen? Your body is becoming a conscious instrument." },
  { title: "Dream processing", body: "Are your dreams more vivid or unusual? Your subconscious is reorganizing. The awareness you build during the day activates deeper processing at night." },
  { title: "External mirrors", body: "Did anyone comment on you seeming different? Calmer, more present, more grounded? Trust the mirror. Others see the transformation before you feel it." },
  { title: "21 days: the threshold crossed", body: "New neural pathways are beginning to solidify. You're no longer forcing awareness — it's starting to arise on its own. The practice is becoming part of you." },
  // Week 4: WHO
  { title: "Who is watching?", body: "Tonight, as you reflect, notice: who is doing the reflecting? That awareness behind your thoughts — that's the witness emerging. You're becoming who you always were." },
  { title: "Beyond the story", body: "If you removed your past, your roles, your labels — who would remain? Not nothing. Awareness itself. Tonight, rest in that awareness, even briefly." },
  { title: "Three brains integrated", body: "Did you check your head, heart, and gut today? When all three align on a decision, there's a feeling of wholeness. That integration is the goal of this work." },
  { title: "Shadow glimpse", body: "Did someone annoy you today? That annoyance is pointing to something in yourself you haven't accepted. Not a flaw — a lost piece of your wholeness." },
  { title: "The voice of silence", body: "Did you find even 30 seconds of genuine inner silence today? Not just quiet surroundings, but a still mind? That silence is not empty — it's the ground of consciousness." },
  { title: "Observation = transformation", body: "Every pattern you observed today was changed by the observation itself. You're not a passive viewer of your life. By watching, you're creating." },
  { title: "Integration is happening", body: "Mind, body, and awareness are beginning to move as one system in you. The separation between 'practice time' and 'real life' is dissolving." },
  { title: "Look back at Day 1", body: "Remember who opened this app 29 days ago? The skepticism, the resistance, the uncertainty. That person and you are very different beings now. Honor the journey." },
  { title: "The real journey begins", body: "30 days of consistent inner work. You've built awareness, caught loops, felt the body, met the witness. This wasn't the destination — it was the preparation. Now you live it." },
];

const DEFAULT_SELF_INQUIRY_PROMPTS = [
  "What thought is occupying most of your mind right now?",
  "What emotion are you feeling right now? Where do you feel it in your body?",
  "Is there a behavior pattern that keeps repeating in your life?",
  "What happens when you focus only on this present moment?",
  "Who is the one noticing your thoughts right now?",
];

export default function EveningSandhya({
  userName, streak, sessionsCompleted, tasksCompleted, totalTasks,
  journalEntries, tomorrowTheme, eveningQuestions, onReflectWithGuide, onNavigateJournal,
  onSelfInquiryPrompt, lateBloomer, journeyDay, selfInquiryPrompts, eveningDone, onFlameClick
}: EveningSandhyaProps) {
  const navigate = useNavigate();
  const prompts = (selfInquiryPrompts && selfInquiryPrompts.length > 0) ? selfInquiryPrompts : DEFAULT_SELF_INQUIRY_PROMPTS;
  const promptEmojis = ["🔍", "❓", "🪞", "💡", "🤝"];

  const startEveningReflection = () => {
    navigate("/app/guide?mode=evening_reflection&slot=evening");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Greeting */}
      <motion.div
        className="flex flex-col items-start"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {lateBloomer ? (
          <>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">
                Every moment is a <span className="text-gradient-sunrise">fresh start</span>
              </h1>
              {streak > 0 && <StreakFlame streak={streak} size="sm" onClick={onFlameClick} />}
            </div>
            <p className="text-sm text-muted-foreground font-body mt-1">
              You're here now, {userName}. That's what matters.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">
                Good evening, <span className="text-gradient-sunrise">{userName}</span>
              </h1>
              {streak > 0 && <StreakFlame streak={streak} size="sm" onClick={onFlameClick} />}
            </div>
            <p className="text-sm text-muted-foreground font-body mt-1">Time to reflect & integrate</p>
          </>
        )}
      </motion.div>

      {/* Late Bloomer: Quick intention OR completed state */}
      {lateBloomer && (
        <motion.div
          className="glass-card rounded-2xl p-5 border-primary/10"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          {eveningDone ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary font-semibold">Evening Session Complete</span>
              </div>
              <p className="text-sm font-body text-muted-foreground">
                You showed up today. That's what matters. Rest well. 🌙
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Sunrise className="w-4 h-4 text-primary/60" />
                <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary/50">Quick Intention</span>
              </div>
              <p className="text-sm font-body text-muted-foreground mb-3">
                Set one intention for the remaining evening. Small is powerful.
              </p>
              <motion.button
                onClick={onReflectWithGuide}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-sunrise text-primary-foreground font-display font-medium text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Set with Guide
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </>
          )}
        </motion.div>
      )}


      {/* ═══ Evening Reflection CTA — Primary Action ═══ */}
      {!lateBloomer && (
        <motion.div
          className="glass-card rounded-2xl p-6 border border-primary/15 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.6 }}
        >
          {eveningDone ? (
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Check className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary font-semibold block">Evening Reflection Done</span>
                  <span className="text-xs text-muted-foreground font-body">Well done today 🙏</span>
                </div>
              </div>
              <p className="text-sm font-body text-muted-foreground leading-relaxed">
                You've reflected and integrated today's experiences. Carry this awareness into rest.
              </p>
            </div>
          ) : (
            <>
              {/* Ambient glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/8 rounded-full blur-[60px] -translate-y-1/2 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Moon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary font-semibold block">Evening Reflection</span>
                    <span className="text-xs text-muted-foreground font-body">3–5 min guided session</span>
                  </div>
                </div>

                <p className="text-sm font-body text-muted-foreground leading-relaxed mb-4">
                  Close your day with awareness. Reflect on moments, emotions, patterns — and let go of what you don't need to carry into sleep.
                </p>

                <motion.button
                  onClick={startEveningReflection}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-sunrise text-primary-foreground font-display font-semibold text-sm shadow-lg shadow-primary/20"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Moon className="w-4 h-4" />
                  Begin Evening Reflection
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
      )}

      <GetTaskButton delay={0.1} />

      {/* Day Summary */}
      <motion.div
        className="glass-card rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.6 }}
      >
        <p className="text-[10px] font-display tracking-[0.2em] uppercase text-primary/60 mb-4">
          Today's Journey
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: "🧘", value: sessionsCompleted, label: "Sessions" },
            { icon: "✅", value: `${tasksCompleted}/${totalTasks}`, label: "Tasks" },
            { icon: "📝", value: journalEntries, label: "Journal" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
            >
              <span className="text-2xl block mb-1">{stat.icon}</span>
              <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-body">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Onboarding Insight — Days 1-30 */}
      {journeyDay && journeyDay <= 30 && (
        <motion.div
          className="glass-card rounded-2xl p-5 border border-primary/10"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary/60">Day {journeyDay} Insight</span>
          </div>
          <h3 className="text-sm font-display font-semibold text-foreground mb-1">{EVENING_INSIGHTS[journeyDay - 1].title}</h3>
          <p className="text-xs font-body text-muted-foreground leading-relaxed">{EVENING_INSIGHTS[journeyDay - 1].body}</p>
        </motion.div>
      )}

      {/* Self-Inquiry: Today's Deep Questions */}
      <motion.div
        className="glass-card rounded-2xl p-6 border border-primary/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.6 }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary/70">
            Self-Inquiry — Today's Reflection
          </span>
        </div>
        <div className="space-y-3">
          {prompts.slice(0, 5).map((q, i) => (
            <motion.button
              key={i}
              onClick={() => onSelfInquiryPrompt ? onSelfInquiryPrompt(q) : onReflectWithGuide()}
              className="w-full text-left p-3.5 rounded-xl glass-subtle hover:bg-primary/5 transition-all group"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.08 }}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg shrink-0">{promptEmojis[i] || "💭"}</span>
                <p className="text-sm font-body text-foreground/80 leading-relaxed group-hover:text-foreground transition-colors">
                  {q}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Engine Evening Questions */}
      {eveningQuestions && eveningQuestions.length > 0 && (
        <motion.div
          className="glass-card rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary/70">
              Personalized Reflection
            </span>
          </div>
          <div className="space-y-3">
            {eveningQuestions.map((q, i) => (
              <motion.button
                key={i}
                onClick={onNavigateJournal}
                className="w-full text-left p-3 rounded-xl glass-subtle hover:bg-primary/5 transition-all"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
              >
                <p className="text-sm font-body text-foreground/80 leading-relaxed">"{q}"</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Secondary: Reflect with Guide (free-form) */}
      {!lateBloomer && (
        <motion.button
          onClick={onReflectWithGuide}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl glass-card border border-border/40 text-foreground font-display font-medium text-sm hover:bg-primary/5 transition-all"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          Open Chat with Guide
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </motion.button>
      )}

      {/* Tomorrow Glimpse */}
      {tomorrowTheme && (
        <motion.div
          className="glass-card rounded-2xl p-6 border-primary/10 overflow-hidden relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary/60">
                Tomorrow's Glimpse
              </span>
            </div>
            <motion.h3
              className="text-lg font-display font-semibold text-foreground mb-2 tracking-tight"
              initial={{ opacity: 0, filter: "blur(8px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.8, duration: 1.2 }}
            >
              {tomorrowTheme.title}
            </motion.h3>
            <motion.p
              className="text-sm font-display italic text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              "{tomorrowTheme.affirmation}"
            </motion.p>
          </div>
        </motion.div>
      )}
    </div>
  );
}