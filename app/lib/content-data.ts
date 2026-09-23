export type BlogPost = {
  author: string;
  category: string;
  content: string[];
  date: string;
  excerpt: string;
  image: string;
  readTime: string;
  slug: string;
  title: string;
};

// 100 % dynamique : les articles sont publiés par le Gérant depuis /espace/vitrine
// (API /vitrine/blog, fallback localStorage). Aucun article en dur ici.
// La page /blog/[slug] utilise getBlogPost() et affiche notFound() si vide.

export const blogCategories = ["Tous", "Conseils", "Actualités", "Réalisations", "Boutique"];

export type Realisation = {
  client: string;
  description: string;
  filiale: string;
  image: string;
  location: string;
  tags: string[];
  title: string;
  value: string;
  year: string;
};

// 100 % dynamique : les réalisations sont publiées par le Gérant depuis
// /espace/vitrine (API /vitrine/realisations, fallback localStorage).
// Aucune réalisation en dur ici — page /realisations masquée si vide.
