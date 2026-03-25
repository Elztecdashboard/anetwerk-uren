-- Voer dit uit in de Supabase SQL Editor

CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bestandsnaam TEXT NOT NULL,
  geupload_op TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  aantal_medewerkers INTEGER DEFAULT 0,
  resultaat JSONB NOT NULL
);

-- Index voor sortering op datum
CREATE INDEX idx_uploads_geupload_op ON uploads (geupload_op DESC);
