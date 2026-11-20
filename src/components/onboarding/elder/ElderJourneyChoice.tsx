/**
 * ElderJourneyChoice — cinematic, screen-by-screen "choose your path ahead".
 *
 * Comes after the Elder reading. Walks the seeker through each of the four
 * paths (Karma / Bhakti / Jnana / Raja) one screen at a time with a short
 * description and what the first 7 days will feel like. The Elder's
 * recommended path is highlighted. The seeker can tap a path at any time, or
 * step through all four and confirm at the end.
 *
 * Pure presentation — committing the choice is delegated to onChoose(path).
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hammer, Heart, BookOpen, Mountain, Check, ArrowRight, ArrowLeft } from "lucide-react";
import type { ElderReading as Reading } from "./ElderDialogue";

type Path = Reading["recommendedPath"];

interface Props {
  reading: Reading;
  name: string;
  saving?: boolean;
  onChoose: (path: Path) => void;
}

interface PathDef {
  id: Path;
  title: string;
  tagline: string;
  description: string;
  firstWeek: string[];
  Icon: typeof Hammer;
  glyph: string;
}

const PATHS: PathDef[] = [
  {
    id: "karma",
    title: "Karma",
    tagline: "The path of action",
    description:
      "You meet the divine through what you do. Work becomes practice. Service becomes prayer. Daily life is the temple.",
    firstWeek: ["Daily action observed", "One offered task", "Witness the doer"],
    Icon: Hammer,
    glyph: "⚒",
  },
  {
    id: "bhakti",
    title: "Bhakti",
    tagline: "The path of the heart",
    description:
      "You meet the divine through love. Devotion melts the small self. The heart becomes the gate.",
    firstWeek: ["Heart-centered breath", "One thing loved openly", "Soft gratitude practice"],
    Icon: Heart,
    glyph: "❤",
  },
  {
    id: "jnana",
    title: "Jnana",
    tagline: "The path of inquiry",
    description:
      "You meet the divine through knowing. Each thought is questioned to its root. Truth is found, not believed.",
    firstWeek: ["Who am I? — daily", "Track one assumption", "Sit with not-knowing"],
    Icon: BookOpen,
    glyph: "📖",
  },
  {
    id: "raja",
    title: "Raja",
    tagline: "The path of mastery",
    description:
      "You meet the divine through stillness. Body, breath and mind are tuned like instruments until silence sings.",
    firstWeek: ["Posture + breath", "10-min sitting", "Witness the witness"],
    Icon: Mountain,
    glyph: "⛰",
  },
];

export default function ElderJourneyChoice({ reading, name, saving, onChoose }: Props) {
  const recommended = reading.recommendedPath;
  // Order: recommended first so the Elder's pick lands first
  const ordered = [
    PATHS.find((p) => p.id === recommended)!,
    ...PATHS.filter((p) => p.id !== recommended),
  ];

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<Path | null>(null);
  const [phase, setPhase] = useState<"tour" | "confirm">("tour");

  const current = ordered[idx];
  const isRecommended = current.id === recommended;
  const isLast = idx === ordered.length - 1;

  const choose = (p: Path) => {
    setSelected(p);
    setPhase("confirm");
  };

  return (
    <div className="fixed inset-0 z-[120] bg-background overflow-hidden flex flex-col">
      {/* Cosmic backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 25%, hsl(var(--primary) / 0.22), transparent 60%), radial-gradient(circle at 50% 90%, hsl(var(--primary) / 0.10), transparent 70%)",
        }}
      />
      {/* Drifting motes */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 22 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/50"
            style={{ left: `${(i * 41) % 100}%`, top: `${(i * 59) % 100}%` }}
            animate={{ opacity: [0.1, 0.6, 0.1], scale: [0.6, 1.3, 0.6] }}
            transition={{ duration: 4 + (i % 5), repeat: Infinity, delay: (i % 7) * 0.3 }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 pt-7 pb-3">
        <div className="max-w-md mx-auto">
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground text-center">
            Choose your path
          </p>
          {phase === "tour" ? (
            <div className="mt-3 flex items-center justify-center gap-1.5">
              {ordered.map((p, i) => (
                <span
                  key={p.id}
                  className={`h-[3px] rounded-full transition-all duration-500 ${
                    i === idx ? "w-8 bg-primary" : i < idx ? "w-4 bg-primary/60" : "w-4 bg-border/40"
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {phase === "tour" ? (
              <motion.div
                key={`tour-${current.id}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                {/* Glyph orb */}
                <motion.div
                  className="mx-auto mb-6 w-28 h-28 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "radial-gradient(circle, hsl(var(--primary) / 0.45), hsl(var(--primary) / 0.05) 70%)",
                    boxShadow: "0 0 70px hsl(var(--primary) / 0.45)",
                  }}
                  animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <current.Icon className="w-10 h-10 text-primary" />
                </motion.div>

                {isRecommended && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-[10px] uppercase tracking-[0.3em] text-primary mb-2"
                  >
                    The Elder suggests this for you
                  </motion.p>
                )}

                <h1 className="font-display text-3xl text-foreground">{current.title}</h1>
                <p className="mt-1 text-sm text-muted-foreground italic">{current.tagline}</p>

                <p className="mt-6 text-foreground/85 text-base leading-relaxed">
                  {current.description}
                </p>

                <div className="mt-7 text-left rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm px-4 py-4">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    Your first week, if you walk this
                  </p>
                  <ul className="space-y-1.5">
                    {current.firstWeek.map((line, i) => (
                      <motion.li
                        key={line}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.15 }}
                        className="flex items-center gap-2 text-sm text-foreground/85"
                      >
                        <span className="w-1 h-1 rounded-full bg-primary/70" />
                        {line}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col gap-2">
                  <button
                    onClick={() => choose(current.id)}
                    className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
                    style={{ boxShadow: "0 0 28px hsl(var(--primary) / 0.4)" }}
                  >
                    Walk the {current.title} path
                  </button>
                  <div className="flex items-center justify-between mt-1">
                    <button
                      onClick={() => setIdx((i) => Math.max(0, i - 1))}
                      disabled={idx === 0}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition disabled:opacity-30"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back
                    </button>
                    {!isLast ? (
                      <button
                        onClick={() => setIdx((i) => i + 1)}
                        className="flex items-center gap-1.5 text-xs text-primary/80 hover:text-primary transition"
                      >
                        See next path
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">All four shown</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <motion.div
                  className="mx-auto mb-6 w-32 h-32 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "radial-gradient(circle, hsl(var(--primary) / 0.55), hsl(var(--primary) / 0.05) 70%)",
                    boxShadow: "0 0 90px hsl(var(--primary) / 0.55)",
                  }}
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Check className="w-12 h-12 text-primary" />
                </motion.div>

                <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-3">
                  {name ? `${name}, your path` : "Your path"}
                </p>
                <h1 className="font-display text-4xl text-foreground">
                  {PATHS.find((p) => p.id === selected)?.title}
                </h1>
                <p className="mt-3 text-sm text-muted-foreground italic max-w-xs mx-auto">
                  {PATHS.find((p) => p.id === selected)?.tagline} — this becomes the spine of the next 90 days.
                </p>

                <div className="mt-10 flex flex-col gap-2">
                  <button
                    onClick={() => selected && onChoose(selected)}
                    disabled={saving || !selected}
                    className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
                    style={{ boxShadow: "0 0 32px hsl(var(--primary) / 0.45)" }}
                  >
                    {saving ? "Sealing your path…" : "Begin"}
                  </button>
                  <button
                    onClick={() => setPhase("tour")}
                    disabled={saving}
                    className="text-xs text-muted-foreground hover:text-foreground transition mt-2 disabled:opacity-50"
                  >
                    ← Reconsider
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
