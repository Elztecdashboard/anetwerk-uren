import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getAdminClient } from "@/lib/supabase-admin";

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.user_metadata?.is_admin) return null;
  return user;
}

// PATCH — wachtwoord of naam wijzigen
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id } = await params;
  const { naam, wachtwoord, is_admin } = await req.json();

  const updates: Record<string, unknown> = {};
  if (wachtwoord) updates.password = wachtwoord;
  if (naam !== undefined || is_admin !== undefined) {
    updates.user_metadata = { naam, is_admin: is_admin || false };
  }

  const { error } = await getAdminClient().auth.admin.updateUserById(id, updates);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE — gebruiker verwijderen
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id } = await params;

  // Voorkom dat admin zichzelf verwijdert
  if (id === admin.id) {
    return NextResponse.json({ error: "Je kunt je eigen account niet verwijderen" }, { status: 400 });
  }

  const { error } = await getAdminClient().auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
