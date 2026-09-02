/* ------------------------------------------------------------------ */
/* Mode2Vie [Lifestyle]™ — blog de vie chrétienne (front, contenu démo)*/
/* Complément du Doc Technique ERP v2.0 — WUGAMS HOLDING INC.          */
/* ------------------------------------------------------------------ */

export type Mode2VieArticle = {
  id: string;
  titre: string;
  categorie: string;
  auteur: string;
  date: string;
  lecture: string;
  verset: string | null;
  extrait: string;
  contenu: string[];
  diasporama: string[];
  blogUrl?: string;
};

export type Mode2VieCategorie = {
  id: string;
  label: string;
};

export const mode2vieCategories: Mode2VieCategorie[] = [
  { id: "Tous", label: "Tous" },
  { id: "Foi & Travail", label: "Foi & Travail" },
  { id: "Versets du jour", label: "Versets du jour" },
  { id: "Témoignages", label: "Témoignages" },
  { id: "Famille", label: "Famille" },
];

export const mode2vieArticles: Mode2VieArticle[] = [
  {
    id: "m2v1",
    titre: "Travailler comme pour le Seigneur",
    categorie: "Foi & Travail",
    auteur: "Jéhovani Godwin Olouwatossi VIATONOU",
    date: "10 août 2026",
    lecture: "5 min",
    verset: "Colossiens 3, 23",
    extrait:
      "Votre travail n'est pas seulement un gagne-pain : c'est un ministère. La façon dont nous bâtissons, nettoyons et servons dit quelque chose de Celui que nous servons.",
    contenu: [
      "Vingt-trois : « Tout ce que vous faites, faites-le de bon cœur, comme pour le Seigneur, et non pour des hommes. » Ce verset n'est pas une citation décorative : c'est le fondement de notre manière de travailler chez WUGAMS.",
      "Sur un chantier, personne ne voit la fondation une fois la dalle coulée. Pourtant, sans elle, rien ne tient. Il en va de même pour la foi dans le travail : elle se manifeste souvent dans l'invisible — la rigueur, l'honnêteté, la ponctualité.",
      "Un artisan qui prie le matin pose ses briques avec une autre conscience. Il sait que son œuvre est vue, non seulement par le client, mais par Dieu lui-même. Cela change tout : le devis exact, l'heure promise, la finition soignée sont autant d'actes d'adoration.",
      "Dans nos filiales, nous encourageons chaque collaborateur à considérer sa mission quotidienne comme une offrande. Le meilleur témoignage n'est pas un discours : c'est une maison livrée propre, un délai tenu, un client rassuré.",
      "Que votre lumière brille par vos œuvres. Chaque coup de pinceau, chaque passage d'entretien, chaque table montée peut devenir une prière silencieuse qui parle plus fort que les mots.",
    ],
    diasporama: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1429497419816-9ca5cfb4571a?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=75&auto=format&fit=crop",
    ],
    blogUrl: "https://mode2vie.wugams.com/articles/travailler-comme-pour-le-seigneur",
  },
  {
    id: "m2v2",
    titre: "Le verset du jour : la sagesse du bâtisseur",
    categorie: "Versets du jour",
    auteur: "Équipe Mode2Vie",
    date: "9 août 2026",
    lecture: "2 min",
    verset: "Matthieu 7, 24-25",
    extrait:
      "Celui qui entend ces paroles et les met en pratique est semblable à un homme prudent qui a bâti sa maison sur le roc.",
    contenu: [
      "Jésus choisit une image de bâtisseur pour enseigner la sagesse : deux maisons, deux fondations, deux destins. La pluie, les torrents et les vents viennent sur les deux — la différence, c'est le roc.",
      "Dans la construction comme dans la vie, les épreuves ne font pas la différence entre les gens ; elles révèlent ce qui était déjà dans la fondation.",
      "Aujourd'hui, demandons-nous : sur quoi bâtissons-nous notre maison ? Nos projets immobiliers, nos entreprises, nos familles — reposent-ils sur le roc de la Parole, ou sur le sable des circonstances favorables ?",
      "Bâtir sur le roc commence par une décision simple : pratiquer ce que l'on entend. Pas demain, pas quand ce sera facile — aujourd'hui.",
    ],
    diasporama: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=75&auto=format&fit=crop",
    ],
    blogUrl: "https://mode2vie.wugams.com/articles/la-sagesse-du-batisseur",
  },
  {
    id: "m2v3",
    titre: "Témoignage : « Ma première maison livrée avec WUGAMS »",
    categorie: "Témoignages",
    auteur: "Frère David K.",
    date: "6 août 2026",
    lecture: "4 min",
    verset: "Psaume 127, 1",
    extrait:
      "Si l'Éternel ne bâtit la maison, ceux qui la bâtissent travaillent en vain. Douze ans de patience, trois chantiers inachevés, puis une rencontre qui a tout changé.",
    contenu: [
      "Mon témoignage commence par une déception : douze ans de sacrifices pour une parcelle, et trois tentatives de construction inachevées par des artisans qui promettaient tout et tenaient peu.",
      "Un dimanche, à la sortie du culte, j'ai rencontré celui qui dirige WUGAMS. Il a écouté mon histoire sans me vendre quoi que ce soit. Il m'a dit simplement : « Ce projet est une bénédiction pour votre famille, traitons-le comme tel. »",
      "Ce qui a changé, ce n'est pas seulement la qualité du travail — c'est la manière de travailler. Réunions de chantier commencées par la prière, comptes rendus photographiés chaque semaine, aucune charge cachée. Je voyais chaque brique avancer comme une promesse tenue.",
      "La maison est aujourd'hui livrée, bénie et habitée. Ma femme y prie chaque matin. Et j'ai compris que l'Éternel ne bâtit pas seulement les maisons : il bâtit aussi les hommes.",
      "C'est pourquoi je témoigne : une entreprise qui craint Dieu et respecte sa parole est possible. WUGAMS en est un exemple vivant.",
    ],
    diasporama: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3d2?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687644-c7f38ed2e0e3?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=75&auto=format&fit=crop",
    ],
    blogUrl: "https://mode2vie.wugams.com/articles/premiere-maison-livree-wugams",
  },
  {
    id: "m2v4",
    titre: "Prière de chantier : bénir chaque lieu de travail",
    categorie: "Foi & Travail",
    auteur: "Équipe Mode2Vie",
    date: "3 août 2026",
    lecture: "3 min",
    verset: "Proverbes 16, 3",
    extrait:
      "Recommande à l'Éternel tes œuvres, et tes projets réussiront. Une courte prière à dire avant de poser la première pierre — ou la première couche de peinture.",
    contenu: [
      "Chaque projet mérite une bénédiction. Non une formule magique, mais une consécration : reconnaître que ce que nous bâtissons ne nous appartient pas seulement.",
      "Voici une prière simple à adapter : « Seigneur, nous te confions ce chantier. Que nos mains soient habiles, nos cœurs honnêtes et notre travail exact. Que cette maison soit un lieu de paix pour ceux qui l'habiteront. Qu'à travers elle, ton nom soit honoré. Amen. »",
      "Prière des ouvriers : « Père, donne-nous force pour la journée, sagesse dans chaque décision et protection sur le site. Que notre salaire soit juste et notre conscience tranquille. »",
      "Prière des clients : « Seigneur, conduis-nous vers des artisans de confiance. Donne-nous la patience de bien faire les choses et la gratitude de reconnaître les bons collaborateurs. »",
      "Bénir son travail, c'est placer son projet sous une autorité plus grande. Et c'est se rappeler que nous sommes des serviteurs avant d'être des maîtres.",
    ],
    diasporama: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=75&auto=format&fit=crop",
    ],
    blogUrl: "https://mode2vie.wugams.com/articles/priere-de-chantier",
  },
  {
    id: "m2v5",
    titre: "Élever des enfants dans une maison en construction",
    categorie: "Famille",
    auteur: "Sœur Isabelle T.",
    date: "30 juillet 2026",
    lecture: "4 min",
    verset: "Deutéronome 6, 7",
    extrait:
      "Chaque weekend, mes enfants montaient des briques avec leur papa. Ils ont appris le métier, mais surtout, ils ont appris l'intégrité.",
    contenu: [
      "Quand on construit sa maison, on n'imagine pas à quel point ce chantier devient une école pour ses enfants. La nôtre a duré deux ans, et je crois qu'ils en ont tiré autant que de l'école du dimanche.",
      "Ils ont vu leur père refuser un devis qui cachait des charges cachées. Ils l'ont vu tenir parole avec les ouvriers, payer le salaire convenu, même quand le budget serrait.",
      "Ils ont appris ce que Deutéronome avait dit : « Tu les inculqueras à tes enfants » — non par des leçons, mais par les gestes quotidiens. Une maison qui se construit dans l'intégrité est une parabole vivante.",
      "Aujourd'hui, ma fille de 9 ans dit qu'elle veut être architecte « pour construire des maisons où les gens sont heureux ». Et je sais que ce vœu est né sur notre chantier, entre les sacs de ciment et les prières du soir.",
      "Bâtir sa maison est peut-être l'une des plus belles occasions d'éduquer. Saisissons-la.",
    ],
    diasporama: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3d2?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=75&auto=format&fit=crop",
    ],
    blogUrl: "https://mode2vie.wugams.com/articles/enfants-maison-construction",
  },
  {
    id: "m2v6",
    titre: "Le verset du jour : la diligence de Joseph",
    categorie: "Versets du jour",
    auteur: "Équipe Mode2Vie",
    date: "27 juillet 2026",
    lecture: "2 min",
    verset: "Genèse 39, 3",
    extrait:
      "Son maître vit que l'Éternel était avec lui, et que l'Éternel faisait prospérer entre ses mains tout ce qu'il entreprenait.",
    contenu: [
      "Joseph a commencé serviteur, puis est devenu intendant, puis gouverneur. Sa promotion n'a pas commencé dans la salle du trône : elle a commencé dans la maison de Potiphar, quand personne d'important ne regardait.",
      "Le secret de Joseph tient dans ce verset : « l'Éternel faisait prospérer entre ses mains tout ce qu'il entreprenait. » Non pas tout ce qui était facile, mais tout ce qu'il entreprenait — y compris les tâches ingrates.",
      "Aujourd'hui, dans votre travail — qu'il s'agisse d'un chantier, d'un bureau, d'une cuisine — servez d'abord Dieu. La fidélité dans le petit prépare la promotion dans le grand.",
      "Ce que vous faites entre les mains de Dieu prospère. Même ce qui semble invisible n'échappe pas à Celui qui voit tout.",
    ],
    diasporama: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=75&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=75&auto=format&fit=crop",
    ],
    blogUrl: "https://mode2vie.wugams.com/articles/diligence-de-joseph",
  },
];

export function formatMode2VieDateFr(value: string): string {
  return value;
}