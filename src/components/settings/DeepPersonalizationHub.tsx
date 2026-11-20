import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Sparkles,
  Target,
  Brain,
  Heart,
  ChevronRight,
  Loader2,
  Check,
  Sliders,
  Eye,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────

const LIFE_DOMAINS = [
  { id: "health", label: "Health" },
  { id: "relationships", label: "Relationships" },
  { id: "career", label: "Career" },
  { id: "finances", label: "Finances" },
  { id: "creativity", label: "Creativity" },
  { id: "spirituality", label: "Spirituality" },
  { id: "family", label: "Family" },
  { id: "social", label: "Social" },
];

const LIFE_STAGES = [
  { id: "student", label: "Student", ageRange: "13–22" },
  { id: "seeker", label: "Seeker", ageRange: "22–32" },
  { id: "builder", label: "Builder", ageRange: "32–45" },
  { id: "integrator", label: "Integrator", ageRange: "45–60" },
  { id: "elder", label: "Elder", ageRange: "60+" },
];

const ANCHOR_PATHS = [
  { id: "observation", label: "Observation" },
  { id: "self_inquiry", label: "Self-Inquiry" },
  { id: "bhakti", label: "Bhakti (Devotion)" },
  { id: "karma", label: "Karma (Action)" },
  { id: "jnana", label: "Jnana (Wisdom)" },
  { id: "raja", label: "Raja (Meditation)" },
  { id: "tantra", label: "Tantra" },
  { id: "shakti", label: "Shakti (Energy)" },
];

const GROWTH_PATHS = [
  { id: "observation", label: "Observation" },
  { id: "self_inquiry", label: "Self-Inquiry" },
  { id: "bhakti", label: "Bhakti (Devotion)" },
  { id: "karma", label: "Karma (Action)" },
  { id: "jnana", label: "Jnana (Wisdom)" },
  { id: "raja", label: "Raja (Meditation)" },
];

const BRAIN_DOMINANCES = [
  { id: "balanced", label: "Balanced" },
  { id: "head", label: "Head (Thinking)" },
  { id: "heart", label: "Heart (Feeling)" },
  { id: "gut", label: "Gut (Intuition)" },
];

const CIRCADIAN_TYPES = [
  { id: "flexible", label: "Flexible" },
  { id: "morning", label: "Morning Lark" },
  { id: "evening", label: "Night Owl" },
  { id: "biphasic", label: "Biphasic" },
];

const TIME_SLOTS = [
  { id: "morning", label: "Morning" },
  { id: "midday", label: "Midday" },
  { id: "evening", label: "Evening" },
  { id: "night", label: "Night" },
];

const ATTACHMENT_STYLES = [
  { id: "secure", label: "Secure" },
  { id: "anxious", label: "Anxious" },
  { id: "avoidant", label: "Avoidant" },
  { id: "disorganized", label: "Disorganized" },
  { id: "fearful", label: "Fearful-Avoidant" },
];

const LIFE_DIRECTIONS = [
  { id: null, label: "Not sure yet" },
  { id: "service", label: "Service (Seva)" },
  { id: "knowledge", label: "Knowledge (Jnana)" },
  { id: "devotion", label: "Devotion (Bhakti)" },
  { id: "action", label: "Action (Karma)" },
  { id: "meditation", label: "Meditation (Raja)" },
  { id: "creativity", label: "Creativity" },
  { id: "teaching", label: "Teaching" },
  { id: "healing", label: "Healing" },
];

const COGNITIVE_STYLES = [
  { id: "analytical", label: "Analytical" },
  { id: "intuitive", label: "Intuitive" },
  { id: "reflective", label: "Reflective" },
  { id: "embodied", label: "Embodied" },
  { id: "relational", label: "Relational" },
];

const DEFENSE_MECHANISMS = [
  { id: "denial", label: "Denial" },
  { id: "projection", label: "Projection" },
  { id: "rationalization", label: "Rationalization" },
  { id: "displacement", label: "Displacement" },
  { id: "reaction_formation", label: "Reaction Formation" },
  { id: "sublimation", label: "Sublimation" },
];

const EMOTIONS = [
  { id: "joy", label: "Joy" },
  { id: "sadness", label: "Sadness" },
  { id: "anger", label: "Anger" },
  { id: "fear", label: "Fear" },
  { id: "love", label: "Love" },
  { id: "grief", label: "Grief" },
];

const ARCHETYPES = [
  { id: "innocent", label: "Innocent" },
  { id: "explorer", label: "Explorer" },
  { id: "sage", label: "Sage" },
  { id: "hero", label: "Hero" },
  { id: "caregiver", label: "Caregiver" },
  { id: "rebel", label: "Rebel" },
  { id: "lover", label: "Lover" },
  { id: "creator", label: "Creator" },
  { id: "jester", label: "Jester" },
  { id: "ruler", label: "Ruler" },
];

const MEANING_PATTERNS = [
  { id: "service", label: "Service" },
  { id: "creativity", label: "Creativity" },
  { id: "connection", label: "Connection" },
  { id: "achievement", label: "Achievement" },
  { id: "understanding", label: "Understanding" },
  { id: "transcendence", label: "Transcendence" },
];

// ─── Types ────────────────────────────────────────────────────

