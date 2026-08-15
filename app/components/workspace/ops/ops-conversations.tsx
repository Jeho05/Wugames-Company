"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AnimatePresence, motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { sendMessage } from "@/app/lib/api/messagerie";
import { OpsPanel } from "@/app/components/workspace/ops/ops-panel";
import {
  conversationRoleMeta,
  demoSecConversations,
  type ConversationThread,
} from "@/app/lib/ops-data";

type OpsConversationsProps = {
  onToast: (message: string, tone?: "success" | "error" | "info") => void;
};

const quickReplies = [
  "Merci, je prends en compte. Retour d'ici la fin de journée.",
  "Pouvez-vous m'envoyer les détails par écrit ?",
  "C'est validé de mon côté. Bonne continuation.",
];

export function OpsConversations({ onToast }: OpsConversationsProps) {
  const [threads, setThreads] = useState<ConversationThread[]>(demoSecConversations);
  const [activeId, setActiveId] = useState<string>(demoSecConversations[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [filter, setFilter] = useState<"toutes" | "partenaire" | "communaut">("toutes");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const active = useMemo(() => threads.find((t) => t.id === activeId) ?? null, [activeId, threads]);
  const totalUnread = useMemo(() => threads.reduce((sum, t) => sum + t.unread, 0), [threads]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [activeId, active?.messages.length]);

  const visibleThreads = useMemo(
    () => (filter === "toutes" ? threads : threads.filter((t) => t.kind === filter)),
    [filter, threads],
  );

  function ouvrirThread(id: string) {
    setActiveId(id);
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unread: 0 } : t)));
  }

  function envoyer() {
    if (!active || !draft.trim()) return;
    const maintenant = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date());
    const message = { id: `m-${Date.now()}`, auteur: "moi" as const, texte: draft.trim(), heure: maintenant, lu: true };
    void sendMessage(active.id, { contenu: draft.trim() }).catch(() => {
      /* API injoignable : message local (mode démo). */
    });
    setThreads((prev) =>
      prev.map((t) => (t.id === active.id ? { ...t, messages: [...t.messages, message], derniereActivite: "à l'instant" } : t)),
    );
    setDraft("");
    setShowReplies(false);
    onToast(`Message envoyé à ${active.nom}`, "success");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
      {/* Liste des fils */}
      <OpsPanel
        action={
          <span className="rounded-full border border-white/[0.08] bg-white/[0.05] px-2.5 py-1 text-[9px] font-extrabold text-[#f2c56d]">
            {totalUnread} non lu(s)
          </span>
        }
        icon="message"
        subtitle="Partenaires, filiales et communautés"
        title="Conversations"
      >
        <div className="mb-3 flex gap-1.5">
          {(["toutes", "partenaire", "communaut"] as const).map((option) => (
            <button
              className={
                "rounded-full border px-3 py-1.5 text-[10px] font-extrabold transition " +
                (filter === option
                  ? "border-[#e3a641]/40 bg-[#e3a641]/15 text-[#f2c56d]"
                  : "border-white/[0.08] text-slate-400 hover:text-white")
              }
              key={option}
              onClick={() => setFilter(option)}
              type="button"
            >
              {option === "toutes" ? "Toutes" : option === "partenaire" ? "Partenaires" : "Communautés"}
            </button>
          ))}
        </div>

        <ul className="space-y-2">
          {visibleThreads.map((thread) => {
            const roleMeta = conversationRoleMeta[thread.role];
            const isActive = thread.id === activeId;
            return (
              <li key={thread.id}>
                <button
                  aria-current={isActive ? "true" : undefined}
                  className={
                    "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition " +
                    (isActive ? "border-[#e3a641]/30 bg-[#e3a641]/[0.07]" : "border-transparent hover:border-white/[0.08] hover:bg-white/[0.04]")
                  }
                  onClick={() => ouvrirThread(thread.id)}
                  type="button"
                >
                  <span className="relative shrink-0">
                    <span className="grid size-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-[11px] font-extrabold text-slate-200">
                      {thread.avatar}
                    </span>
                    <span className={"absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-[#0b1020] " + roleMeta.dot} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[12px] font-extrabold text-white">{thread.nom}</span>
                      {thread.unread > 0 ? (
                        <span className="grid min-w-5 place-items-center rounded-full bg-[#e3a641] px-1.5 text-[9px] font-extrabold text-[#17294b]">
                          {thread.unread}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="truncate text-[10px] text-slate-400">{thread.detail}</span>
                      <span className="shrink-0 text-[9px] text-slate-500">{thread.derniereActivite}</span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          {visibleThreads.length === 0 ? (
            <p className="py-8 text-center text-[11px] font-semibold text-slate-500">Aucune conversation dans ce filtre.</p>
          ) : null}
        </ul>
      </OpsPanel>

      {/* Fil de discussion */}
      <OpsPanel
        action={
          active ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.05] px-2.5 py-1 text-[9px] font-bold text-slate-300">
              <span className={"size-1.5 rounded-full " + conversationRoleMeta[active.role].dot} />
              {conversationRoleMeta[active.role].label}
            </span>
          ) : null
        }
        icon="message"
        subtitle={active ? active.detail : "Sélectionnez une conversation"}
        title={active ? active.nom : "Conversation"}
      >
        {active ? (
          <div className="flex h-[420px] flex-col">
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1" ref={scrollRef}>
              {active.messages.map((message) => (
                <div
                  className={"flex " + (message.auteur === "moi" ? "justify-end" : "justify-start")}
                  key={message.id}
                >
                  <div
                    className={
                      "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[11px] leading-5 " +
                      (message.auteur === "moi"
                        ? "rounded-br-md bg-[#0f7a5f] text-white"
                        : "rounded-bl-md border border-white/[0.06] bg-white/[0.05] text-slate-200")
                    }
                  >
                    <p>{message.texte}</p>
                    <p className={"mt-1 text-right text-[8px] font-semibold " + (message.auteur === "moi" ? "text-emerald-100/70" : "text-slate-500")}>
                      {message.heure}
                      {message.auteur === "moi" && message.lu ? " · lu" : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 space-y-2">
              <AnimatePresence>
                {showReplies ? (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-1.5"
                    exit={{ opacity: 0, y: 6 }}
                    initial={{ opacity: 0, y: 6 }}
                  >
                    {quickReplies.map((reply) => (
                      <button
                        className="rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold text-slate-300 transition hover:border-[#e3a641]/40 hover:text-[#f2c56d]"
                        key={reply}
                        onClick={() => setDraft(reply)}
                        type="button"
                      >
                        {reply}
                      </button>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <div className="flex items-end gap-2">
                <button
                  aria-label="Réponses rapides"
                  className={
                    "grid size-10 shrink-0 place-items-center rounded-2xl border transition " +
                    (showReplies
                      ? "border-[#e3a641]/40 bg-[#e3a641]/15 text-[#f2c56d]"
                      : "border-white/[0.08] bg-white/[0.04] text-slate-300 hover:text-white")
                  }
                  onClick={() => setShowReplies((open) => !open)}
                  type="button"
                >
                  <Icon name="sparkles" size={15} />
                </button>
                <textarea
                  aria-label="Votre message"
                  className="max-h-28 min-h-10 flex-1 resize-none rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-[12px] font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-[#e3a641]/40"
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      envoyer();
                    }
                  }}
                  placeholder="Écrire un message…"
                  rows={1}
                  value={draft}
                />
                <button
                  aria-label="Envoyer"
                  className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#0f7a5f] text-white shadow-lg shadow-emerald-950/40 transition hover:bg-[#0e8a6c] disabled:opacity-40"
                  disabled={!draft.trim()}
                  onClick={envoyer}
                  type="button"
                >
                  <Icon name="arrow-up-right" size={15} className="-rotate-45" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid h-72 place-items-center text-center">
            <div>
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white/[0.05] text-slate-400">
                <Icon name="message" size={22} />
              </span>
              <p className="mt-3 text-[12px] font-bold text-slate-300">Aucune conversation sélectionnée</p>
            </div>
          </div>
        )}
      </OpsPanel>
    </div>
  );
}
