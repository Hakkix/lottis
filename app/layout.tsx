import type { Metadata } from "next";
import { CookieConsentProvider } from "./components/CookieConsentProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Tonttujahti - Lotta ja Tontut",
  description: "Hauskaa joulua Lotan kanssa! Nappaa kaikki piileksivät tontut!",
  manifest: "/manifest.json",
  themeColor: "#000000",
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
      <body className="antialiased">
        <CookieConsentProvider>
          {children}
        </CookieConsentProvider>
      </body>
    </html>
  );
}
