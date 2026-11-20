import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Anchor, Compass, Lock, ChevronDown, Sparkles, Sun, Sunset, Moon, Coffee } from "lucide-react";
import {
  CORE_PRACTICES,
  PATH_PRACTICES,
  SPECIALTY_PRACTICES,
  getMaxLevel,
  type PracticeDef,
  type PracticeId,
} from "@/types/practices";
import { usePracticeLevels } from "@/hooks/usePracticeMatrix";
import { useSpiritualDNA } from "@/hooks/useSpiritualDNA";

// ─── Map between hook keys (snake) ↔ practice ids (kebab/single)
const ID_TO_KEY: Record<string, string> = {
  observation: "observation",
  "self-inquiry": "self_inquiry",
  breath: "breath",
  witnessing: "witnessing",
  body: "body",
  bhakti: "bhakti",
  karma: "karma",
  jnana: "jnana",
  raja: "raja",
  kriya: "kriya",
  tantra: "tantra",
  neuroscience: "neuroscience",
  "emotional-healing": "emotional_healing",
  "loop-dissolution": "loop_dissolution",
  relationship: "relationship",
  "work-career": "work_career",
  finance: "finance",
  health: "health",
};

// ─── Off-app rhythm cues per practice (level-aware)
const OFF_APP_CUES: Record<string, (lvl: number) => { morning: string; midday: string; evening: string; night: string }> = {
  observation: (l) => ({
    morning: "Notice 3 things you see before unlocking your phone.",
    midday: l >= 2 ? "Catch one thought mid-stream. Just label it: 'thinking'." : "Pause once and name 5 things you can see.",
    evening: l >= 5 ? "Rest in the gap between two thoughts for one breath." : "Watch one emotion arise without judging it.",
    night: "Lying in bed, scan the body from feet to head. No fixing.",
  }),
  "self-inquiry": (l) => ({
    morning: "Ask: 'What am I feeling right now?' Don't answer — just feel.",
    midday: l >= 3 ? "When triggered ask: 'Is this belief actually true?'" : "Ask: 'Where did this thought come from?'",
    evening: l >= 4 ? "'Who is the one who lived this day?' Sit with it." : "What emotion most colored today?",
    night: l >= 5 ? "Whisper 'Who am I?' once. Sleep with the question." : "What did I learn about myself today?",
  }),
  breath: (l) => ({
    morning: l >= 3 ? "10 box breaths (4-4-4-4) before standing up." : "Take 3 natural breaths, eyes closed, before getting out of bed.",
    midday: l >= 2 ? "Count 1 to 10 breaths between meetings." : "Notice your breath once every hour.",
    evening: l >= 4 ? "5 mins spinal breathing (energy up the spine)." : "Slow exhale, twice as long as the inhale, x10.",
    night: "Let the breath breathe itself as you fall asleep.",
  }),
  witnessing: (l) => ({
    morning: "Watch your first reaction of the day without joining it.",
    midday: l >= 2 ? "Catch one reaction in real time. Don't suppress — just see." : "Notice one event without labeling 'good' or 'bad'.",
    evening: l >= 3 ? "Spot one repeating pattern (loop) you ran today." : "Replay the day as if watching a film of someone else.",
    night: l >= 4 ? "Hold Sakshi Bhav as you drift — be the silent witness." : "Witness the body settling without commentary.",
  }),
  body: (l) => ({
    morning: "Feet on floor — feel weight, temperature, texture for 1 min.",
    midday: l >= 2 ? "Locate the strongest sensation. Map it: shape, edge, color." : "Drop awareness into the belly for 5 breaths.",
    evening: l >= 3 ? "Sense prana flow up the spine while walking." : "Progressive scan, shoulders → jaw → forehead.",
    night: "Lie down. Feel the body as energy, not solid.",
  }),
  bhakti: (l) => ({
    morning: "Name 3 things you're grateful for — out loud.",
    midday: l >= 2 ? "Hum or sing one mantra/bhajan line internally." : "Touch your heart and say 'thank you' once.",
    evening: l >= 3 ? "Surrender one outcome you're gripping. Hands open." : "Recall one moment of love today.",
    night: l >= 4 ? "Heart meditation: imagine love radiating outward as you sleep." : "End the day with 'thank you' to whatever you trust.",
  }),
  karma: (l) => ({
    morning: "Do one small act for someone — expect nothing.",
    midday: l >= 2 ? "Bring full skill to one boring task. Excellence as offering." : "Hold the door / smile at a stranger.",
    evening: l >= 3 ? "Release attachment to today's results. They're not yours." : "Reflect: which act today was for me, which for service?",
    night: "Offer the day's actions before sleep. Let go.",
  }),
  jnana: (l) => ({
    morning: l >= 2 ? "Look in mirror: 'Not this body. Not this name.'" : "Ask: 'What is real and what is borrowed?'",
    midday: l >= 3 ? "Catch one thought and ask: 'Is this me, or a passing weather?'" : "Notice one belief you assume is fact.",
    evening: l >= 4 ? "Contemplate: 'Tat tvam asi' — That, I am." : "What did I confuse for myself today?",
    night: l >= 5 ? "Rest in 'I Am' before sleep — no story." : "Drop one identity (role, label) before bed.",
  }),
  raja: (l) => ({
    morning: l >= 3 ? "5 mins steady asana — find the still posture." : "One yama today: speak only what is true and kind.",
    midday: l >= 4 ? "5 rounds of pranayama between tasks." : "One niyama: clean one small space mindfully.",
    evening: l >= 5 ? "Pratyahara: 5 mins eyes closed, withdraw from sound." : "Sit upright for 5 mins, no movement.",
    night: l >= 6 ? "Dharana: one-pointed focus on breath until sleep." : "Posture check before sleep — spine long, shoulders down.",
  }),
  kriya: () => ({
    morning: "Nadi Shodhana, 9 rounds, before anything else.",
    midday: "3 rounds of Kapalbhati to clear the head.",
    evening: "Spinal breathing, 5 mins, eyes closed.",
    night: "Slow ujjayi as you fall asleep.",
  }),
  tantra: () => ({
    morning: "See one ordinary thing as sacred (a cup, a tree).",
    midday: "Notice the polarity in one interaction (giving/receiving).",
    evening: "Ritualize one daily act — make tea like a ceremony.",
    night: "Feel the body as energy, the room as field, you as both.",
  }),
  neuroscience: () => ({
    morning: "Locate head/heart/gut. Which spoke first today?",
    midday: "When stressed: long exhale → vagus nerve reset (x5).",
    evening: "Notice DMN chatter (mind wandering). Just see it.",
    night: "Coherent breathing 6/min for 5 mins before sleep.",
  }),
  "emotional-healing": () => ({
    morning: "Name today's dominant emotion before checking phone.",
    midday: "Find the emotion in the body. Where does it live?",
    evening: "Trace one strong emotion: when did I first feel this?",
    night: "Let unfelt feelings be felt for 2 mins. No story.",
  }),
  "loop-dissolution": () => ({
    morning: "Name today's most likely loop trigger.",
    midday: "Catch the loop mid-cycle. Pause. One breath.",
    evening: "Ask the loop: 'What are you protecting me from?'",
    night: "See the loop as weather, not self. Let it pass.",
  }),
  relationship: () => ({
    morning: "Set one intention for how to show up for others.",
    midday: "In one conversation, listen without preparing reply.",
    evening: "Notice one projection. What's mine, what's theirs?",
    night: "Send a silent blessing to one difficult person.",
  }),
  "work-career": () => ({
    morning: "Ask: 'What is my dharma in today's work?'",
    midday: "Find one moment of flow. What enabled it?",
    evening: "Separate effort from outcome. Both done.",
    night: "Release work mind. Tomorrow exists tomorrow.",
  }),
  finance: () => ({
    morning: "Notice one money belief running today.",
    midday: "One spending choice — values or impulse?",
    evening: "Money as energy: where did it flow today?",
    night: "Gratitude for what's already enough.",
  }),
  health: () => ({
    morning: "Ask the body: 'What do you need today?'",
    midday: "One conscious eating moment — taste it fully.",
    evening: "Move the body in any way that feels good for 5 mins.",
    night: "Body scan with healing intention. Rest deep.",
  }),
};

