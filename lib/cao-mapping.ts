import { CaoType } from "@/types";

// Iriszorg locaties die onder GGZ vallen
const IRISZORG_GGZ = [
  "dd kliniek",
  "kliniek zevenaar",
  "werk & activiteiten tiel",
  "werk en activiteiten tiel",
  "opiatenpoli",
  "mhu nijmegen",
  "meerzorg de hulsen",
];

export function getCao(
  opdrachtgever: string,
  uursoort = "",
  kostenplaats = ""
): CaoType | null {
  const o = opdrachtgever.toLowerCase();
  const kp = kostenplaats.toLowerCase();
  const u = uursoort.toLowerCase();

  // Iriszorg: controleer eerst op GGZ-uitzonderingen
  const iriszorgBron = kp.includes("iriszorg") ? kp : o.includes("iriszorg") ? o : null;
  if (iriszorgBron) {
    if (IRISZORG_GGZ.some((x) => iriszorgBron.includes(x))) return "ggz";
    return "sw";
  }

  // Primair op opdrachtgever
  if (["lister", "ribw"].some((x) => o.includes(x))) return "ggz";
  if (["asvz", "humanitas", "zozijn", "prezzent", "seizoenen"].some((x) => o.includes(x))) return "ghz";
  if (["oosterpoort", "klinq", "timon", "youke", "youké", "kinabu", "nabucco", "ivg kind", "het werkt", "veilig thuis", "pluryn"].some((x) => o.includes(x))) return "jeugd";
  if (["woondroomzorg", "busehoek", "eigen thuis", "toekomst"].some((x) => o.includes(x))) return "vvt";
  if (["smo", "traverse", "tussenvoorziening"].some((x) => o.includes(x))) return "sw";

  // Fallback op uursoort
  if (["ggz", "lister", "ribw"].some((x) => u.includes(x))) return "ggz";
  if (["ghz", "asvz", "humanitas", "zozijn", "prezzent", "seizoenen"].some((x) => u.includes(x))) return "ghz";
  if (["jeugd", "klinq", "oosterpoort", "youke", "timon", "overgenomen"].some((x) => u.includes(x))) return "jeugd";
  if (["vvt", "woondroomzorg", "busehoek"].some((x) => u.includes(x))) return "vvt";
  if (["smo", "traverse", "iriszorg", "social"].some((x) => u.includes(x))) return "sw";

  return null;
}
