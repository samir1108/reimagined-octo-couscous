// Human Map: 9 categories × 11 dimensions = 99
// Single source of truth for dimension IDs, labels, and category metadata.

export interface Dimension {
  id: string;            // e.g. "cog_pattern_recognition"
  category: string;      // e.g. "cognitive"
  raw: string;           // legacy snake key e.g. "pattern_recognition"
  label: string;         // human readable
}

export interface CategoryMeta {
  key: string;
  label: string;
  emoji: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { key: "cognitive",    label: "Cognitive",    emoji: "🧠" },
  { key: "emotional",    label: "Emotional",    emoji: "💖" },
  { key: "physical",     label: "Physical",     emoji: "🏃" },
  { key: "relational",   label: "Relational",   emoji: "🤝" },
  { key: "existential",  label: "Existential",  emoji: "✨" },
  { key: "creative",     label: "Creative",     emoji: "🎨" },
  { key: "professional", label: "Professional", emoji: "💼" },
  { key: "ecological",   label: "Ecological",   emoji: "🌿" },
  { key: "integrative",  label: "Integrative",  emoji: "🔮" },
];

const RAW: Record<string, string[]> = {
  cognitive:   ["analytical_thinking","creative_thinking","meta_cognition","pattern_recognition","learning_speed","cognitive_flexibility","abstract_reasoning","decision_quality","memory_integration","conceptual_depth","intuitive_knowing"],
  emotional:   ["emotional_awareness","emotional_regulation","empathy","compassion","emotional_resilience","vulnerability_capacity","emotional_expression","grief_processing","joy_capacity","anger_integration","fear_relationship"],
  physical:    ["body_awareness","energy_management","sleep_quality","movement_practice","breath_awareness","pain_relationship","sensory_sensitivity","appetite_awareness","tension_patterns","physical_resilience","somatic_intelligence"],
  relational:  ["attachment_style","communication_depth","boundary_setting","conflict_navigation","intimacy_capacity","community_engagement","leadership_presence","listening_depth","forgiveness_practice","trust_capacity","social_awareness"],
  existential: ["meaning_making","death_awareness","purpose_clarity","values_alignment","spiritual_connection","awe_capacity","gratitude_depth","acceptance_level","surrender_capacity","faith_quality","mystery_tolerance"],
  creative:    ["creative_expression","imagination_access","flow_state_frequency","aesthetic_sensitivity","innovation_capacity","playfulness","dream_richness","symbolic_thinking","artistic_skill","creative_courage","vision_clarity"],
  professional:["work_engagement","skill_mastery","career_alignment","financial_wisdom","productivity_quality","collaboration_skill","mentoring_capacity","ethical_standards","stress_management","growth_orientation","service_attitude"],
  ecological:  ["nature_connection","environmental_awareness","consumption_consciousness","place_attachment","seasonal_attunement","animal_connection","plant_awareness","weather_sensitivity","ecological_responsibility","wilderness_comfort","earth_gratitude"],
  integrative: ["mind_body_coherence","shadow_integration","paradox_tolerance","wholeness_sense","flow_between_states","inner_outer_balance","masculine_feminine_balance","tradition_innovation_balance","solitude_community_balance","action_stillness_balance","knowing_unknowing_balance"],
};

const PREFIX: Record<string, string> = {
  cognitive: "cog", emotional: "emo", physical: "phy", relational: "rel",
  existential: "exi", creative: "cre", professional: "pro", ecological: "eco",
  integrative: "int",
};

const titleCase = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const DIMENSIONS: Dimension[] = Object.entries(RAW).flatMap(
  ([category, list]) =>
    list.map((raw) => ({
      id: `${PREFIX[category]}_${raw}`,
      category,
      raw,
      label: titleCase(raw),
    }))
);

export const dimensionById = (id: string) =>
  DIMENSIONS.find((d) => d.id === id);

export const dimensionsByCategory = (cat: string) =>
  DIMENSIONS.filter((d) => d.category === cat);
