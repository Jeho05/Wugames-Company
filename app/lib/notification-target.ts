"use client";

import type { Notification } from "@/app/lib/contracts";
import type { RoleCode } from "@/app/lib/contracts";

const clientRoles = new Set(["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"]);

/**
 * Résout la destination d'une notification vers une route workspace.
 * Retourne null si aucune cible pertinente (notification système générique).
 *
 * Le backend peut envoyer plusieurs formes :
 * - notification.type (ex: "alerte_stock", "nouvelle_mission", "facture_en_retard", "message")
 * - notification.table_cible / entite_id (audit-like)
 * - notification.message qui contient des indices textuels
 *
 * On normalise tout en lower_case et on cherche des mots-clés.
 */
export function resolveNotificationTarget(
  notification: Notification,
  role?: RoleCode | null
): { href: string; label: string } | null {
  const rawType = String(notification.type ?? "").toLowerCase();
  const rawMessage = String(notification.message ?? "").toLowerCase();
  const combined = `${rawType} ${rawMessage}`;

  // Champs additionnels possibles du backend (non typés)
  const extra = notification as Record<string, unknown>;
  const table = String(extra.table_cible ?? extra.table ?? "").toLowerCase();
  const entite = String(extra.entite_id ?? extra.entity_id ?? extra.id_cible ?? "").toLowerCase();

  // Helper
  const has = (k: string) => combined.includes(k) || table.includes(k);

  // Contexte client
  const isClient = role ? clientRoles.has(role) : false;

  if (isClient) {
    if (has("facture")) return { href: "/espace/factures", label: "Voir la facture" };
    if (has("devis")) return { href: "/espace/devis", label: "Voir le devis" };
    if (has("commande")) return { href: "/espace/commandes", label: "Voir la commande" };
    if (has("mission")) return { href: "/espace/missions", label: "Voir la mission" };
    if (has("message") || has("messagerie") || has("conversation")) return { href: "/espace/messages", label: "Ouvrir la messagerie" };
    if (has("document") || has("photo") || has("rapport")) return { href: "/espace/documents", label: "Voir le document" };
    if (has("projet") || has("chantier")) return { href: "/espace/projets", label: "Voir le projet" };
    if (has("demande")) return { href: "/espace/demandes", label: "Voir la demande" };
    // Fallback client
    return { href: "/espace", label: "Ouvrir l'espace" };
  }

  // Back-office (gérant, managers, etc.)
  if (has("alerte_stock") || has("stock") || has("rupture") || has("reapprovision") || table === "produits") {
    return { href: "/espace/stocks", label: "Voir le stock" };
  }
  if (has("pointage") || has("pointage_a_verifier")) {
    return { href: "/espace/carte", label: "Voir la carte" };
  }
  if (has("mission") || has("rapport") || table === "missions") {
    return { href: "/espace/missions", label: "Voir les missions" };
  }
  if (has("chantier") || table === "chantiers") {
    return { href: "/espace/chantiers", label: "Voir les chantiers" };
  }
  if (has("facture") || has("facture_emise") || has("facture_en_retard") || table === "factures") {
    return { href: "/espace/devis", label: "Voir les factures" };
  }
  if (has("devis") || table === "devis") {
    return { href: "/espace/devis", label: "Voir les devis" };
  }
  if (has("commande") || has("commande_validee") || table === "commandes") {
    return { href: "/espace/commandes", label: "Voir les commandes" };
  }
  if (has("client") || table === "clients") {
    return { href: "/espace/clients", label: "Voir les clients" };
  }
  if (has("fournisseur") || table === "fournisseurs") {
    return { href: "/espace/fournisseurs", label: "Voir les fournisseurs" };
  }
  if (has("filiale") || table === "filiales") {
    return { href: "/espace/filiales", label: "Voir les filiales" };
  }
  if (has("ouvrier") || has("prime") || table === "ouvriers" || table === "evaluations" || table === "primes") {
    return { href: "/espace/ouvriers", label: "Voir les ouvriers" };
  }
  if (has("message") || has("messagerie") || has("conversation") || table === "conversations") {
    return { href: "/espace/messagerie", label: "Ouvrir la messagerie" };
  }
  if (has("manager") || table === "managers") {
    return { href: "/espace/managers", label: "Voir les managers" };
  }
  if (has("audit") || table === "audit_logs") {
    return { href: "/espace/administration", label: "Voir l'audit" };
  }
  if (has("notification") || rawType === "système" || rawType === "systeme") {
    return { href: "/espace/notifications", label: "Voir les notifications" };
  }

  // Fallback : page notifications si on ne sait pas
  // On retourne null seulement si vraiment générique sans type
  if (!rawType && !rawMessage) return null;
  return { href: "/espace/notifications", label: "Voir la notification" };
}

/**
 * Variante qui tente aussi d'extraire un id d'entité pour un deep-link futur.
 * Pour l'instant on route vers la liste, mais la structure est prête pour
 * /espace/missions?highlight=xxx ou /espace/stocks?produit=xxx
 */
export function resolveNotificationHref(notification: Notification, role?: RoleCode | null): string {
  const target = resolveNotificationTarget(notification, role);
  return target?.href ?? "/espace/notifications";
}
