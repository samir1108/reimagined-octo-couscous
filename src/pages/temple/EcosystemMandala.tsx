import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, X, Sparkles } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   The Nalanda Mandala — a living knowledge ecosystem.
   Consciousness at the center. Every lineage points home.
   ──────────────────────────────────────────────────────────────────────── */

type SubBranch = {
  id: string;
  name: string;
  blurb: string;
  figures: string[];
};

type Lineage = {
  id: string;
  name: string;
  tagline: string;
  accent: string; // hsl triplet
  glyph: string; // unicode mark
  angle: number; // degrees on the wheel
  subs: SubBranch[];
};

const LINEAGES: Lineage[] = [
  {
    id: "yoga",
    name: "Yoga & Tantra",
    tagline: "The science of inner technology",
    accent: "38 95% 60%",
    glyph: "ॐ",
    angle: -90,
    subs: [
      { id: "hatha", name: "Hatha", blurb: "Sun & moon — balancing the body.", figures: ["Swatmarama", "Gheranda"] },
      { id: "raja", name: "Raja", blurb: "The eight limbs of Patanjali.", figures: ["Patanjali", "Vyasa"] },
      { id: "bhakti", name: "Bhakti", blurb: "The path of devotion.", figures: ["Mirabai", "Chaitanya", "Ramakrishna"] },
      { id: "jnana", name: "Jnana", blurb: "Self-inquiry & discrimination.", figures: ["Ramana", "Adi Shankara", "Nisargadatta"] },
      { id: "kriya", name: "Kriya", blurb: "Energetic refinement.", figures: ["Yogananda", "Lahiri Mahasaya"] },
      { id: "tantra", name: "Kashmir Shaivism", blurb: "Recognition — Pratyabhijna.", figures: ["Abhinavagupta", "Lakshman Joo"] },
    ],
  },
  {
    id: "religion",
    name: "World Religions",
    tagline: "One mountain, many trails",
    accent: "20 88% 58%",
    glyph: "✶",
    angle: 0,
    subs: [
      { id: "hindu", name: "Hindu", blurb: "Vedanta, Bhakti, Tantra streams.", figures: ["Adi Shankara", "Ramana", "Ramakrishna"] },
      { id: "buddhist", name: "Buddhist", blurb: "Theravada, Zen, Vajrayana.", figures: ["Buddha", "Nagarjuna", "Dogen", "Padmasambhava"] },
      { id: "sufi", name: "Sufi / Islamic", blurb: "The path of the heart.", figures: ["Rumi", "Ibn Arabi", "Hafiz"] },
      { id: "christian", name: "Christian Mystic", blurb: "Contemplative silence.", figures: ["Meister Eckhart", "Thomas Merton", "Teresa of Ávila"] },
      { id: "taoist", name: "Taoist", blurb: "Effortless flow with the Way.", figures: ["Lao Tzu", "Chuang Tzu"] },
      { id: "kabbalah", name: "Kabbalah", blurb: "The tree of life.", figures: ["Isaac Luria", "Moses de León"] },
    ],
  },
  {
    id: "philosophy",
    name: "Philosophy",
    tagline: "The architecture of mind",
    accent: "210 70% 65%",
    glyph: "Φ",
    angle: 90,
    subs: [
      { id: "advaita", name: "Advaita Vedanta", blurb: "Non-duality.", figures: ["Adi Shankara", "Gaudapada"] },
      { id: "stoic", name: "Stoicism", blurb: "Sovereignty of the inner citadel.", figures: ["Marcus Aurelius", "Epictetus", "Seneca"] },
      { id: "pheno", name: "Phenomenology", blurb: "First-person experience as ground.", figures: ["Husserl", "Merleau-Ponty"] },
      { id: "existential", name: "Existentialism", blurb: "Meaning made, not found.", figures: ["Kierkegaard", "Camus", "Sartre"] },
      { id: "process", name: "Process / Integral", blurb: "Reality as becoming.", figures: ["Whitehead", "Sri Aurobindo", "Ken Wilber"] },
    ],
  },
  {
    id: "neuro",
    name: "Neuroscience & Body",
    tagline: "Where biology meets awareness",
    accent: "150 60% 55%",
    glyph: "≈",
    angle: 180,
    subs: [
      { id: "dmn", name: "Default Mode Network", blurb: "The self-narrating brain.", figures: ["Raichle", "Carhart-Harris"] },
      { id: "polyvagal", name: "Polyvagal Theory", blurb: "The nervous system's social map.", figures: ["Stephen Porges"] },
      { id: "interoception", name: "Interoception", blurb: "Listening to the body's signals.", figures: ["Bud Craig", "Sarah Garfinkel"] },
      { id: "flow", name: "Flow States", blurb: "The neurochemistry of absorption.", figures: ["Csikszentmihalyi", "Kotler"] },
      { id: "psyche", name: "Psychedelic Research", blurb: "Ego dissolution under the microscope.", figures: ["Pollan", "Griffiths", "Nutt"] },
      { id: "somatic", name: "Somatic Therapy", blurb: "Trauma stored, trauma released.", figures: ["van der Kolk", "Peter Levine"] },
    ],
  },
];

