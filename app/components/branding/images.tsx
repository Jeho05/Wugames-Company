import Image from "next/image";

export function HeroImage() {
  return (
    <div className="relative mx-auto mt-10 max-w-lg lg:mt-0 lg:mx-0">
      <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-[#e3a641]/10 to-[#426b95]/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-2xl shadow-slate-900/5">
        <Image
          alt="Chantier de construction moderne à Abidjan"
          className="size-full object-cover"
          height={600}
          priority
          src="https://images.unsplash.com/photo-1541888946425-d81bbad27a4f?w=800&q=80"
          style={{ aspectRatio: "4/3" }}
          width={800}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#17294b]/30 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur-sm">
          <p className="text-xs font-bold text-[#17294b]">WUGAMS Construction — Cocody, Abidjan</p>
          <p className="mt-0.5 text-[11px] text-slate-500">Livré en 6 mois, budget respecté</p>
        </div>
      </div>
    </div>
  );
}

export function FilialeImage({ src, label }: { src: string; label: string }) {
  return (
    <Image
      alt={label}
      className="size-full object-cover"
      height={200}
      src={src}
      style={{ aspectRatio: "16/9" }}
      width={320}
    />
  );
}

export function TestimonialImage({ src, name }: { src: string; name: string }) {
  return (
    <Image
      alt={name}
      className="rounded-full object-cover"
      height={48}
      src={src}
      width={48}
    />
  );
}
