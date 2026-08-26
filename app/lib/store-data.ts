export type Product = {
  category: string;
  description: string;
  filiale: string;
  id: string;
  image: string;
  name: string;
  note: string;
  price: number;
  stock: string;
  unit: string;
};

export const productCategories = [
  "Tous",
  "Gros œuvre",
  "Entretien",
  "Électricité",
  "Mobilier",
  "Plomberie",
  "Peinture",
  "Quincaillerie",
];

export const productFiliales = ["Toutes", "Matériaux", "Mobilier", "Rénovation"];

export const products: Product[] = [
  { id: "P-001", name: "Ciment 50 kg", description: "Ciment CPA 42,5 pour maçonnerie courante. Conforme aux normes NF P 15-302. Idéal pour fondations, hourdis et égalisation.", category: "Gros œuvre", filiale: "Matériaux", price: 6250, unit: "sac", stock: "En stock", note: "4,7", image: "https://images.unsplash.com/photo-1541888946425-d81bbad27a4f?w=800&q=80" },
  { id: "P-002", name: "Carrelage grès 60×60", description: "Grès cérame beige mat, résistant aux chocs et aux taches. R10 antidérapant. Pose collée ou joint epoxy. Débit : 2,78 m²/carton.", category: "Gros œuvre", filiale: "Matériaux", price: 12000, unit: "carton", stock: "En stock", note: "4,8", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80" },
  { id: "P-003", name: "Peinture blanc mat 25 L", description: "Peinture acrylique mates imperméabilisante. Couvrance exceptionnelle, séchage rapide en 2h. Rendement : 10-12 m²/L.", category: "Peinture", filiale: "Matériaux", price: 28500, unit: "pot", stock: "Stock faible", note: "4,5", image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80" },
  { id: "P-004", name: "Câble électrique 2,5 mm", description: "Câble rigide monoconducteur gainé H07V-R. Section 2,5 mm², tension 450/750V. Pour câblage fixe encastré ou visible.", category: "Électricité", filiale: "Matériaux", price: 9200, unit: "rouleau", stock: "En stock", note: "4,6", image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80" },
  { id: "P-005", name: "Interrupteur double encastré", description: "Interrupteur va-et-vient double 10A/250V, mécanisme Platine standard. Finition blanc mat. Compatible boîtier encastré Ø60.", category: "Électricité", filiale: "Matériaux", price: 3800, unit: "pièce", stock: "En stock", note: "4,4", image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80" },
  { id: "P-006", name: "Tuyau PVC 110 mm ×3 m", description: "Tube PVC rigide pour évacuation eaux usées. Ø110 mm, longueur 3 m. Norme NF EN 1401. Résistant aux produits chimiques.", category: "Plomberie", filiale: "Matériaux", price: 7400, unit: "barre", stock: "En stock", note: "4,6", image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80" },
  { id: "P-007", name: "Robinet mélangeur cuisine", description: "Mitigeur cuisine à bec fixe, chromé. Aerator eco 5 L/min. Cartouche céramique 35 mm. Garantie 5 ans.", category: "Plomberie", filiale: "Matériaux", price: 18600, unit: "pièce", stock: "Stock faible", note: "4,7", image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80" },
  { id: "P-008", name: "Coffre à outils 108 pièces", description: "Coffre de mécanique professionnelle 108 outils. Chrome vanadium, finition anti-corrosion. Valise métallique avec serrure.", category: "Quincaillerie", filiale: "Matériaux", price: 65400, unit: "coffre", stock: "En stock", note: "4,9", image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80" },
  { id: "P-009", name: "Fauteuil bois massif", description: "Fauteuil confort en bois massif d'acacia. Structure robuste, assise rembourrée tissu lin. Dimensions : 70×65×85 cm.", category: "Mobilier", filiale: "Mobilier", price: 105000, unit: "pièce", stock: "Sur commande", note: "4,9", image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80" },
  { id: "P-010", name: "Table de salon chêne", description: "Table de salon en chêne massif, finition huilée. Pieds fuseaux, plateau rectangulaire 160×90 cm. Hauteur 75 cm.", category: "Mobilier", filiale: "Mobilier", price: 184000, unit: "pièce", stock: "Sur commande", note: "4,8", image: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&q=80" },
  { id: "P-011", name: "Étagère atelier 5 niveaux", description: "Étagère modulaire 5 niveaux, structure métallique. Charge max 200 kg/niveau. Dimensions : 100×40×200 cm.", category: "Mobilier", filiale: "Mobilier", price: 42700, unit: "pièce", stock: "En stock", note: "4,6", image: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80" },
  { id: "P-012", name: "Kit peinture intérieure complet", description: "Kit complet : 10L peinture mate blanc + 2 rouleaux 25cm + bac + spy + ruban. Rendement 10m²/L, séchage 2h.", category: "Peinture", filiale: "Rénovation", price: 38900, unit: "kit", stock: "En stock", note: "4,7", image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80" },
];

export type CartItem = {
  product: Product;
  quantity: number;
};

export const formatFcfa = (amount: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount) + " FCFA";
