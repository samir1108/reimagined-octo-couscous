ALTER TABLE public.daily_themes DROP CONSTRAINT daily_themes_theme_date_key;
ALTER TABLE public.daily_themes ADD CONSTRAINT daily_themes_user_date_unique UNIQUE (user_id, theme_date);