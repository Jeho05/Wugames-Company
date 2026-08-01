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

export const blogPosts: BlogPost[] = [
  {
    slug: "renovation-reussie-7-reflexes",
    title: "Rénovation réussie : les 7 réflexes avant de signer",
    category: "Conseils",
    author: "Équipe WUGAMS Rénovation",
    date: "28 juillet 2026",
    readTime: "6 min",
    excerpt: "Avant de lancer un chantier, quelques vérifications simples évitent 90 % des mauvaises surprises. Guide pratique pour les particuliers.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
    content: [
      "Un chantier réussi commence bien avant la première pelleteuse. La différence entre une rénovation qui se passe bien et une qui tourne au cauchemar tient souvent à quelques réflexes simples, pris au bon moment.",
      "1. Vérifiez la garantie décennale de l'entreprise. Elle est obligatoire pour les travaux de construction et de rénovation lourde, et couvre dix ans les dommages qui compromettent la solidité de l'ouvrage.",
      "2. Exigez un devis détaillé et chiffré ligne par ligne. Méfiez-vous des devis au forfait flou : si une ligne n'est pas claire, demandez-la. Le prix annoncé doit être le prix payé.",
      "3. Définissez un calendrier avec des jalons précis. Chaque étape (démolition, gros œuvre, second œuvre, finitions) doit avoir une date de début et une date de fin.",
      "4. Gardez un seul interlocuteur. Plus le nombre d'intervenants est grand, plus le risque de perte d'information augmente. Un chef de projet unique change tout.",
      "5. Photographiez l'état des lieux avant travaux. Ces photos serviront de référence en cas de litige, et de preuve de la valeur ajoutée à la livraison.",
      "6. Ne payez jamais la totalité d'avance. Les acomptes progressent avec l'avancement réel du chantier, et le solde se règle à la réception des travaux.",
      "7. Faites une réception contradictoire. Visitez le chantier avec l'entreprise, notez les réserves éventuelles, et ne signez qu'à la fin des finitions.",
      "Chez WUGAMS, ces réflexes sont intégrés à notre méthode de suivi : devis transparent, calendrier engagé, suivi en temps réel et garantie décennale incluse. La sérénité ne devrait jamais être une option.",
    ],
  },
  {
    slug: "chantier-suivi-temps-reel",
    title: "Le suivi de chantier en temps réel, ça change quoi ?",
    category: "Actualités",
    author: "Direction WUGAMS",
    date: "21 juillet 2026",
    readTime: "4 min",
    excerpt: "Photos d'avancement, pointage des équipes, rapport quotidien : la digitalisation du chantier redonne la main au client.",
    image: "https://images.unsplash.com/photo-1541888946425-d81bbad27a4f?w=1600&q=80",
    content: [
      "Pendant longtemps, suivre un chantier signifiait une seule chose : attendre. Attendre un appel, attendre une visite, attendre la surprise. La digitalisation du terrain a mis fin à cette époque.",
      "Chez WUGAMS, chaque mission est suivie depuis la plateforme : l'équipe pointe son arrivée et sa sortie en géolocalisation, le rapport de fin de mission est transmis avec photos, et le client voit l'avancement de ses travaux à tout moment depuis son téléphone.",
      "Concrètement, cela signifie qu'une question simple — « où en est mon chantier ? » — trouve une réponse précise, datée et sourcée, sans passer par une secrétaire.",
      "Pour l'entreprise, la même logique protège la paie des ouvriers : chaque heure travaillée est horodatée et géolocalisée. Pour le client, la facturation s'appuie sur des preuves réelles plutôt que sur des estimations.",
      "Le suivi en temps réel ne remplace pas la relation humaine — il la rend plus claire. Parce qu'un chantier qui avance visiblement est un chantier qui se termine dans la confiance.",
    ],
  },
  {
    slug: "boutique-materiaux-livraison",
    title: "La boutique WUGAMS Matériaux livre désormais vos chantiers",
    category: "Boutique",
    author: "Équipe WUGAMS Matériaux",
    date: "14 juillet 2026",
    readTime: "3 min",
    excerpt: "Ciment, peinture, outillage : commandez en ligne et faites-vous livrer sur votre chantier, même en urgence.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80",
    content: [
      "Un chantier qui s'arrête parce qu'il manque un sac de ciment coûte cher. C'est pour cette raison que la centrale d'achat WUGAMS Matériaux ouvre sa boutique en ligne à tous les professionnels et particuliers.",
      "Le catalogue couvre le gros œuvre, l'électricité, la plomberie, la peinture et la quincaillerie. Chaque fiche produit affiche le prix réel, le stock disponible en dépôt et un délai de livraison.",
      "La commande se passe en quelques minutes : panier, adresse de livraison, règlement par carte ou Mobile Money (MTN MoMo, Moov Money). La confirmation est immédiate.",
      "Pour les chantiers, nous proposons la livraison en urgence sous 4 heures sur Abidjan, et un service de réapprovisionnement programmé pour les équipes.",
      "Les clients membres WUGAMS bénéficient de tarifs préférentiels et d'un suivi logistique en temps réel. La boutique est accessible depuis le site, ouverte 7 j/7.",
    ],
  },
  {
    slug: "nettoyage-professionnel-regles-or",
    title: "Nettoyage professionnel : les règles d'or d'une prestation qui dure",
    category: "Conseils",
    author: "Équipe WUGAMS Entretien",
    date: "07 juillet 2026",
    readTime: "5 min",
    excerpt: "Produits, fréquences, protocoles : ce que les professionnels savent et que les particuliers découvrent souvent trop tard.",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=1600&q=80",
    content: [
      "Un nettoyage professionnel ne se résume pas à passer un chiffon. Il repose sur trois piliers : les bons produits, les bonnes fréquences, et un protocole documenté.",
      "D'abord les produits. Tous les sols ne se nettoient pas de la même manière : un traitement adapté prolonge la durée de vie des revêtements et réduit les coûts d'entretien sur le long terme.",
      "Ensuite les fréquences. Un espace médical ou une résidence recevant du public exige un passage quotidien sur les zones de contact, tandis que les surfaces verticales peuvent se planifier hebdomadairement.",
      "Enfin le protocole : chaque intervention se termine par un rapport de passage, noté et vérifié par le client. Cette traçabilité, c'est ce qui sépare une prestation professionnelle d'un service au résultat aléatoire.",
      "Nos équipes de WUGAMS Entretien appliquent ce cadre sur les résidences, bureaux, complexes médicaux et espaces verts, avec le même niveau d'exigence partout.",
    ],
  },
  {
    slug: "mobilier-sur-mesure-creation",
    title: "Mobilier sur mesure : pourquoi nos clients quittent la grande distribution",
    category: "Réalisations",
    author: "Atelier WUGAMS Mobilier",
    date: "30 juin 2026",
    readTime: "4 min",
    excerpt: "Un meuble qui épouse votre espace, vos usages et votre budget : retour sur la méthode de l'atelier WUGAMS.",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80",
    content: [
      "Un salon standard est conçu pour un salon standard. Or, aucun espace n'est standard : les angles, les hauteurs, les usages, tout diffère.",
      "Notre atelier commence toujours par l'écoute : quels objets vivront dans ce meuble, qui s'en sert, comment circule-t-on dans la pièce ? À partir de là, nous dessinons, chiffrons, et fabriquons.",
      "Le bois massif local, le travail de finition et la restauration d'anciens meubles restent notre cœur de métier. Chaque pièce sort de l'atelier avec sa fiche de fabrication et sa garantie.",
      "Le sur-mesure n'est pas un luxe inaccessible : en optimisant les matériaux, le coût final est souvent proche d'un achat de gamme moyenne — pour un résultat qui, lui, ne ressemble à aucun autre.",
    ],
  },
  {
    slug: "villa-livree-cocody-retour-chantier",
    title: "Villa livrée à Cocody : retour sur un chantier de 14 semaines",
    category: "Réalisations",
    author: "Direction WUGAMS",
    date: "22 juin 2026",
    readTime: "5 min",
    excerpt: "Rénovation complète d'une villa, 3 équipes, 0 dépassement de délai : la chronique d'un chantier bien mené.",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80",
    content: [
      "Quand les propriétaires de cette villa de Cocody nous ont confié leur rénovation complète, le bâtiment était en l'état depuis huit ans : toiture à refaire, électricité aux normes, finitions entièrement reprises.",
      "La première semaine a été consacrée au diagnostic technique et à l'état des lieux photographié. Le devis a été figé ligne par ligne, avec un calendrier de 14 semaines engagé.",
      "Trois équipes se sont relayées sur site : gros œuvre et toiture, second œuvre (électricité, plomberie, climatisation), puis finitions et mobilier sur mesure.",
      "Chaque soir, un rapport de mission était transmis avec photos. Chaque semaine, le client recevait un point d'avancement. Les deux seuls ajustements de périmètre ont été validés par écrit avant exécution.",
      "La villa a été livrée à la date promise, avec le budget annoncé. La réception s'est conclue sans réserve. C'est exactement la définition que nous donnons du métier : des engagements tenus, documentés, vérifiables.",
    ],
  },
];

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

