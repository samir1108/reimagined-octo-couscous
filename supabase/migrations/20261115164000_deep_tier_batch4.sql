-- ============================================================
-- DEEP TIER — batch 4 (closes the 30-deep target)
-- ============================================================

INSERT INTO public.content_ingredients
  (id, kind, label, summary, body, practice, depth, step_kind, params,
   paths, dimensions, loop_families, min_journey_day, status, safety_class)
VALUES
('deep:p9', 'practice', 'Candle Gaze, Long',
 'Twelve minutes of steady gazing. When the eyes water, close them and keep the image.',
 'Twelve minutes of steady gazing. When the eyes water, close them and keep the after-image; the seeing continues inside.',
 'trataka', 'deep', 'practice', '{"family":"observation","level":3,"exercise":"long trataka","durationSeconds":720}',
 ARRAY['raja'], ARRAY['awareness','body'], ARRAY['MEN','COG','CTL'], 21, 'draft', 'B'),
('deep:p10', 'practice', 'Metta for the Difficult One',
 'Twelve minutes of loving kindness, ending with the person you least want to include.',
 'Twelve minutes of loving kindness, ending with the person you least want to include. Do not force warmth; just stop excluding.',
 'metta', 'deep', 'practice', '{"family":"bhakti","level":3,"exercise":"metta for the difficult person","durationSeconds":720}',
 ARRAY['bhakti'], ARRAY['emotion','connection'], ARRAY['REL','EMO','VAL'], 30, 'draft', 'B'),
('deep:k7', 'knowledge', 'The Two Arrows',
 'The first arrow is the event. The second is the story about the event, and you shoot it yourself.',
 'The first arrow is the event. The second is the story about the event, and that one you shoot yourself, repeatedly, long after the first has landed.',
 NULL, 'deep', 'wisdom-read', '{"passage":"The first arrow is the event. The second is the story about the event, and that one you shoot yourself, repeatedly, long after the first has landed.","source":"Dhammapada (paraphrase)"}',
 ARRAY['jnana'], ARRAY['thought','emotion'], ARRAY['NAR','COG','EMO'], 21, 'draft', 'B'),
('deep:k8', 'knowledge', 'Attention Is Love',
 'What you give attention to grows. This is the whole of practice, stated plainly.',
 'What you give attention to grows. Not because attention is magic, but because it is the only currency you actually spend.',
 NULL, 'deep', 'wisdom-read', '{"passage":"What you give attention to grows. Not because attention is magic, but because it is the only currency you actually spend.","source":"original"}',
 ARRAY['raja','jnana'], ARRAY['awareness','connection'], ARRAY['REL','PRD','SPR'], 30, 'draft', 'B'),
('deep:r7', 'reflection', 'What You Would Keep',
 'If you could keep only one thing from this year, what would it be?',
 'If you could keep only one thing from this year, what would it be, and what does that reveal about the rest?',
 NULL, 'deep', 'journal', '{"questions":["If you could keep only one thing from this year, what would it be, and what does that reveal about the rest?"],"minChars":40}',
 ARRAY['jnana'], ARRAY['awareness','emotion'], ARRAY['ATT','PUR','DEC'], 30, 'draft', 'B'),
('deep:r8', 'reflection', 'Where You Are Still Proving',
 'Where are you still proving something, and to whom?',
 'Where are you still proving something, and to whom, and what would stop if you stopped?',
 NULL, 'deep', 'journal', '{"questions":["Where are you still proving something, and to whom, and what would stop if you stopped?"],"minChars":40}',
 ARRAY['jnana','karma'], ARRAY['action','emotion'], ARRAY['EGO','VAL','PRD'], 45, 'draft', 'B')
ON CONFLICT (id) DO NOTHING;

UPDATE public.content_ingredients
SET status = 'published', updated_at = now()
WHERE id LIKE 'deep:%'
  AND status = 'draft'
  AND NOT EXISTS (
    SELECT 1 FROM public.validate_content_ingredient(content_ingredients.id)
  );