export default function EcosystemMandala() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);
  const [active, setActive] = useState<{ lineage: Lineage; sub: SubBranch } | null>(null);

  // Radial geometry
  const R_LINEAGE = 200; // distance of main petals from center
  const R_SUB = 110; // distance of sub-branches from their petal

  const positions = useMemo(() => {
    return LINEAGES.map((l) => {
      const rad = (l.angle * Math.PI) / 180;
      return { ...l, cx: Math.cos(rad) * R_LINEAGE, cy: Math.sin(rad) * R_LINEAGE };
    });
  }, []);

  return (
    <section className="relative mt-28 mb-10">
      {/* Heading */}
      <div className="text-center mb-12 px-4">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-amber-200/70 mb-4">
          <Sparkles className="w-3 h-3" /> The Nalanda Mandala <Sparkles className="w-3 h-3" />
        </div>
        <h2 className="text-3xl md:text-5xl font-serif text-amber-50 leading-tight mb-3">
          One mountain. <span className="text-amber-200/70">Many trails.</span>
        </h2>
        <p className="text-amber-100/60 max-w-xl mx-auto text-sm md:text-base">
          Yoga, religion, philosophy, neuroscience — every lineage is a different finger pointing
          at the same moon. Touch a petal to see its sub-branches. Open one to meet its masters.
        </p>
      </div>

      {/* The wheel */}
      <div className="relative mx-auto w-full max-w-[720px] aspect-square">
        {/* Ambient rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[1, 0.75, 0.5, 0.3].map((s, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-amber-200/10"
              style={{ width: `${s * 100}%`, height: `${s * 100}%` }}
              animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
              transition={{ duration: 60 + i * 20, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </div>

        {/* SVG connecting lines (lineage → center, and sub-branches when hovered) */}
        <svg
          viewBox="-360 -360 720 720"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <defs>
            {LINEAGES.map((l) => (
              <radialGradient key={l.id} id={`grad-${l.id}`} cx="0" cy="0" r="1">
                <stop offset="0%" stopColor={`hsl(${l.accent} / 0.7)`} />
                <stop offset="100%" stopColor={`hsl(${l.accent} / 0)`} />
              </radialGradient>
            ))}
          </defs>
          {positions.map((p) => (
            <line
              key={p.id}
              x1={0}
              y1={0}
              x2={p.cx}
              y2={p.cy}
              stroke={`hsl(${p.accent} / ${hovered === p.id ? 0.7 : 0.25})`}
              strokeWidth={hovered === p.id ? 1.5 : 0.8}
              style={{ transition: "all 400ms ease" }}
            />
          ))}

          {/* Sub-branches when hovered */}
          {positions
            .filter((p) => p.id === hovered)
            .map((p) =>
              p.subs.map((s, i) => {
                const spread = 110; // angular spread degrees
                const baseAngle = p.angle;
                const step = spread / Math.max(p.subs.length - 1, 1);
                const subAngle = baseAngle - spread / 2 + step * i;
                const rad = (subAngle * Math.PI) / 180;
                const sx = p.cx + Math.cos(rad) * R_SUB;
                const sy = p.cy + Math.sin(rad) * R_SUB;
                return (
                  <motion.line
                    key={s.id}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                    x1={p.cx}
                    y1={p.cy}
                    x2={sx}
                    y2={sy}
                    stroke={`hsl(${p.accent} / 0.5)`}
                    strokeWidth={0.6}
                    strokeDasharray="2 3"
                  />
                );
              }),
            )}
        </svg>

        {/* Center: Consciousness */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex items-center justify-center"
          >
            <div
              className="absolute w-44 h-44 rounded-full blur-2xl"
              style={{ background: "radial-gradient(circle, hsl(38 95% 60% / 0.4), transparent 70%)" }}
            />
            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border border-amber-200/40 bg-black/70 backdrop-blur flex flex-col items-center justify-center text-center">
              <div className="text-amber-200 text-3xl font-serif leading-none">अ</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-amber-100/80 mt-1.5">
                Consciousness
              </div>
            </div>
          </motion.div>
        </div>

        {/* Lineage petals */}
        {positions.map((p) => (
          <button
            key={p.id}
            onMouseEnter={() => setHovered(p.id)}
            onMouseLeave={() => setHovered((h) => (h === p.id ? null : h))}
            onFocus={() => setHovered(p.id)}
            onBlur={() => setHovered((h) => (h === p.id ? null : h))}
            className="absolute group"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${p.cx}px), calc(-50% + ${p.cy}px))`,
            }}
            aria-label={p.name}
          >
            <motion.div
              whileHover={{ scale: 1.08 }}
              className="relative flex flex-col items-center"
            >
              <div
                className="absolute -inset-6 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition"
                style={{ background: `radial-gradient(circle, hsl(${p.accent} / 0.5), transparent 70%)` }}
              />
              <div
                className="relative w-20 h-20 md:w-24 md:h-24 rounded-full border bg-black/60 backdrop-blur flex items-center justify-center text-3xl font-serif transition"
                style={{
                  borderColor: `hsl(${p.accent} / 0.45)`,
                  color: `hsl(${p.accent})`,
                  boxShadow: hovered === p.id ? `0 0 40px hsl(${p.accent} / 0.5)` : "none",
                }}
              >
                {p.glyph}
              </div>
              <div className="absolute top-full mt-3 whitespace-nowrap text-center">
                <div className="text-amber-50 text-sm md:text-base font-medium">{p.name}</div>
                <div className="text-amber-100/50 text-[10px] uppercase tracking-[0.2em] mt-0.5">
                  {p.subs.length} streams
                </div>
              </div>
            </motion.div>

            {/* Sub-branch nodes */}
            <AnimatePresence>
              {hovered === p.id &&
                p.subs.map((s, i) => {
                  const spread = 110;
                  const step = spread / Math.max(p.subs.length - 1, 1);
                  const subAngle = p.angle - spread / 2 + step * i;
                  const rad = (subAngle * Math.PI) / 180;
                  const sx = Math.cos(rad) * R_SUB;
                  const sy = Math.sin(rad) * R_SUB;
                  return (
                    <motion.span
                      key={s.id}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActive({ lineage: p, sub: s });
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto"
                      style={{ left: `calc(50% + ${sx}px)`, top: `calc(50% + ${sy}px)` }}
                    >
                      <span
                        className="block px-2.5 py-1 rounded-full text-[10px] md:text-xs whitespace-nowrap border bg-black/80 backdrop-blur hover:scale-110 transition"
                        style={{
                          borderColor: `hsl(${p.accent} / 0.5)`,
                          color: `hsl(${p.accent})`,
                        }}
                      >
                        {s.name}
                      </span>
                    </motion.span>
                  );
                })}
            </AnimatePresence>
          </button>
        ))}
      </div>

      {/* Mobile fallback: simple expandable list */}
      <div className="md:hidden mt-10 px-4 space-y-3">
        {LINEAGES.map((l) => (
          <details
            key={l.id}
            className="rounded-2xl border border-amber-100/15 bg-black/40 overflow-hidden"
          >
            <summary
              className="cursor-pointer list-none p-4 flex items-center justify-between"
              style={{ color: `hsl(${l.accent})` }}
            >
              <span className="flex items-center gap-3">
                <span className="text-xl font-serif">{l.glyph}</span>
                <span className="text-amber-50 text-sm font-medium">{l.name}</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-amber-100/50">
                {l.subs.length}
              </span>
            </summary>
            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              {l.subs.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActive({ lineage: l, sub: s })}
                  className="text-left text-xs px-3 py-2 rounded-lg border border-amber-100/10 bg-black/40 hover:bg-amber-100/5"
                  style={{ color: `hsl(${l.accent})` }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </details>
        ))}
      </div>

      {/* Lineage card modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ y: 30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl border bg-gradient-to-b from-black to-zinc-950 p-7"
              style={{ borderColor: `hsl(${active.lineage.accent} / 0.4)` }}
            >
              <button
                onClick={() => setActive(null)}
                className="absolute top-4 right-4 text-amber-100/50 hover:text-amber-100"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div
                className="text-[10px] uppercase tracking-[0.3em] mb-2"
                style={{ color: `hsl(${active.lineage.accent})` }}
              >
                {active.lineage.name}
              </div>
              <h3 className="text-2xl font-serif text-amber-50 mb-2">{active.sub.name}</h3>
              <p className="text-amber-100/70 text-sm mb-5">{active.sub.blurb}</p>

              <div className="mb-6">
                <div className="text-[10px] uppercase tracking-[0.25em] text-amber-100/50 mb-2">
                  Voices in this stream
                </div>
                <div className="flex flex-wrap gap-2">
                  {active.sub.figures.map((f) => (
                    <span
                      key={f}
                      className="text-xs px-3 py-1.5 rounded-full border border-amber-100/15 text-amber-100/85 bg-black/40"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate(`/auth?redirect=/app/masters`)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition"
                style={{
                  background: `hsl(${active.lineage.accent} / 0.15)`,
                  color: `hsl(${active.lineage.accent})`,
                  border: `1px solid hsl(${active.lineage.accent} / 0.4)`,
                }}
              >
                Enter this path <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
