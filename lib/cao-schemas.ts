import { CaoType, OrtTijdvak } from "@/types";

function t(h: number, m = 0): number {
  return h * 60 + m;
}

export const CAO_ORT: Record<
  CaoType,
  {
    weekdag: OrtTijdvak[];
    vrijdag?: OrtTijdvak[];
    zaterdag: OrtTijdvak[];
    zondag: OrtTijdvak[];
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
    zondag: [{ startMin: t(0), eindMin: 1440, pct: 160 }],
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
    slaap_uren: 4,
  },
};

export const DAG_NAMEN = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

export function dagType(
  datum: Date,
  cao: CaoType
): "weekdag" | "vrijdag" | "zaterdag" | "zondag" {
  const wd = datum.getDay(); // 0=zondag, 6=zaterdag
  if (wd === 0) return "zondag";
  if (wd === 6) return "zaterdag";
  if (wd === 5 && cao === "sw") return "vrijdag";
  return "weekdag";
}

export function getSchema(cao: CaoType, datum: Date): OrtTijdvak[] {
  const schema = CAO_ORT[cao];
  const dt = dagType(datum, cao);
  if (dt === "vrijdag" && schema.vrijdag) return schema.vrijdag;
  if (dt === "zaterdag") return schema.zaterdag;
  if (dt === "zondag") return schema.zondag;
  return schema.weekdag;
}
