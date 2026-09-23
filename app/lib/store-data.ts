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

// 100 % dynamique : le catalogue boutique vient de l'API (/vitrine/produits puis
// /stocks/produits). Aucun produit en dur ici — la boutique affiche
// « Catalogue en préparation » si vide. Seul formatFcfa est conservé (utilitaire).

export type CartItem = {
  product: Product;
  quantity: number;
};

export const formatFcfa = (amount: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount) + " FCFA";
