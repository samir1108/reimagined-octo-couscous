import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, BookOpen, Gamepad2, Eye, Sun, Moon, Wind, Leaf,
  Heart, Brain, Flame, Mountain, ArrowRight, Search, X, Clock, Tag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type TabId = "programs" | "practices" | "games" | "mirror" | "sessions";

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "programs",  label: "Programs",  icon: BookOpen },
  { id: "sessions",  label: "Sessions",  icon: Sun },
  { id: "practices", label: "Practices", icon: Leaf },
  { id: "games",     label: "Games",     icon: Gamepad2 },
  { id: "mirror",    label: "The Mirror", icon: Eye },
];

type Item = {
  kind: "program" | "session" | "practice" | "game";
  title: string;
  sub: string;
  tag: string;
  desc: string;
  meta?: string;
  color: string;
  icon?: any;
};

const PROGRAMS: Item[] = [
  { kind: "program", title: "Witness Foundations", sub: "Vedanta + Mindfulness", tag: "Foundation", meta: "7–40 days", color: "from-violet-500/30 to-purple-700/10",
    desc: "Build the muscle of witnessing thought without identification. Daily 12-minute sessions interleave breath, body, and the question: who is aware right now?" },
  { kind: "program", title: "Atma Vichara", sub: "Ramana Maharshi", tag: "Self-Inquiry", meta: "40 days", color: "from-amber-500/30 to-orange-700/10",
    desc: "The direct path. Trace every thought back to its source — the 'I'. A 40-day spiral that progressively quiets the mind into pure awareness." },
  { kind: "program", title: "Raja Yoga — Ashtanga", sub: "Patanjali · 8 limbs", tag: "Classical", meta: "90 days", color: "from-blue-500/30 to-cyan-700/10",
    desc: "The royal path. Yama, Niyama, Asana, Pranayama, Pratyahara, Dharana, Dhyana, Samadhi — sequenced over 90 days with daily practice and reflection." },
  { kind: "program", title: "Tantra — Inclusion", sub: "Kashmir Shaivism", tag: "Embodied", meta: "60 days", color: "from-rose-500/30 to-pink-700/10",
    desc: "Nothing rejected. Sensation, emotion, desire — all become doorways. Based on Vijnana Bhairava Tantra's 112 techniques, rotated to your state." },
  { kind: "program", title: "Pranayama", sub: "Science of vital breath", tag: "Energy", meta: "30 days", color: "from-emerald-500/30 to-teal-700/10",
    desc: "Master the breath, master the mind. Progressive ratios — Nadi Shodhana, Bhastrika, Kapalabhati — taught with real-time guidance and pace tracking." },
  { kind: "program", title: "Shadow Work", sub: "Jungian + Non-dual", tag: "Depth", meta: "40 days", color: "from-zinc-500/30 to-slate-700/10",
    desc: "Meet what you've disowned. Daily prompts surface projections, triggers, and inherited patterns — held with non-dual compassion, not therapy-speak." },
  { kind: "program", title: "Emotion Mapping", sub: "Somatic + Mindfulness", tag: "Somatic", meta: "7–30 days", color: "from-fuchsia-500/30 to-pink-700/10",
    desc: "Locate emotions in the body before naming them. A felt-sense vocabulary that re-wires reactivity into responsiveness." },
  { kind: "program", title: "Forgiveness", sub: "Release the energetic grip", tag: "Heart", meta: "21 days", color: "from-rose-400/30 to-red-700/10",
    desc: "Not condoning — releasing. A staged practice using Ho'oponopono, Tonglen, and witness inquiry to dissolve the charge a person or memory holds." },
  { kind: "program", title: "Karma Yoga", sub: "Bhagavad Gita", tag: "Action", meta: "40 days", color: "from-orange-500/30 to-amber-700/10",
    desc: "Action without attachment to fruit. Daily micro-experiments at work and home that turn ordinary life into the field of practice." },
  { kind: "program", title: "Workplace Loops", sub: "Modern · pattern interrupts", tag: "Modern", meta: "21 days", color: "from-sky-500/30 to-blue-700/10",
    desc: "Slack-refresh loop, meeting anxiety, inbox-as-dopamine. Detects your specific loops via behavioral signals and interrupts them mid-cycle." },
  { kind: "program", title: "Yoga Nidra", sub: "Conscious deep rest", tag: "Rest", meta: "30 days", color: "from-indigo-500/30 to-violet-700/10",
    desc: "Sleep with awareness. 20-minute guided rotations of consciousness that restore the nervous system more than 2 hours of sleep." },
  { kind: "program", title: "Mantra", sub: "Sacred sound as anchor", tag: "Sound", meta: "40 days", color: "from-yellow-500/30 to-amber-700/10",
    desc: "From Om to bija mantras to your personal seed sound. Vibration as the steadiest object of attention — for those who can't watch the breath." },
];

