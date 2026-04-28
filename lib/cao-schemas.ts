import { CaoType, OrtTijdvak } from "@/types";

function t(h: number, m = 0): number {
  return h * 60 + m;
}

// Paaszondag berekening (Meeus/Jones/Butcher algoritme)
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function isFeestdag(datum: Date): boolean {
  const y = datum.getFullYear();
  const easter = easterSunday(y);

  // Koningsdag: 27 april, maar als dat een zondag is → 26 april
  const koningsdag27 = new Date(y, 3, 27);
  const koningsdag = koningsdag27.getDay() === 0 ? new Date(y, 3, 26) : koningsdag27;

  const feestdagen = [
    new Date(y, 0, 1),       // Nieuwjaarsdag
    addDays(easter, -2),      // Goede Vrijdag
    easter,                   // Eerste Paasdag
    addDays(easter, 1),       // Tweede Paasdag
    koningsdag,               // Koningsdag
    new Date(y, 4, 5),       // Bevrijdingsdag
    addDays(easter, 39),      // Hemelvaartsdag
    addDays(easter, 49),      // Eerste Pinksterdag
    addDays(easter, 50),      // Tweede Pinksterdag
    new Date(y, 11, 25),     // Eerste Kerstdag
    new Date(y, 11, 26),     // Tweede Kerstdag
  ];

  return feestdagen.some((f) => sameDay(datum, f));
}

export const CAO_ORT: Record<
  CaoType,
  {
    weekdag: OrtTijdvak[];
    vrijdag?: OrtTijdvak[];
    zaterdag: OrtTijdvak[];
    zondag: OrtTijdvak[];
    feestdag?: OrtTijdvak[];
    slaap_uren: number;
  }
> = {
  ggz: {
    weekdag: [
      { startMin: t(0), eindMin: t(6), pct: 144 },
      { startMin: t(6), eindMin: t(7), pct: 122 },
      { startMin: t(7), eindMin: t(20), pct: 100 },
      { startMin: t(20), eindMin: t(22), pct: 122 },
      { startMin: t(22), eindMin: 1440, pct: 144 },
    ],
    zaterdag: [
      { startMin: t(0), eindMin: t(6), pct: 149 },
      { startMin: t(6), eindMin: t(8), pct: 138 },
      { startMin: t(8), eindMin: t(12), pct: 100 },
      { startMin: t(12), eindMin: t(22), pct: 138 },
      { startMin: t(22), eindMin: 1440, pct: 149 },
    ],
    zondag: [{ startMin: t(0), eindMin: 1440, pct: 160 }],
    feestdag: [{ startMin: t(0), eindMin: 1440, pct: 160 }],
    slaap_uren: 4,
  },
  ghz: {
    weekdag: [
      { startMin: t(0), eindMin: t(6), pct: 147 },
      { startMin: t(6), eindMin: t(7), pct: 122 },
      { startMin: t(7), eindMin: t(20), pct: 100 },
      { startMin: t(20), eindMin: t(22), pct: 122 },
      { startMin: t(22), eindMin: 1440, pct: 147 },
    ],
    zaterdag: [{ startMin: t(0), eindMin: 1440, pct: 152 }],
    zondag: [{ startMin: t(0), eindMin: 1440, pct: 152 }],
    feestdag: [{ startMin: t(0), eindMin: 1440, pct: 160 }],
    slaap_uren: 8,
  },
  jeugd: {
    weekdag: [
      { startMin: t(0), eindMin: t(6), pct: 145 },
      { startMin: t(6), eindMin: t(8), pct: 125 },
      { startMin: t(8), eindMin: t(18), pct: 100 },
      { startMin: t(18), eindMin: t(22), pct: 125 },
      { startMin: t(22), eindMin: 1440, pct: 145 },
    ],
    zaterdag: [
      { startMin: t(0), eindMin: t(6), pct: 145 },
      { startMin: t(6), eindMin: t(22), pct: 130 },
      { startMin: t(22), eindMin: 1440, pct: 145 },
    ],
    zondag: [{ startMin: t(0), eindMin: 1440, pct: 145 }],
    feestdag: [{ startMin: t(0), eindMin: 1440, pct: 145 }],
    slaap_uren: 4,
  },
  vvt: {
    weekdag: [
      { startMin: t(0), eindMin: t(6), pct: 147 },
      { startMin: t(6), eindMin: t(7), pct: 122 },
      { startMin: t(7), eindMin: t(20), pct: 100 },
      { startMin: t(20), eindMin: t(22), pct: 122 },
      { startMin: t(22), eindMin: 1440, pct: 147 },
    ],
    zaterdag: [
      { startMin: t(0), eindMin: t(6), pct: 152 },
      { startMin: t(6), eindMin: t(8), pct: 138 },
      { startMin: t(8), eindMin: t(12), pct: 100 },
      { startMin: t(12), eindMin: t(22), pct: 138 },
      { startMin: t(22), eindMin: 1440, pct: 152 },
    ],
    zondag: [{ startMin: t(0), eindMin: 1440, pct: 160 }],
    feestdag: [{ startMin: t(0), eindMin: 1440, pct: 160 }],
    slaap_uren: 4,
  },
  sw: {
    weekdag: [
      { startMin: t(0), eindMin: t(7), pct: 125 },
      { startMin: t(7), eindMin: t(19), pct: 100 },
      { startMin: t(19), eindMin: 1440, pct: 120 },
    ],
    vrijdag: [
      { startMin: t(0), eindMin: t(7), pct: 125 },
      { startMin: t(7), eindMin: t(19), pct: 100 },
      { startMin: t(19), eindMin: 1440, pct: 125 },
    ],
    zaterdag: [{ startMin: t(0), eindMin: 1440, pct: 125 }],
    zondag: [{ startMin: t(0), eindMin: 1440, pct: 145 }],
    feestdag: [{ startMin: t(0), eindMin: 1440, pct: 145 }],
    slaap_uren: 4,
  },
};

export const DAG_NAMEN = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

export function dagType(
  datum: Date,
  cao: CaoType
): "weekdag" | "vrijdag" | "zaterdag" | "zondag" | "feestdag" {
  if (isFeestdag(datum)) return "feestdag";
  const wd = datum.getDay(); // 0=zondag, 6=zaterdag
  if (wd === 0) return "zondag";
  if (wd === 6) return "zaterdag";
  if (wd === 5 && cao === "sw") return "vrijdag";
  return "weekdag";
}

export function getSchema(cao: CaoType, datum: Date): OrtTijdvak[] {
  const schema = CAO_ORT[cao];
  const dt = dagType(datum, cao);
  if (dt === "feestdag") {
    if (schema.feestdag) return schema.feestdag;
    // Geen feestdag-schema: val terug op de echte dag van de week
    const wd = datum.getDay();
    if (wd === 0) return schema.zondag;
    if (wd === 6) return schema.zaterdag;
    if (wd === 5 && schema.vrijdag) return schema.vrijdag;
    return schema.weekdag;
  }
  if (dt === "vrijdag" && schema.vrijdag) return schema.vrijdag;
  if (dt === "zaterdag") return schema.zaterdag;
  if (dt === "zondag") return schema.zondag;
  return schema.weekdag;
}
