"use client";

import { HorizonHeroSection } from "@/app/components/ui/horizon-hero-section";

export function HorizonHeroDemo() {
  return (
    <HorizonHeroSection
      title="WUGAMS"
      subtitle={{
        line1: "Où la vision rencontre la réalité,",
        line2: "nous façonnons l'avenir de demain",
      }}
    >
      <div className="h-screen flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="text-center">
          <h2 className="text-4xl font-bold">BÂTIR</h2>
          <p className="text-lg mt-2">Des fondations solides pour des projets d&apos;exception</p>
        </div>
      </div>
      <div className="h-screen flex items-center justify-center bg-[#eef4fa]/80 backdrop-blur-sm">
        <div className="text-center">
          <h2 className="text-4xl font-bold">RÉNOVER</h2>
          <p className="text-lg mt-2">Redonner vie aux espaces, réinventer le confort</p>
        </div>
      </div>
    </HorizonHeroSection>
  );
}
