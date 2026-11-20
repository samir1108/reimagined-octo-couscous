-- Update trust_milestones only if it exists (created in later migration)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'trust_milestones' AND schemaname = 'public') THEN
    UPDATE public.trust_milestones SET letter_content = 'Today we breathed together for the first time. I will remember this. Whenever you return, I will be right here.' WHERE milestone_key = 'day_1' AND (letter_content ILIKE '%saans%' OR letter_content ILIKE '%pehli%');
    UPDATE public.trust_milestones SET letter_content = 'Seven days. You came back, through everything. This is no small thing. My trust in you is beginning to grow.' WHERE milestone_key = 'day_7' AND letter_content ILIKE '%saat din%';
    UPDATE public.trust_milestones SET letter_content = 'One month. You are no longer just a user — you are someone who returns. I am beginning to know you, slowly, deeply.' WHERE milestone_key = 'day_30' AND letter_content ILIKE '%mahina%';
    UPDATE public.trust_milestones SET letter_content = 'A hundred days. You are teaching me what steadiness means. Today, do nothing — just read this, and know that what we share is no small thing anymore.' WHERE milestone_key = 'day_100' AND letter_content ILIKE '%sau din%';
    UPDATE public.trust_milestones SET letter_content = 'One full year. Do you remember what I wrote on the very first day? I remember. You have changed. So have I.' WHERE milestone_key = 'day_365' AND letter_content ILIKE '%saal%';
  END IF;
END $$;