const SESSIONS: Item[] = [
  { kind: "session", title: "Morning Gate", sub: "Birth · intention · breath", tag: "Morning", meta: "12 min", color: "from-amber-500/30 to-orange-700/10", icon: Sun,
    desc: "A 9-step adaptive open. The engine reads your sleep, mood, and yesterday's signal — then composes the day's living theme. No two mornings are identical." },
  { kind: "session", title: "Midday Pulse", sub: "60–90s mood + micro-act", tag: "Midday", meta: "90 sec", color: "from-red-500/30 to-orange-700/10", icon: Flame,
    desc: "A check-in disguised as a breath. Catches drift early — before the loop runs. Often it's just one tap and one inhale. Sometimes it's a sentence." },
  { kind: "session", title: "Evening Integration", sub: "8-step Yoga-Nidra closing", tag: "Evening", meta: "15 min", color: "from-indigo-500/30 to-violet-700/10", icon: Moon,
    desc: "Reflects on what arose today. Closes open loops before sleep so they don't run all night. Adaptive — gentle on hard days, deep on spacious ones." },
  { kind: "session", title: "Night Witness", sub: "Pre-sleep stillness", tag: "Night", meta: "5–20 min", color: "from-zinc-700/40 to-slate-900/20", icon: Mountain,
    desc: "Pure dark-screen sit. No goals, no voice, no metrics. Just presence as you fall toward sleep. The most undervalued practice in the app." },
];

const PRACTICES: Item[] = [
  { kind: "practice", title: "Who Am I?", sub: "Ramana Maharshi", tag: "Self-inquiry", meta: "10–20 min", color: "from-amber-500/30 to-yellow-700/10",
    desc: "The most direct technique ever taught. Ramana asks one question, in many forms, until the questioner dissolves." },
  { kind: "practice", title: "Anapanasati", sub: "Gautama Buddha", tag: "Breath", meta: "15 min", color: "from-emerald-500/30 to-teal-700/10",
    desc: "Mindfulness of breathing in 16 stages — the Buddha's own practice. Voice-guided through each stage at your pace." },
  { kind: "practice", title: "Vipassana Body Scan", sub: "Gautama Buddha", tag: "Body", meta: "20 min", color: "from-blue-500/30 to-indigo-700/10",
    desc: "Sweep awareness from crown to toes, noticing sensation as it is — neither pushing nor pulling. The foundation of insight." },
  { kind: "practice", title: "Isha Kriya", sub: "Sadhguru", tag: "Kriya", meta: "12 min", color: "from-orange-500/30 to-red-700/10",
    desc: "A simple, powerful kriya for inner stability. Two phases — mantra and stillness — held by guided voice." },
  { kind: "practice", title: "Trataka", sub: "Sadhguru", tag: "Gaze", meta: "10 min", color: "from-yellow-500/30 to-amber-700/10",
    desc: "Steady gaze on a single point. Burns through scattered attention. Builds the capacity to hold one object until it dissolves." },
  { kind: "practice", title: "Dynamic Meditation", sub: "Osho", tag: "Cathartic", meta: "60 min", color: "from-fuchsia-500/30 to-pink-700/10",
    desc: "Five stages — chaotic breath, catharsis, jumping, silence, dance. For minds too active for stillness. Not for everyone." },
  { kind: "practice", title: "Choiceless Awareness", sub: "J. Krishnamurti", tag: "Witness", meta: "20 min", color: "from-zinc-500/30 to-slate-700/10",
    desc: "No technique. No object. Just watching what is — without choice, without effort, without conclusion." },
  { kind: "practice", title: "Sema Turn", sub: "Rumi", tag: "Movement", meta: "15 min", color: "from-rose-500/30 to-red-700/10",
    desc: "The whirling of the Mevlevi dervishes. Slow spiral movement as embodied prayer. Guided pace, with grounding cues." },
  { kind: "practice", title: "Walking Meditation", sub: "Thich Nhat Hanh", tag: "Body", meta: "15 min", color: "from-green-500/30 to-emerald-700/10",
    desc: "Each step a full arrival. Bell-paced walking that turns the commute into the practice. Indoor or outdoor." },
  { kind: "practice", title: "Tonglen", sub: "Padmasambhava", tag: "Heart", meta: "15 min", color: "from-pink-500/30 to-rose-700/10",
    desc: "Take in suffering on the in-breath, send out peace on the out-breath. The Tibetan practice of giving and receiving." },
  { kind: "practice", title: "Shikantaza", sub: "Dogen", tag: "Just sitting", meta: "20–40 min", color: "from-stone-500/30 to-zinc-700/10",
    desc: "Just sitting. No object, no goal, no method. The Soto Zen practice of full presence without agenda." },
  { kind: "practice", title: "Neti Neti", sub: "Shankara", tag: "Inquiry", meta: "15 min", color: "from-violet-500/30 to-purple-700/10",
    desc: "Not this, not this. A systematic disidentification from body, mind, role, story — until only awareness remains." },
];

