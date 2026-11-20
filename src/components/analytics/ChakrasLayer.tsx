import { motion } from "framer-motion";
import type { ConsciousnessProfile } from "@/hooks/useConsciousnessEngine";
import { YogaPathConstellation } from "./YogaPathConstellation";

const spring = { type: "spring", stiffness: 300, damping: 30 } as const;

const CHAKRAS = [
  { key: "crown", label: "Crown", sanskrit: "Sahasrāra", color: "hsl(280 70% 65%)", emoji: "👑" },
  { key: "third_eye", label: "Third Eye", sanskrit: "Ājñā", color: "hsl(240 60% 60%)", emoji: "🔮" },
  { key: "throat", label: "Throat", sanskrit: "Viśuddha", color: "hsl(200 70% 55%)", emoji: "💎" },
  { key: "heart", label: "Heart", sanskrit: "Anāhata", color: "hsl(150 60% 50%)", emoji: "💚" },
  { key: "solar", label: "Solar Plexus", sanskrit: "Maṇipūra", color: "hsl(45 90% 55%)", emoji: "☀️" },
  { key: "sacral", label: "Sacral", sanskrit: "Svādhiṣṭhāna", color: "hsl(25 85% 55%)", emoji: "🌊" },
  { key: "root", label: "Root", sanskrit: "Mūlādhāra", color: "hsl(0 70% 50%)", emoji: "🔴" },
];

const YOGA_PATHS = [
  { key: "jnana", label: "Jñāna", desc: "Path of Knowledge", color: "hsl(210 80% 60%)" },
  { key: "bhakti", label: "Bhakti", desc: "Path of Devotion", color: "hsl(330 70% 60%)" },
  { key: "karma", label: "Karma", desc: "Path of Action", color: "hsl(150 60% 50%)" },
  { key: "raja", label: "Rāja", desc: "Path of Meditation", color: "hsl(270 70% 60%)" },
];

const H_CAPACITIES = [
  "wisdom", "courage", "inquiry", "humility", "patience", "presence",
  "awareness", "stillness", "compassion", "dedication", "equanimity", "generosity",
];

interface Props {
  profile?: ConsciousnessProfile;
}

export function ChakrasLayer({ profile }: Props) {
  const chakras = (profile as any)?.chakras || {};
  const pathAffinity = (profile?.yoga_path_affinity || {}) as Record<string, number>;
  const hCaps = (profile?.h_capacities || {}) as Record<string, number>;
  const dominantPath = profile?.dominant_path;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring}>
        <h2 className="text-lg font-display font-bold text-foreground">Energy Map</h2>
        <p className="text-sm text-muted-foreground font-body">Your energetic blueprint across chakras and yoga paths</p>
      </motion.div>

      {/* Chakra Stack */}
      <div className="space-y-2">
        {CHAKRAS.map((ch, i) => {
          const val = Number(chakras[ch.key]) || 0;
          return (
            <motion.div
              key={ch.key}
              className="glass-card rounded-xl p-3 flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: i * 0.05 }}
            >
              <span className="text-lg">{ch.emoji}</span>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-display font-medium text-foreground">{ch.label}</span>
                  <span className="text-[9px] text-muted-foreground font-body italic">{ch.sanskrit}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: ch.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(5, val * 10)}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                  />
                </div>
              </div>
              <span className="text-xs font-display font-bold text-foreground w-8 text-right">{val.toFixed(1)}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Yoga Path Affinity */}
      <YogaPathConstellation
        affinity={pathAffinity}
        dominantPath={dominantPath}
      />
      <motion.div
        className="glass-card rounded-2xl p-5 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.35 }}
      >
        <h3 className="font-display font-semibold text-foreground text-sm">Yoga Path Affinity</h3>
        {dominantPath && (
          <p className="text-xs text-primary font-body">Dominant: <span className="font-medium capitalize">{dominantPath}</span></p>
        )}
        <div className="space-y-2">
          {YOGA_PATHS.map((p) => {
            const val = Number(pathAffinity[p.key]) || 0;
            return (
              <div key={p.key} className="space-y-1">
                <div className="flex justify-between text-[10px] font-body">
                  <span className="text-foreground font-medium">{p.label} <span className="text-muted-foreground">— {p.desc}</span></span>
                  <span className="text-muted-foreground">{Math.round(val * 10)}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: p.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(3, val * 10)}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* H-Capacities Heat Grid */}
      <motion.div
        className="glass-card rounded-2xl p-5 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.45 }}
      >
        <h3 className="font-display font-semibold text-foreground text-sm">Human Capacities</h3>
        <div className="grid grid-cols-3 gap-2">
          {H_CAPACITIES.map((cap) => {
            const val = Number(hCaps[cap]) || 0;
            const intensity = Math.max(0.1, val / 10);
            return (
              <motion.div
                key={cap}
                className="rounded-lg p-2 text-center"
                style={{ backgroundColor: `hsl(43 96% 56% / ${intensity * 0.3})` }}
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-[10px] font-body text-foreground capitalize">{cap}</p>
                <p className="text-xs font-display font-bold text-foreground">{val.toFixed(1)}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
