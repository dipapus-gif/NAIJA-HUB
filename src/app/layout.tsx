import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import {
  JetBrains_Mono,
  Plus_Jakarta_Sans,
  Playfair_Display,
  Space_Grotesk,
} from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { THEME_INIT_SCRIPT } from "@/components/site/ThemeToggle";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://naija-hub.vercel.app"),
  title: "Naija Hub — Offline-First Utilities Super-App (EN & Pidgin)",
  description:
    "Built offline-first for everyday Nigerian basics: Light Tracker, Fuel & Energy, Price Watch, Naira Rates, Tax & VAT, Split the Bill, Ajo/Esusu, Bill Reminders, USSD/Emergency & Scam Check.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/images/naija-hub-icon.png",
    apple: "/images/naija-hub-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Naija Hub",
  },
};

export const viewport: Viewport = {
  themeColor: "#061A14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} ${playfair.variable}`}
    >
      <head />
      <body className="antialiased selection:bg-amber-400 selection:text-stone-950">
        <Script id="theme-init" strategy="beforeInteractive">{THEME_INIT_SCRIPT}</Script>
        {children}
      </body>
    </html>
  );
}
