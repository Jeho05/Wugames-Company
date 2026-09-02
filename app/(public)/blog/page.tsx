"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { BrandMark } from "@/app/components/ui/brand-mark";
import { Icon } from "@/app/components/ui/app-icon";
import { useBlogPosts } from "@/app/hooks/use-vitrine";

export default function BlogPage() {
  const [category, setCategory] = useState("Tous");
  const { data: posts, loading } = useBlogPosts();

  const categories = useMemo(() => {
    if (!posts || posts.length === 0) return ["Tous"];
    const cats = Array.from(new Set(posts.map((p) => p.category)));
    return ["Tous", ...cats];
  }, [posts]);

  const visiblePosts = useMemo(() => {
    if (!posts) return [];
    return category === "Tous" ? posts : posts.filter((post) => post.category === category);
  }, [posts, category]);

  const [featured, ...rest] = visiblePosts;

  return (
    <main className="min-h-screen bg-[#fbfcfe] text-[#17294b]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#101a2d]">
        <div className="mx-auto flex h-[76px] w-full max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <BrandMark href="/" inverse />
          <nav aria-label="Navigation blog" className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <Link className="text-slate-300 transition hover:text-white" href="/">
              Accueil
            </Link>
            <Link className="text-slate-300 transition hover:text-white" href="/boutique">
              Boutique
            </Link>
            <Link className="text-slate-300 transition hover:text-white" href="/realisations">
              Réalisations
            </Link>
          </nav>
          <Link
            className="inline-flex items-center gap-2 rounded-xl bg-[#e3a641] px-3.5 py-2.5 text-xs font-bold text-[#14223b] shadow-lg shadow-amber-600/15 transition hover:bg-[#efb653] sm:px-4 sm:text-sm"
            href="/connexion"
          >
            Mon espace <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </header>

      <section className="bg-[#101a2d] pb-12 pt-32 text-white">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300">Le journal WUGAMS</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] sm:text-5xl">Blog &amp; conseils</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
            Chantiers, matériaux, rénovation, entretien : les coulisses et les conseils de nos équipes, sans langue de bois.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-5 py-10 sm:px-8">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  aria-pressed={category === cat}
                  className={
                    "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition " +
                    (category === cat ? "bg-[#17294b] text-white shadow-sm" : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300")
                  }
                  key={cat}
                  onClick={() => setCategory(cat)}
                  type="button"
                >
                  {cat}
                </button>
              ))}
            </div>

            {featured ? (
              <Link
                className="mt-6 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg lg:grid-cols-2"
                href={"/blog/" + featured.slug}
              >
                <div className="aspect-[16/10] overflow-hidden bg-slate-100 lg:aspect-auto lg:h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img loading="lazy" decoding="async" alt={featured.title} className="h-full w-full object-cover transition duration-500 hover:scale-105" src={featured.image} />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400">
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">{featured.category}</span>
                    <span>{featured.date}</span>
                    <span>· {featured.read_time}</span>
                  </div>
                  <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-[#17294b] sm:text-3xl">{featured.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{featured.excerpt}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#426b95] transition hover:text-[#17294b]">
                    Lire l&apos;article <Icon name="arrow-right" size={17} />
                  </span>
                </div>
              </Link>
            ) : (
              <div className="mt-6 grid place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
                <p className="text-sm font-semibold text-slate-500">Aucun article dans cette catégorie</p>
              </div>
            )}

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <Link
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  href={"/blog/" + post.slug}
                  key={post.slug}
                >
                  <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img loading="lazy" decoding="async" alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={post.image} />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400">
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">{post.category}</span>
                      <span>{post.read_time}</span>
                    </div>
                    <h3 className="mt-3 text-base font-bold tracking-[-0.02em] text-[#233856] transition group-hover:text-[#17294b]">{post.title}</h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{post.excerpt}</p>
                    <p className="mt-auto pt-4 text-[11px] font-semibold text-slate-400">
                      {post.author} · {post.date}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-[#d19331]">
              <Icon name="file-text" size={24} />
            </span>
            <h3 className="mt-4 text-lg font-bold tracking-[-0.03em] text-[#17294b]">Aucun article pour le moment</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Le journal WUGAMS est en préparation. Le Gérant publiera bientôt les premiers articles depuis l&apos;espace d&apos;administration.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
