
CREATE TABLE public.user_psyche_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  
  -- Beliefs System
  beliefs jsonb NOT NULL DEFAULT '{"core_beliefs": [], "limiting_beliefs": [], "empowering_beliefs": [], "belief_origins": {}}'::jsonb,
  
  -- Archetypes
  archetypes jsonb NOT NULL DEFAULT '{"dominant": null, "shadow": null, "aspirational": null, "active_archetypes": [], "evolution_timeline": []}'::jsonb,
  
  -- Shadow Profile
  shadow jsonb NOT NULL DEFAULT '{"disowned_parts": [], "projection_patterns": [], "integration_progress": 0, "shadow_triggers": []}'::jsonb,
  
  -- Values & Priorities
  values_profile jsonb NOT NULL DEFAULT '{"detected_values": [], "stated_values": [], "alignment_score": 0, "value_conflicts": []}'::jsonb,
  
  -- Defense Mechanisms
  defenses jsonb NOT NULL DEFAULT '{"active_defenses": [], "trigger_defense_map": {}, "primary_defense": null, "defense_awareness": 0}'::jsonb,
  
  -- Emotional Signatures
  emotional_signatures jsonb NOT NULL DEFAULT '{"baseline_state": null, "emotional_range": 0, "suppressed_emotions": [], "emotional_maturity": 0, "dominant_emotions": []}'::jsonb,
  
  -- Inner Voices / Sub-personalities
  inner_voices jsonb NOT NULL DEFAULT '{"inner_critic": {"strength": 0, "frequency": 0, "common_messages": []}, "inner_child": {"state": null, "needs": []}, "saboteur": {"patterns": [], "strength": 0}, "wise_self": {"access_frequency": 0, "messages": []}}'::jsonb,
  
  -- Life Domains Health
  life_domains jsonb NOT NULL DEFAULT '{"health": 0, "relationships": 0, "career": 0, "finances": 0, "creativity": 0, "spirituality": 0, "family": 0, "social": 0}'::jsonb,
  
  -- Cognitive Patterns
  cognitive_patterns jsonb NOT NULL DEFAULT '{"thinking_traps": [], "flexibility_score": 0, "rumination_ratio": 0, "dominant_cognitive_style": null}'::jsonb,
  
  -- Somatic Map
  somatic_map jsonb NOT NULL DEFAULT '{"tension_areas": [], "emotion_body_map": {}, "body_awareness_score": 0, "chronic_patterns": []}'::jsonb,
  
  -- Attachment Style
  attachment jsonb NOT NULL DEFAULT '{"primary_style": null, "secondary_style": null, "evolution": [], "relational_triggers": [], "secure_percentage": 0}'::jsonb,
  
  -- Purpose & Meaning
  purpose jsonb NOT NULL DEFAULT '{"clarity_score": 0, "ikigai": {"love": [], "good_at": [], "world_needs": [], "paid_for": []}, "meaning_patterns": [], "life_direction": null}'::jsonb,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- RLS
ALTER TABLE public.user_psyche_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own psyche profile"
  ON public.user_psyche_profile FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own psyche profile"
  ON public.user_psyche_profile FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own psyche profile"
  ON public.user_psyche_profile FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Auto-update timestamp
CREATE TRIGGER update_psyche_profile_updated_at
  BEFORE UPDATE ON public.user_psyche_profile
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
