"use client";

import { VerwerkingsResultaat, MedewerkerResultaat, VerwerkteDienst } from "@/types";

const CAO_KLEUREN: Record<string, string> = {
  ggz: "bg-purple-100 text-purple-800",
  ghz: "bg-blue-100 text-blue-800",
  jeugd: "bg-green-100 text-green-800",
  vvt: "bg-orange-100 text-orange-800",
  sw: "bg-yellow-100 text-yellow-800",
};

const ORT_KLEUR = (pct: number, isSlaap: boolean) => {
  if (isSlaap) return "bg-blue-50 text-blue-700 font-semibold";
  if (pct === 100) return "bg-green-50 text-green-700";
  return "bg-amber-50 text-amber-700 font-semibold";
};

interface Props {
  resultaat: VerwerkingsResultaat;
  uploadId: string | null;
  geselecteerdeMw: MedewerkerResultaat | null;
  onSelecteerMw: (mw: MedewerkerResultaat | null) => void;
}

export default function ResultatenView({ resultaat, geselecteerdeMw, onSelecteerMw }: Props) {
  return (
    <div className="space-y-6">
      {/* Samenvatting */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Medewerkers" waarde={resultaat.aantalMedewerkers} />
        <StatCard label="Diensten" waarde={resultaat.aantalDiensten} />
        <StatCard
          label="Totaal uren"
          waarde={resultaat.medewerkers.reduce((s, m) => s + m.totaalUren, 0).toFixed(2) + " u"}
        />
      </div>

      {resultaat.niet_herkend.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <strong>Niet herkend ({resultaat.niet_herkend.length}):</strong>{" "}
          {resultaat.niet_herkend.join(", ")}
        </div>
      )}

      <div className="flex gap-6">
        {/* Overzichtslijst */}
        <div className="w-80 flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Medewerkers
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {resultaat.medewerkers.map((mw) => (
              <button
                key={`${mw.medewerker}|||${mw.kostenplaats}`}
                onClick={() => onSelecteerMw(geselecteerdeMw?.medewerker === mw.medewerker && geselecteerdeMw?.kostenplaats === mw.kostenplaats ? null : mw)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition ${
                  geselecteerdeMw?.medewerker === mw.medewerker && geselecteerdeMw?.kostenplaats === mw.kostenplaats
                    ? "bg-blue-50 border-l-4 border-l-[#1F4E79]"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-900 truncate max-w-[140px]">
                    {mw.medewerker}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 ${CAO_KLEUREN[mw.cao] || "bg-gray-100 text-gray-600"}`}>
                    {mw.cao.toUpperCase()}
                  </span>
                </div>
                {mw.opdrachtgever && (
                  <div className="text-xs font-medium text-[#1F4E79] mt-0.5 truncate">{mw.opdrachtgever}</div>
                )}
                <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                  <span className="truncate max-w-[130px]">{mw.kostenplaats}</span>
                  <span className="font-mono">{mw.totaalUren.toFixed(2)} u</span>
                </div>
                {mw.totaalKm > 0 && (
                  <div className="text-xs text-gray-400 mt-0.5">{mw.totaalKm} km</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Detail view */}
        <div className="flex-1 min-w-0">
          {geselecteerdeMw ? (
            <DienstDetail mw={geselecteerdeMw} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              Selecteer een medewerker om de details te zien
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, waarde }: { label: string; waarde: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-[#1F4E79] mt-1">{waarde}</p>
    </div>
  );
}

function DienstDetail({ mw }: { mw: MedewerkerResultaat }) {
  const diensten = mw.diensten.filter((d) => d.type !== "reiskosten");
  const reiskosten = mw.diensten.filter((d) => d.type === "reiskosten");

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1F4E79]">{mw.medewerker}</h2>
            {mw.opdrachtgever && (
              <p className="text-sm font-medium text-[#1F4E79] mt-0.5">{mw.opdrachtgever}</p>
            )}
            <p className="text-sm text-gray-500 mt-0.5">{mw.kostenplaats}</p>
          </div>
          <div className="text-right">
            <span className={`text-sm px-3 py-1 rounded-full font-semibold ${CAO_KLEUREN[mw.cao] || "bg-gray-100"}`}>
              CAO {mw.cao.toUpperCase()}
            </span>
            <p className="text-2xl font-bold text-[#1F4E79] mt-2">{mw.totaalUren.toFixed(2)} uur</p>
            {mw.totaalKm > 0 && (
              <p className="text-sm text-gray-500">{mw.totaalKm} km</p>
            )}
          </div>
        </div>
      </div>

      {/* Diensten tabel */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700 text-sm">Diensten & ORT-tijdvakken</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#2E75B6] text-white">
                <th className="px-3 py-2 text-left font-medium">Datum</th>
                <th className="px-3 py-2 text-left font-medium">Dag</th>
                <th className="px-3 py-2 text-center font-medium">Start</th>
                <th className="px-3 py-2 text-center font-medium">Eind</th>
                <th className="px-3 py-2 text-center font-medium">Tijdvak</th>
                <th className="px-3 py-2 text-center font-medium">Uren</th>
                <th className="px-3 py-2 text-center font-medium">ORT%</th>
                <th className="px-3 py-2 text-left font-medium">Uursoort</th>
              </tr>
            </thead>
            <tbody>
              {diensten.map((dienst, di) => (
                <DienstRijen key={di} dienst={dienst} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-[#D6E4F0] flex justify-between items-center border-t border-gray-200">
          <span className="font-semibold text-sm text-gray-700">Totaal gewerkte uren</span>
          <span className="font-bold text-[#1F4E79] font-mono">{mw.totaalUren.toFixed(2)}</span>
        </div>
      </div>

      {/* Reiskosten */}
      {reiskosten.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700 text-sm">Reiskosten</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#2E75B6] text-white">
                <th className="px-3 py-2 text-left font-medium">Datum</th>
                <th className="px-3 py-2 text-left font-medium">Dag</th>
                <th className="px-3 py-2 text-left font-medium">Uursoort</th>
                <th className="px-3 py-2 text-center font-medium">Km</th>
              </tr>
            </thead>
            <tbody>
              {reiskosten.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-[#EBF3FB]" : ""}>
                  <td className="px-3 py-2">{r.datumStr}</td>
                  <td className="px-3 py-2">{r.dag}</td>
                  <td className="px-3 py-2">{r.uursoort}</td>
                  <td className="px-3 py-2 text-center font-mono">{r.km}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 bg-[#D6E4F0] flex justify-between items-center border-t border-gray-200">
            <span className="font-semibold text-sm text-gray-700">Totaal km</span>
            <span className="font-bold text-[#1F4E79] font-mono">{mw.totaalKm}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function DienstRijen({ dienst }: { dienst: VerwerkteDienst }) {
  return (
    <>
      {dienst.tijdvakken.map((tv, ti) => (
        <tr key={ti} className={ti % 2 === 0 ? "bg-[#EBF3FB]" : ""}>
          <td className="px-3 py-2">{ti === 0 ? dienst.datumStr : tv.datumStr !== dienst.datum ? tv.datumStr : ""}</td>
          <td className="px-3 py-2">{ti === 0 ? dienst.dag : tv.dag}</td>
          <td className="px-3 py-2 text-center font-mono">{ti === 0 ? dienst.start : ""}</td>
          <td className="px-3 py-2 text-center font-mono">{ti === 0 ? dienst.eind : ""}</td>
          <td className="px-3 py-2 text-center font-mono">{tv.tijdvak}</td>
          <td className="px-3 py-2 text-center font-mono">{tv.uren.toFixed(2)}</td>
          <td className="px-3 py-2 text-center">
            <span className={`px-2 py-0.5 rounded text-xs ${ORT_KLEUR(tv.pct, tv.isSlaap)}`}>
              {tv.isSlaap ? "Slaap 100%" : `${tv.pct}%`}
            </span>
          </td>
          <td className="px-3 py-2 text-gray-600 text-xs">{ti === 0 ? dienst.uursoort : ""}</td>
        </tr>
      ))}
    </>
  );
}
