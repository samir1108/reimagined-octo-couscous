DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.guru_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  context JSONB,
  importance INTEGER DEFAULT 5,
  last_referenced TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guru_memory TO authenticated;
GRANT ALL ON public.guru_memory TO service_role;
ALTER TABLE public.guru_memory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own memory" ON public.guru_memory;
CREATE POLICY "Users can view own memory" ON public.guru_memory FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own memory" ON public.guru_memory;
CREATE POLICY "Users can create own memory" ON public.guru_memory FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own memory" ON public.guru_memory;
CREATE POLICY "Users can update own memory" ON public.guru_memory FOR UPDATE USING (auth.uid() = user_id);
