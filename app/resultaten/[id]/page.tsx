"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { VerwerkingsResultaat, MedewerkerResultaat } from "@/types";
import ResultatenView from "@/app/components/ResultatenView";

export default function ResultatenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<{ resultaat: VerwerkingsResultaat; bestandsnaam: string } | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [geselecteerdeMw, setGeselecteerdeMw] = useState<MedewerkerResultaat | null>(null);

  useEffect(() => {
    fetch(`/api/uploads/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setFout(d.error);
        } else {
          setData({ resultaat: d.resultaat, bestandsnaam: d.bestandsnaam });
        }
      })
      .catch(() => setFout("Kon resultaten niet laden"));
  }, [id]);

  if (fout) {
    return <div className="text-red-600">{fout}</div>;
  }

  if (!data) {
    return <div className="text-gray-500">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F4E79]">{data.bestandsnaam}</h1>
        <p className="text-sm text-gray-500 mt-1">Eerder verwerkt resultaat</p>
      </div>
      <ResultatenView
        resultaat={data.resultaat}
        uploadId={id}
        geselecteerdeMw={geselecteerdeMw}
        onSelecteerMw={setGeselecteerdeMw}
      />
    </div>
  );
}
