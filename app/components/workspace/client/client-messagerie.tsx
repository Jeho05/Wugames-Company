"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ClientSection } from "@/app/components/workspace/client/client-section";
import {
  listConversations,
  listMessages,
  sendMessage,
  markConversationAsRead,
  createConversation,
} from "@/app/lib/api/messagerie";
import type { Conversation, Message } from "@/app/lib/contracts";

type ClientMessagerieProps = {
  sectionId?: string;
};

const demoConversations: Conversation[] = [
  {
    id: "conv-1",
    sujet: "Suivi rénovation résidence Traoré",
    projet: "Résidence Traoré",
    participants: [
      { id: "u-sarah", first_name: "Sarah", last_name: "Gnahoua", role: "ROLE_MGR_OPS" },
    ],
    derniere_activite: "Il y a 2 h",
    dernier_message: "La visite de suivi est prévue mardi à 09h30. Je vous envoie le rapport après passage.",
    non_lus: 1,
    created_at: "2026-07-10T10:00:00Z",
    updated_at: "2026-07-26T14:00:00Z",
  },
  {
    id: "conv-2",
    sujet: "Choix du revêtement salle de bain",
    projet: "Résidence Traoré",
    participants: [
      { id: "u-sarah", first_name: "Sarah", last_name: "Gnahoua", role: "ROLE_MGR_OPS" },
    ],
    derniere_activite: "Hier",
    dernier_message: "J'ai bien reçu les échantillons. On se coordonne pour la pose la semaine prochaine.",
    non_lus: 0,
    created_at: "2026-07-18T09:00:00Z",
    updated_at: "2026-07-25T16:30:00Z",
  },
  {
    id: "conv-3",
    sujet: "Dépannage plomberie Marcory",
    projet: "Intervention Marcory",
    participants: [
      { id: "u-marc", first_name: "Marc", last_name: "Koné", role: "ROLE_SECRETAIRE" },
    ],
    derniere_activite: "04 juin",
    dernier_message: "L'intervention est terminée. Merci pour votre confiance !",
    non_lus: 0,
    created_at: "2026-06-02T11:00:00Z",
    updated_at: "2026-06-04T17:00:00Z",
  },
];

const demoMessages: Record<string, Message[]> = {
  "conv-1": [
    { id: "m1", conversation_id: "conv-1", auteur_id: "u-sarah", contenu: "Bonjour ! Je vous confirme la visite de suivi prévue mardi 29 à 09h30 sur le chantier Résidence Traoré.", lu: true, created_at: "2026-07-25T09:00:00Z" },
    { id: "m2", conversation_id: "conv-1", auteur_id: "me", contenu: "Parfait, merci Sarah. Y a-t-il quelque chose que je dois préparer pour la visite ?", lu: true, created_at: "2026-07-25T09:15:00Z" },
    { id: "m3", conversation_id: "conv-1", auteur_id: "u-sarah", contenu: "Pas de préparation particulière. Je vérifierai l'avancement de la plomberie et de l'électricité. Je vous envoie le rapport après passage.", lu: false, created_at: "2026-07-26T14:00:00Z" },
  ],
  "conv-2": [
    { id: "m4", conversation_id: "conv-2", auteur_id: "me", contenu: "Bonjour Sarah, j'ai reçu les échantillons de carrelage. Le grès 60x60 ivory me plaît bien.", lu: true, created_at: "2026-07-24T10:00:00Z" },
    { id: "m5", conversation_id: "conv-2", auteur_id: "u-sarah", contenu: "Excellent choix ! Je valide avec le chantier et on planifie la pose la semaine prochaine.", lu: true, created_at: "2026-07-25T16:30:00Z" },
  ],
  "conv-3": [
    { id: "m6", conversation_id: "conv-3", auteur_id: "u-marc", contenu: "L'intervention plomberie est terminée. Tout fonctionne correctement.", lu: true, created_at: "2026-06-04T17:00:00Z" },
  ],
};

function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  } catch {
    return "";
  }
}

function getInitials(first?: string, last?: string): string {
  return ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase() || "?";
}

