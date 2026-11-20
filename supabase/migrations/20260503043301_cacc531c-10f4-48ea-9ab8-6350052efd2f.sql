DO $$
DECLARE
  uids uuid[] := ARRAY['fa089471-bb82-4372-831c-a56ba05edf5e'::uuid, '01f4dd61-2c24-4116-ac49-adcea9fa766c'::uuid];
  t text;
  tables text[] := ARRAY[
    'active_loops','admin_activity_log','ai_usage_log','app_relationship_depth','arc_chapters','arc_echoes','arc_history',
    'arc_intelligence_decisions','arrival_states','band_practice_anchors','challenge_participants','collective_meditation_participants',
    'community_observations','community_reactions','companion_absences','companion_mood','companion_presence','consciousness_signals',
    'credit_transactions','cross_pollination_log','curiosity_queue','daily_dimension_summary','daily_engine_plans','daily_rituals',
    'daily_sankalpa','daily_sessions','daily_tasks','daily_themes','daily_user_context','dimension_map_scores','dream_entries',
    'emotional_timeline','enterprise_notifications','evening_reflections','geo_practice_anchors','graduation_reports',
    'guru_daily_sessions','guru_memory','guru_program_enrollments','guru_quick_sessions','guru_rotations','guru_shishya_relationships',
    'inside_jokes','journal_analyses','journal_entries','journey_group_members','journey_harvest','karma_events',
    'karma_verification_log','legacy_guardians','legacy_vault','life_domain_scores','life_events','living_teachings',
    'master_theme_teachings','memory_patterns','mood_pulses','notifications','observation_tasks','org_members',
    'practice_effectiveness','practice_journal','practice_runs','practice_sessions','practice_sessions_v2','pre_journey_mirrors',
    'pre_journey_progress','predictive_signals','profiles','program_day_progress','program_enrollments','regression_events',
    'retention_signals','sacred_moments','session_continuity','sessions','shadow_patterns','shared_language','specialty_activations',
    'speed_profile_history','spiritual_dna_assessments','temple_ai_conversations','temple_practice_sessions','theme_arcs',
    'theme_evolution_log','theme_memory','today_practice_packs','trust_milestones','user_arc_preferences',
    'user_assessment_answers','user_assessment_results','user_audio_preferences','user_consciousness_layers',
    'user_consciousness_profile','user_credits','user_daily_gates','user_goals','user_goals_history','user_health_scores',
    'user_journey_arcs','user_journey_log','user_journeys','user_karma','user_life_stage','user_loops',
    'user_practice_constellation','user_practice_constellation_history','user_practice_levels','user_program_progress',
    'user_programs','user_psyche_profile','user_roles','user_samskaras','user_session_history','user_speed_profile',
    'user_spiritual_dna','user_text_bookmarks','user_text_reads','witness_circle_members'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = t AND schemaname = 'public') THEN
      EXECUTE format('DELETE FROM public.%I WHERE user_id = ANY($1)', t) USING uids;
    END IF;
  END LOOP;

  -- Delete from auth.users (cascades to auth.identities, sessions, refresh_tokens)
  DELETE FROM auth.users WHERE id = ANY(uids);
END $$;
