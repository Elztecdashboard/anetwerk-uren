import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.user_metadata?.is_admin) return { user: null, supabase };
  return { user, supabase };
}

// PATCH — wachtwoord wijzigen
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, supabase } = await checkAdmin();
  if (!user) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id } = await params;
  const { wachtwoord } = await req.json();

  if (wachtwoord) {
    const { error } = await supabase.rpc("wijzig_wachtwoord", {
      p_id: id,
      p_password: wachtwoord,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE — gebruiker verwijderen
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, supabase } = await checkAdmin();
  if (!user) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id } = await params;

  if (id === user.id) {
    return NextResponse.json({ error: "Je kunt je eigen account niet verwijderen" }, { status: 400 });
  }

  const { error } = await supabase.rpc("verwijder_gebruiker", { p_id: id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