export function ClientMessagerie({ sectionId = "portail-messages" }: ClientMessagerieProps) {
  const [conversations, setConversations] = useState<Conversation[]>(demoConversations);
  const [activeId, setActiveId] = useState<string>("conv-1");
  const [messages, setMessages] = useState<Record<string, Message[]>>(demoMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [newConvOpen, setNewConvOpen] = useState(false);
  const [newSujet, setNewSujet] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    listConversations()
      .then((result) => {
        if (cancelled || result.length === 0) return;
        setConversations(result);
        setActiveId(result[0].id);
      })
      .catch(() => {
        /* API injoignable : on garde les données démo */
      });
    return () => { cancelled = true; };
  }, []);

  const active = useMemo(() => conversations.find((c) => c.id === activeId) ?? null, [conversations, activeId]);
  const activeMessages = useMemo(() => messages[activeId] ?? [], [messages, activeId]);
  const totalUnread = useMemo(() => conversations.reduce((sum, c) => sum + c.non_lus, 0), [conversations]);

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    listMessages(activeId)
      .then((result) => {
        if (cancelled || result.length === 0) return;
        setMessages((prev) => ({ ...prev, [activeId]: result }));
        markConversationAsRead(activeId).catch(() => undefined);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [activeMessages.length, activeId]);

  const openConversation = useCallback((id: string) => {
    setActiveId(id);
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, non_lus: 0 } : c)));
  }, []);

  const handleSend = useCallback(async () => {
    if (!active || !draft.trim() || sending) return;
    const texte = draft.trim();
    setDraft("");
    setSending(true);

    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      conversation_id: active.id,
      auteur_id: "me",
      contenu: texte,
      lu: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => ({ ...prev, [active.id]: [...(prev[active.id] ?? []), optimistic] }));

    try {
      const sent = await sendMessage(active.id, { contenu: texte });
      setMessages((prev) => ({
        ...prev,
        [active.id]: [...(prev[active.id] ?? []).filter((m) => m.id !== optimistic.id), sent],
      }));
    } catch {
      /* API injoignable : le message optimiste reste affiché */
    } finally {
      setSending(false);
    }
  }, [active, draft, sending]);

  const handleNewConversation = useCallback(async () => {
    if (!newSujet.trim() || !newMessage.trim()) return;
    try {
      const conv = await createConversation({ sujet: newSujet.trim(), premier_message: newMessage.trim() });
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
      setMessages((prev) => ({
        ...prev,
        [conv.id]: [{
          id: `m-${Date.now()}`,
          conversation_id: conv.id,
          auteur_id: "me",
          contenu: newMessage.trim(),
          lu: false,
          created_at: new Date().toISOString(),
        }],
      }));
    } catch {
      const conv: Conversation = {
        id: `new-${Date.now()}`,
        sujet: newSujet.trim(),
        projet: null,
        participants: [{ id: "u-auto", first_name: "Équipe", last_name: "WUGAMS", role: "ROLE_MGR_OPS" }],
        derniere_activite: "à l'instant",
        dernier_message: newMessage.trim(),
        non_lus: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
      setMessages((prev) => ({
        ...prev,
        [conv.id]: [{
          id: `m-${Date.now()}`,
          conversation_id: conv.id,
          auteur_id: "me",
          contenu: newMessage.trim(),
          lu: false,
          created_at: new Date().toISOString(),
        }],
      }));
    } finally {
      setNewConvOpen(false);
      setNewSujet("");
      setNewMessage("");
    }
  }, [newSujet, newMessage]);

  const wugamsMember = active?.participants[0];

  return (
    <ClientSection
      icon="message"
      id={sectionId}
      subtitle="Échangez directement avec votre équipe WUGAMS"
      title="Messagerie"
    >
      <div className="mt-2 grid gap-4 xl:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)]">
        {/* Liste des conversations */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
              <Icon name="message" size={14} />
              Conversations
              {totalUnread > 0 ? (
                <span className="grid min-w-5 place-items-center rounded-full bg-[#17294b] px-1.5 py-0.5 text-[9px] font-bold text-white">
                  {totalUnread}
                </span>
              ) : null}
            </span>
            <button
              className="inline-flex items-center gap-1 rounded-xl bg-[#17294b] px-3 py-1.5 text-[10px] font-bold text-white transition hover:bg-[#243a61]"
              onClick={() => setNewConvOpen(true)}
              type="button"
            >
              <Icon name="plus" size={12} />
              Nouveau
            </button>
          </div>

          <ul className="space-y-1.5">
            {conversations.map((conv) => {
              const participant = conv.participants[0];
              const isActive = conv.id === activeId;
              const hasUnread = conv.non_lus > 0;
              return (
                <li key={conv.id}>
                  <button
                    aria-current={isActive ? "true" : undefined}
                    className={
                      "flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition " +
                      (isActive
                        ? "border-[#17294b]/20 bg-[#17294b]/[0.04]"
                        : "border-transparent hover:border-slate-200 hover:bg-slate-50")
                    }
                    onClick={() => openConversation(conv.id)}
                    type="button"
                  >
                    <span className="relative shrink-0">
                      <span className="grid size-10 place-items-center rounded-full bg-[#17294b] text-[11px] font-bold text-[#f2c56d]">
                        {participant ? getInitials(participant.first_name, participant.last_name) : "?"}
                      </span>
                      <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-emerald-400" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className={"truncate text-[12px] " + (hasUnread ? "font-extrabold text-[#16233a]" : "font-bold text-slate-700")}>
                          {participant ? `${participant.first_name} ${participant.last_name}` : conv.sujet}
                        </span>
                        {hasUnread ? (
                          <span className="grid min-w-5 place-items-center rounded-full bg-[#17294b] px-1.5 text-[9px] font-bold text-white">
                            {conv.non_lus}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-[10px] font-semibold text-[#b47e1e]">{conv.sujet}</span>
                      <span className="mt-0.5 flex items-center justify-between gap-2">
                        <span className="truncate text-[10px] text-slate-400">{conv.dernier_message}</span>
                        <span className="shrink-0 text-[9px] text-slate-400">{conv.derniere_activite}</span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
            {conversations.length === 0 ? (
              <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-slate-200 py-10 text-center">
                <Icon name="message" size={20} className="text-slate-300" />
                <p className="text-xs font-bold text-slate-500">Aucune conversation</p>
              </div>
            ) : null}
          </ul>
        </div>

        {/* Zone de chat */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
          {active ? (
            <>
              {/* En-tête du interlocuteur WUGAMS */}
              <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3.5">
                <span className="relative shrink-0">
                  <span className="grid size-10 place-items-center rounded-full bg-[#17294b] text-[11px] font-bold text-[#f2c56d]">
                    {wugamsMember ? getInitials(wugamsMember.first_name, wugamsMember.last_name) : "?"}
                  </span>
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-emerald-400" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-[#16233a]">
                    {wugamsMember ? `${wugamsMember.first_name} ${wugamsMember.last_name}` : "Équipe WUGAMS"}
                  </p>
                  <p className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    En ligne · {active.sujet}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#17294b]/15 bg-[#17294b]/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#17294b]">
                  <Icon name="shield" size={10} />
                  WUGAMS
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4" ref={scrollRef} style={{ minHeight: 320, maxHeight: 420 }}>
                {activeMessages.length === 0 ? (
                  <div className="grid h-full place-items-center text-center">
                    <div>
                      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                        <Icon name="message" size={20} />
                      </span>
                      <p className="mt-3 text-xs font-bold text-slate-500">Commencez la conversation</p>
                      <p className="mt-1 text-[10px] text-slate-400">Votre interlocuteur WUGAMS vous répondra rapidement.</p>
                    </div>
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isMe = msg.auteur_id === "me";
                    return (
                      <motion.div
                        className={"flex " + (isMe ? "justify-end" : "justify-start")}
                        initial={reduce ? undefined : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id}
                        transition={{ duration: 0.25 }}
                      >
                        {!isMe ? (
                          <span className="mr-2 mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-[#17294b] text-[8px] font-bold text-[#f2c56d]">
                            {wugamsMember ? getInitials(wugamsMember.first_name, wugamsMember.last_name) : "?"}
                          </span>
                        ) : null}
                        <div
                          className={
                            "max-w-[78%] rounded-2xl px-4 py-2.5 text-[12px] leading-5 " +
                            (isMe
                              ? "rounded-br-md bg-[#17294b] text-white"
                              : "rounded-bl-md border border-slate-100 bg-slate-50 text-[#16233a]")
                          }
                        >
                          <p>{msg.contenu}</p>
                          <p className={"mt-1 text-right text-[9px] font-semibold " + (isMe ? "text-white/50" : "text-slate-400")}>
                            {formatTime(msg.created_at)}
                            {isMe && msg.lu ? " · lu" : ""}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Zone de saisie */}
              <div className="border-t border-slate-100 px-5 py-3">
                <div className="flex items-end gap-2">
                  <textarea
                    aria-label="Votre message"
                    className="max-h-24 min-h-10 flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-medium text-[#16233a] outline-none transition placeholder:text-slate-400 focus:border-[#17294b] focus:ring-2 focus:ring-[#17294b]/10"
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={`Écrire à ${wugamsMember?.first_name ?? "WUGAMS"}…`}
                    rows={1}
                    value={draft}
                  />
                  <button
                    aria-label="Envoyer"
                    className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#17294b] text-white shadow-lg shadow-[#17294b]/20 transition hover:bg-[#243a61] disabled:opacity-40"
                    disabled={!draft.trim() || sending}
                    onClick={handleSend}
                    type="button"
                  >
                    <Icon name="arrow-up-right" size={15} className="-rotate-45" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="grid h-80 place-items-center text-center">
              <div>
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-300">
                  <Icon name="message" size={24} />
                </span>
                <p className="mt-4 text-sm font-bold text-slate-600">Sélectionnez une conversation</p>
                <p className="mt-1 text-xs text-slate-400">Ou commencez-en une nouvelle avec votre équipe WUGAMS.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal nouvelle conversation */}
      <AnimatePresence>
        {newConvOpen ? (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              aria-hidden="true"
              className="pointer-events-auto absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNewConvOpen(false)}
            />
            <motion.div
              aria-label="Nouvelle conversation"
              aria-modal="true"
              className="pointer-events-auto w-full max-w-md rounded-3xl border border-white/20 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0f1a2e]"
              initial={reduce ? undefined : { opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
              role="dialog"
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b47e1e]">Messagerie</p>
                  <h3 className="mt-1.5 text-lg font-bold tracking-[-0.03em] text-[#16233a]">Nouvelle conversation</h3>
                  <p className="mt-1 text-xs text-slate-400">Un membre de l&apos;équipe WUGAMS vous répondra.</p>
                </div>
                <button
                  aria-label="Fermer"
                  className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                  onClick={() => setNewConvOpen(false)}
                  type="button"
                >
                  <Icon name="close" size={16} />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500" htmlFor="conv-sujet">
                    Sujet
                  </label>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-semibold text-[#16233a] outline-none transition placeholder:text-slate-300 focus:border-[#17294b] focus:ring-2 focus:ring-[#17294b]/20"
                    id="conv-sujet"
                    onChange={(e) => setNewSujet(e.target.value)}
                    placeholder="Ex. : Question sur mon chantier"
                    value={newSujet}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500" htmlFor="conv-message">
                    Premier message
                  </label>
                  <textarea
                    className="min-h-24 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-semibold text-[#16233a] outline-none transition placeholder:text-slate-300 focus:border-[#17294b] focus:ring-2 focus:ring-[#17294b]/20"
                    id="conv-message"
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Décrivez votre demande…"
                    value={newMessage}
                  />
                </div>
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#17294b] px-4 py-3.5 text-[13px] font-bold text-white shadow-lg shadow-[#17294b]/15 transition hover:bg-[#243a61] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!newSujet.trim() || !newMessage.trim()}
                  onClick={handleNewConversation}
                  type="button"
                >
                  <Icon name="arrow-up-right" size={15} />
                  Envoyer
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </ClientSection>
  );
}
