import { NextRequest, NextResponse } from "next/server";
import { verwerkExcel } from "@/lib/excel-import";
import { supabase } from "@/lib/supabase";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const bestand = formData.get("bestand") as File;

    if (!bestand) {
      return NextResponse.json({ error: "Geen bestand meegegeven" }, { status: 400 });
    }

    const buffer = await bestand.arrayBuffer();
    const resultaat = verwerkExcel(buffer);

    // Sla op in Supabase
    const { data, error } = await supabase
      .from("uploads")
      .insert({
        bestandsnaam: bestand.name,
        aantal_medewerkers: resultaat.aantalMedewerkers,
        resultaat: resultaat,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      // Geef resultaat terug ook zonder opslag
      return NextResponse.json({ resultaat, id: null });
    }

    return NextResponse.json({ resultaat, id: data.id });
  } catch (err) {
    console.error("Verwerkingsfout:", err);
    return NextResponse.json(
      { error: "Verwerking mislukt: " + (err as Error).message },
      { status: 500 }
    );
  }
}
