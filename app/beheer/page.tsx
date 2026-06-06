"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Gebruiker {
  id: string;
  email: string;
  naam: string;
  is_admin: boolean;
  aangemaakt_op: string;
}

export default function BeheerPage() {
  const [gebruikers, setGebruikers] = useState<Gebruiker[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [bezig, setBezig] = useState(true);

  // Nieuw gebruiker formulier
  const [nieuwNaam, setNieuwNaam] = useState("");
  const [nieuwEmail, setNieuwEmail] = useState("");
  const [nieuwWachtwoord, setNieuwWachtwoord] = useState("");
  const [nieuwIsAdmin, setNieuwIsAdmin] = useState(false);
  const [aanmakenBezig, setAanmakenBezig] = useState(false);
  const [aanmakenFout, setAanmakenFout] = useState<string | null>(null);
  const [aanmakenOk, setAanmakenOk] = useState(false);

  // Wachtwoord wijzigen
  const [wijzigId, setWijzigId] = useState<string | null>(null);
  const [wijzigWachtwoord, setWijzigWachtwoord] = useState("");
  const [wijzigBezig, setWijzigBezig] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user?.user_metadata?.is_admin) {
        setIsAdmin(false);
        setBezig(false);
        return;
      }
      setIsAdmin(true);
      laadGebruikers();
    });
  }, []);

  async function laadGebruikers() {
    setBezig(true);
    const res = await fetch("/api/beheer/gebruikers");
    const data = await res.json();
    setGebruikers(data);
    setBezig(false);
  }

  async function handleAanmaken(e: React.FormEvent) {
    e.preventDefault();
    setAanmakenBezig(true);
    setAanmakenFout(null);
    setAanmakenOk(false);

    const res = await fetch("/api/beheer/gebruikers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam: nieuwNaam, email: nieuwEmail, wachtwoord: nieuwWachtwoord, is_admin: nieuwIsAdmin }),
    });
    const data = await res.json();

    if (!res.ok) {
      setAanmakenFout(data.error || "Onbekende fout");
    } else {
      setAanmakenOk(true);
      setNieuwNaam(""); setNieuwEmail(""); setNieuwWachtwoord(""); setNieuwIsAdmin(false);
      laadGebruikers();
    }
    setAanmakenBezig(false);
  }

  async function handleVerwijderen(id: string, naam: string) {
    if (!confirm(`Weet je zeker dat je ${naam} wilt verwijderen?`)) return;
    await fetch(`/api/beheer/gebruikers/${id}`, { method: "DELETE" });
    laadGebruikers();
  }

  async function handleWijzigWachtwoord(e: React.FormEvent) {
    e.preventDefault();
    if (!wijzigId) return;
    setWijzigBezig(true);
    await fetch(`/api/beheer/gebruikers/${wijzigId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wachtwoord: wijzigWachtwoord }),
    });
    setWijzigId(null);
    setWijzigWachtwoord("");
    setWijzigBezig(false);
  }

  if (isAdmin === false) {
    return (
      <div className="text-center py-20 text-gray-500">
        Je hebt geen toegang tot deze pagina.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-[#1F4E79]">Gebruikersbeheer</h1>

      {/* Gebruikerslijst */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700">Actieve gebruikers</h2>
        </div>
        {bezig ? (
          <p className="px-5 py-4 text-sm text-gray-400">Laden...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#2E75B6] text-white text-left">
                <th className="px-4 py-2 font-medium">Naam</th>
                <th className="px-4 py-2 font-medium">E-mail</th>
                <th className="px-4 py-2 font-medium text-center">Beheerder</th>
                <th className="px-4 py-2 font-medium text-right">Acties</th>
              </tr>
            </thead>
            <tbody>
              {gebruikers.map((g, i) => (
                <tr key={g.id} className={i % 2 === 0 ? "bg-[#EBF3FB]" : ""}>
                  <td className="px-4 py-2 font-medium">{g.naam || "—"}</td>
                  <td className="px-4 py-2 text-gray-600">{g.email}</td>
                  <td className="px-4 py-2 text-center">
                    {g.is_admin ? (
                      <span className="text-xs bg-[#1F4E79] text-white px-2 py-0.5 rounded-full">Ja</span>
                    ) : (
                      <span className="text-xs text-gray-400">Nee</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button
                      onClick={() => { setWijzigId(g.id); setWijzigWachtwoord(""); }}
                      className="text-xs text-[#2E75B6] hover:underline"
                    >
                      Wachtwoord
                    </button>
                    <button
                      onClick={() => handleVerwijderen(g.id, g.naam || g.email)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Verwijderen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Wachtwoord wijzigen modal */}
      {wijzigId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Wachtwoord wijzigen</h3>
            <form onSubmit={handleWijzigWachtwoord} className="space-y-3">
              <input
                type="password"
                value={wijzigWachtwoord}
                onChange={(e) => setWijzigWachtwoord(e.target.value)}
                placeholder="Nieuw wachtwoord"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setWijzigId(null)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={wijzigBezig}
                  className="px-4 py-2 text-sm rounded-lg bg-[#1F4E79] text-white hover:bg-[#2E75B6] disabled:opacity-50"
                >
                  {wijzigBezig ? "Bezig..." : "Opslaan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Nieuwe gebruiker aanmaken */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Nieuwe gebruiker aanmaken</h2>
        <form onSubmit={handleAanmaken} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Naam</label>
              <input
                type="text"
                value={nieuwNaam}
                onChange={(e) => setNieuwNaam(e.target.value)}
                required
                placeholder="Voor- en achternaam"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">E-mailadres</label>
              <input
                type="email"
                value={nieuwEmail}
                onChange={(e) => setNieuwEmail(e.target.value)}
                required
                placeholder="naam@email.nl"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Beginwachtwoord</label>
            <input
              type="text"
              value={nieuwWachtwoord}
              onChange={(e) => setNieuwWachtwoord(e.target.value)}
              required
              placeholder="Tijdelijk wachtwoord"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_admin"
              checked={nieuwIsAdmin}
              onChange={(e) => setNieuwIsAdmin(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="is_admin" className="text-sm text-gray-600">
              Beheerderstoegang geven
            </label>
          </div>
          {aanmakenFout && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{aanmakenFout}</p>
          )}
          {aanmakenOk && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">Gebruiker aangemaakt ✓</p>
          )}
          <button
            type="submit"
            disabled={aanmakenBezig}
            className="bg-[#1F4E79] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#2E75B6] disabled:opacity-50 transition"
          >
            {aanmakenBezig ? "Aanmaken..." : "Gebruiker aanmaken"}
          </button>
        </form>
      </div>
    </div>
  );
}
