import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tonttujahti - Lotta ja Tontut",
  description: "Hauskaa joulua Lotan kanssa! Nappaa kaikki piileksivät tontut!",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fi">
      <body className="antialiased">{children}</body>
    </html>
  );
}
