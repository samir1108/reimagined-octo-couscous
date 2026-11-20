
CREATE TABLE public.guru_program_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  guru_id TEXT NOT NULL,
  program_title TEXT NOT NULL,
  program_description TEXT NOT NULL DEFAULT '',
  duration_days INTEGER NOT NULL DEFAULT 7,
  current_day INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  program_curriculum JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.guru_program_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own guru program enrollments"
  ON public.guru_program_enrollments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own guru program enrollments"
  ON public.guru_program_enrollments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own guru program enrollments"
  ON public.guru_program_enrollments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_guru_program_enrollments_updated_at
  BEFORE UPDATE ON public.guru_program_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