function getOffAppRhythm(id: PracticeId, level: number) {
  const fn = OFF_APP_CUES[id];
  if (!fn) return null;
  return fn(Math.max(1, level));
}

// ─── Activation check for specialties
function isSpecialtyActive(
  id: PracticeId,
  levels: Record<string, number>,
  band: number,
  brainDominance?: string,
): boolean {
  switch (id) {
    case "kriya":
      return (levels.raja ?? 0) >= 4 && (levels.body ?? 0) >= 3;
    case "tantra":
      return band >= 3 && (levels.jnana ?? 0) >= 3;
    case "neuroscience":
      return brainDominance === "head";
    case "emotional-healing":
    case "loop-dissolution":
    case "relationship":
    case "work-career":
    case "finance":
    case "health":
      return true; // available on demand
    default:
      return false;
  }
}

// ─────────────────────────────────────────────────────────
export default function MyMatrixTab() {
  const { data: levelsData, isLoading: levelsLoading } = usePracticeLevels();
  const { data: dna, isLoading: dnaLoading } = useSpiritualDNA();
  const [expanded, setExpanded] = useState<PracticeId | null>(null);

  const levels = useMemo<Record<string, number>>(() => {
    if (!levelsData) return {};
    const { sessions_at_level: _s, ...rest } = levelsData as any;
    return rest as Record<string, number>;
  }, [levelsData]);

  if (levelsLoading || dnaLoading) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="w-8 h-8 mx-auto rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="text-xs text-muted-foreground font-body mt-4">Loading your matrix…</p>
      </div>
    );
  }

  const anchorPath = dna?.anchor_path;
  const growthPath = dna?.growth_path;
  const band = dna?.identity_band ?? 0;
  const brain = dna?.brain_dominance;

  const toggle = (id: PracticeId) => setExpanded((cur) => (cur === id ? null : id));

  return (
    <div className="space-y-6">
      {/* Intro */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground tracking-tight">Your Practice Matrix</h3>
        </div>
        <p className="text-xs text-muted-foreground font-body leading-relaxed">
          Three layers personalised from your Spiritual DNA. Tap any practice to see your current level and an off-app rhythm you can carry into the day.
        </p>
      </motion.div>

      {/* CORE */}
      <Section title="Core" subtitle="Foundations everyone walks">
        {CORE_PRACTICES.map((p) => (
          <PracticeRow
            key={p.id}
            practice={p}
            level={levels[ID_TO_KEY[p.id]] ?? 0}
            tag={null}
            isLocked={false}
            isExpanded={expanded === p.id}
            onToggle={() => toggle(p.id)}
          />
        ))}
      </Section>

      {/* PATH */}
      <Section title="Path" subtitle="Chosen by your Spiritual DNA">
        {PATH_PRACTICES.map((p) => {
          const tag =
            p.id === anchorPath ? "anchor" : p.id === growthPath ? "growth" : null;
          return (
            <PracticeRow
              key={p.id}
              practice={p}
              level={levels[ID_TO_KEY[p.id]] ?? 0}
              tag={tag}
              isLocked={false}
              isExpanded={expanded === p.id}
              onToggle={() => toggle(p.id)}
            />
          );
        })}
      </Section>

      {/* SPECIALTY */}
      <Section title="Specialty" subtitle="Activates when you need it">
        {SPECIALTY_PRACTICES.map((p) => {
          const active = isSpecialtyActive(p.id, levels, band, brain);
          return (
            <PracticeRow
              key={p.id}
              practice={p}
              level={levels[ID_TO_KEY[p.id]] ?? 0}
              tag={null}
              isLocked={!active}
              isExpanded={expanded === p.id}
              onToggle={() => toggle(p.id)}
            />
          );
        })}
      </Section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="px-1">
        <h3 className="text-[10px] font-display tracking-[0.22em] uppercase text-muted-foreground">{title}</h3>
        <p className="text-[11px] font-body text-muted-foreground/70 mt-0.5">{subtitle}</p>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
function PracticeRow({
  practice,
  level,
  tag,
  isLocked,
  isExpanded,
  onToggle,
}: {
  practice: PracticeDef;
  level: number;
  tag: "anchor" | "growth" | null;
  isLocked: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const maxLevel = getMaxLevel(practice.id);
  const safeLevel = Math.max(1, Math.min(level || 1, maxLevel));
  const currentLevelDef = practice.levels.find((l) => l.level === safeLevel) ?? practice.levels[0];
  const progressPct = level > 0 ? Math.round((level / maxLevel) * 100) : 0;
  const rhythm = getOffAppRhythm(practice.id, safeLevel);

  return (
    <motion.div
      layout
      className={`rounded-2xl glass-card overflow-hidden transition-opacity ${isLocked ? "opacity-50" : ""}`}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={isLocked}
        className="w-full p-4 flex items-center gap-3 text-left"
      >
        <div className="w-10 h-10 rounded-xl glass-subtle flex items-center justify-center text-lg shrink-0">
          {practice.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-display font-medium text-sm text-foreground tracking-tight truncate">
              {practice.label}
            </h4>
            {tag === "anchor" && (
              <span className="text-[9px] font-display tracking-wider uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <Anchor className="w-2.5 h-2.5" /> Anchor
              </span>
            )}
            {tag === "growth" && (
              <span className="text-[9px] font-display tracking-wider uppercase text-accent-foreground bg-accent/40 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <Compass className="w-2.5 h-2.5" /> Growth
              </span>
            )}
            {isLocked && (
              <span className="text-[9px] font-display tracking-wider uppercase text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> {practice.activationCondition ? "Locked" : "Soon"}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5 truncate">
            {level > 0 ? `L${safeLevel} · ${currentLevelDef.name}` : "Not started yet"}
          </p>

          {/* level dots */}
          <div className="flex items-center gap-1 mt-2">
            {practice.levels.map((lvl) => (
              <span
                key={lvl.level}
                className={`h-1 rounded-full transition-all ${
                  lvl.level <= level
                    ? "bg-primary"
                    : lvl.level === safeLevel && level === 0
                      ? "bg-primary/30"
                      : "bg-border/40"
                }`}
                style={{ width: `${100 / maxLevel}%`, maxWidth: 18 }}
              />
            ))}
            <span className="text-[10px] font-display text-muted-foreground ml-1.5">
              {progressPct}%
            </span>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && !isLocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="px-4 pb-4 space-y-4"
          >
            {/* Current level details */}
            <div className="rounded-xl glass-subtle p-3">
              <p className="text-[10px] font-display tracking-wider uppercase text-primary/80">
                Current · L{safeLevel}
              </p>
              <p className="text-sm font-display font-medium text-foreground mt-1">
                {currentLevelDef.name}
              </p>
              <p className="text-xs text-muted-foreground font-body mt-1 leading-relaxed">
                {currentLevelDef.description}
              </p>
            </div>

            {/* Off-app rhythm */}
            {rhythm && (
              <div>
                <p className="text-[10px] font-display tracking-wider uppercase text-muted-foreground mb-2">
                  Off-app rhythm
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  <RhythmRow icon={<Coffee className="w-3 h-3" />} label="Morning" text={rhythm.morning} />
                  <RhythmRow icon={<Sun className="w-3 h-3" />} label="Midday" text={rhythm.midday} />
                  <RhythmRow icon={<Sunset className="w-3 h-3" />} label="Evening" text={rhythm.evening} />
                  <RhythmRow icon={<Moon className="w-3 h-3" />} label="Night" text={rhythm.night} />
                </div>
              </div>
            )}

            {/* Next level peek */}
            {safeLevel < maxLevel && (
              <div className="rounded-xl border border-dashed border-border/40 p-3">
                <p className="text-[10px] font-display tracking-wider uppercase text-muted-foreground">
                  Next · L{safeLevel + 1}
                </p>
                <p className="text-xs font-display text-foreground/80 mt-1">
                  {practice.levels[safeLevel].name}
                </p>
                <p className="text-[11px] text-muted-foreground font-body mt-0.5 leading-relaxed">
                  {practice.levels[safeLevel].description}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {isExpanded && isLocked && practice.activationCondition && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4"
          >
            <div className="rounded-xl glass-subtle p-3">
              <p className="text-[10px] font-display tracking-wider uppercase text-muted-foreground">
                Unlocks when
              </p>
              <p className="text-xs text-foreground/80 font-body mt-1">{practice.activationCondition}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RhythmRow({ icon, label, text }: { icon: React.ReactNode; label: string; text: string }) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/20 transition-colors">
      <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-display tracking-wider uppercase text-muted-foreground">{label}</p>
        <p className="text-xs text-foreground/85 font-body leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
