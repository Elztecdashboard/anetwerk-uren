import { CaoType, VerwerktTijdvak } from "@/types";
import { CAO_ORT, DAG_NAMEN, getSchema } from "./cao-schemas";

function minToStr(min: number): string {
  const m = ((min % 1440) + 1440) % 1440;
  return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
}

function tijdvakStr(startMin: number, eindMin: number): string {
  return minToStr(startMin) + "-" + minToStr(eindMin);
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(d: Date): string {
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

function formatDateNL(d: Date): string {
  return String(d.getDate()).padStart(2, "0") + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    d.getFullYear();
}

function dagNaam(d: Date): string {
  return DAG_NAMEN[d.getDay() === 0 ? 6 : d.getDay() - 1];
}

function berekenOrtDag(
  cao: CaoType,
  datum: Date,
  startMin: number,
  eindMin: number
): VerwerktTijdvak[] {
  const schema = getSchema(cao, datum);
  const result: VerwerktTijdvak[] = [];

  for (const { startMin: ts, eindMin: te, pct } of schema) {
    const ovS = Math.max(startMin, ts);
    const ovE = Math.min(eindMin, te);
    if (ovE > ovS) {
      const uren = (ovE - ovS) / 60;
      result.push({
        datum: formatDate(datum),
        datumStr: formatDateNL(datum),
        dag: dagNaam(datum),
        startMin: ovS,
        eindMin: ovE,
        tijdvak: tijdvakStr(ovS, ovE),
        uren: Math.round(uren * 1000) / 1000,
        pct,
        isSlaap: false,
      });
    }
  }
  return result;
}

export function berekenDienst(
  cao: CaoType,
  datumStr: string,
  startMin: number,
  eindMin: number,
  pauzeMin = 0
): VerwerktTijdvak[] {
  const datum = parseDate(datumStr);
  let result: VerwerktTijdvak[] = [];

  if (eindMin <= startMin) {
    // Nachtdienst over middernacht
    result = berekenOrtDag(cao, datum, startMin, 1440);
    const volgende = new Date(datum);
    volgende.setDate(volgende.getDate() + 1);
    const eindM = eindMin === 0 ? 1440 : eindMin;
    result = result.concat(berekenOrtDag(cao, volgende, 0, eindM));
  } else {
    result = berekenOrtDag(cao, datum, startMin, eindMin);
  }

  // Pauze aftrekken van het eerste tijdvak met voldoende uren
  if (pauzeMin > 0) {
    let over = pauzeMin / 60;
    for (let i = 0; i < result.length; i++) {
      if (result[i].uren >= over) {
        result[i] = { ...result[i], uren: Math.round((result[i].uren - over) * 1000) / 1000 };
        break;
      } else {
        over -= result[i].uren;
        result[i] = { ...result[i], uren: 0 };
      }
    }
  }

  return result.filter((t) => t.uren > 0.001);
}

export function berekenSlaapdienst(
  cao: CaoType,
  datumStr: string,
  startMin: number,
  eindMin: number
): VerwerktTijdvak[] {
  const datum = parseDate(datumStr);
  const volgende = new Date(datum);
  volgende.setDate(volgende.getDate() + 1);
  const result: VerwerktTijdvak[] = [];

  // Deel 1: uren voor 23:00 via ORT schema
  const slaapStartMin = 23 * 60;
  if (startMin < slaapStartMin) {
    result.push(...berekenOrtDag(cao, datum, startMin, slaapStartMin));
  }

  // Deel 2: slaapdienst 23:00 - 00:00 (100%)
  result.push({
    datum: formatDate(datum),
    datumStr: formatDateNL(datum),
    dag: dagNaam(datum),
    startMin: slaapStartMin,
    eindMin: 1440,
    tijdvak: tijdvakStr(slaapStartMin, 1440),
    uren: 1.0,
    pct: 100,
    isSlaap: true,
  });

  // Deel 3: slaapdienst 00:00 - 07:00 (100%) volgende dag
  result.push({
    datum: formatDate(volgende),
    datumStr: formatDateNL(volgende),
    dag: dagNaam(volgende),
    startMin: 0,
    eindMin: 7 * 60,
    tijdvak: tijdvakStr(0, 7 * 60),
    uren: 7.0,
    pct: 100,
    isSlaap: true,
  });

  // Deel 4: uren na 07:00 via ORT schema volgende dag
  const slaapEindMin = 7 * 60;
  if (eindMin > slaapEindMin) {
    result.push(...berekenOrtDag(cao, volgende, slaapEindMin, eindMin));
  }

  return result.filter((t) => t.uren > 0.001);
}

export function parseTime(val: unknown): number | null {
  if (val === null || val === undefined) return null;

  // Excel tijdwaarde (decimaal getal, fractie van een dag)
  if (typeof val === "number") {
    const totalMin = Math.round(val * 1440);
    return totalMin % 1440;
  }

  const s = String(val).trim();
  if (!s || s === "None") return null;

  // HH:MM formaat
  const match = s.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    return parseInt(match[1]) * 60 + parseInt(match[2]);
  }

  return null;
}

export { formatDate, formatDateNL, dagNaam, parseDate };
