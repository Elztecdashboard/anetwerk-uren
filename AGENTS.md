<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Anetwerk Uren — Ontwikkelaarsdocumentatie

## Database (Supabase)

**Project**: `upkzgbqxscngisirylze`
**DDL uitvoeren**: via de Supabase CLI — project is gelinkt, voer SQL altijd zo uit:
```bash
npx supabase db query --linked << 'SQL'
-- jouw SQL hier
SQL
```
Sla migraties ook op als `.sql`-bestand in `supabase/` zodat er een history is. Nooit kopiëren/plakken via het dashboard.
