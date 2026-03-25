export type CaoType = "ggz" | "ghz" | "jeugd" | "vvt" | "sw";

export type DienstType = "dienst" | "slaapdienst" | "reiskosten";

export interface OrtTijdvak {
  startMin: number; // minuten vanaf 00:00
  eindMin: number;
  pct: number;
}

export interface VerwerktTijdvak {
  datum: string; // YYYY-MM-DD
  datumStr: string; // DD-MM-YYYY
  dag: string; // Ma, Di, etc.
  startMin: number;
  eindMin: number;
  tijdvak: string; // "07:00-14:00"
  uren: number;
  pct: number;
  isSlaap: boolean;
}

export interface VerwerkteDienst {
  type: DienstType;
  datum: string;
  datumStr: string;
  dag: string;
  start: string; // "HH:MM"
  eind: string;
  uursoort: string;
  opmerking: string;
  tijdvakken: VerwerktTijdvak[];
  km?: number;
}

export interface MedewerkerResultaat {
  medewerker: string;
  opdrachtgever: string;
  kostenplaats: string;
  cao: CaoType;
  diensten: VerwerkteDienst[];
  totaalUren: number;
  totaalKm: number;
}

export interface VerwerkingsResultaat {
  medewerkers: MedewerkerResultaat[];
  aantalMedewerkers: number;
  aantalDiensten: number;
  niet_herkend: string[];
}

export interface UploadRecord {
  id: string;
  bestandsnaam: string;
  geupload_op: string;
  periode: string | null;
  aantal_medewerkers: number;
  resultaat: VerwerkingsResultaat;
}