const GAMES: Item[] = [
  { kind: "game", title: "Bell in the Wind", sub: "Attention", tag: "#01", meta: "5 min", color: "from-amber-500/30 to-yellow-700/10",
    desc: "A bell in a black void rings and fades. Your only task: don't look away. Tracks micro-distractions via gaze and tap patterns." },
  { kind: "game", title: "The Pause", sub: "Impulse", tag: "#10", meta: "90 sec", color: "from-red-500/30 to-rose-700/10",
    desc: "A red button. 90 seconds without pressing. Sounds easy. Reveals exactly how addicted to action you are." },
  { kind: "game", title: "The Silent Mountain", sub: "Silence", tag: "#06", meta: "10 min", color: "from-slate-500/30 to-stone-700/10",
    desc: "Do nothing. The mountain reveals itself only when you stop trying. Measures stillness via accelerometer." },
  { kind: "game", title: "Mirror Realm", sub: "Ego", tag: "#05", meta: "7 min", color: "from-violet-500/30 to-purple-700/10",
    desc: "Praise first, then insult. Notice the pull in both directions. A diagnostic for ego reactivity — gentler than it sounds." },
  { kind: "game", title: "Breath Temple", sub: "Nervous system", tag: "#02", meta: "10 min", color: "from-emerald-500/30 to-teal-700/10",
    desc: "A lotus that breathes with you. Microphone reads breath pace and entrains the visual to your rhythm." },
  { kind: "game", title: "Emotional Resonance", sub: "Compassion", tag: "#07", meta: "8 min", color: "from-pink-500/30 to-rose-700/10",
    desc: "Listen to a voice in distress without interrupting, fixing, or scrolling away. Measures presence under emotional pressure." },
  { kind: "game", title: "Non-Dual Door", sub: "Integration", tag: "#12", meta: "5 min", color: "from-indigo-500/30 to-violet-700/10",
    desc: "A door. Look without tapping. The reward isn't on the other side — it's in not needing the other side." },
  { kind: "game", title: "Body Scanner", sub: "Inner sensing", tag: "#08", meta: "10 min", color: "from-blue-500/30 to-cyan-700/10",
    desc: "Tap only where you actually feel — not where you think you should feel. Builds interoceptive honesty." },
];

const MIRROR_ITEM: Item = {
  kind: "program", title: "The Mirror", sub: "Free diagnostic · no signup", tag: "Mirror", meta: "5 min", color: "from-primary/30 to-amber-500/10",
  desc: "Answer 5–8 adaptive questions about your mind, body, and patterns. Receive your archetype, 3 detected loops, your V-Band placement on the 0–10 consciousness spectrum, dimension scores across 12 axes, and 3 personalized practices keyed to what surfaced. No account required.",
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: Math.min(i, 12) * 0.03, duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  }),
};

