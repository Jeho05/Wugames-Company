/**
 * Configuration métier WUGAMS — valeurs opérationnelles centralisées.
 *
 * PRODUCTION : aucun numéro, URL, tarif ou paramètre sensible ne doit rester
 * dispersé en dur dans les composants. Ce module est l'unique endroit où ces
 * valeurs sont définies (en attendant une exposition via le backend).
 */

export const BUSINESS_CONFIG = {
  /** Contact commercial / support (anciennement hardcodé dans client-cleans.tsx). */
  contactPhone: "+229 97 00 00 00",
  contactLabel: "WUGAMS",
} as const;
