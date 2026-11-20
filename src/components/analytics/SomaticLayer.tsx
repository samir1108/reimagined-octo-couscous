import { motion } from "framer-motion";
import { Activity, MapPin, LayoutGrid } from "lucide-react";
import { ProgressRing } from "./ProgressRing";

const spring = { type: "spring", stiffness: 300, damping: 30 } as const;

const BODY_AREAS: { key: string; label: string; x: number; y: number }[] = [
  { key: "head", label: "Head", x: 50, y: 8 },
  { key: "throat", label: "Throat", x: 50, y: 18 },
  { key: "shoulders", label: "Shoulders", x: 50, y: 25 },
  { key: "chest", label: "Chest", x: 50, y: 33 },
  { key: "stomach", label: "Stomach", x: 50, y: 45 },
  { key: "lower_back", label: "Lower Back", x: 50, y: 55 },
  { key: "hips", label: "Hips", x: 50, y: 62 },
  { key: "legs", label: "Legs", x: 50, y: 78 },
  { key: "feet", label: "Feet", x: 50, y: 92 },
];

const DOMAIN_CONFIG: Record<string, { emoji: string; color: string }> = {
  health: { emoji: "💪", color: "hsl(150 60% 50%)" },
  relationships: { emoji: "💗", color: "hsl(330 70% 60%)" },
  career: { emoji: "💼", color: "hsl(210 60% 60%)" },
  finances: { emoji: "💰", color: "hsl(45 90% 55%)" },
  creativity: { emoji: "🎨", color: "hsl(270 70% 60%)" },
  spirituality: { emoji: "🕉️", color: "hsl(280 60% 65%)" },
  family: { emoji: "🏠", color: "hsl(30 70% 55%)" },
  social: { emoji: "👥", color: "hsl(180 50% 50%)" },
};

interface Props {
  psycheData: any;
}

export function SomaticLayer({ psycheData }: Props) {
  const somatic = psycheData?.somatic_map || { tension_areas: [], emotion_body_map: {}, body_awareness_score: 0, chronic_patterns: [] };
  const lifeDomains = psycheData?.life_domains || {};

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring}>
        <h2 className="text-lg font-display font-bold text-foreground">Body & Life Map</h2>
        <p className="text-sm text-muted-foreground font-body">Where emotions live in your body and the health of your life domains</p>
      </motion.div>

      {/* Somatic Map */}
      <motion.div
        className="glass-card rounded-2xl p-5 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.05 }}
      >
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">Somatic Map</h3>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <ProgressRing value={Number(somatic.body_awareness_score)} max={10} size={56} strokeWidth={4}>
            <span className="text-xs font-display font-bold text-foreground">{Number(somatic.body_awareness_score).toFixed(1)}</span>
          </ProgressRing>
          <span className="text-xs text-muted-foreground font-body">Body Awareness</span>
        </div>

        {/* Body silhouette with tension points */}
        <div className="relative h-64 glass-card rounded-xl overflow-hidden">
          {/* Simple body outline */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl opacity-10">🧍</span>
          </div>

          {BODY_AREAS.map((area) => {
            const isTense = somatic.tension_areas?.includes(area.key);
            const emotion = (somatic.emotion_body_map as Record<string, string>)?.[area.key];
            return (
              <motion.div
                key={area.key}
                className="absolute flex items-center gap-1"
                style={{ left: `${area.x}%`, top: `${area.y}%`, transform: "translate(-50%, -50%)" }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + BODY_AREAS.indexOf(area) * 0.04 }}
              >
                <motion.div
                  className={`w-3 h-3 rounded-full ${isTense ? 'bg-destructive' : 'bg-muted-foreground/30'}`}
                  animate={isTense ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : {}}
                  transition={isTense ? { duration: 2, repeat: Infinity } : {}}
                />
                <div className="flex flex-col">
                  <span className={`text-[8px] font-body whitespace-nowrap ${isTense ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                    {area.label}
                  </span>
                  {emotion && (
                    <span className="text-[7px] text-primary font-body capitalize">{emotion}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {somatic.tension_areas?.length > 0 && (
          <div>
            <span className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">Tension Areas</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {somatic.tension_areas.map((area: string, i: number) => (
                <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-destructive/10 text-destructive font-body capitalize">{area.replace(/_/g, " ")}</span>
              ))}
            </div>
          </div>
        )}

        {somatic.chronic_patterns?.length > 0 && (
          <div>
            <span className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">Chronic Patterns</span>
            {somatic.chronic_patterns.map((p: string, i: number) => (
              <p key={i} className="text-xs font-body text-foreground mt-1">🔄 {p}</p>
            ))}
          </div>
        )}

        {somatic.tension_areas?.length === 0 && (
          <p className="text-xs text-muted-foreground font-body italic text-center">Your somatic map will develop as body-emotion patterns are detected.</p>
        )}
      </motion.div>

      {/* Life Domains */}
      <motion.div
        className="glass-card rounded-2xl p-5 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">Life Domains</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {Object.entries(DOMAIN_CONFIG).map(([key, config], i) => {
            const val = Number((lifeDomains as Record<string, number>)[key]) || 0;
            return (
              <motion.div
                key={key}
                className="glass-card rounded-xl p-3 flex items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.25 + i * 0.04 }}
              >
                <span className="text-lg">{config.emoji}</span>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-display font-medium text-foreground capitalize">{key}</span>
                    <span className="text-[10px] font-display text-muted-foreground">{val.toFixed(1)}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: config.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(3, val * 10)}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.04 }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
