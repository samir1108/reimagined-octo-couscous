# Remote Supabase DB Migration Checklist

Use this checklist to bring the remote Supabase database in sync with the codebase. The local `supabase/migrations/` folder assumes many tables/columns that may not exist in the remote DB yet, based on the current console errors.

## How to apply
1. Open your Supabase project dashboard.
2. Go to **SQL Editor**.
3. Run each block in order, or apply the local migrations with `supabase db push` if your local project is linked.
4. After each section, verify with a quick `SELECT` or by using the Table Editor.

---

## 1. Missing core tables (404s / likely missing in remote)

These tables are queried from the frontend but return **404 Not Found**, which means they likely do not exist in the remote DB schema.

```sql
-- future_self_whispers
CREATE TABLE IF NOT EXISTS public.future_self_whispers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  whisper text NOT NULL,
  consumed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.future_self_whispers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own whispers"
  ON public.future_self_whispers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own whispers"
  ON public.future_self_whispers FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- user_assessment_results
CREATE TABLE IF NOT EXISTS public.user_assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_slug text NOT NULL,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  score numeric,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, assessment_slug)
);
ALTER TABLE public.user_assessment_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own assessment results"
  ON public.user_assessment_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own assessment results"
  ON public.user_assessment_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
```

---

## 2. Schema drift fixes (400s)

These tables exist, but queries return **400 Bad Request** because expected columns are missing in the remote DB.

```sql
-- daily_themes: missing user_id, sequence_no, max_depth, metadata, updated_at
ALTER TABLE public.daily_themes
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS sequence_no integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_depth integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Replace old unique constraint with (user_id, theme_date, sequence_no)
ALTER TABLE public.daily_themes
  DROP CONSTRAINT IF EXISTS daily_themes_theme_date_key,
  DROP CONSTRAINT IF EXISTS daily_themes_user_date_unique,
  ADD CONSTRAINT daily_themes_user_date_unique UNIQUE (user_id, theme_date, sequence_no);

-- observation_tasks: missing task_date, theme_id, user_topic
ALTER TABLE public.observation_tasks
  ADD COLUMN IF NOT EXISTS task_date date DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS theme_id uuid REFERENCES public.daily_themes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS user_topic text;

-- profiles: missing lifestyle, wake_time, sleep_time, occupation, country, preferred_theme, ai_mode
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS lifestyle jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS wake_time text,
  ADD COLUMN IF NOT EXISTS sleep_time text,
  ADD COLUMN IF NOT EXISTS occupation text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS preferred_theme text NOT NULL DEFAULT 'sunrise',
  ADD COLUMN IF NOT EXISTS ai_mode text NOT NULL DEFAULT 'fast'
    CHECK (ai_mode IN ('fast', 'premium'));
```

---

## 3. RLS / policy issues (403s)

Many queries return **403 Forbidden** even though the tables exist. This usually means:
- The user is anonymous instead of authenticated, OR
- The remote RLS policies are missing or stricter than the code expects.

Verify these policies exist in the remote DB:

