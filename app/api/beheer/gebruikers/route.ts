import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.user_metadata?.is_admin) return null;
  return user;
}

// GET — alle gebruikers ophalen
export async function GET() {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const gebruikers = data.users.map((u) => ({
    id: u.id,
    email: u.email,
    naam: u.user_metadata?.naam || "",
    is_admin: u.user_metadata?.is_admin || false,
    aangemaakt_op: u.created_at,
  }));

  return NextResponse.json(gebruikers);
}

// POST — nieuwe gebruiker aanmaken
export async function POST(req: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { naam, email, wachtwoord, is_admin } = await req.json();
  if (!naam || !email || !wachtwoord) {
    return NextResponse.json({ error: "Naam, e-mail en wachtwoord zijn verplicht" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: wachtwoord,
    email_confirm: true,
    user_metadata: { naam, is_admin: is_admin || false },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.user.id });
}
