import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.user_metadata?.is_admin) return { user: null, supabase };
  return { user, supabase };
}

// GET — alle gebruikers ophalen
export async function GET() {
  const { user, supabase } = await checkAdmin();
  if (!user) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { data, error } = await supabase.rpc("get_gebruikers");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// POST — nieuwe gebruiker aanmaken
export async function POST(req: NextRequest) {
  const { user, supabase } = await checkAdmin();
  if (!user) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { naam, email, wachtwoord, is_admin } = await req.json();
  if (!naam || !email || !wachtwoord) {
    return NextResponse.json({ error: "Naam, e-mail en wachtwoord zijn verplicht" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("maak_gebruiker", {
    p_email: email,
    p_password: wachtwoord,
    p_naam: naam,
    p_is_admin: is_admin || false,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data });
}
