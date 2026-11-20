-- ============================================================
-- LOOP FAMILY CONTENT — batch 1
-- ------------------------------------------------------------
-- One practice + one reflection for each of the 26 loop families in the
-- catalog. Authored as drafts and auto-published only when they clear
-- validate_content_ingredient(). Safe to re-run.
-- ============================================================

INSERT INTO public.content_ingredients
  (id, kind, label, summary, body, practice, depth, step_kind, params,
   paths, dimensions, loop_families, min_journey_day, status, safety_class)
VALUES
-- ATT
('loop:ATT:practice', 'practice', 'Let the Held Thing Rest',
 'Name one thing you have been holding, then sit and let it be held by nothing for five minutes.',
 'Name one thing you have been holding, then sit and let it be held by nothing for five minutes.',
 'witness', 'medium', 'witness', '{"durationSeconds":300,"object":"the held thing"}',
 ARRAY['jnana','raja'], ARRAY['thought','awareness'], ARRAY['ATT','CTL'], 7, 'draft', 'B'),
('loop:ATT:reflect', 'reflection', 'What Are You Holding',
 'What are you holding on to that has already let go of you?',
 'What are you holding on to that has already let go of you?',
 NULL, 'light', 'journal', '{"questions":["What are you holding on to that has already let go of you?"],"minChars":40}',
 ARRAY['jnana'], ARRAY['thought','emotion'], ARRAY['ATT','EMO'], NULL, 'draft', 'B'),

-- AVD
('loop:AVD:practice', 'practice', 'Do the Avoided First Step',
 'Choose the task you keep postponing and do only its first two minutes before anything else.',
 'Choose the task you keep postponing and do only its first two minutes before anything else.',
 'selfless_action', 'light', 'practice', '{"family":"karma","level":1,"exercise":"two-minute first step","durationSeconds":120}',
 ARRAY['karma'], ARRAY['action','emotion'], ARRAY['AVD','MOT'], NULL, 'draft', 'B'),
('loop:AVD:reflect', 'reflection', 'Name the Postponed Thing',
 'Which task have you postponed the longest, and what feeling sits underneath it?',
 'Which task have you postponed the longest, and what feeling sits underneath it?',
 NULL, 'light', 'journal', '{"questions":["Which task have you postponed the longest, and what feeling sits underneath it?"],"minChars":40}',
 ARRAY['karma'], ARRAY['action','thought'], ARRAY['AVD','DEC'], NULL, 'draft', 'B'),

-- CMP
('loop:CMP:practice', 'practice', 'Close the Comparison',
 'Sit and notice the mind measuring you against someone, then let the measurement pass unanswered.',
 'Sit and notice the mind measuring you against someone, then let the measurement pass unanswered.',
 'witness', 'light', 'witness', '{"durationSeconds":240,"object":"comparison"}',
 ARRAY['raja','jnana'], ARRAY['emotion','thought'], ARRAY['CMP','VAL'], NULL, 'draft', 'B'),
('loop:CMP:reflect', 'reflection', 'Who Did You Measure Against',
 'Who did you compare yourself to today, and what did the comparison protect you from?',
 'Who did you compare yourself to today, and what did the comparison protect you from?',
 NULL, 'light', 'journal', '{"questions":["Who did you compare yourself to today, and what did the comparison protect you from?"],"minChars":40}',
 ARRAY['jnana'], ARRAY['emotion','thought'], ARRAY['CMP','SOC'], NULL, 'draft', 'B'),

-- CTL
('loop:CTL:practice', 'practice', 'Loosen the Grip',
 'Breathe four in, hold, six out, and let one plan you cannot control stay unresolved for the whole sit.',
 'Breathe four in, hold, six out, and let one plan you cannot control stay unresolved for the whole sit.',
 'breath', 'medium', 'breathwork', '{"pattern":"4-4-6","durationSeconds":240}',
 ARRAY['raja'], ARRAY['body','thought'], ARRAY['CTL','ENR'], 7, 'draft', 'B'),
('loop:CTL:reflect', 'reflection', 'What Refused to Obey',
 'What did you try to control today, and what happened when it did not obey?',
 'What did you try to control today, and what happened when it did not obey?',
 NULL, 'light', 'journal', '{"questions":["What did you try to control today, and what happened when it did not obey?"],"minChars":40}',
 ARRAY['jnana'], ARRAY['thought','emotion'], ARRAY['CTL','PRD'], NULL, 'draft', 'B'),

