import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anetwerk Urenverwerking",
  description: "ORT-verwerking voor Anetwerk Personeelsdiensten",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-gray-50 antialiased">
        <nav className="bg-[#1F4E79] text-white px-6 py-4 flex items-center justify-between shadow-md">
          <a href="/" className="text-lg font-bold tracking-wide hover:text-blue-200 transition">
            ♡ Anetwerk Urenverwerking
          </a>
          <a href="/geschiedenis" className="text-sm text-blue-200 hover:text-white transition">
            Eerdere uploads →
          </a>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
