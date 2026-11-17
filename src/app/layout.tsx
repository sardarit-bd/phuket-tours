import type { Metadata } from "next";
import localFont from "next/font/local";
import { siteConfig } from "@/config/site";
import { StoreProvider } from "@/store/provider";
import { PublicShell } from "@/components/layout/public-shell";
import "./globals.css";

const jakarta = localFont({
  src: "../fonts/plus-jakarta-sans.woff2",
  variable: "--font-sans",
  display: "swap",
});

const outfit = localFont({
  src: "../fonts/outfit.woff2",
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Island Hopping, Day Trips & Phuket Excursions`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Phuket tours",
    "Phi Phi island tour",
    "James Bond island",
    "Similan islands snorkeling",
    "Phuket day trips",
    "Thailand boat tours",
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${outfit.variable}`}>
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <StoreProvider>
          <PublicShell>{children}</PublicShell>
        </StoreProvider>
      </body>
    </html>
  );
}