-- NAR
('loop:NAR:practice', 'practice', 'Stop Mid-Story',
 'Tell yourself the story you keep repeating, then stop mid-sentence and sit in the silence after it.',
 'Tell yourself the story you keep repeating, then stop mid-sentence and sit in the silence after it.',
 'witness', 'medium', 'witness', '{"durationSeconds":300,"object":"the story"}',
 ARRAY['jnana','raja'], ARRAY['thought','awareness'], ARRAY['NAR','MEN'], 7, 'draft', 'B'),
('loop:NAR:reflect', 'reflection', 'Which Story Got Repeats',
 'Which story did you tell more than once today, and who were you hoping would believe it?',
 'Which story did you tell more than once today, and who were you hoping would believe it?',
 NULL, 'light', 'journal', '{"questions":["Which story did you tell more than once today, and who were you hoping would believe it?"],"minChars":40}',
 ARRAY['jnana'], ARRAY['thought','emotion'], ARRAY['NAR','VAL'], NULL, 'draft', 'B'),

-- SRV
('loop:SRV:practice', 'practice', 'Serve Without Witness',
 'Do one small act for someone today and tell no one about it, not even as a hint.',
 'Do one small act for someone today and tell no one about it, not even as a hint.',
 'serving', 'light', 'practice', '{"family":"karma","level":1,"exercise":"unseen act of service","durationSeconds":240}',
 ARRAY['karma'], ARRAY['action','emotion'], ARRAY['SRV','SOC'], NULL, 'draft', 'B'),
('loop:SRV:reflect', 'reflection', 'Where Did You Give to Be Seen',
 'Where did you give today, and where did you give only so that it would be noticed?',
 'Where did you give today, and where did you give only so that it would be noticed?',
 NULL, 'light', 'journal', '{"questions":["Where did you give today, and where did you give only so that it would be noticed?"],"minChars":40}',
 ARRAY['karma','jnana'], ARRAY['emotion','action'], ARRAY['SRV','EGO'], NULL, 'draft', 'B'),

-- VAL
('loop:VAL:practice', 'practice', 'Sit Without Approval',
 'Sit where nobody can see you and notice how much of the day was performed for an audience.',
 'Sit where nobody can see you and notice how much of the day was performed for an audience.',
 'witness', 'medium', 'witness', '{"durationSeconds":240,"object":"the audience"}',
 ARRAY['raja','jnana'], ARRAY['emotion','thought'], ARRAY['VAL','ATT'], 7, 'draft', 'B'),
('loop:VAL:reflect', 'reflection', 'Whose Approval Did You Shape For',
 'Whose approval did you shape yourself for today, and what did it cost you?',
 'Whose approval did you shape yourself for today, and what did it cost you?',
 NULL, 'light', 'journal', '{"questions":["Whose approval did you shape yourself for today, and what did it cost you?"],"minChars":40}',
 ARRAY['jnana'], ARRAY['emotion','thought'], ARRAY['VAL','EGO'], NULL, 'draft', 'B'),

-- BHV
('loop:BHV:practice', 'practice', 'Interrupt the Autopilot',
 'Pick one automatic action today, then pause for three breaths before you do it.',
 'Pick one automatic action today, then pause for three breaths before you do it.',
 'observation', 'light', 'practice', '{"family":"observation","level":1,"exercise":"three-breath pause before one automatic action","durationSeconds":180}',
 ARRAY['raja','jnana'], ARRAY['body','awareness'], ARRAY['BHV','HAB'], NULL, 'draft', 'B'),
('loop:BHV:reflect', 'reflection', 'Which Habit Ran Today',
 'Which automatic action did you notice today, and what was it standing in for?',
 'Which automatic action did you notice today, and what was it standing in for?',
 NULL, 'light', 'journal', '{"questions":["Which automatic action did you notice today, and what was it standing in for?"],"minChars":40}',
 ARRAY['jnana'], ARRAY['thought','awareness'], ARRAY['BHV','COG'], NULL, 'draft', 'B'),

-- BLF
('loop:BLF:practice', 'practice', 'Hold a Belief Lightly',
 'Take one belief you are certain of and, for five minutes, argue only the other side.',
 'Take one belief you are certain of and, for five minutes, argue only the other side.',
 'inquiry', 'medium', 'practice', '{"family":"self_inquiry","level":2,"exercise":"argue the opposite of one belief","durationSeconds":300}',
 ARRAY['jnana'], ARRAY['thought','awareness'], ARRAY['BLF','EGO'], 14, 'draft', 'B'),