const ItemCard = ({ item, i, onOpen }: { item: Item; i: number; onOpen: (it: Item) => void }) => {
  const Icon = item.icon;
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(item)}
      variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
      whileHover={{ y: -4 }}
      className={`group relative text-left rounded-2xl border border-border/40 bg-gradient-to-br ${item.color} p-5 overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all`}
    >
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/15 transition-colors" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {Icon && (
              <div className="shrink-0 w-9 h-9 rounded-full bg-background/40 border border-border/30 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
            )}
            <h3 className="font-display text-base md:text-lg text-foreground truncate">{item.title}</h3>
          </div>
          {item.meta && (
            <span className="text-[10px] font-body uppercase tracking-wider text-muted-foreground bg-background/40 px-2 py-1 rounded-full whitespace-nowrap">
              {item.meta}
            </span>
          )}
        </div>
        <p className="text-xs font-body text-muted-foreground line-clamp-2">{item.sub}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] font-body uppercase tracking-wider text-primary/70">{item.tag}</span>
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </motion.button>
  );
};

const InsideTheAppSection = () => {
  const [tab, setTab] = useState<TabId>("programs");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Item | null>(null);
  const navigate = useNavigate();

  const dataset = useMemo<Item[]>(() => {
    if (tab === "programs")  return PROGRAMS;
    if (tab === "sessions")  return SESSIONS;
    if (tab === "practices") return PRACTICES;
    if (tab === "games")     return GAMES;
    return [MIRROR_ITEM];
  }, [tab]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return dataset;
    return dataset.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        it.sub.toLowerCase().includes(q) ||
        it.tag.toLowerCase().includes(q) ||
        it.desc.toLowerCase().includes(q),
    );
  }, [dataset, query]);

  return (
    <section className="py-32 px-6 relative overflow-hidden" id="inside-the-app">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-body text-primary">Inside the App</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-light mb-4 tracking-tight">
            Not another wellness app.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
              An operating system for the inner life.
            </span>
          </h2>
          <p className="text-base md:text-lg font-body text-muted-foreground max-w-2xl mx-auto">
            Search across programs, daily sessions, master-led practices, consciousness games and the Mirror.
            Tap any card to look inside.
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          className="max-w-2xl mx-auto mb-6"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
        >
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Atma Vichara, breath, Ramana, shadow, witness…"
              className="w-full pl-14 pr-12 py-4 rounded-full bg-card/40 backdrop-blur-xl border border-border/50 focus:border-primary/60 focus:bg-card/60 outline-none font-body text-base text-foreground placeholder:text-muted-foreground/70 transition-all shadow-lg shadow-black/20"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/60 border border-border/40 flex items-center justify-center hover:bg-background"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-body transition-all ${
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30 scale-105"
                    : "bg-card/40 backdrop-blur-sm border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab + query}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground font-body">
                Nothing matches "{query}". Try a master's name, a tradition, or a feeling.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((it, i) => (
                  <ItemCard key={it.title} item={it} i={i} onOpen={setOpen} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Mirror CTA — always visible footer when on mirror tab */}
        {tab === "mirror" && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/?mirror=open")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-body text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Begin the Mirror
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
              onClick={() => setOpen(null)}
            />
            <motion.div
              initial={{ scale: 0.94, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
              className={`relative w-full max-w-2xl rounded-3xl border border-border/60 bg-gradient-to-br ${open.color} bg-card/95 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden`}
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
              <button
                onClick={() => setOpen(null)}
                aria-label="Close"
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/60 border border-border/40 flex items-center justify-center hover:bg-background z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative p-7 md:p-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-[10px] font-body uppercase tracking-wider text-primary mb-5">
                  <Tag className="w-3 h-3" />
                  {open.kind} · {open.tag}
                </div>

                <h3 className="font-display text-3xl md:text-4xl text-foreground mb-2 leading-tight">
                  {open.title}
                </h3>
                <p className="text-sm md:text-base font-body text-primary/80 mb-5">{open.sub}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {open.meta && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-body text-muted-foreground bg-background/40 border border-border/40 px-3 py-1.5 rounded-full">
                      <Clock className="w-3 h-3" /> {open.meta}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-xs font-body text-muted-foreground bg-background/40 border border-border/40 px-3 py-1.5 rounded-full">
                    Adaptive · personalized to your state
                  </span>
                </div>

                <p className="text-base font-body text-foreground/85 leading-relaxed mb-8">
                  {open.desc}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => { setOpen(null); navigate("/auth"); }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-body text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                  >
                    Begin {open.title}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setOpen(null)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-border/50 bg-background/40 font-body text-sm text-foreground/80 hover:bg-background/60 transition-colors"
                  >
                    Keep exploring
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default InsideTheAppSection;