export const realisations: Realisation[] = [
  { title: "Rénovation complète — Villa Cocody", filiale: "Rénovation", client: "Particulier", location: "Cocody, Abidjan", value: "38,5 M FCFA", year: "2026", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1400&q=80", tags: ["Rénovation", "Finitions", "14 semaines"], description: "Toiture, second œuvre, finitions et mobilier sur mesure. Livré sans réserve, dans les délais." },
  { title: "Immeuble de bureaux — Façade & étanchéité", filiale: "Construction", client: "SCI Les Palmiers", location: "Marcory, Abidjan", value: "96,0 M FCFA", year: "2025", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80", tags: ["Construction", "Façade", "Étanchéité"], description: "Reprise complète de la façade, étanchéité des toitures-terrasses et mise aux normes électriques." },
  { title: "Entretien — Résidence Les Palmiers", filiale: "Entretien", client: "SCI Les Palmiers", location: "Treichville, Abidjan", value: "Contrat annuel", year: "2026", image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=1400&q=80", tags: ["Entretien", "Résidentiel", "Quotidien"], description: "Plan d'entretien quotidien des parties communes, espaces verts et hall d'accueil, rapporté chaque semaine." },
  { title: "Aménagement — Boutique de matériaux", filiale: "Construction", client: "WUGAMS Matériaux", location: "Cocody, Abidjan", value: "24,0 M FCFA", year: "2025", image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1400&q=80", tags: ["Aménagement", "Commerce", "Logistique"], description: "Réception des flux logistiques, rayonnage industriel et espace d'accueil clients." },
  { title: "Mobilier sur mesure — Salle de conférence", filiale: "Mobilier", client: "Groupe Ahoua", location: "Plateau, Abidjan", value: "12,4 M FCFA", year: "2026", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80", tags: ["Mobilier", "Bois massif", "Sur mesure"], description: "Table de réunion 12 places en bois massif local, création et restauration de l'assise existante." },
  { title: "Nettoyage — Complexe médical", filiale: "Entretien", client: "Centre de santé", location: "Yopougon, Abidjan", value: "Contrat annuel", year: "2025", image: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=1400&q=80", tags: ["Entretien", "Santé", "Protocole"], description: "Protocole d'hygiène adapté aux espaces médicaux, personnel formé et rapport de passage systématique." },
  { title: "Réhabilitation — Maison familiale", filiale: "Rénovation", client: "Particulier", location: "Bingerville", value: "17,8 M FCFA", year: "2025", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1400&q=80", tags: ["Rénovation", "Mobilier", "Peinture"], description: "Reprise des peintures, menuiseries et aménagement extérieur, en site occupé." },
  { title: "Équipement — Dépôt Treichville", filiale: "Matériaux", client: "WUGAMS Matériaux", location: "Treichville, Abidjan", value: "9,6 M FCFA", year: "2026", image: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1400&q=80", tags: ["Stocks", "Rayonnage", "Logistique"], description: "Réorganisation du dépôt, création de zones de stockage par famille produit et signalétique." },
  { title: "Villa moderne — Construction neuve", filiale: "Construction", client: "Villa Koné", location: "Bingerville", value: "112,0 M FCFA", year: "2026", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80", tags: ["Construction", "Neuf", "Clé en main"], description: "Construction neuve clé en main : structure, corps d'état, finitions et aménagement extérieur." },
];
