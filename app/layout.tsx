import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond, Montserrat } from "next/font/google";

import { AuthProvider } from "@/app/lib/auth-context";
import { ChatWidget } from "@/app/components/ui/chat-widget";
import { PwaRegister } from "@/app/components/pwa-register";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  description: "Plateforme web de pilotage multi-filiales de WUGAMS Holding Inc.",
  title: {
    default: "WUGAMS | Pilotage multi-filiales",
    template: "%s | WUGAMS",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "WUGAMS" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "WUGAMS",
    title: "WUGAMS | Pilotage multi-filiales",
    description: "Bâtir, rénover, entreprendre. Avec la bonne équipe.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WUGAMS Holding Inc. — emblème livre ouvert et W doré",
      },
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "WUGAMS emblem",
      },
    ],
  },
};

export const viewport = {
  themeColor: "#090A0C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={[
        geistSans.variable,
        geistMono.variable,
        cormorant.variable,
        montserrat.variable,
        "h-full",
        "antialiased",
      ].join(" ")}
      lang="fr"
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <AuthProvider>
          {children}
          <ChatWidget />
          <PwaRegister />
        </AuthProvider>
      </body>
    </html>
  );
}
