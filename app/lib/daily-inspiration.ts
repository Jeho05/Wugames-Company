export type DailyInspiration = {
  citation: string;
  reference: string;
  auteur?: string;
};

const inspirations: DailyInspiration[] = [
  {
    citation: "Travaille comme pour le Seigneur et non pour des hommes.",
    reference: "Colossiens 3:23",
  },
  {
    citation: "La sagesse du constructeur, c'est de bâtir sur le roc.",
    reference: "Matthieu 7:24-25",
  },
  {
    citation: "Dieu n'a pas donné un esprit de timidité, mais de puissance, d'amour et de sagesse.",
    reference: "2 Timothée 1:7",
  },
  {
    citation: "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta propre intelligence.",
    reference: "Proverbes 3:5",
  },
  {
    citation: "Celui quisemence une bonne œuvre la mènera à son terme.",
    reference: "Philippiens 1:6",
  },
  {
    citation: "Voici, je suis avec vous tous les jours, jusqu'à la fin du monde.",
    reference: "Matthieu 28:20",
  },
  {
    citation: "L'homme qui craint l'Éternel fait ce qui lui plaît.",
    reference: "Proverbes 16:3",
  },
  {
    citation: "Tout est possible à celui qui croit.",
    reference: "Marc 9:23",
  },
  {
    citation: "Chargé du jour et de sa peine, car le lendemain aura soin de lui-même.",
    reference: "Matthieu 6:34",
  },
  {
    citation: "Je puis tout par celui qui me fortifie.",
    reference: "Philippiens 4:13",
  },
  {
    citation: "L'Éternel est mon berger : je ne manquerai de rien.",
    reference: "Psaume 23:1",
  },
  {
    citation: "Avant de te former dans le ventre, je t'ai connu.",
    reference: "Jérémie 1:5",
  },
  {
    citation: "La prière de la foi sauvera le malade, et l'Éternel le relèvera.",
    reference: "Jacques 5:15",
  },
  {
    citation: "Ne crains rien, car je suis avec toi ; ne promène pas tes regards, car je suis ton Dieu.",
    reference: "Ésaïe 41:10",
  },
  {
    citation: "Heureux l'homme qui trouve la sagesse ! Car elle vaut plus que l'argent.",
    reference: "Proverbes 3:13-14",
  },
  {
    citation: "L'amour est patient, il est bienveillant. L'amour ne jalouse pas.",
    reference: "1 Corinthiens 13:4",
  },
  {
    citation: "La paix que je vous donne, le monde ne la donne pas.",
    reference: "Jean 14:27",
  },
  {
    citation: "Celui qui sème avec abondance moissonnera avec abondance.",
    reference: "2 Corinthiens 9:6",
  },
  {
    citation: "Toutes choses concourent au bien de ceux qui aiment Dieu.",
    reference: "Romains 8:28",
  },
  {
    citation: "Si Dieu est pour nous, qui sera contre nous ?",
    reference: "Romains 8:31",
  },
  {
    citation: "Le Seigneur combattra pour vous, et vous, vous garderez le silence.",
    reference: "Exode 14:14",
  },
  {
    citation: "Ne t'inquiète de rien, mais en toute chose laisse tes désirs devant Dieu.",
    reference: "Philippiens 4:6",
  },
  {
    citation: "La lumière brille dans les ténèbres, et les ténèbres ne l'ont pas comprise.",
    reference: "Jean 1:5",
  },
  {
    citation: "Je suis le chemin, la vérité et la vie. Nul ne vient au Père que par moi.",
    reference: "Jean 14:6",
  },
  {
    citation: "Un ami est un trésor, et il n'y a pas de prix pour sa valeur.",
    reference: "Proverbes 17:17",
  },
  {
    citation: "Le bonheur ne se trouve pas dans les choses que l'on possède, mais dans l'amour que l'on donne.",
    reference: "Sagesse contemporaine",
  },
  {
    citation: "La patience est la mère de toutes les vertus.",
    reference: "Proverbe africain",
  },
  {
    citation: "Celui qui a le Christ a la vie éternelle.",
    reference: "1 Jean 5:12",
  },
  {
    citation: "Le travail bien fait est le plus bel hommage rendu à Dieu.",
    reference: "Sagesse populaire",
  },
  {
    citation: "Béni soit l'homme qui craint l'Éternel, car ses jours seront prolongés.",
    reference: "Psaume 128:1-2",
  },
  {
    citation: "Dieu met la joie au cœur de celui qui sème avec amour.",
    reference: "Psaume 126:5",
  },
  {
    citation: "L'espérance différée afflige le cœur, mais un désir accompli est un arbre de vie.",
    reference: "Proverbes 13:12",
  },
  {
    citation: "La bénédiction de l'Éternel enrichit, et il ne la suit aucun chagrin.",
    reference: "Proverbes 10:22",
  },
  {
    citation: "Marche devant moi et sois intègre.",
    reference: "Genèse 17:1",
  },
  {
    citation: "La joie du Seigneur est ma force.",
    reference: "Néhémie 8:10",
  },
  {
    citation: "Dieu est fidèle, et il ne permet pas que vous soyez tentés au-delà de vos forces.",
    reference: "1 Corinthiens 10:13",
  },
  {
    citation: "La maison se construit par la sagesse, et elle s'affermie par l'intelligence.",
    reference: "Proverbes 24:3",
  },
  {
    citation: "Aimez-vous les uns les autres comme je vous ai aimés.",
    reference: "Jean 13:34",
  },
  {
    citation: "Le bon ouvrier reçoit sa nourriture.",
    reference: "1 Timothée 5:18",
  },
  {
    citation: "Que tout ce que vous faites soit fait avec amour.",
    reference: "1 Corinthiens 16:14",
  },
];

export function getDailyInspiration(): DailyInspiration {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const index = dayOfYear % inspirations.length;
  return inspirations[index];
}

export function formatInspirationDate(): string {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
