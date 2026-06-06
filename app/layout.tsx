import type { Metadata } from "next";
import "./globals.css";
import { createClient } from "@/lib/supabase-server";
import NavBar from "@/app/components/NavBar";

export const metadata: Metadata = {
  title: "Anetwerk Urenverwerking",
  description: "ORT-verwerking voor Anetwerk Personeelsdiensten",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const naam = user?.user_metadata?.naam || user?.email || "";
  const isAdmin = user?.user_metadata?.is_admin || false;

  return (
    <html lang="nl">
      <body className="min-h-screen bg-gray-50 antialiased">
        {user && <NavBar naam={naam} isAdmin={isAdmin} />}
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
