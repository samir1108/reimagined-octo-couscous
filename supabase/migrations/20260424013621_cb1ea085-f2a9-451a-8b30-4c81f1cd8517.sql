
-- Constellation: 12 practices, each with weight + level + status
CREATE TABLE public.user_practice_constellation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,

  -- Phase tracker (Law 3: diverge → T-shape → breathe → integrate)
  phase TEXT NOT NULL DEFAULT 'diverge',
  computation_source TEXT NOT NULL DEFAULT 'initial',

  -- 12 practices: weight (0.01-1.0, sums to 1.0), level (0-7), status
  observe_weight   NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (observe_weight   >= 0.01 AND observe_weight   <= 1.0),
  observe_level    SMALLINT     NOT NULL DEFAULT 0     CHECK (observe_level    >= 0    AND observe_level    <= 7),
  observe_status   TEXT         NOT NULL DEFAULT 'secondary',

  inquiry_weight   NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (inquiry_weight   >= 0.01 AND inquiry_weight   <= 1.0),
  inquiry_level    SMALLINT     NOT NULL DEFAULT 0     CHECK (inquiry_level    >= 0    AND inquiry_level    <= 7),
  inquiry_status   TEXT         NOT NULL DEFAULT 'secondary',

  bhakti_weight    NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (bhakti_weight    >= 0.01 AND bhakti_weight    <= 1.0),
  bhakti_level     SMALLINT     NOT NULL DEFAULT 0     CHECK (bhakti_level     >= 0    AND bhakti_level     <= 7),
  bhakti_status    TEXT         NOT NULL DEFAULT 'secondary',

  witness_weight   NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (witness_weight   >= 0.01 AND witness_weight   <= 1.0),
  witness_level    SMALLINT     NOT NULL DEFAULT 0     CHECK (witness_level    >= 0    AND witness_level    <= 7),
  witness_status   TEXT         NOT NULL DEFAULT 'secondary',

  karma_weight     NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (karma_weight     >= 0.01 AND karma_weight     <= 1.0),
  karma_level      SMALLINT     NOT NULL DEFAULT 0     CHECK (karma_level      >= 0    AND karma_level      <= 7),
  karma_status     TEXT         NOT NULL DEFAULT 'secondary',

  breath_weight    NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (breath_weight    >= 0.01 AND breath_weight    <= 1.0),
  breath_level     SMALLINT     NOT NULL DEFAULT 0     CHECK (breath_level     >= 0    AND breath_level     <= 7),
  breath_status    TEXT         NOT NULL DEFAULT 'secondary',

  body_weight      NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (body_weight      >= 0.01 AND body_weight      <= 1.0),
  body_level       SMALLINT     NOT NULL DEFAULT 0     CHECK (body_level       >= 0    AND body_level       <= 7),
  body_status      TEXT         NOT NULL DEFAULT 'secondary',

  jnana_weight     NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (jnana_weight     >= 0.01 AND jnana_weight     <= 1.0),
  jnana_level      SMALLINT     NOT NULL DEFAULT 0     CHECK (jnana_level      >= 0    AND jnana_level      <= 7),
  jnana_status     TEXT         NOT NULL DEFAULT 'dormant',

  raja_weight      NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (raja_weight      >= 0.01 AND raja_weight      <= 1.0),
  raja_level       SMALLINT     NOT NULL DEFAULT 0     CHECK (raja_level       >= 0    AND raja_level       <= 7),
  raja_status      TEXT         NOT NULL DEFAULT 'dormant',

  tantra_weight    NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (tantra_weight    >= 0.01 AND tantra_weight    <= 1.0),
  tantra_level     SMALLINT     NOT NULL DEFAULT 0     CHECK (tantra_level     >= 0    AND tantra_level     <= 7),
  tantra_status    TEXT         NOT NULL DEFAULT 'dormant',

  neuro_weight     NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (neuro_weight     >= 0.01 AND neuro_weight     <= 1.0),
  neuro_level      SMALLINT     NOT NULL DEFAULT 0     CHECK (neuro_level      >= 0    AND neuro_level       <= 7),
  neuro_status     TEXT         NOT NULL DEFAULT 'dormant',

  kriya_weight     NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (kriya_weight     >= 0.01 AND kriya_weight     <= 1.0),
  kriya_level      SMALLINT     NOT NULL DEFAULT 0     CHECK (kriya_level      >= 0    AND kriya_level      <= 7),
  kriya_status     TEXT         NOT NULL DEFAULT 'dormant',

  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- History: every recompute snapshots
CREATE TABLE public.user_practice_constellation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  snapshot JSONB NOT NULL,
  computation_source TEXT NOT NULL DEFAULT 'recompute',
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_constellation_history_user ON public.user_practice_constellation_history(user_id, snapshot_at DESC);

-- RLS
ALTER TABLE public.user_practice_constellation         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_practice_constellation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own constellation"
  ON public.user_practice_constellation FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own constellation"
  ON public.user_practice_constellation FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own constellation"
  ON public.user_practice_constellation FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users view own constellation history"
  ON public.user_practice_constellation_history FOR SELECT
  USING (auth.uid() = user_id);

-- Updated-at trigger
CREATE TRIGGER update_constellation_updated_at
  BEFORE UPDATE ON public.user_practice_constellation
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
