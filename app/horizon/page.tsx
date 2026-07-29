"use client";

import { HorizonHeroSection } from "@/app/components/ui/horizon-hero-section";

export default function HorizonPage() {
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
        {
          title: "INNOVER",
          line1: "Au-delà des frontières de l'imagination,",
          line2: "se trouve l'univers des possibles",
        },
      ]}
    />
  );
}
