import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

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

export const metadata: Metadata = {
  description: "Plateforme web de pilotage multi-filiales de WUGAMS Holding Inc.",
  title: {
    default: "WUGAMS | Pilotage multi-filiales",
    template: "%s | WUGAMS",
  },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "WUGAMS" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "WUGAMS",
    title: "WUGAMS | Pilotage multi-filiales",
    description: "Bâtir, rénover, entreprendre. Avec la bonne équipe.",
  },
};

export const viewport = {
  themeColor: "#17294b",
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
      className={[geistSans.variable, geistMono.variable, "h-full", "antialiased"].join(" ")}
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