```sql
-- Ensure RLS is enabled and policies exist for user-owned tables
-- observation_tasks
ALTER TABLE public.observation_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own obs tasks" ON public.observation_tasks;
CREATE POLICY "Users view own obs tasks"
  ON public.observation_tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own obs tasks" ON public.observation_tasks;
CREATE POLICY "Users insert own obs tasks"
  ON public.observation_tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own obs tasks" ON public.observation_tasks;
CREATE POLICY "Users update own obs tasks"
  ON public.observation_tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- daily_tasks
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own daily tasks" ON public.daily_tasks;
CREATE POLICY "Users view own daily tasks"
  ON public.daily_tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own daily tasks" ON public.daily_tasks;
CREATE POLICY "Users insert own daily tasks"
  ON public.daily_tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own daily tasks" ON public.daily_tasks;
CREATE POLICY "Users update own daily tasks"
  ON public.daily_tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- daily_themes: should allow authenticated read
ALTER TABLE public.daily_themes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Themes viewable by authenticated" ON public.daily_themes;
CREATE POLICY "Themes viewable by authenticated"
  ON public.daily_themes FOR SELECT TO authenticated USING (true);

-- user_orientation_progress
ALTER TABLE public.user_orientation_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS own_select ON public.user_orientation_progress;
CREATE POLICY own_select ON public.user_orientation_progress
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS own_insert ON public.user_orientation_progress;
CREATE POLICY own_insert ON public.user_orientation_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS own_update ON public.user_orientation_progress;
CREATE POLICY own_update ON public.user_orientation_progress
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- user_karma
ALTER TABLE public.user_karma ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own karma" ON public.user_karma;
CREATE POLICY "Users view own karma"
  ON public.user_karma FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own karma" ON public.user_karma;
CREATE POLICY "Users update own karma"
  ON public.user_karma FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- pre_journey_progress
ALTER TABLE public.pre_journey_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own pre journey" ON public.pre_journey_progress;
CREATE POLICY "Users view own pre journey"
  ON public.pre_journey_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own pre journey" ON public.pre_journey_progress;
CREATE POLICY "Users insert own pre journey"
  ON public.pre_journey_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own pre journey" ON public.pre_journey_progress;
CREATE POLICY "Users update own pre journey"
  ON public.pre_journey_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- program_enrollments
ALTER TABLE public.program_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own enrollments" ON public.program_enrollments;
CREATE POLICY "Users view own enrollments"
  ON public.program_enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- life_domain_scores
ALTER TABLE public.life_domain_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own domain scores" ON public.life_domain_scores;
CREATE POLICY "Users view own domain scores"
  ON public.life_domain_scores FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- user_spiritual_dna
ALTER TABLE public.user_spiritual_dna ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own spiritual dna" ON public.user_spiritual_dna;
CREATE POLICY "Users view own spiritual dna"
  ON public.user_spiritual_dna FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own spiritual dna" ON public.user_spiritual_dna;
CREATE POLICY "Users update own spiritual dna"
  ON public.user_spiritual_dna FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- user_practice_constellation
ALTER TABLE public.user_practice_constellation ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own constellation" ON public.user_practice_constellation;
CREATE POLICY "Users view own constellation"
  ON public.user_practice_constellation FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own constellation" ON public.user_practice_constellation;
CREATE POLICY "Users update own constellation"
  ON public.user_practice_constellation FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- theme_arcs
ALTER TABLE public.theme_arcs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own theme arcs" ON public.theme_arcs;
CREATE POLICY "Users view own theme arcs"
  ON public.theme_arcs FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- nudge_queue
ALTER TABLE public.nudge_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own nudges" ON public.nudge_queue;
CREATE POLICY "Users view own nudges"
  ON public.nudge_queue FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own nudges" ON public.nudge_queue;
CREATE POLICY "Users update own nudges"
  ON public.nudge_queue FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- consciousness_signals
ALTER TABLE public.consciousness_signals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own signals" ON public.consciousness_signals;
CREATE POLICY "Users view own signals"
  ON public.consciousness_signals FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own signals" ON public.consciousness_signals;
CREATE POLICY "Users insert own signals"
  ON public.consciousness_signals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- session_states
ALTER TABLE public.session_states ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own session states" ON public.session_states;
CREATE POLICY "Users view own session states"
  ON public.session_states FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own session states" ON public.session_states;
CREATE POLICY "Users update own session states"
  ON public.session_states FOR UPDATE TO authenticated USING (auth.uid() = user_id);
```

---

## 4. RPC / function issues (400s)

The `award_karma_event` RPC returned **400** in the logs. Verify this function exists and matches the latest migration:

