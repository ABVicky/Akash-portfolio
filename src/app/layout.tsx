import type { Metadata } from "next";
import { Prata, Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { AudioProvider } from "@/context/AudioContext";
import SmoothScroll from "@/components/SmoothScroll";
import NoiseGrain from "@/components/NoiseGrain";
import CustomCursor from "@/components/CustomCursor";
import Header from "@/components/Header";
import Loader from "@/components/Loader";

const cormorant = Prata({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-serif",
  display: "swap",
});

const plusJakarta = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const spaceMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AKASH // Cinematic Photography Portfolio",
  description: "A professional editorial photography and cinematic production portfolio, capturing light, narrative, and quiet spaces.",
  keywords: ["photography", "cinematic", "editorial", "film", "leica", "production", "portfolio"],
  openGraph: {
    title: "AKASH // Cinematic Photography Portfolio",
    description: "Editorial and cinematic photography — capturing light, narrative, and quiet spaces.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${plusJakarta.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas text-foreground font-sans relative overflow-x-hidden">
        <AudioProvider>
          <SmoothScroll>
            {/* Drifting film grain overlay */}
            <NoiseGrain />
            
            {/* Custom interactive trailing physics cursor */}
            <CustomCursor />
            
            {/* First-visit loader / intro flash animation */}
            <Loader />

            {/* Global minimal navigation */}
            <Header />

            {/* Main portfolio content */}
            <div className="relative z-10 w-full min-h-screen">
              {children}
            </div>
          </SmoothScroll>
        </AudioProvider>
      </body>
    </html>
  );
}
