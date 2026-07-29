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
      sections={[
        {
          title: "BÂTIR",
          line1: "Des fondations solides",
          line2: "pour des projets d'exception",
        },
        {
          title: "RÉNOVER",
          line1: "Redonner vie aux espaces,",
          line2: "réinventer le confort",
        },
      ]}
    />
  );
}
