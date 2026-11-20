
-- Fix missing GRANT statements causing 403 Forbidden errors on authenticated queries

-- notifications: has RLS policies but missing GRANT for authenticated role
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;

-- guru_program_enrollments: has RLS policies but missing GRANT for authenticated role
GRANT SELECT, INSERT, UPDATE ON public.guru_program_enrollments TO authenticated;

-- guru_rotations: may exist without local migration, GRANT, or RLS policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'guru_rotations' AND schemaname = 'public') THEN
    GRANT SELECT, INSERT, UPDATE ON public.guru_rotations TO authenticated;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'guru_rotations' AND policyname = 'Users view own rotations') THEN
      CREATE POLICY "Users view own rotations"
        ON public.guru_rotations FOR SELECT TO authenticated
        USING (auth.uid() = user_id);
      CREATE POLICY "Users insert own rotations"
        ON public.guru_rotations FOR INSERT TO authenticated
        WITH CHECK (auth.uid() = user_id);
      CREATE POLICY "Users update own rotations"
        ON public.guru_rotations FOR UPDATE TO authenticated
        USING (auth.uid() = user_id);
    END IF;
  END IF;
END $$;

-- enrolled_programs: may be a view or table without GRANT
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'enrolled_programs' AND schemaname = 'public') THEN
    GRANT SELECT ON public.enrolled_programs TO authenticated;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'enrolled_programs' AND policyname = 'Users view own enrolled programs') THEN
      CREATE POLICY "Users view own enrolled programs"
        ON public.enrolled_programs FOR SELECT TO authenticated
        USING (auth.uid() = user_id);
    END IF;
  ELSIF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'enrolled_programs' AND schemaname = 'public') THEN
    GRANT SELECT ON public.enrolled_programs TO authenticated;
  END IF;
END $$;
