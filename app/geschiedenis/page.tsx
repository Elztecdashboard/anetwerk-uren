"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Upload {
  id: string;
  bestandsnaam: string;
  geupload_op: string;
  aantal_medewerkers: number;
}

export default function GeschiedenisPage() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    fetch("/api/uploads")
      .then((r) => r.json())
      .then((data) => {
        setUploads(Array.isArray(data) ? data : []);
        setLaden(false);
      })
      .catch(() => setLaden(false));
  }, []);

  if (laden) {
    return <div className="text-gray-500">Laden...</div>;
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-[#1F4E79]">Eerdere uploads</h1>

      {uploads.length === 0 ? (
        <p className="text-gray-500">Nog geen uploads gevonden.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {uploads.map((u) => (
            <Link
              key={u.id}
              href={`/resultaten/${u.id}`}
              className="flex items-center justify-between px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-medium text-gray-900">{u.bestandsnaam}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(u.geupload_op).toLocaleString("nl-NL")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[#1F4E79]">
                  {u.aantal_medewerkers} medewerkers
                </p>
                <p className="text-xs text-[#2E75B6] mt-0.5">Bekijken →</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