('loop:BLF:reflect', 'reflection', 'Which Belief Went Unchecked',
 'Which belief did you defend today without re-examining it?',
 'Which belief did you defend today without re-examining it?',
 NULL, 'light', 'journal', '{"questions":["Which belief did you defend today without re-examining it?"],"minChars":40}',
 ARRAY['jnana'], ARRAY['thought'], ARRAY['BLF','IDN'], NULL, 'draft', 'B'),

-- BOD
('loop:BOD:practice', 'practice', 'Release One Holding',
 'Scan slowly and release the one place the body is gripping, without forcing it open.',
 'Scan slowly and release the one place the body is gripping, without forcing it open.',
 'body', 'light', 'practice', '{"family":"body_awareness","level":1,"exercise":"release the tightest place","durationSeconds":300}',
 ARRAY['raja'], ARRAY['body','emotion'], ARRAY['BOD','ENR'], NULL, 'draft', 'B'),
('loop:BOD:reflect', 'reflection', 'Where the Body Held On',
 'Where was your body holding tension today, and what was the tension protecting?',
 'Where was your body holding tension today, and what was the tension protecting?',
 NULL, 'light', 'journal', '{"questions":["Where was your body holding tension today, and what was the tension protecting?"],"minChars":40}',
 ARRAY['raja'], ARRAY['body','emotion'], ARRAY['BOD','EMO'], NULL, 'draft', 'B'),

-- COG
('loop:COG:practice', 'practice', 'Count the Thoughts',
 'Count thoughts without following any of them. When you reach ten, begin again at one.',
 'Count thoughts without following any of them. When you reach ten, begin again at one.',
 'witness', 'medium', 'witness', '{"durationSeconds":240,"object":"thoughts"}',
 ARRAY['raja','jnana'], ARRAY['thought','awareness'], ARRAY['COG','MEN'], 7, 'draft', 'B'),
('loop:COG:reflect', 'reflection', 'Which Thought Returned Most',
 'Which thought returned most today, and what did it want you to do?',
 'Which thought returned most today, and what did it want you to do?',
 NULL, 'light', 'journal', '{"questions":["Which thought returned most today, and what did it want you to do?"],"minChars":40}',
 ARRAY['jnana'], ARRAY['thought'], ARRAY['COG','NAR'], NULL, 'draft', 'B'),

-- CRE
('loop:CRE:practice', 'practice', 'Make Something Small',
 'Make one small useless thing, a line or a sound, with no intention of it being good.',
 'Make one small useless thing, a line or a sound, with no intention of it being good.',
 'observation', 'light', 'practice', '{"family":"observation","level":1,"exercise":"make one small useless thing","durationSeconds":360}',
 ARRAY['raja','karma'], ARRAY['action','emotion'], ARRAY['CRE','PRD'], NULL, 'draft', 'B'),
('loop:CRE:reflect', 'reflection', 'What You Stopped Making',
 'What did you want to make today but stopped because it would not be good enough?',
 'What did you want to make today but stopped because it would not be good enough?',
 NULL, 'light', 'journal', '{"questions":["What did you want to make today but stopped because it would not be good enough?"],"minChars":40}',
 ARRAY['karma'], ARRAY['emotion','action'], ARRAY['CRE','VAL'], NULL, 'draft', 'B'),

-- DEC
('loop:DEC:practice', 'practice', 'One Decision, One Minute',
 'Choose the smaller of two decisions in one minute, then do not revisit it for the rest of the day.',
 'Choose the smaller of two decisions in one minute, then do not revisit it for the rest of the day.',
 'observation', 'light', 'practice', '{"family":"observation","level":1,"exercise":"decide one small thing in sixty seconds","durationSeconds":120}',
 ARRAY['karma','raja'], ARRAY['action','thought'], ARRAY['DEC','CTL'], NULL, 'draft', 'B'),
('loop:DEC:reflect', 'reflection', 'Which Decision Waited',
 'Which decision did you postpone today, and what were you avoiding by waiting?',
 'Which decision did you postpone today, and what were you avoiding by waiting?',
 NULL, 'light', 'journal', '{"questions":["Which decision did you postpone today, and what were you avoiding by waiting?"],"minChars":40}',
 ARRAY['jnana'], ARRAY['thought','action'], ARRAY['DEC','AVD'], NULL, 'draft', 'B'),