interface DeepPersonalizationState {
  // Core Identity
  selectedDomains: string[];
  lifeStage: string;
  age: number;

  // Spiritual DNA
  anchorPath: string;
  growthPath: string;
  brainDominance: string;
  circadianType: string;
  traditionAffinity: string;
  availableSlots: string[];
  primarySlot: string;
  flexibleMode: boolean;
  weekdayDuration: number;
  weekendDuration: number;

  // Practice Paths
  pathBhakti: number;
  pathKarma: number;
  pathJnana: number;
  pathRaja: number;

  // Brain & Mind
  brainHead: number;
  brainHeart: number;
  brainGut: number;
  chittaVritti: number;

  // Psyche
  attachmentStyle: string;
  statedValues: string;
  lifeDirection: string;
  cognitiveStyle: string;
  innerCriticStrength: number;
  emotionalMaturity: number;

  // Consciousness
  domainScores: Record<string, number>;
  activeLoops: string;

  // Beliefs & Inner World
  coreBeliefs: string;
  limitingBeliefs: string;
  empoweringBeliefs: string;

  // Shadow & Defenses
  shadowTriggers: string;
  disownedParts: string;
  primaryDefense: string;
  defenseAwareness: number;

  // Archetypes
  dominantArchetype: string;
  shadowArchetype: string;
  aspirationalArchetype: string;

  // Purpose & Ikigai
  ikigaiLove: string;
  ikigaiGoodAt: string;
  ikigaiWorldNeeds: string;
  ikigaiPaidFor: string;
  meaningPatterns: string;
  clarityScore: number;

  // Somatic & Body
  tensionAreas: string;
  bodyAwarenessScore: number;
  chronicPatterns: string;

  // Witness & Consciousness State
  overallBand: number;
  witnessGap: number;
  witnessStability: number;
  witnessDepth: number;

  // App Relationship & Lifetime
  identityBand: number;
  identityBandName: string;
  appRelationshipPhase: string;
  appRelationshipDay: number;
  lifetimePhase: string;
  lifetimePhaseDay: number;
  totalGurusEncountered: number;
  guruResonance: string;

  // Lifestyle & Context
  wakeTime: string;
  sleepTime: string;
  availableTimeDaily: number;
  traditionAffinityDetail: string;
}

const INITIAL_STATE: DeepPersonalizationState = {
  selectedDomains: ["spirituality", "health", "relationships"],
  lifeStage: "seeker",
  age: 25,
  anchorPath: "observation",
  growthPath: "self_inquiry",
  brainDominance: "balanced",
  circadianType: "flexible",
  traditionAffinity: "",
  availableSlots: ["morning"],
  primarySlot: "morning",
  flexibleMode: false,
  weekdayDuration: 15,
  weekendDuration: 30,
  pathBhakti: 20,
  pathKarma: 20,
  pathJnana: 30,
  pathRaja: 30,
  brainHead: 33,
  brainHeart: 33,
  brainGut: 34,
  chittaVritti: 50,
  attachmentStyle: "secure",
  statedValues: "",
  lifeDirection: "",
  cognitiveStyle: "reflective",
  innerCriticStrength: 30,
  emotionalMaturity: 40,
  domainScores: {
    health: 50,
    relationships: 50,
    career: 50,
    finances: 50,
    creativity: 50,
    spirituality: 50,
    family: 50,
    social: 50,
  },
  activeLoops: "",

  // Beliefs & Inner World
  coreBeliefs: "",
  limitingBeliefs: "",
  empoweringBeliefs: "",

  // Shadow & Defenses
  shadowTriggers: "",
  disownedParts: "",
  primaryDefense: "",
  defenseAwareness: 30,

  // Archetypes
  dominantArchetype: "",
  shadowArchetype: "",
  aspirationalArchetype: "",

  // Purpose & Ikigai
  ikigaiLove: "",
  ikigaiGoodAt: "",
  ikigaiWorldNeeds: "",
  ikigaiPaidFor: "",
  meaningPatterns: "",
  clarityScore: 50,

  // Somatic & Body
  tensionAreas: "",
  bodyAwarenessScore: 40,
  chronicPatterns: "",

  // Witness & Consciousness State
  overallBand: 30,
  witnessGap: 20,
  witnessStability: 30,
  witnessDepth: 20,

  // App Relationship & Lifetime
  identityBand: 0,
  identityBandName: "Unconscious Conditioning",
  appRelationshipPhase: "tool",
  appRelationshipDay: 0,
  lifetimePhase: "awakening",
  lifetimePhaseDay: 1,
  totalGurusEncountered: 0,
  guruResonance: "",

  // Lifestyle & Context
  wakeTime: "06:30",
  sleepTime: "22:30",
  availableTimeDaily: 30,
  traditionAffinityDetail: "",
};

