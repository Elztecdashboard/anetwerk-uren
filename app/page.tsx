"use client";

import { useState, useRef } from "react";
import { VerwerkingsResultaat, MedewerkerResultaat } from "@/types";
import ResultatenView from "@/app/components/ResultatenView";

export default function HomePage() {
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [resultaat, setResultaat] = useState<VerwerkingsResultaat | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [geselecteerdeMw, setGeselecteerdeMw] = useState<MedewerkerResultaat | null>(null);
  const [bestandsnaam, setBestandsnaam] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const bestand = inputRef.current?.files?.[0];
    if (!bestand) return;

    setBezig(true);
    setFout(null);
    setResultaat(null);
    setGeselecteerdeMw(null);

    try {
      const form = new FormData();
      form.append("bestand", bestand);

      const res = await fetch("/api/verwerk", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok || data.error) {
        setFout(data.error || "Onbekende fout");
        return;
      }

      setResultaat(data.resultaat);
      setUploadId(data.id);
    } catch (err) {
      setFout("Verbindingsfout: " + (err as Error).message);
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Upload card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-xl">
        <h1 className="text-2xl font-bold text-[#1F4E79] mb-2">Uren verwerken</h1>
        <p className="text-gray-500 text-sm mb-6">
          Upload een Excel-export uit Bendy. De ORT-tijdvakken worden automatisch berekend per CAO.
        </p>

        <form onSubmit={handleUpload} className="space-y-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#2E75B6] transition"
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => setBestandsnaam(e.target.files?.[0]?.name || null)}
            />
            {bestandsnaam ? (
              <p className="text-[#1F4E79] font-medium text-sm">{bestandsnaam}</p>
            ) : (
              <p className="text-gray-400 text-sm">Klik om een Excel-bestand te selecteren</p>
            )}
          </div>

          <button
            type="submit"
            disabled={bezig || !bestandsnaam}
            className="w-full bg-[#1F4E79] text-white py-3 rounded-lg font-semibold hover:bg-[#2E75B6] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bezig ? "Bezig met verwerken..." : "Verwerken"}
          </button>
        </form>

        {fout && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {fout}
          </div>
        )}
      </div>

      {/* Resultaten */}
      {resultaat && (
        <ResultatenView
          resultaat={resultaat}
          uploadId={uploadId}
          geselecteerdeMw={geselecteerdeMw}
          onSelecteerMw={setGeselecteerdeMw}
        />
      )}
    </div>
  );
}