```sql
-- Only create if user_karma table exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_karma' AND schemaname = 'public') THEN
    CREATE OR REPLACE FUNCTION public.award_karma_event(
      p_source text,
      p_base integer DEFAULT 1,
      p_weight numeric DEFAULT 1.0,
      p_metadata jsonb DEFAULT '{}'::jsonb
    )
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO 'public'
    AS $function$
    DECLARE
      v_user uuid := auth.uid();
      v_award integer;
      v_throttle interval;
      v_recent timestamptz;
      v_new_points integer;
      v_new_lifetime integer;
      v_prev_lifetime integer;
      v_karma_row public.user_karma%ROWTYPE;
      v_new_breakthrough text := NULL;
    BEGIN
      IF v_user IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
      END IF;

      v_award := LEAST(25, GREATEST(1, ROUND(p_base * COALESCE(p_weight, 1.0))::int));

      v_throttle := CASE p_source
        WHEN 'app_open'          THEN interval '6 hours'
        WHEN 'ai_chat'           THEN interval '90 seconds'
        WHEN 'mood_pulse'        THEN interval '2 hours'
        WHEN 'journal_open'      THEN interval '2 hours'
        WHEN 'journal_entry'     THEN interval '15 minutes'
        WHEN 'temple_enter'      THEN interval '4 hours'
        WHEN 'practice_start'    THEN interval '30 minutes'
        WHEN 'practice_complete' THEN interval '5 minutes'
        WHEN 'session_complete'  THEN interval '5 minutes'
        WHEN 'game_complete'     THEN interval '3 minutes'
        WHEN 'guru_session'      THEN interval '5 minutes'
        WHEN 'witness_session'   THEN interval '5 minutes'
        WHEN 'observation_task'  THEN interval '5 minutes'
        WHEN 'daily_task'        THEN interval '5 minutes'
        WHEN 'evening_reflection' THEN interval '4 hours'
        WHEN 'gratitude_logged'  THEN interval '2 hours'
        WHEN 'sankalpa_set'      THEN interval '12 hours'
        WHEN 'dream_logged'      THEN interval '4 hours'
        ELSE interval '60 seconds'
      END;

      SELECT created_at INTO v_recent
      FROM public.karma_events
      WHERE user_id = v_user AND source = p_source
      ORDER BY created_at DESC
      LIMIT 1;

      IF v_recent IS NOT NULL AND v_recent > now() - v_throttle THEN
        RETURN jsonb_build_object(
          'awarded', 0,
          'reason', 'throttled',
          'next_eligible_at', v_recent + v_throttle
        );
      END IF;

      INSERT INTO public.user_karma (user_id, points, lifetime_points)
      VALUES (v_user, 0, 0)
      ON CONFLICT (user_id) DO NOTHING;

      SELECT * INTO v_karma_row FROM public.user_karma WHERE user_id = v_user;
      v_prev_lifetime := COALESCE(v_karma_row.lifetime_points, 0);

      UPDATE public.user_karma
         SET points = points + v_award,
             lifetime_points = lifetime_points + v_award,
             last_event_at = now(),
             today_event_count = CASE
               WHEN last_event_date = CURRENT_DATE THEN today_event_count + 1
               ELSE 1
             END,
             week_event_count = CASE
               WHEN week_anchor_date IS NOT NULL AND week_anchor_date > CURRENT_DATE - interval '7 days' THEN week_event_count + 1
               ELSE 1
             END,
             last_event_date = CURRENT_DATE,
             week_anchor_date = COALESCE(
               CASE WHEN week_anchor_date IS NOT NULL AND week_anchor_date > CURRENT_DATE - interval '7 days' THEN week_anchor_date END,
               CURRENT_DATE
             )
       WHERE user_id = v_user
       RETURNING points, lifetime_points INTO v_new_points, v_new_lifetime;

      IF v_prev_lifetime < 300 AND v_new_lifetime >= 300 THEN
        v_new_breakthrough := 'minor_300';
      ELSIF v_prev_lifetime < 1000 AND v_new_lifetime >= 1000 THEN
        v_new_breakthrough := 'major_1000';
      END IF;

      INSERT INTO public.karma_events (user_id, source, base_points, weight, awarded, metadata)
      VALUES (v_user, p_source, p_base, COALESCE(p_weight, 1.0), v_award, COALESCE(p_metadata, '{}'::jsonb));

      RETURN jsonb_build_object(
        'awarded', v_award,
        'points', v_new_points,
        'lifetime_points', v_new_lifetime,
        'new_breakthrough', v_new_breakthrough
      );
    END;
    $function$;
  END IF;
END $$;
```

