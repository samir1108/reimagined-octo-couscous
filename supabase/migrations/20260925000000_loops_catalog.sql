-- ============================================
-- LOOPS CATALOG — Unified Loop Library
-- Merges localLoopDetector (detection keywords) + loopLibraryCatalog (user-facing hints)
-- Single source of truth for all loop definitions
-- ============================================

CREATE TABLE IF NOT EXISTS public.loops_catalog (
  id TEXT PRIMARY KEY,                    -- e.g., VAL001
  name TEXT NOT NULL,                     -- e.g., "People-Pleasing"
  category TEXT NOT NULL,                 -- e.g., "VAL", "CTL", "AVD", etc.
  hint TEXT,                              -- User-facing short description
  keywords TEXT[],                        -- Keywords for local detection (lowercase)
  phrases TEXT[],                         -- Longer phrases for higher-confidence detection
  root_wound TEXT,                        -- Core wound for consciousness-engine (separation, unworthiness, etc.)
  chakras TEXT[],                         -- Associated chakras for chakra computation
  way_out TEXT,                           -- Practice prescription / way out
  triggers JSONB,                         -- Guest master summoning triggers
  severity_thresholds JSONB,              -- For detector scoring: { low: 0.3, medium: 0.5, high: 0.7 }
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.loops_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view loops catalog"
  ON public.loops_catalog FOR SELECT
  USING (is_active = TRUE);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_loops_catalog_category ON public.loops_catalog(category);
CREATE INDEX IF NOT EXISTS idx_loops_catalog_active ON public.loops_catalog(is_active);

-- Auto-update updated_at
CREATE TRIGGER update_loops_catalog_updated_at
  BEFORE UPDATE ON public.loops_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- SEED DATA — Core loop definitions
-- This is a subset; full 400+ loops should be seeded via script
-- ============================================

INSERT INTO public.loops_catalog (id, name, category, hint, keywords, phrases, root_wound, chakras, way_out, triggers, severity_thresholds) VALUES
-- VALIDATION
('VAL001', 'People-Pleasing', 'VAL', 'Hard to say no; afraid to disappoint.',
  ARRAY['please', 'approve', 'everyone happy', 'saying no', 'disappoint', 'upset them', 'make them happy'],
  ARRAY['i don''t want to upset', 'i can''t say no', 'what will they think', 'i need them to like me', 'i always put others first'],
  'unworthiness', ARRAY['solar', 'heart'],
  'Practice saying no to small requests; notice the discomfort without acting.',
  '{"rumi": ["please", "disappoint", "upset", "like me"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

('VAL002', 'Perfectionism', 'VAL', 'It has to be flawless or it doesn''t count.',
  ARRAY['perfect', 'flawless', 'mistake', 'not good enough', 'imperfect', 'standards'],
  ARRAY['it has to be perfect', 'i can''t make mistakes', 'not good enough', 'my standards are', 'if it''s not perfect'],
  'unworthiness', ARRAY['solar'],
  'Set "good enough" criteria before starting; practice deliberate imperfection.',
  '{"krishna": ["perfect", "mistake", "standards", "flawless"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

('VAL003', 'External Validation', 'VAL', 'Need to be seen, approved, recognized.',
  ARRAY['validate', 'recognition', 'noticed', 'appreciated', 'acknowledge', 'likes', 'followers'],
  ARRAY['nobody notices', 'need recognition', 'want to be seen', 'need appreciation', 'want acknowledgment'],
  'unworthiness', ARRAY['solar', 'heart'],
  'Self-witnessing practice: notice the urge for external approval without acting on it.',
  '{"nisargadatta": ["validate", "recognition", "noticed", "appreciated"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

('VAL008', 'Productivity Guilt', 'VAL', 'Guilty when resting or pausing.',
  ARRAY['unproductive', 'wasting time', 'lazy', 'should be doing', 'guilty for resting'],
  ARRAY['i feel guilty when i rest', 'i should be productive', 'wasting my time', 'i''m being lazy'],
  'unworthiness', ARRAY['solar', 'root'],
  'Schedule deliberate rest; label guilt as "productivity identity" when it arises.',
  '{"krishna": ["guilty", "rest", "productive", "lazy"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

('VAL009', 'Spiritual Bypassing', 'VAL', 'Using positivity to skip what hurts.',
  ARRAY['everything happens for a reason', 'just let go', 'stay positive', 'it''s all divine'],
  ARRAY['it''s all part of the plan', 'i should just accept', 'good vibes only', 'i''ve transcended that'],
  'separation', ARRAY['crown', 'heart'],
  'Name the emotion you''re bypassing; allow it without spiritual framing.',
  '{"kabir": ["positive", "divine", "transcended", "let go"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

-- CONTROL
('CTL001', 'Micromanaging', 'CTL', 'Can''t trust others to do it right.',
  ARRAY['control', 'manage', 'can''t delegate', 'my way', 'trust others'],
  ARRAY['i need to control', 'can''t trust anyone', 'do it myself', 'no one does it right'],
  'unsafety', ARRAY['solar', 'root'],
  'Delegate one small thing daily; notice the anxiety without intervening.',
  '{"lao_tzu": ["control", "delegate", "trust", "my way"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

('CTL002', 'Catastrophizing', 'CTL', 'Imagining worst-case constantly.',
  ARRAY['worst case', 'disaster', 'terrible', 'everything will fail', 'ruin'],
  ARRAY['everything will go wrong', 'it''s going to be a disaster', 'what if everything falls apart'],
  'unsafety', ARRAY['root', 'solar'],
  'Write down the feared outcome; ask "what''s the evidence for/against?"',
  '{"bodhidharma": ["disaster", "worst", "fail", "ruin"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

('CTL003', 'Overthinking', 'CTL', 'Mind won''t stop spinning.',
  ARRAY['overthink', 'think too much', 'can''t stop thinking', 'spiral', 'head won''t stop'],
  ARRAY['i can''t stop thinking', 'my mind won''t shut up', 'overthinking everything', 'going in circles'],
  'identity_fixation', ARRAY['third_eye', 'crown'],
  'Set a 5-minute timer for thinking; then shift to body/breath.',
  '{"buddha": ["overthink", "spiral", "thinking", "circles"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

-- AVOIDANCE
('AVD001', 'Emotional Avoidance', 'AVD', 'Pushing feelings down to deal later.',
  ARRAY['avoid', 'don''t want to feel', 'push down', 'numb', 'ignore feelings'],
  ARRAY['i don''t want to feel', 'pushing it down', 'rather not think about it', 'i''ll deal with it later'],
  'inner_void', ARRAY['sacral', 'heart'],
  'Name one feeling you''re avoiding; sit with it for 60 seconds.',
  '{"rumi": ["avoid", "feel", "push", "numb"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

('AVD002', 'Procrastination', 'AVD', 'Putting off what matters most.',
  ARRAY['procrastinate', 'put off', 'later', 'delay', 'tomorrow'],
  ARRAY['i''ll do it tomorrow', 'keep putting it off', 'can''t start', 'always delaying'],
  'inner_void', ARRAY['sacral', 'root'],
  'Do the task for 2 minutes only; permission to stop after.',
  '{"vivekananda": ["procrastinate", "tomorrow", "delay", "start"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

-- SURVIVAL
('SRV001', 'Hypervigilance', 'SRV', 'Always scanning for danger.',
  ARRAY['alert', 'danger', 'watch out', 'on guard', 'threat', 'safe'],
  ARRAY['always on guard', 'can''t relax', 'watching for danger', 'something bad will happen'],
  'unsafety', ARRAY['root'],
  'Orient to present safety: name 5 things you see, 4 you feel, 3 you hear.',
  '{"patanjali": ["guard", "danger", "threat", "safe"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

('SRV002', 'Fight Response', 'SRV', 'Quick to anger or attack.',
  ARRAY['angry', 'fight', 'attack', 'defend', 'aggressive', 'rage'],
  ARRAY['i want to fight', 'ready to attack', 'so angry', 'defensive'],
  'powerlessness', ARRAY['solar', 'root'],
  'Box breath (4-4-4-4) when anger rises; name "anger is here".',
  '{"buddha": ["angry", "fight", "attack", "rage"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

('SRV303', 'Freeze Response', 'SRV', 'Shutting down when overwhelmed.',
  ARRAY['freeze', 'stuck', 'paralyzed', 'can''t move', 'shutdown', 'frozen'],
  ARRAY['i''m frozen', 'can''t move', 'completely stuck', 'shutting down', 'i just freeze'],
  'unsafety', ARRAY['root', 'sacral'],
  'Micro-movement: wiggle toes, fingers; name "freeze is here".',
  '{"anandamayi": ["freeze", "stuck", "paralyzed", "shutdown"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

-- BODY
('BOD001', 'Tension Hoarding', 'BOD', 'Shoulders / jaw chronically tight.',
  ARRAY['tension', 'tight', 'tense', 'shoulders', 'neck'],
  ARRAY['holding tension', 'body is tense', 'shoulders are tight'],
  'disconnection', ARRAY['root', 'sacral'],
  'Progressive relaxation scan; exhale longer than inhale.',
  '{"patanjali": ["tension", "tight", "shoulders", "neck"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

('BOD005', 'Somatic Anxiety', 'BOD', 'Heart racing, chest tight, stomach off.',
  ARRAY['stomach', 'heart racing', 'sweating', 'shaking', 'chest tight'],
  ARRAY['my heart is racing', 'stomach is churning', 'chest feels tight', 'can''t breathe'],
  'abandonment', ARRAY['heart', 'sacral', 'solar'],
  'Hand on heart, hand on belly; slow exhale through pursed lips.',
  '{"patanjali": ["heart racing", "chest", "stomach", "breathe"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

-- EMOTIONAL
('EMO001', 'Emotional Flooding', 'EMO', 'Drowning in too much feeling.',
  ARRAY['overwhelmed', 'too much', 'flooded', 'can''t handle', 'drowning'],
  ARRAY['completely overwhelmed', 'too many emotions', 'drowning in feelings', 'can''t handle this'],
  'abandonment', ARRAY['heart', 'sacral'],
  'Anchor: feet on floor, name "overwhelm is here", slow exhale.',
  '{"rumi": ["overwhelmed", "flooded", "drowning", "too much"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

('EMO002', 'Guilt Recycling', 'EMO', 'Can''t forgive yourself; replays.',
  ARRAY['guilty', 'guilt', 'should have', 'my fault'],
  ARRAY['i feel so guilty', 'it''s all my fault', 'should have done differently', 'can''t forgive myself'],
  'unworthiness', ARRAY['solar', 'heart'],
  'Write the regret; read aloud; say "I did my best with what I knew".',
  '{"rumi": ["guilty", "guilt", "fault", "forgive"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

('EMO005', 'Shame Spiral', 'EMO', 'Want to disappear; feel worthless.',
  ARRAY['shame', 'ashamed', 'embarrassed', 'humiliated', 'worthless'],
  ARRAY['so ashamed', 'i''m worthless', 'want to disappear', 'feel so small'],
  'unworthiness', ARRAY['solar', 'heart'],
  'Place hand on heart; whisper "this is shame; I am not my shame".',
  '{"rumi": ["shame", "ashamed", "worthless", "disappear"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

-- MENTAL
('MEN001', 'Rumination', 'MEN', 'Replaying the same thing on loop.',
  ARRAY['ruminate', 'keep thinking', 'can''t let go', 'replay', 'over and over'],
  ARRAY['keep replaying', 'can''t stop thinking about', 'going over and over', 'stuck in my head'],
  'identity_fixation', ARRAY['third_eye'],
  'Set "worry time" 10 min/day; outside it, note "rumination" and return to now.',
  '{"buddha": ["replay", "ruminate", "stuck", "over and over"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

('MEN003', 'Analysis Paralysis', 'MEN', 'Too many options; can''t choose.',
  ARRAY['analyze', 'can''t decide', 'too many options', 'weighing', 'stuck deciding'],
  ARRAY['can''t make a decision', 'analyzing too much', 'too many options', 'going back and forth'],
  'identity_fixation', ARRAY['third_eye', 'solar'],
  'Pick one criterion; decide on that alone; commit for 24 hours.',
  '{"krishna": ["decide", "options", "weighing", "stuck"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

('MEN014', 'Imposter Syndrome', 'MEN', 'They''ll find out I''m a fraud.',
  ARRAY['imposter', 'fraud', 'found out', 'don''t belong', 'faking'],
  ARRAY['they''ll find out', 'i''m a fraud', 'don''t belong here', 'faking it'],
  'identity_fixation', ARRAY['third_eye', 'throat'],
  'List 3 things you''ve done well; read before high-stakes moments.',
  '{"ramana": ["imposter", "fraud", "belong", "faking"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

-- RELATIONSHIP
('REL001', 'Pursuer–Distancer', 'REL', 'More you chase, more they pull away.',
  ARRAY['chase', 'pull away', 'pursue', 'distance', 'closer they run'],
  ARRAY['the more i chase', 'they pull away', 'when i pull back they come closer'],
  'abandonment', ARRAY['heart', 'sacral'],
  'Stop pursuing for 48 hours; notice what arises in the space.',
  '{"rumi": ["chase", "pull away", "pursue", "distance"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

('REL004', 'Codependency', 'REL', 'Can''t function without them.',
  ARRAY['codependent', 'need them', 'can''t be alone', 'depend on', 'without them'],
  ARRAY['can''t function without them', 'need them to be okay', 'lost without them'],
  'abandonment', ARRAY['heart', 'sacral', 'solar'],
  'Do one thing daily entirely for yourself; no checking in.',
  '{"ramana": ["need", "alone", "depend", "lost"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

('REL014', 'Anxious Attachment', 'REL', 'Why aren''t they texting back?',
  ARRAY['attached', 'clingy', 'text back', 'abandoned', 'left'],
  ARRAY['why aren''t they texting', 'feel abandoned', 'too clingy', 'scared they''ll leave'],
  'abandonment', ARRAY['heart', 'root'],
  'Self-soothe: hand on heart, "I am here for me", wait 10 min before checking.',
  '{"rumi": ["text", "abandoned", "clingy", "leave"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

-- IDENTITY
('IDN001', 'Fixed Identity Lock', 'IDN', 'That''s just who I am.',
  ARRAY['that''s just who i am', 'i''ve always been', 'can''t change', 'this is me'],
  ARRAY['that''s just who i am', 'i''ve always been this way', 'i can''t change'],
  'identity_fixation', ARRAY['throat', 'third_eye'],
  'Try on a new identity for one hour: "What if I''m someone who...?"',
  '{"ramana": ["always", "change", "who i am", "fixed"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

-- CORE BELIEFS
('BLF001', 'I''m Not Enough', 'BLF', 'Inadequate at the core.',
  ARRAY['not enough', 'inadequate', 'lacking', 'insufficient'],
  ARRAY['i''m not enough', 'never enough', 'i''m inadequate', 'not worthy'],
  'unworthiness', ARRAY['solar', 'heart'],
  'Daily: "I am enough as I am" — say it even if you don''t believe it.',
  '{"ramana": ["enough", "inadequate", "worthy", "lacking"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

('BLF003', 'I Don''t Deserve Love', 'BLF', 'Unlovable just as I am.',
  ARRAY['don''t deserve', 'unlovable', 'unworthy of love'],
  ARRAY['don''t deserve love', 'i''m unlovable', 'no one could love me'],
  'unworthiness', ARRAY['heart', 'sacral'],
  'Receive one compliment daily without deflecting; just say "thank you".',
  '{"rumi": ["deserve", "love", "unlovable", "worthy"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

-- PURPOSE
('PUR001', 'Purpose Paralysis', 'PUR', 'What''s even the point?',
  ARRAY['purpose', 'meaning', 'what''s the point', 'meaningless', 'why am i'],
  ARRAY['what''s my purpose', 'life feels meaningless', 'why am i here'],
  'separation', ARRAY['crown', 'solar'],
  'Do one small meaningful thing daily; purpose follows action, not thought.',
  '{"vivekananda": ["purpose", "meaning", "point", "meaningless"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

-- SPIRITUAL
('SPR001', 'Awakening Addiction', 'SPR', 'Chasing the next peak experience.',
  ARRAY['awakening', 'enlightenment', 'peak experience', 'bliss'],
  ARRAY['chasing awakening', 'need that bliss again', 'want another peak experience'],
  'separation', ARRAY['crown', 'third_eye'],
  'Practice ordinary moments; notice the sacred in the mundane.',
  '{"kabir": ["awakening", "enlightenment", "peak", "bliss"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

-- PRODUCTIVITY
('PRD001', 'Busy-ness Addiction', 'PRD', 'Idle time feels unsafe.',
  ARRAY['busy', 'so much to do', 'never stop', 'always doing'],
  ARRAY['always busy', 'can''t stop doing', 'need to stay busy', 'being idle scares me'],
  'inner_void', ARRAY['sacral', 'root'],
  'Schedule 15 min of "doing nothing" daily; sit with the discomfort.',
  '{"krishna": ["busy", "stop", "idle", "doing"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

-- COGNITIVE BIAS
('COG003', 'Negativity Bias', 'COG', 'Only see what''s wrong.',
  ARRAY['negative', 'bad things', 'focus on wrong', 'ignore good'],
  ARRAY['only see the negative', 'focus on what went wrong', 'ignoring the good things'],
  'identity_fixation', ARRAY['third_eye', 'crown'],
  'End each day: write 3 things that went well, no matter how small.',
  '{"buddha": ["negative", "wrong", "ignore", "good"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}'),

-- MOTIVATION
('MOT001', 'Motivation-Dependent', 'MOT', 'Need to feel motivated to start.',
  ARRAY['not motivated', 'no motivation', 'don''t feel like it', 'waiting for motivation'],
  ARRAY['don''t feel motivated', 'waiting for motivation', 'can''t do it without motivation'],
  'inner_void', ARRAY['sacral', 'solar'],
  'Action precedes motivation: do 2 minutes before you feel ready.',
  '{"vivekananda": ["motivated", "waiting", "feel like", "start"]}',
  '{"low": 0.3, "medium": 0.5, "high": 0.7}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  hint = EXCLUDED.hint,
  keywords = EXCLUDED.keywords,
  phrases = EXCLUDED.phrases,
  root_wound = EXCLUDED.root_wound,
  chakras = EXCLUDED.chakras,
  way_out = EXCLUDED.way_out,
  triggers = EXCLUDED.triggers,
  severity_thresholds = EXCLUDED.severity_thresholds,
  updated_at = NOW();

-- ============================================
-- VIEW: Loop categories with counts (for Mirror UI)
-- ============================================
CREATE OR REPLACE VIEW public.loop_categories_view AS
SELECT
  category AS key,
  CASE category
    WHEN 'VAL' THEN 'Validation & Worth'
    WHEN 'CTL' THEN 'Control & Worry'
    WHEN 'AVD' THEN 'Avoidance'
    WHEN 'SRV' THEN 'Survival'
    WHEN 'BOD' THEN 'Body'
    WHEN 'ENR' THEN 'Energy'
    WHEN 'EMO' THEN 'Emotional'
    WHEN 'MEN' THEN 'Mental'
    WHEN 'BHV' THEN 'Behavioral'
    WHEN 'HAB' THEN 'Habits'
    WHEN 'SOC' THEN 'Social'
    WHEN 'REL' THEN 'Relationships'
    WHEN 'IDN' THEN 'Identity'
    WHEN 'EGO' THEN 'Ego'
    WHEN 'BLF' THEN 'Core Beliefs'
    WHEN 'PUR' THEN 'Purpose'
    WHEN 'SPR' THEN 'Spiritual'
    WHEN 'PRD' THEN 'Productivity'
    WHEN 'COG' THEN 'Cognitive Bias'
    WHEN 'MOT' THEN 'Motivation'
    ELSE category
  END AS label,
  CASE category
    WHEN 'VAL' THEN '🌀'
    WHEN 'CTL' THEN '🎛️'
    WHEN 'AVD' THEN '🚪'
    WHEN 'SRV' THEN '🛡️'
    WHEN 'BOD' THEN '🫀'
    WHEN 'ENR' THEN '⚡'
    WHEN 'EMO' THEN '💧'
    WHEN 'MEN' THEN '🧠'
    WHEN 'BHV' THEN '🔁'
    WHEN 'HAB' THEN '📱'
    WHEN 'SOC' THEN '👥'
    WHEN 'REL' THEN '💞'
    WHEN 'IDN' THEN '🪞'
    WHEN 'EGO' THEN '👑'
    WHEN 'BLF' THEN '🪨'
    WHEN 'PUR' THEN '🧭'
    WHEN 'SPR' THEN '🕉️'
    WHEN 'PRD' THEN '📈'
    WHEN 'COG' THEN '🔬'
    WHEN 'MOT' THEN '🎯'
    ELSE '❓'
  END AS emoji,
  CASE category
    WHEN 'VAL' THEN 'Patterns around approval, worth, perfectionism.'
    WHEN 'CTL' THEN 'Trying to control what cannot be controlled.'
    WHEN 'AVD' THEN 'Pushing away what wants to be felt.'
    WHEN 'SRV' THEN 'Fight, flight, freeze, hypervigilance.'
    WHEN 'BOD' THEN 'Tension, fatigue, somatic anxiety.'
    WHEN 'ENR' THEN 'Burnout, depletion, stimulants.'
    WHEN 'EMO' THEN 'Guilt, shame, jealousy, loneliness.'
    WHEN 'MEN' THEN 'Rumination, overthinking, imposter.'
    WHEN 'BHV' THEN 'Procrastination, avoidance behaviors.'
    WHEN 'HAB' THEN 'Doom-scrolling, comfort eating.'
    WHEN 'SOC' THEN 'Masking, social anxiety, FOMO.'
    WHEN 'REL' THEN 'Attachment, codependency, distancing.'
    WHEN 'IDN' THEN 'Fixed roles you''ve locked into.'
    WHEN 'EGO' THEN 'Defensiveness, needing to be right.'
    WHEN 'BLF' THEN '''I''m not enough'', ''I don''t deserve...'''
    WHEN 'PUR' THEN 'Meaning, existential dread.'
    WHEN 'SPR' THEN 'Bypassing, awakening addiction.'
    WHEN 'PRD' THEN 'Busy-ness as identity.'
    WHEN 'COG' THEN 'Negativity bias, emotional reasoning.'
    WHEN 'MOT' THEN 'Waiting for motivation or perfect conditions.'
    ELSE ''
  END AS blurb,
  COUNT(*) AS loop_count
FROM public.loops_catalog
WHERE is_active = TRUE
GROUP BY category
ORDER BY category;