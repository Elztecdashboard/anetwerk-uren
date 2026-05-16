<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Anetwerk Uren — Ontwikkelaarsdocumentatie

## Database (Supabase)

**Project**: `upkzgbqxscngisirylze`
**DDL uitvoeren** — volg altijd dit volledige patroon:

**Stap 1: schrijf het SQL-bestand**
Sla de migratie op als `supabase/<naam>.sql` (history + review).

**Stap 2: uitvoeren via CLI**
```bash
npx supabase db query --linked --file supabase/<naam>.sql
```
Of inline voor kleine queries:
```bash
npx supabase db query --linked << 'SQL'
-- jouw SQL hier
SQL
```

**Stap 3: committen**
```bash
git add supabase/<naam>.sql
git commit -m "db: <omschrijving van de migratie>"
```

**Stap 4: deployen naar Vercel**
```bash
npx vercel --prod
```

Nooit kopiëren/plakken via het Supabase dashboard. Nooit stoppen na stap 2 — altijd committen én deployen.
