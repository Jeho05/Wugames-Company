import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandMark } from "@/app/components/ui/brand-mark";
import { Icon } from "@/app/components/ui/app-icon";
import { blogPosts } from "@/app/lib/content-data";

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((candidate) => candidate.slug === slug);

  if (!post) {
    notFound();
  }

  const related = blogPosts.filter((candidate) => candidate.slug !== slug).slice(0, 3);

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
            <Link className="text-white" href="/blog">
              Blog
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

      <article className="mx-auto w-full max-w-[820px] px-5 pt-32 sm:px-8">
        <Link
          className="inline-flex items-center gap-2 text-xs font-bold text-[#426b95] transition hover:text-[#17294b]"
          href="/blog"
        >
          <Icon className="rotate-180" name="arrow-right" size={15} />
          Retour au blog
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-400">
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">{post.category}</span>
          <span>{post.date}</span>
          <span>· {post.readTime} de lecture</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-[-0.05em] text-[#17294b] sm:text-[42px] sm:leading-[1.15]">
          {post.title}
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-500">{post.excerpt}</p>

        <div className="mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={post.title} className="h-full w-full object-cover" src={post.image} />
        </div>

        <div className="mt-10 space-y-6">
          {post.content.map((paragraph, index) => (
            <p
              className={
                index === 0
                  ? "text-lg font-medium leading-8 text-[#22314b]"
                  : "text-[15px] leading-8 text-slate-600"
              }
              key={index}
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">À propos de l&apos;auteur</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#dce7f5] text-xs font-extrabold text-[#244269]">
              {post.author.split(" ").map((part) => part[0]).join("").slice(0, 2)}
            </span>
            <div>
              <p className="text-sm font-bold text-[#233856]">{post.author}</p>
              <p className="text-xs text-slate-500">Équipe WUGAMS — {post.category}</p>
            </div>
          </div>
        </div>
      </article>

      <section className="mx-auto w-full max-w-[1240px] px-5 py-14 sm:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-[-0.035em] text-[#17294b]">À lire ensuite</h2>
          <Link className="inline-flex items-center gap-2 text-xs font-bold text-[#426b95] hover:text-[#17294b]" href="/blog">
            Tous les articles <Icon name="arrow-right" size={15} />
          </Link>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((candidate) => (
            <Link
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              href={"/blog/" + candidate.slug}
              key={candidate.slug}
            >
              <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={candidate.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  src={candidate.image}
                />
              </div>
              <div className="p-5">
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                  {candidate.category}
                </span>
                <h3 className="mt-3 text-sm font-bold leading-6 text-[#233856] transition group-hover:text-[#17294b]">
                  {candidate.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