// ─── Helpers ──────────────────────────────────────────────────

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <span className="text-[10px] text-muted-foreground">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs font-body text-foreground">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative ${
          value ? "bg-primary" : "bg-muted"
        }`}
      >
        <motion.div
          className="w-5 h-5 rounded-full bg-background shadow-sm absolute top-0.5"
          animate={{ left: value ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
      </button>
    </div>
  );
}

function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-border/40 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-display font-semibold text-foreground flex-1">{title}</span>
        <ChevronRight
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-90" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────

export default function DeepPersonalizationHub() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<DeepPersonalizationState>(INITIAL_STATE);

  // Load all deep profile data
  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [
          profileRes,
          spiritualDnaRes,
          assessmentsRes,
          psycheRes,
          consciousnessRes,
        ] = await Promise.all([
          supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("user_spiritual_dna").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("spiritual_dna_assessments").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("user_psyche_profile").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("user_consciousness_profile").select("*").eq("user_id", user.id).maybeSingle(),
        ]);

        const sd = (spiritualDnaRes.data as any) || {};
        const sa = (assessmentsRes.data as any) || {};
        const pp = (psycheRes.data as any) || {};
        const cp = (consciousnessRes.data as any) || {};

        setState((prev) => ({
          ...prev,
          // Core identity lives in engine tables, not profiles
          selectedDomains: cp.life_domains
            ? Object.keys(cp.life_domains).filter((k: string) => cp.life_domains[k] > 0)
            : prev.selectedDomains,
          lifeStage: sd.life_stage || prev.lifeStage,
          age: (profileRes.data as any)?.age || prev.age,

          // Spiritual DNA
          anchorPath: sd.anchor_path || prev.anchorPath,
          growthPath: sd.growth_path || prev.growthPath,
          brainDominance: sd.brain_dominance || prev.brainDominance,
          circadianType: sd.circadian_type || prev.circadianType,
          traditionAffinity: sd.tradition_affinity || prev.traditionAffinity,
          availableSlots: sd.available_slots?.length ? sd.available_slots : prev.availableSlots,
          primarySlot: sd.primary_slot || prev.primarySlot,
          flexibleMode: sd.flexible_mode ?? prev.flexibleMode,
          weekdayDuration: sd.weekday_duration || prev.weekdayDuration,
          weekendDuration: sd.weekend_duration || prev.weekendDuration,

          // Practice Paths
          pathBhakti: sa.path_bhakti ?? prev.pathBhakti,
          pathKarma: sa.path_karma ?? prev.pathKarma,
          pathJnana: sa.path_jnana ?? prev.pathJnana,
          pathRaja: sa.path_raja ?? prev.pathRaja,

          // Brain & Mind
          brainHead: sa.brain_head ?? prev.brainHead,
          brainHeart: sa.brain_heart ?? prev.brainHeart,
          brainGut: sa.brain_gut ?? prev.brainGut,
          chittaVritti: sa.chitta_vritti_level ?? prev.chittaVritti,

          // Psyche
          attachmentStyle: pp.attachment?.primary_style || prev.attachmentStyle,
          statedValues: pp.values_profile?.stated_values?.join(", ") || prev.statedValues,
          lifeDirection: pp.purpose?.life_direction || prev.lifeDirection,
          cognitiveStyle: pp.cognitive_patterns?.dominant_cognitive_style || prev.cognitiveStyle,
          innerCriticStrength: pp.inner_voices?.inner_critic?.strength ?? prev.innerCriticStrength,
          emotionalMaturity: pp.emotional_signatures?.emotional_maturity ?? prev.emotionalMaturity,

          // Consciousness
          domainScores: cp.life_domains && typeof cp.life_domains === "object"
            ? { ...prev.domainScores, ...cp.life_domains }
            : prev.domainScores,
          activeLoops: cp.active_loops?.length ? cp.active_loops.join(", ") : prev.activeLoops,

          // Beliefs & Inner World
          coreBeliefs: pp.beliefs?.core_beliefs?.join(", ") || prev.coreBeliefs,
          limitingBeliefs: pp.beliefs?.limiting_beliefs?.join(", ") || prev.limitingBeliefs,
          empoweringBeliefs: pp.beliefs?.empowering_beliefs?.join(", ") || prev.empoweringBeliefs,

          // Shadow & Defenses
          shadowTriggers: pp.shadow?.shadow_triggers?.join(", ") || prev.shadowTriggers,
          disownedParts: pp.shadow?.disowned_parts?.join(", ") || prev.disownedParts,
          primaryDefense: pp.defenses?.primary_defense || prev.primaryDefense,
          defenseAwareness: pp.defenses?.defense_awareness ?? prev.defenseAwareness,

          // Archetypes
          dominantArchetype: pp.archetypes?.dominant || prev.dominantArchetype,
          shadowArchetype: pp.archetypes?.shadow || prev.shadowArchetype,
          aspirationalArchetype: pp.archetypes?.aspirational || prev.aspirationalArchetype,

          // Purpose & Ikigai
          ikigaiLove: pp.purpose?.ikigai?.love?.join(", ") || prev.ikigaiLove,
          ikigaiGoodAt: pp.purpose?.ikigai?.good_at?.join(", ") || prev.ikigaiGoodAt,
          ikigaiWorldNeeds: pp.purpose?.ikigai?.world_needs?.join(", ") || prev.ikigaiWorldNeeds,
          ikigaiPaidFor: pp.purpose?.ikigai?.paid_for?.join(", ") || prev.ikigaiPaidFor,
          meaningPatterns: pp.purpose?.meaning_patterns?.join(", ") || prev.meaningPatterns,
          clarityScore: pp.purpose?.clarity_score ?? prev.clarityScore,

          // Somatic & Body
          tensionAreas: pp.somatic_map?.tension_areas?.join(", ") || prev.tensionAreas,
          bodyAwarenessScore: pp.somatic_map?.body_awareness_score ?? prev.bodyAwarenessScore,
          chronicPatterns: pp.somatic_map?.chronic_patterns?.join(", ") || prev.chronicPatterns,

          // Witness & Consciousness State
          overallBand: cp.overall_band ?? prev.overallBand,
          witnessGap: cp.witness_gap ?? prev.witnessGap,
          witnessStability: cp.witness_stability ?? prev.witnessStability,
          witnessDepth: cp.witness_depth ?? prev.witnessDepth,

          // App Relationship & Lifetime
          identityBand: sd.identity_band ?? prev.identityBand,
          identityBandName: sd.identity_band_name || prev.identityBandName,
          appRelationshipPhase: sd.app_relationship_phase || prev.appRelationshipPhase,
          appRelationshipDay: sd.app_relationship_day ?? prev.appRelationshipDay,
          lifetimePhase: sd.lifetime_phase || prev.lifetimePhase,
          lifetimePhaseDay: sd.lifetime_phase_day ?? prev.lifetimePhaseDay,
          totalGurusEncountered: sd.total_gurus_encountered ?? prev.totalGurusEncountered,
          guruResonance: sd.guru_resonance ? JSON.stringify(sd.guru_resonance) : prev.guruResonance,

          // Lifestyle & Context
          wakeTime: (profileRes.data as any)?.wake_time || prev.wakeTime,
          sleepTime: (profileRes.data as any)?.sleep_time || prev.sleepTime,
          availableTimeDaily: sa.available_time_daily ?? prev.availableTimeDaily,
          traditionAffinityDetail: sd.tradition_affinity || prev.traditionAffinityDetail,
        }));
      } catch (e) {
        console.error("Failed to load deep personalization:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const update = useCallback(<K extends keyof DeepPersonalizationState>(key: K, value: DeepPersonalizationState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Spiritual DNA
      const { error: sdError } = await supabase
        .from("user_spiritual_dna")
        .upsert(
          {
            user_id: user.id,
            anchor_path: state.anchorPath,
            growth_path: state.growthPath,
            brain_dominance: state.brainDominance,
            circadian_type: state.circadianType,
            tradition_affinity: state.traditionAffinity || null,
            life_stage: state.lifeStage,
            identity_band: state.identityBand,
            identity_band_name: state.identityBandName,
            app_relationship_phase: state.appRelationshipPhase,
            app_relationship_day: state.appRelationshipDay,
            lifetime_phase: state.lifetimePhase,
            lifetime_phase_day: state.lifetimePhaseDay,
            available_slots: state.availableSlots,
            primary_slot: state.primarySlot,
            flexible_mode: state.flexibleMode,
            weekday_duration: state.weekdayDuration,
            weekend_duration: state.weekendDuration,
            total_gurus_encountered: state.totalGurusEncountered,
            guru_resonance: state.guruResonance ? JSON.parse(state.guruResonance) : {},
          },
          { onConflict: "user_id" }
        );
      if (sdError) throw sdError;

      // 2. Assessments
      const { error: saError } = await supabase
        .from("spiritual_dna_assessments")
        .upsert(
          {
            user_id: user.id,
            available_time_daily: state.availableTimeDaily,
            path_bhakti: state.pathBhakti,
            path_karma: state.pathKarma,
            path_jnana: state.pathJnana,
            path_raja: state.pathRaja,
            brain_head: state.brainHead,
            brain_heart: state.brainHeart,
            brain_gut: state.brainGut,
            chitta_vritti_level: state.chittaVritti,
            primary_loops: state.activeLoops.split(",").map((s) => s.trim()).filter(Boolean),
          },
          { onConflict: "user_id" }
        );
      if (saError) throw saError;

      // 3. Psyche — read existing row first so we don't blow away nested JSONB
      const { data: existingPsyche } = await supabase
        .from("user_psyche_profile")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const existingAttachment = (existingPsyche as any)?.attachment || {};
      const existingValues = (existingPsyche as any)?.values_profile || {};
      const existingPurpose = (existingPsyche as any)?.purpose || {};
      const existingCog = (existingPsyche as any)?.cognitive_patterns || {};
      const existingVoices = (existingPsyche as any)?.inner_voices || {};
      const existingEmo = (existingPsyche as any)?.emotional_signatures || {};
      const existingBeliefs = (existingPsyche as any)?.beliefs || {};
      const existingShadow = (existingPsyche as any)?.shadow || {};
      const existingDefenses = (existingPsyche as any)?.defenses || {};
      const existingArchetypes = (existingPsyche as any)?.archetypes || {};
      const existingSomatic = (existingPsyche as any)?.somatic_map || {};

      const { error: ppError } = await supabase
        .from("user_psyche_profile")
        .upsert(
          {
            user_id: user.id,
            beliefs: {
              ...existingBeliefs,
              core_beliefs: state.coreBeliefs.split(",").map((s) => s.trim()).filter(Boolean),
              limiting_beliefs: state.limitingBeliefs.split(",").map((s) => s.trim()).filter(Boolean),
              empowering_beliefs: state.empoweringBeliefs.split(",").map((s) => s.trim()).filter(Boolean),
            },
            archetypes: {
              ...existingArchetypes,
              dominant: state.dominantArchetype || existingArchetypes.dominant,
              shadow: state.shadowArchetype || existingArchetypes.shadow,
              aspirational: state.aspirationalArchetype || existingArchetypes.aspirational,
            },
            shadow: {
              ...existingShadow,
              shadow_triggers: state.shadowTriggers.split(",").map((s) => s.trim()).filter(Boolean),
              disowned_parts: state.disownedParts.split(",").map((s) => s.trim()).filter(Boolean),
            },
            attachment: { ...existingAttachment, primary_style: state.attachmentStyle },
            values_profile: { ...existingValues, stated_values: state.statedValues.split(",").map((s) => s.trim()).filter(Boolean) },
            defenses: {
              ...existingDefenses,
              primary_defense: state.primaryDefense || existingDefenses.primary_defense,
              defense_awareness: state.defenseAwareness,
            },
            purpose: {
              ...existingPurpose,
              life_direction: state.lifeDirection || existingPurpose.life_direction || null,
              clarity_score: state.clarityScore,
              ikigai: {
                love: state.ikigaiLove.split(",").map((s) => s.trim()).filter(Boolean),
                good_at: state.ikigaiGoodAt.split(",").map((s) => s.trim()).filter(Boolean),
                world_needs: state.ikigaiWorldNeeds.split(",").map((s) => s.trim()).filter(Boolean),
                paid_for: state.ikigaiPaidFor.split(",").map((s) => s.trim()).filter(Boolean),
              },
              meaning_patterns: state.meaningPatterns.split(",").map((s) => s.trim()).filter(Boolean),
            },
            cognitive_patterns: { ...existingCog, dominant_cognitive_style: state.cognitiveStyle || existingCog.dominant_cognitive_style || null },
            inner_voices: {
              ...existingVoices,
              inner_critic: {
                ...(existingVoices.inner_critic || {}),
                strength: state.innerCriticStrength,
              },
            },
            emotional_signatures: {
              ...existingEmo,
              emotional_maturity: state.emotionalMaturity,
            },
            somatic_map: {
              ...existingSomatic,
              tension_areas: state.tensionAreas.split(",").map((s) => s.trim()).filter(Boolean),
              body_awareness_score: state.bodyAwarenessScore,
              chronic_patterns: state.chronicPatterns.split(",").map((s) => s.trim()).filter(Boolean),
            },
          },
          { onConflict: "user_id" }
        );
      if (ppError) throw ppError;

      // 4. Consciousness — read existing to merge life_domains
      const { data: existingCp } = await supabase
        .from("user_consciousness_profile")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const existingDomains = (existingCp as any)?.life_domains || {};
      const domainScores: Record<string, number> = { ...existingDomains };
      for (const domain of LIFE_DOMAINS) {
        domainScores[domain.id] = state.selectedDomains.includes(domain.id)
          ? state.domainScores[domain.id] || 50
          : 0;
      }

      const { error: cpError } = await supabase
        .from("user_consciousness_profile")
        .upsert(
          {
            user_id: user.id,
            overall_band: state.overallBand,
            dimension_bands: {
              thought: state.brainHead,
              emotion: state.brainHeart,
              body: state.brainGut,
              awareness: 100 - state.chittaVritti,
            },
            life_domains: domainScores,
            active_loops: state.activeLoops.split(",").map((s) => s.trim()).filter(Boolean),
            journey_day: (existingCp as any)?.journey_day,
            journey_phase: (existingCp as any)?.journey_phase,
            witness_gap: state.witnessGap,
            witness_stability: state.witnessStability,
            witness_depth: state.witnessDepth,
          },
          { onConflict: "user_id" }
        );
      if (cpError) throw cpError;

      // 5. Profiles
      const { error: pError } = await supabase
        .from("profiles")
        .update({
          age: state.age,
          wake_time: state.wakeTime || null,
          sleep_time: state.sleepTime || null,
        })
        .eq("user_id", user.id);
      if (pError) throw pError;

      toast({ title: "Deep personalization saved", description: "Your guide will use this to shape your experience." });
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [state]);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading deep profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Sliders className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground text-sm">Deep Personalization</h3>
          <p className="text-xs text-muted-foreground">Full profile across identity, DNA, psyche, and consciousness</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* 1. Core Identity */}
        <CollapsibleSection title="Core Identity" icon={User} defaultOpen>
          {/* Life Domains */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Life Domains</p>
            <div className="flex flex-wrap gap-2">
              {LIFE_DOMAINS.map((domain) => {
                const active = state.selectedDomains.includes(domain.id);
                const score = state.domainScores[domain.id] || 0;
                return (
                  <button
                    key={domain.id}
                    onClick={() =>
                      update(
                        "selectedDomains",
                        active
                          ? state.selectedDomains.filter((d) => d !== domain.id)
                          : [...state.selectedDomains, domain.id]
                      )
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                      active
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-white/5 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {domain.label}
                    {active && <span className="text-[10px] opacity-70">{score}%</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Domain Scores */}
          {state.selectedDomains.length > 0 && (
            <div className="space-y-3 pt-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Domain Health</p>
              {state.selectedDomains.map((domainId) => {
                const domain = LIFE_DOMAINS.find((d) => d.id === domainId);
                if (!domain) return null;
                return (
                  <SliderField
                    key={domainId}
                    label={domain.label}
                    value={state.domainScores[domainId] || 50}
                    onChange={(v) =>
                      update("domainScores", { ...state.domainScores, [domainId]: v })
                    }
                  />
                );
              })}
            </div>
          )}

          {/* Life Stage */}
          <div className="space-y-2 pt-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Life Stage</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LIFE_STAGES.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => update("lifeStage", stage.id)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    state.lifeStage === stage.id
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <p className="text-xs font-display font-semibold">{stage.label}</p>
                  <p className="text-[10px] text-muted-foreground">{stage.ageRange}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Age */}
          <div className="space-y-2 pt-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Age</p>
            <input
              type="number"
              value={state.age}
              onChange={(e) => update("age", Number(e.target.value))}
              className="w-full max-w-xs px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
              min={13}
              max={120}
            />
          </div>
        </CollapsibleSection>

        {/* 2. Spiritual DNA */}
        <CollapsibleSection title="Spiritual DNA" icon={Sparkles} defaultOpen>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              label="Anchor Path"
              value={state.anchorPath}
              onChange={(v) => update("anchorPath", v)}
              options={ANCHOR_PATHS}
            />
            <SelectField
              label="Growth Path"
              value={state.growthPath}
              onChange={(v) => update("growthPath", v)}
              options={GROWTH_PATHS}
            />
            <SelectField
              label="Brain Dominance"
              value={state.brainDominance}
              onChange={(v) => update("brainDominance", v)}
              options={BRAIN_DOMINANCES}
            />
            <SelectField
              label="Circadian Type"
              value={state.circadianType}
              onChange={(v) => update("circadianType", v)}
              options={CIRCADIAN_TYPES}
            />
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Tradition Affinity</p>
            <input
              type="text"
              value={state.traditionAffinity}
              onChange={(e) => update("traditionAffinity", e.target.value)}
              placeholder="e.g. Advaita Vedanta, Zen, Tibetan Buddhism…"
              className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
            />
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Available Slots</p>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((slot) => {
                const active = state.availableSlots.includes(slot.id);
                return (
                  <button
                    key={slot.id}
                    onClick={() =>
                      update(
                        "availableSlots",
                        active
                          ? state.availableSlots.filter((s) => s !== slot.id)
                          : [...state.availableSlots, slot.id]
                      )
                    }
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                      active
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-white/5 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <SelectField
              label="Primary Slot"
              value={state.primarySlot}
              onChange={(v) => update("primarySlot", v)}
              options={TIME_SLOTS}
            />
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Weekday Duration (min)</p>
              <input
                type="number"
                value={state.weekdayDuration}
                onChange={(e) => update("weekdayDuration", Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
                min={5}
                max={120}
              />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Weekend Duration (min)</p>
              <input
                type="number"
                value={state.weekendDuration}
                onChange={(e) => update("weekendDuration", Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
                min={5}
                max={180}
              />
            </div>
          </div>

          <div className="pt-2">
            <ToggleField
              label="Flexible Mode"
              value={state.flexibleMode}
              onChange={(v) => update("flexibleMode", v)}
            />
          </div>
        </CollapsibleSection>

        {/* 3. Practice Paths */}
        <CollapsibleSection title="Practice Paths" icon={Target} defaultOpen>
          <div className="space-y-3">
            <SliderField
              label="Bhakti (Devotion)"
              value={state.pathBhakti}
              onChange={(v) => update("pathBhakti", v)}
            />
            <SliderField
              label="Karma (Action)"
              value={state.pathKarma}
              onChange={(v) => update("pathKarma", v)}
            />
            <SliderField
              label="Jnana (Wisdom)"
              value={state.pathJnana}
              onChange={(v) => update("pathJnana", v)}
            />
            <SliderField
              label="Raja (Meditation)"
              value={state.pathRaja}
              onChange={(v) => update("pathRaja", v)}
            />
          </div>
        </CollapsibleSection>

        {/* 4. Brain & Mind */}
        <CollapsibleSection title="Brain & Mind" icon={Brain} defaultOpen>
          <div className="space-y-3">
            <SliderField
              label="Head (Thinking)"
              value={state.brainHead}
              onChange={(v) => update("brainHead", v)}
            />
            <SliderField
              label="Heart (Feeling)"
              value={state.brainHeart}
              onChange={(v) => update("brainHeart", v)}
            />
            <SliderField
              label="Gut (Intuition)"
              value={state.brainGut}
              onChange={(v) => update("brainGut", v)}
            />
            <SliderField
              label="Chitta Vritti (Mental Activity)"
              value={state.chittaVritti}
              onChange={(v) => update("chittaVritti", v)}
            />
          </div>
        </CollapsibleSection>

        {/* 5. Psyche */}
        <CollapsibleSection title="Psyche" icon={Heart} defaultOpen>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              label="Attachment Style"
              value={state.attachmentStyle}
              onChange={(v) => update("attachmentStyle", v)}
              options={ATTACHMENT_STYLES}
            />
            <SelectField
              label="Life Direction"
              value={state.lifeDirection}
              onChange={(v) => update("lifeDirection", v)}
              options={LIFE_DIRECTIONS}
            />
            <SelectField
              label="Cognitive Style"
              value={state.cognitiveStyle}
              onChange={(v) => update("cognitiveStyle", v)}
              options={COGNITIVE_STYLES}
            />
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Stated Values (comma-separated)</p>
            <input
              type="text"
              value={state.statedValues}
              onChange={(e) => update("statedValues", e.target.value)}
              placeholder="e.g. authenticity, compassion, growth, freedom…"
              className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
            />
          </div>

          <div className="space-y-3 pt-2">
            <SliderField
              label="Inner Critic Strength"
              value={state.innerCriticStrength}
              onChange={(v) => update("innerCriticStrength", v)}
            />
            <SliderField
              label="Emotional Maturity"
              value={state.emotionalMaturity}
              onChange={(v) => update("emotionalMaturity", v)}
            />
          </div>
        </CollapsibleSection>

        {/* 6. Consciousness */}
        <CollapsibleSection title="Consciousness" icon={Brain} defaultOpen>
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Active Loops (comma-separated)
            </p>
            <input
              type="text"
              value={state.activeLoops}
              onChange={(e) => update("activeLoops", e.target.value)}
              placeholder="e.g. procrastination, people-pleasing, comparison…"
              className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
            />
          </div>
        </CollapsibleSection>

        {/* 7. Beliefs & Inner World */}
        <CollapsibleSection title="Beliefs & Inner World" icon={Sparkles}>
          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Core Beliefs (comma-separated)</p>
              <input
                type="text"
                value={state.coreBeliefs}
                onChange={(e) => update("coreBeliefs", e.target.value)}
                placeholder="e.g. I am worthy, life supports me, growth is possible…"
                className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
              />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Limiting Beliefs (comma-separated)</p>
              <input
                type="text"
                value={state.limitingBeliefs}
                onChange={(e) => update("limitingBeliefs", e.target.value)}
                placeholder="e.g. I'm not good enough, I must be perfect, I can't trust others…"
                className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
              />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Empowering Beliefs (comma-separated)</p>
              <input
                type="text"
                value={state.empoweringBeliefs}
                onChange={(e) => update("empoweringBeliefs", e.target.value)}
                placeholder="e.g. I learn from failure, I am resilient, I choose my response…"
                className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* 8. Shadow & Defenses */}
        <CollapsibleSection title="Shadow & Defenses" icon={Brain}>
          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Shadow Triggers (comma-separated)</p>
              <input
                type="text"
                value={state.shadowTriggers}
                onChange={(e) => update("shadowTriggers", e.target.value)}
                placeholder="e.g. criticism, abandonment, being ignored, conflict…"
                className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
              />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Disowned Parts (comma-separated)</p>
              <input
                type="text"
                value={state.disownedParts}
                onChange={(e) => update("disownedParts", e.target.value)}
                placeholder="e.g. my anger, my neediness, my ambition, my vulnerability…"
                className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SelectField
                label="Primary Defense"
                value={state.primaryDefense}
                onChange={(v) => update("primaryDefense", v)}
                options={DEFENSE_MECHANISMS}
              />
              <SliderField
                label="Defense Awareness"
                value={state.defenseAwareness}
                onChange={(v) => update("defenseAwareness", v)}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* 9. Archetypes */}
        <CollapsibleSection title="Archetypes" icon={User}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SelectField
              label="Dominant Archetype"
              value={state.dominantArchetype}
              onChange={(v) => update("dominantArchetype", v)}
              options={ARCHETYPES}
            />
            <SelectField
              label="Shadow Archetype"
              value={state.shadowArchetype}
              onChange={(v) => update("shadowArchetype", v)}
              options={ARCHETYPES}
            />
            <SelectField
              label="Aspirational Archetype"
              value={state.aspirationalArchetype}
              onChange={(v) => update("aspirationalArchetype", v)}
              options={ARCHETYPES}
            />
          </div>
        </CollapsibleSection>

        {/* 10. Purpose & Ikigai */}
        <CollapsibleSection title="Purpose & Ikigai" icon={Target}>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">What I Love</p>
                <input
                  type="text"
                  value={state.ikigaiLove}
                  onChange={(e) => update("ikigaiLove", e.target.value)}
                  placeholder="e.g. music, teaching, nature, cooking…"
                  className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">What I'm Good At</p>
                <input
                  type="text"
                  value={state.ikigaiGoodAt}
                  onChange={(e) => update("ikigaiGoodAt", e.target.value)}
                  placeholder="e.g. listening, coding, writing, designing…"
                  className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">What the World Needs</p>
                <input
                  type="text"
                  value={state.ikigaiWorldNeeds}
                  onChange={(e) => update("ikigaiWorldNeeds", e.target.value)}
                  placeholder="e.g. healing, understanding, connection, justice…"
                  className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">What I Can Be Paid For</p>
                <input
                  type="text"
                  value={state.ikigaiPaidFor}
                  onChange={(e) => update("ikigaiPaidFor", e.target.value)}
                  placeholder="e.g. consulting, art, therapy, engineering…"
                  className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Meaning Patterns (comma-separated)</p>
              <input
                type="text"
                value={state.meaningPatterns}
                onChange={(e) => update("meaningPatterns", e.target.value)}
                placeholder="e.g. service, creativity, connection, achievement, understanding…"
                className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
              />
            </div>
            <SliderField
              label="Clarity Score"
              value={state.clarityScore}
              onChange={(v) => update("clarityScore", v)}
            />
          </div>
        </CollapsibleSection>

        {/* 11. Somatic & Body */}
        <CollapsibleSection title="Somatic & Body" icon={Heart}>
          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Tension Areas (comma-separated)</p>
              <input
                type="text"
                value={state.tensionAreas}
                onChange={(e) => update("tensionAreas", e.target.value)}
                placeholder="e.g. neck, shoulders, jaw, lower back, chest…"
                className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
              />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Chronic Patterns (comma-separated)</p>
              <input
                type="text"
                value={state.chronicPatterns}
                onChange={(e) => update("chronicPatterns", e.target.value)}
                placeholder="e.g. headaches, insomnia, fatigue, digestive issues…"
                className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
              />
            </div>
            <SliderField
              label="Body Awareness"
              value={state.bodyAwarenessScore}
              onChange={(v) => update("bodyAwarenessScore", v)}
            />
          </div>
        </CollapsibleSection>

        {/* 12. Witness & Consciousness State */}
        <CollapsibleSection title="Witness & Consciousness State" icon={Eye}>
          <div className="space-y-3">
            <SliderField
              label="Overall Band"
              value={state.overallBand}
              onChange={(v) => update("overallBand", v)}
            />
            <SliderField
              label="Witness Gap"
              value={state.witnessGap}
              onChange={(v) => update("witnessGap", v)}
            />
            <SliderField
              label="Witness Stability"
              value={state.witnessStability}
              onChange={(v) => update("witnessStability", v)}
            />
            <SliderField
              label="Witness Depth"
              value={state.witnessDepth}
              onChange={(v) => update("witnessDepth", v)}
            />
          </div>
        </CollapsibleSection>

        {/* 13. App Relationship & Lifetime */}
        <CollapsibleSection title="App Relationship & Lifetime" icon={Sparkles}>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SelectField
                label="App Relationship Phase"
                value={state.appRelationshipPhase}
                onChange={(v) => update("appRelationshipPhase", v)}
                options={[
                  { id: "tool", label: "Tool" },
                  { id: "teacher", label: "Teacher" },
                  { id: "companion", label: "Companion" },
                  { id: "friend", label: "Friend" },
                  { id: "mirror", label: "Mirror" },
                  { id: "self", label: "Self" },
                  { id: "silence", label: "Silence" },
                ]}
              />
              <SelectField
                label="Lifetime Phase"
                value={state.lifetimePhase}
                onChange={(v) => update("lifetimePhase", v)}
                options={[
                  { id: "awakening", label: "Awakening" },
                  { id: "exploration", label: "Exploration" },
                  { id: "deepening", label: "Deepening" },
                  { id: "integration", label: "Integration" },
                  { id: "mastery", label: "Mastery" },
                  { id: "teaching", label: "Teaching" },
                  { id: "dissolution", label: "Dissolution" },
                  { id: "freedom", label: "Freedom" },
                  { id: "compassion", label: "Compassion" },
                  { id: "beyond", label: "Beyond" },
                ]}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Identity Band</p>
                <input
                  type="number"
                  value={state.identityBand}
                  onChange={(e) => update("identityBand", Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
                  min={0}
                  max={7}
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Identity Band Name</p>
                <input
                  type="text"
                  value={state.identityBandName}
                  onChange={(e) => update("identityBandName", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">App Relationship Day</p>
                <input
                  type="number"
                  value={state.appRelationshipDay}
                  onChange={(e) => update("appRelationshipDay", Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Lifetime Phase Day</p>
                <input
                  type="number"
                  value={state.lifetimePhaseDay}
                  onChange={(e) => update("lifetimePhaseDay", Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Total Gurus Encountered</p>
                <input
                  type="number"
                  value={state.totalGurusEncountered}
                  onChange={(e) => update("totalGurusEncountered", Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Guru Resonance (JSON)</p>
                <input
                  type="text"
                  value={state.guruResonance}
                  onChange={(e) => update("guruResonance", e.target.value)}
                  placeholder='e.g. {"arya": 4, "krishna": 3}'
                  className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
                />
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* 14. Lifestyle & Context */}
        <CollapsibleSection title="Lifestyle & Context" icon={Target}>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Wake Time</p>
                <input
                  type="time"
                  value={state.wakeTime}
                  onChange={(e) => update("wakeTime", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sleep Time</p>
                <input
                  type="time"
                  value={state.sleepTime}
                  onChange={(e) => update("sleepTime", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Available Time Daily (min)</p>
                <input
                  type="number"
                  value={state.availableTimeDaily}
                  onChange={(e) => update("availableTimeDaily", Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
                  min={5}
                  max={180}
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Tradition Affinity</p>
                <input
                  type="text"
                  value={state.traditionAffinityDetail}
                  onChange={(e) => update("traditionAffinityDetail", e.target.value)}
                  placeholder="e.g. Advaita Vedanta, Zen, Tibetan Buddhism…"
                  className="w-full px-3 py-2 rounded-xl bg-background/40 border border-border/60 text-sm"
                />
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </div>

      {/* Save */}
      <div className="pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-full bg-primary text-primary-foreground text-sm font-display font-semibold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Save Deep Personalization
            </>
          )}
        </button>
      </div>
    </div>
  );
}
