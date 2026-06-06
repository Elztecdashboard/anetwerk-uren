"use client";

import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

interface Props {
  naam: string;
  isAdmin: boolean;
}

export default function NavBar({ naam, isAdmin }: Props) {
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleUitloggen() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="bg-[#1F4E79] text-white px-6 py-4 flex items-center justify-between shadow-md">
      <a href="/" className="text-lg font-bold tracking-wide hover:text-blue-200 transition">
        ♡ Anetwerk Urenverwerking
      </a>
      <div className="flex items-center gap-4">
        <a href="/geschiedenis" className="text-sm text-blue-200 hover:text-white transition">
          Eerdere uploads
        </a>
        {isAdmin && (
          <a href="/beheer" className="text-sm text-blue-200 hover:text-white transition">
            Beheer
          </a>
        )}
        <div className="flex items-center gap-3 pl-3 border-l border-blue-400">
          <span className="text-sm text-blue-100">{naam}</span>
          <button
            onClick={handleUitloggen}
            className="text-xs bg-blue-800 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition"
          >
            Uitloggen
          </button>
        </div>
      </div>
    </nav>
  );
}
