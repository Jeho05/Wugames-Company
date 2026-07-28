"use client";

import { Icon } from "@/app/components/ui/app-icon";

const items = [
  "1 200+ projets livrés",
  "4,7/5 satisfaction",
  "Zéro surprise tarifaire",
  "Garantie décennale 10 ans",
  "5 filiales spécialisées",
  "Suivi en temps réel",
  "Consultation gratuite",
  "Devis transparent",
];

export function Marquee() {
  return (
    <div className="overflow-hidden border-y border-slate-200/60 bg-[#f0f4f8] py-3">
      <div className="marquee-track">
        {[...items, ...items].map((item, i) => (
          <span className="mx-8 inline-flex shrink-0 items-center gap-2 text-xs font-bold tracking-wide text-slate-400" key={i}>
            <Icon className="text-[#e3a641]/40" name="sparkles" size={12} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
