import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AuthProvider } from "@/app/lib/auth-context";
import { SmoothScroll } from "@/app/components/ui/smooth-scroll";
import { ChatWidget } from "@/app/components/ui/chat-widget";

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
      <body className="min-h-full bg-background text-foreground">
        <SmoothScroll>
          <AuthProvider>
            {children}
            <ChatWidget />
          </AuthProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
