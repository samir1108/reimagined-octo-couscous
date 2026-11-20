ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarded boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_theme text NOT NULL DEFAULT 'sunrise';