-- EGO
('loop:EGO:practice', 'practice', 'Be Ordinary',
 'Sit and let the story of being special set itself down, without replacing it with a better story.',
 'Sit and let the story of being special set itself down, without replacing it with a better story.',
 'witness', 'deep', 'witness', '{"durationSeconds":420,"object":"the self-image"}',
 ARRAY['jnana','raja'], ARRAY['awareness','thought'], ARRAY['EGO','IDN'], 21, 'draft', 'B'),
('loop:EGO:reflect', 'reflection', 'Where You Needed to Shine',
 'Where did you need to be seen as more than you are today?',
 'Where did you need to be seen as more than you are today?',
 NULL, 'light', 'journal', '{"questions":["Where did you need to be seen as more than you are today?"],"minChars":40}',
 ARRAY['jnana'], ARRAY['emotion','thought'], ARRAY['EGO','VAL'], NULL, 'draft', 'B'),

-- EMO
('loop:EMO:practice', 'practice', 'Let the Wave Finish',
 'Stay with one emotion without naming or fixing it, and let it rise, peak and leave on its own.',
 'Stay with one emotion without naming or fixing it, and let it rise, peak and leave on its own.',
 'witness', 'medium', 'witness', '{"durationSeconds":300,"object":"the emotion"}',
 ARRAY['raja'], ARRAY['emotion','body'], ARRAY['EMO','BOD'], 7, 'draft', 'B'),
('loop:EMO:reflect', 'reflection', 'Which Emotion Went Underground',
 'Which emotion did you push down today, and where did it go instead?',
 'Which emotion did you push down today, and where did it go instead?',
 NULL, 'light', 'journal', '{"questions":["Which emotion did you push down today, and where did it go instead?"],"minChars":40}',
 ARRAY['jnana'], ARRAY['emotion','body'], ARRAY['EMO','AVD'], NULL, 'draft', 'B'),

-- ENR
('loop:ENR:practice', 'practice', 'Rest Without Earning',
 'Lie down for eight minutes with no goal at all. Rest is the practice, not the reward for one.',
 'Lie down for eight minutes with no goal at all. Rest is the practice, not the reward for one.',
 'body', 'medium', 'practice', '{"family":"body_awareness","level":1,"exercise":"rest with no goal","durationSeconds":480}',
 ARRAY['raja'], ARRAY['body','emotion'], ARRAY['ENR','PRD'], 7, 'draft', 'B'),
('loop:ENR:reflect', 'reflection', 'Where Your Energy Leaked',
 'What did you spend energy on today that did not actually need you?',
 'What did you spend energy on today that did not actually need you?',
 NULL, 'light', 'journal', '{"questions":["What did you spend energy on today that did not actually need you?"],"minChars":40}',
 ARRAY['jnana'], ARRAY['body','action'], ARRAY['ENR','CTL'], NULL, 'draft', 'B'),

-- HAB
('loop:HAB:practice', 'practice', 'Same Cue, New Reply',
 'Choose one cue you know well and answer it once today with something deliberately different.',
 'Choose one cue you know well and answer it once today with something deliberately different.',
 'observation', 'light', 'practice', '{"family":"observation","level":1,"exercise":"one cue answered differently","durationSeconds":240}',
 ARRAY['raja','karma'], ARRAY['body','action'], ARRAY['HAB','BHV'], NULL, 'draft', 'B'),
('loop:HAB:reflect', 'reflection', 'Which Habit Ran Without Consent',
 'Which habit ran today without your consent, and what was the cue that started it?',
 'Which habit ran today without your consent, and what was the cue that started it?',
 NULL, 'light', 'journal', '{"questions":["Which habit ran today without your consent, and what was the cue that started it?"],"minChars":40}',
 ARRAY['jnana'], ARRAY['action','awareness'], ARRAY['HAB','BHV'], NULL, 'draft', 'B'),

-- IDN
('loop:IDN:practice', 'practice', 'Drop the Role',
 'Name the role you played most today, then sit and see what is left when you stop playing it.',
 'Name the role you played most today, then sit and see what is left when you stop playing it.',
 'inquiry', 'deep', 'practice', '{"family":"self_inquiry","level":2,"exercise":"who is left without the role","durationSeconds":360}',
 ARRAY['jnana'], ARRAY['thought','awareness'], ARRAY['IDN','EGO'], 21, 'draft', 'B'),
