import * as XLSX from "xlsx";
import { getCao } from "./cao-mapping";
import { berekenDienst, berekenSlaapdienst, parseTime, formatDate, formatDateNL, dagNaam, parseDate } from "./ort-berekening";
import { MedewerkerResultaat, VerwerkteDienst, VerwerkingsResultaat } from "@/types";

function parseKm(val: unknown): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  const s = String(val).replace(/[^\d.,]/g, "").replace(",", ".");
  return parseFloat(s) || 0;
}

function isSlaap(tekst: string): boolean {
  return tekst.toLowerCase().includes("slaap");
}

function isReis(tekst: string): boolean {
  return tekst.toLowerCase().includes("reis");
}

function parseExcelDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === "number") {
    // Excel serial date
    return XLSX.SSF.parse_date_code(val) as unknown as Date;
  }
  const s = String(val).trim();
  try {
    const d = new Date(s.substring(0, 10));
    if (!isNaN(d.getTime())) return d;
  } catch {
    // ignore
  }
  return null;
}

export function verwerkExcel(buffer: ArrayBuffer): VerwerkingsResultaat {
  const wb = XLSX.read(buffer, { type: "array", cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true }) as unknown[][];

  const verwerkt = new Map<string, { cao: ReturnType<typeof getCao>; diensten: VerwerkteDienst[] }>();
  const reisBuffer: Array<{ mw: string; kp: string; datum: Date; uursoort: string; opmerking: string; km: number }> = [];
  const nietHerkend: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    const rij = rows[i] as unknown[];
    if (!rij[0]) continue;

    try {
      // Kolom mapping (0-indexed, gelijk aan Python script):
      // 0: datum, 2: start, 3: eind, 5: pauze_start, 6: pauze_eind
      // 8: opdrachtgever, 9: kostenplaats, 10: medewerker
      // 13: uursoort, 14: opmerking, 16: km

      const datumRaw = rij[0];
      let datum: Date | null = null;

      if (datumRaw instanceof Date) {
        datum = datumRaw;
      } else if (typeof datumRaw === "number") {
        const parsed = XLSX.SSF.parse_date_code(datumRaw);
        if (parsed) datum = new Date(parsed.y, parsed.m - 1, parsed.d);
      } else {
        datum = parseExcelDate(datumRaw);
      }

      if (!datum) continue;

      const opdracht = String(rij[8] || "");
      const kp = String(rij[9] || "");
      const mw = String(rij[10] || "Onbekend");
      const uursoort = String(rij[13] || "");
      const opmerking = String(rij[14] || "");

      const sleutel = `${mw}|||${kp || opdracht}`;
      const datumStr = formatDate(datum);
      const datumNL = formatDateNL(datum);
      const dag = dagNaam(datum);

      // Reiskosten apart verwerken
      if (isReis(uursoort)) {
        const km = parseKm(rij[16]);
        reisBuffer.push({ mw, kp: kp || opdracht, datum, uursoort, opmerking, km });
        continue;
      }

      const startMin = parseTime(rij[2]);
      const eindMin = parseTime(rij[3]);

      if (startMin === null || eindMin === null) continue;

      // Pauze berekenen
      let pauzeMin = 0;
      const pauzeStart = parseTime(rij[5]);
      const pauzeEind = parseTime(rij[6]);
      if (pauzeStart !== null && pauzeEind !== null) {
        pauzeMin = pauzeEind - pauzeStart;
      }

      const cao = getCao(opdracht, uursoort, kp);
      if (!cao) {
        const melding = `${uursoort || opdracht} (${mw})`;
        if (!nietHerkend.includes(melding)) nietHerkend.push(melding);
        continue;
      }

      if (!verwerkt.has(sleutel)) {
        verwerkt.set(sleutel, { cao, diensten: [] });
      }

      const entry = verwerkt.get(sleutel)!;
      const slaap = isSlaap(uursoort) || isSlaap(opmerking);

      let dienst: VerwerkteDienst;

      if (slaap) {
        const tijdvakken = berekenSlaapdienst(cao, datumStr, startMin, eindMin);
        dienst = {
          type: "slaapdienst",
          datum: datumStr,
          datumStr: datumNL,
          dag,
          start: `${String(Math.floor(startMin / 60)).padStart(2, "0")}:${String(startMin % 60).padStart(2, "0")}`,
          eind: `${String(Math.floor(eindMin / 60)).padStart(2, "0")}:${String(eindMin % 60).padStart(2, "0")}`,
          uursoort,
          opmerking,
          tijdvakken,
        };
      } else {
        const tijdvakken = berekenDienst(cao, datumStr, startMin, eindMin, pauzeMin);
        dienst = {
          type: "dienst",
          datum: datumStr,
          datumStr: datumNL,
          dag,
          start: `${String(Math.floor(startMin / 60)).padStart(2, "0")}:${String(startMin % 60).padStart(2, "0")}`,
          eind: `${String(Math.floor(eindMin / 60)).padStart(2, "0")}:${String(eindMin % 60).padStart(2, "0")}`,
          uursoort,
          opmerking,
          tijdvakken,
        };
      }

      entry.diensten.push(dienst);
    } catch {
      // Rij overgeslagen
    }
  }

  // Reiskosten koppelen
  for (const reis of reisBuffer) {
    const sleutel = `${reis.mw}|||${reis.kp}`;
    let target = verwerkt.get(sleutel);

    if (!target) {
      // Zoek op medewerkersnaam alleen
      for (const [k, v] of verwerkt.entries()) {
        if (k.startsWith(reis.mw + "|||")) {
          target = v;
          break;
        }
      }
    }

    if (!target) continue;

    target.diensten.push({
      type: "reiskosten",
      datum: formatDate(reis.datum),
      datumStr: formatDateNL(reis.datum),
      dag: dagNaam(reis.datum),
      start: "",
      eind: "",
      uursoort: reis.uursoort,
      opmerking: reis.opmerking,
      tijdvakken: [],
      km: reis.km,
    });
  }

  // Resultaten samenvatten
  const medewerkers: MedewerkerResultaat[] = [];
  let aantalDiensten = 0;

  const gesorteerd = [...verwerkt.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], "nl")
  );

  for (const [sleutel, data] of gesorteerd) {
    const [mw, kp] = sleutel.split("|||");
    const totaalUren = data.diensten.reduce((som, d) => {
      if (d.type === "reiskosten") return som;
      return som + d.tijdvakken.reduce((s, t) => s + t.uren, 0);
    }, 0);
    const totaalKm = data.diensten.reduce((som, d) => som + (d.km || 0), 0);

    medewerkers.push({
      medewerker: mw,
      kostenplaats: kp,
      cao: data.cao!,
      diensten: data.diensten,
      totaalUren: Math.round(totaalUren * 100) / 100,
      totaalKm: Math.round(totaalKm * 100) / 100,
    });

    aantalDiensten += data.diensten.filter((d) => d.type !== "reiskosten").length;
  }

  return {
    medewerkers,
    aantalMedewerkers: medewerkers.length,
    aantalDiensten,
    niet_herkend: nietHerkend,
  };
}
