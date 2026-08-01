export type Product = {
  category: string;
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
  "Électricité",
  "Plomberie",
  "Peinture",
  "Quincaillerie",
  "Mobilier",
];

export const productFiliales = ["Toutes", "Matériaux", "Mobilier", "Rénovation"];

export const products: Product[] = [
  { id: "P-001", name: "Ciment 50 kg", category: "Gros œuvre", filiale: "Matériaux", price: 6250, unit: "sac", stock: "En stock", note: "4,7", image: "https://images.unsplash.com/photo-1541888946425-d81bbad27a4f?w=800&q=80" },
  { id: "P-002", name: "Carrelage grès 60×60", category: "Gros œuvre", filiale: "Matériaux", price: 12000, unit: "carton", stock: "En stock", note: "4,8", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80" },
  { id: "P-003", name: "Peinture blanc mat 25 L", category: "Peinture", filiale: "Matériaux", price: 28500, unit: "pot", stock: "Stock faible", note: "4,5", image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80" },
  { id: "P-004", name: "Câble électrique 2,5 mm", category: "Électricité", filiale: "Matériaux", price: 9200, unit: "rouleau", stock: "En stock", note: "4,6", image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80" },
  { id: "P-005", name: "Interrupteur double encastré", category: "Électricité", filiale: "Matériaux", price: 3800, unit: "pièce", stock: "En stock", note: "4,4", image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80" },
  { id: "P-006", name: "Tuyau PVC 110 mm ×3 m", category: "Plomberie", filiale: "Matériaux", price: 7400, unit: "barre", stock: "En stock", note: "4,6", image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80" },
  { id: "P-007", name: "Robinet mélangeur cuisine", category: "Plomberie", filiale: "Matériaux", price: 18600, unit: "pièce", stock: "Stock faible", note: "4,7", image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80" },
  { id: "P-008", name: "Coffre à outils 108 pièces", category: "Quincaillerie", filiale: "Matériaux", price: 65400, unit: "coffre", stock: "En stock", note: "4,9", image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80" },
  { id: "P-009", name: "Fauteuil bois massif", category: "Mobilier", filiale: "Mobilier", price: 105000, unit: "pièce", stock: "Sur commande", note: "4,9", image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80" },
  { id: "P-010", name: "Table de salon chêne", category: "Mobilier", filiale: "Mobilier", price: 184000, unit: "pièce", stock: "Sur commande", note: "4,8", image: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&q=80" },
  { id: "P-011", name: "Étagère atelier 5 niveaux", category: "Mobilier", filiale: "Mobilier", price: 42700, unit: "pièce", stock: "En stock", note: "4,6", image: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80" },
  { id: "P-012", name: "Kit peinture intérieure complet", category: "Peinture", filiale: "Rénovation", price: 38900, unit: "kit", stock: "En stock", note: "4,7", image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80" },
];

export type CartItem = {
  product: Product;
  quantity: number;
};

export const formatFcfa = (amount: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount) + " FCFA";