('loop:IDN:reflect', 'reflection', 'Which Role You Wore Longest',
 'Which role did you wear longest today, and what did it ask you to hide?',
 'Which role did you wear longest today, and what did it ask you to hide?',
 NULL, 'light', 'journal', '{"questions":["Which role did you wear longest today, and what did it ask you to hide?"],"minChars":40}',
 ARRAY['jnana'], ARRAY['thought','emotion'], ARRAY['IDN','EGO'], NULL, 'draft', 'B'),

-- LRN
('loop:LRN:practice', 'practice', 'Learn Without Mastering',
 'Practise something you are bad at for five minutes and stop before you improve.',
 'Practise something you are bad at for five minutes and stop before you improve.',
 'observation', 'light', 'practice', '{"family":"observation","level":1,"exercise":"five minutes of being a beginner","durationSeconds":300}',
 ARRAY['raja','jnana'], ARRAY['thought','action'], ARRAY['LRN','CMP'], NULL, 'draft', 'B'),
('loop:LRN:reflect', 'reflection', 'Where You Required Excellence',
 'Where did you need to be good at something today before allowing yourself to begin?',
 'Where did you need to be good at something today before allowing yourself to begin?',
 NULL, 'light', 'journal', '{"questions":["Where did you need to be good at something today before allowing yourself to begin?"],"minChars":40}',
 ARRAY['jnana'], ARRAY['thought','emotion'], ARRAY['LRN','VAL'], NULL, 'draft', 'B'),

-- MEN
('loop:MEN:practice', 'practice', 'One Object Only',
 'Give attention one object, the breath at the nostrils, and let everything else stay as background.',
 'Give attention one object, the breath at the nostrils, and let everything else stay as background.',
 'breath', 'medium', 'breathwork', '{"pattern":"natural","durationSeconds":300}',
 ARRAY['raja'], ARRAY['thought','body'], ARRAY['MEN','COG'], 7, 'draft', 'B'),
('loop:MEN:reflect', 'reflection', 'The Loudest Thought',
 'What was the loudest thought today, and what was it trying to protect?',
 'What was the loudest thought today, and what was it trying to protect?',
 NULL, 'light', 'journal', '{"questions":["What was the loudest thought today, and what was it trying to protect?"],"minChars":40}',
 ARRAY['jnana'], ARRAY['thought'], ARRAY['MEN','COG'], NULL, 'draft', 'B'),

-- MOT
('loop:MOT:practice', 'practice', 'Start at Two Minutes',
 'Set a two-minute timer and begin the thing you have no motivation for. Stop when it ends.',
 'Set a two-minute timer and begin the thing you have no motivation for. Stop when it ends.',
 'observation', 'light', 'practice', '{"family":"observation","level":1,"exercise":"two minutes of starting","durationSeconds":120}',
 ARRAY['karma'], ARRAY['action','emotion'], ARRAY['MOT','AVD'], NULL, 'draft', 'B'),
('loop:MOT:reflect', 'reflection', 'What You Waited to Feel Ready For',
 'What did you wait to feel motivated for today, and what would two minutes have changed?',
 'What did you wait to feel motivated for today, and what would two minutes have changed?',
 NULL, 'light', 'journal', '{"questions":["What did you wait to feel motivated for today, and what would two minutes have changed?"],"minChars":40}',
 ARRAY['karma'], ARRAY['action','thought'], ARRAY['MOT','AVD'], NULL, 'draft', 'B'),

-- PRD
('loop:PRD:practice', 'practice', 'Do Less, Fully',
 'Choose one task, remove everything else from the desk, and work only until the timer ends.',
 'Choose one task, remove everything else from the desk, and work only until the timer ends.',
 'observation', 'light', 'practice', '{"family":"observation","level":1,"exercise":"single-task until the bell","durationSeconds":360}',
 ARRAY['karma','raja'], ARRAY['action','thought'], ARRAY['PRD','CTL'], NULL, 'draft', 'B'),
('loop:PRD:reflect', 'reflection', 'What Could Have Been Half',
 'What did you do today that could have been done with half the effort and the same result?',
 'What did you do today that could have been done with half the effort and the same result?',
 NULL, 'light', 'journal', '{"questions":["What did you do today that could have been done with half the effort and the same result?"],"minChars":40}',
 ARRAY['karma'], ARRAY['action','thought'], ARRAY['PRD','ENR'], NULL, 'draft', 'B'),

