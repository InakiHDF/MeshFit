import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Providers } from "@/components/providers";
import "./globals.css";

const fontSans = GeistSans;
const fontMono = GeistMono;

export const metadata: Metadata = {
  title: "MeshFit — Grafo de outfit",
  description: "Prototype de MeshFit: gestionar tu guardarropa como un grafo y generar outfits validos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={${fontSans.variable}  antialiased}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
