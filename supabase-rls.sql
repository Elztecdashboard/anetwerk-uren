-- ============================================================
-- RLS voor uploads-tabel + GRANT voor Supabase Data API
-- Uitvoeren via Supabase dashboard → SQL Editor
-- ============================================================
-- Let op: deze app gebruikt de anon-sleutel direct (geen user-sessies).
-- RLS is ingeschakeld zodat de tabel niet onbedoeld via de Data API
-- te benaderen is vanuit andere clients.
-- ============================================================

ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

-- Anon-gebruikers mogen lezen (dashboard toont upload-history)
CREATE POLICY "anon_select_uploads"
  ON public.uploads FOR SELECT TO anon USING (true);

-- Anon-gebruikers mogen invoegen (upload verwerking slaat op via anon key)
CREATE POLICY "anon_insert_uploads"
  ON public.uploads FOR INSERT TO anon WITH CHECK (true);

-- Geen UPDATE of DELETE voor anon — uploads zijn immutabel
-- (verwijdering alleen via dashboard / service_role)

-- GRANT voor Supabase Data API (vereist vanaf Oct 30 2026)
GRANT SELECT, INSERT ON public.uploads TO anon;

-- Verificatie
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'uploads';