-- PUR
('loop:PUR:practice', 'practice', 'Ask the Larger Question',
 'Sit with the question of what this life is for, without answering it or resolving the discomfort.',
 'Sit with the question of what this life is for, without answering it or resolving the discomfort.',
 'inquiry', 'deep', 'practice', '{"family":"self_inquiry","level":2,"exercise":"what is this life for","durationSeconds":360}',
 ARRAY['jnana'], ARRAY['awareness','thought'], ARRAY['PUR','SPR'], 21, 'draft', 'B'),
('loop:PUR:reflect', 'reflection', 'When You Felt Most Alive',
 'When did you feel most alive this week, and what were you doing in that moment?',
 'When did you feel most alive this week, and what were you doing in that moment?',
 NULL, 'light', 'journal', '{"questions":["When did you feel most alive this week, and what were you doing in that moment?"],"minChars":40}',
 ARRAY['jnana'], ARRAY['emotion','awareness'], ARRAY['PUR','MOT'], NULL, 'draft', 'B'),

-- REL
('loop:REL:practice', 'practice', 'Listen Without Replying',
 'In your next conversation, listen until the other person finishes, then count three breaths before replying.',
 'In your next conversation, listen until the other person finishes, then count three breaths before replying.',
 'observation', 'light', 'practice', '{"family":"observation","level":1,"exercise":"three breaths before replying","durationSeconds":300}',
 ARRAY['karma','raja'], ARRAY['emotion','action'], ARRAY['REL','SOC'], NULL, 'draft', 'B'),
('loop:REL:reflect', 'reflection', 'Which Conversation You Did Not Hear',
 'Which conversation today did you listen to only in order to prepare your reply?',
 'Which conversation today did you listen to only in order to prepare your reply?',
 NULL, 'light', 'journal', '{"questions":["Which conversation today did you listen to only in order to prepare your reply?"],"minChars":40}',
 ARRAY['jnana'], ARRAY['emotion','action'], ARRAY['REL','EGO'], NULL, 'draft', 'B'),

-- SOC
('loop:SOC:practice', 'practice', 'Step Toward One Person',
 'Send one honest message to a person you have been avoiding, without explaining yourself.',
 'Send one honest message to a person you have been avoiding, without explaining yourself.',
 'selfless_action', 'light', 'practice', '{"family":"karma","level":1,"exercise":"one honest message","durationSeconds":240}',
 ARRAY['karma'], ARRAY['action','emotion'], ARRAY['SOC','AVD'], NULL, 'draft', 'B'),
('loop:SOC:reflect', 'reflection', 'Who You Avoided',
 'Who did you avoid today, and what did you imagine they would think of you?',
 'Who did you avoid today, and what did you imagine they would think of you?',
 NULL, 'light', 'journal', '{"questions":["Who did you avoid today, and what did you imagine they would think of you?"],"minChars":40}',
 ARRAY['jnana'], ARRAY['emotion','thought'], ARRAY['SOC','VAL'], NULL, 'draft', 'B'),

-- SPR
('loop:SPR:practice', 'practice', 'Stop Improving',
 'Sit with no technique at all. If you notice yourself trying to become something, simply stop.',
 'Sit with no technique at all. If you notice yourself trying to become something, simply stop.',
 'witness', 'deep', 'witness', '{"durationSeconds":420,"object":"nothing in particular"}',
 ARRAY['jnana','raja'], ARRAY['awareness','thought'], ARRAY['SPR','EGO'], 21, 'draft', 'B'),
('loop:SPR:reflect', 'reflection', 'Where Practice Became Avoidance',
 'Where did you use practice today to avoid something ordinary?',
 'Where did you use practice today to avoid something ordinary?',
 NULL, 'light', 'journal', '{"questions":["Where did you use practice today to avoid something ordinary?"],"minChars":40}',
 ARRAY['jnana'], ARRAY['awareness','emotion'], ARRAY['SPR','AVD'], NULL, 'draft', 'B')
ON CONFLICT (id) DO NOTHING;

-- Publish only what clears the bar; anything failing stays draft for review.
UPDATE public.content_ingredients
SET status = 'published', updated_at = now()
WHERE id LIKE 'loop:%'
  AND status = 'draft'
  AND NOT EXISTS (
    SELECT 1 FROM public.validate_content_ingredient(content_ingredients.id)
  );