---

## 5. Edge function secrets

The following edge functions require these secrets to be set in the Supabase dashboard (Settings → Edge Functions → Secrets):

| Secret | Used by | Why |
|--------|---------|-----|
| `SUPABASE_URL` | All edge functions | Supabase project URL |
| `SUPABASE_ANON_KEY` | Most edge functions | Client-side anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | companion-engine, guide-chat, consciousness-engine, etc. | Admin access for writes |
| `GROQ_API_KEY` or `GEMINI_API_KEY` | AI functions | LLM provider |
| `DEEPGRAM_API_KEY` | stt-listen | Speech-to-text |
| `ELEVENLABS_API_KEY` | tts-speak | Text-to-speech |
| `RAZORPAY_KEY_SECRET` | razorpay-verify | Payment verification |
| `CRON_SECRET` | Scheduled jobs | Auth for cron endpoints |
| `GITHUB_TOKEN` | github-late-night-watcher | GitHub API |
| `GOOGLE_CALENDAR_API_KEY` | calendar-meeting-watcher | Calendar API |
| `GOOGLE_MAIL_API_KEY` | Gmail integration | Email |
| `MICROSOFT_OUTLOOK_API_KEY` | Outlook integration | Email |
| `MICROSOFT_TEAMS_API_KEY` | Teams integration | Teams |
| `SLACK_API_KEY` | Slack integration | Slack |
| `LINEAR_API_KEY` | Linear integration | Linear |

**Set them with:**
```bash
supabase secrets set GROQ_API_KEY=your-key-here
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# ... repeat for each secret
```

---

## 6. Auth / anon key rotation (security)

The Supabase publishable key and service-role key were previously tracked in git. Even though `.env` is now gitignored, **the old keys may still be in git history**.

1. Go to Supabase Dashboard → Settings → API.
2. Regenerate the **anon/public** key (publishable key).
3. Regenerate the **service_role** key.
4. Update your local `.env` with the new values.
5. Update all deployed environments (Vercel, etc.) with the new keys.
6. Consider purging or rewriting git history if these keys were committed previously.

---

## 7. Verification steps

After applying the above:

1. **Check tables exist:**
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```
Make sure these are present: `future_self_whispers`, `user_assessment_results`, `daily_themes`, `observation_tasks`, `daily_tasks`, `profiles`, `user_karma`, `pre_journey_progress`, `program_enrollments`, `life_domain_scores`, `user_spiritual_dna`, `user_practice_constellation`, `theme_arcs`, `nudge_queue`, `consciousness_signals`, `session_states`, `user_orientation_progress`.

2. **Check columns exist:**
```sql
SELECT column_name FROM information_schema.columns
 WHERE table_schema = 'public' AND table_name = 'daily_themes'
 ORDER BY column_name;
```
Make sure `user_id`, `sequence_no`, `max_depth`, `metadata`, `updated_at` exist.

3. **Check RLS policies:**
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
 FROM pg_policies
 WHERE schemaname = 'public'
 ORDER BY tablename, policyname;
```

4. **Check edge function logs:**
In Supabase Dashboard → Edge Functions → Logs. Look for 500 errors on `companion-engine` and `guide-chat` and verify the required env vars are set.

5. **Test a single query:**
Open the browser console and run:
```js
const { data, error } = await supabase.from('profiles').select('lifestyle, display_name').eq('user_id', userId).single();
console.log(data, error);
```
This should return data without 400/403.
