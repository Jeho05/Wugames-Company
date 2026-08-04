"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { Icon } from "@/app/components/ui/app-icon";

type Message = {
  author: "bot" | "user";
  text: string;
};

const quickReplies = [
  { label: "Demander un devis", reply: "devis" },
  { label: "Commander des matériaux", reply: "boutique" },
  { label: "Suivre mon chantier", reply: "chantier" },
  { label: "Autre question", reply: "contact" },
];

function botAnswer(input: string): string {
  const text = input.toLocaleLowerCase("fr");
  if (/(devis|prix|tarif|coût|cout|estimation)/.test(text)) {
    return "Le devis WUGAMS est gratuit et détaillé : nous vous proposons différentes options et vous accompagnons dans la validation de la solution retenue. Prenez rendez-vous avec WUGAMS ou connectez-vous / créez un compte pour en demander un.";
  }
  if (/(boutique|matériau|matériaux|commande|livraison|ciment|peinture|outillage|mobilier)/.test(text)) {
    return "L'Espace Wu, la boutique WUGAMS, rassemble entretien, matériaux, mobilier et outillage. Livraison 7 j/7, service urgent Porto-Novo · Express et retrait à l'Espace Wu. Paiement par carte ou Mobile Money. Commandez dès maintenant sur la page Boutique.";
  }
  if (/(rendez-vous|rendez vous|rdv|consultation|rencontre|rencontrer)/.test(text)) {
    return "Prenez rendez-vous avec WUGAMS : en visio (Google Meet, Skype, Teams, WhatsApp, Zoom) ou en personne à Bénin, Porto-Novo / Dowa Saint-Paul C/31. Cette rencontre nous permet de comprendre vos besoins, de partager votre vision et de construire ensemble un projet adapté à vos attentes. Connectez-vous ou créez un compte, puis suivez « Prenez rendez-vous ici ».";
  }
  if (/(chantier|suivi|avancement|projet)/.test(text)) {
    return "Chaque chantier bénéficie d'une communication régulière à chaque étape de votre projet, avec photos et rapports. Connectez-vous à votre espace client, section « Mes projets » ou « Carte terrain ».";
  }
  if (/(contact|téléphone|telephone|email|e-mail|mail|appel|joindre|adresse)/.test(text)) {
    return "Pour nous joindre : wugams_holding_inc@hotmail.com · Horaires du lundi au vendredi (matinée 9 h à 11 h, soirée 15 h à 17 h) · urgences chantier 5 j/7 · Adresse : Bénin, Porto-Novo / Dowa Saint-Paul C/31, visite libre. Vous pouvez aussi utiliser le formulaire de contact : une connexion ou une création de compte est requise.";
  }
  if (/(rénovation|renovation|entretien|construction|mobilier)/.test(text)) {
    return "WUGAMS regroupe Construction, Rénovation, Entretien, Mobilier et Matériaux : une équipe engagée vous accompagne à chaque étape de votre projet, avec un suivi unique.";
  }
  return "Merci pour votre message ! Connectez-vous ou créez un compte pour envoyer votre demande via le formulaire de contact. En attendant, je peux vous renseigner sur les devis, la boutique ou le suivi de chantier.";
}

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { author: "bot", text: "Bonjour 👋 Je suis l'assistant WUGAMS. Devis, boutique, suivi de chantier : je peux vous aider tout de suite." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  if (
    pathname.startsWith("/espace") ||
    pathname.startsWith("/connexion") ||
    pathname.startsWith("/inscription")
  ) {
    return null;
  }

  function send(text: string) {
    const clean = text.trim();
    if (!clean) return;
    setMessages((prev) => [...prev, { author: "user", text: clean }]);
    setInput("");
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { author: "bot", text: botAnswer(clean) }]);
    }, 900);
  }

  return (
    <>
      <button
        aria-expanded={open}
        aria-label="Ouvrir le chat WUGAMS"
        className={
          "fixed bottom-5 right-5 z-[65] grid size-14 place-items-center rounded-2xl bg-[#e3a641] text-[#14223b] shadow-xl shadow-amber-600/25 transition hover:bg-[#efb653] " +
          (open ? "rotate-90 scale-90" : "")
        }
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        {open ? <Icon name="close" size={22} /> : <Icon name="message" size={22} />}
      </button>

      {open ? (
        <div className="fixed bottom-[84px] right-5 z-[65] flex w-[min(380px,calc(100vw-40px))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center gap-3 bg-[#101a2d] px-4 py-3.5">
            <span className="grid size-9 place-items-center rounded-xl bg-[#e3a641]/15 text-[#f5c66f]">
              <Icon name="sparkles" size={17} />
            </span>
            <div>
              <p className="text-sm font-bold text-white">Assistant WUGAMS</p>
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                En ligne · réponse immédiate
              </p>
            </div>
          </div>

          <div className="h-[300px] space-y-3 overflow-y-auto bg-[#f5f7fb] p-4" ref={listRef}>
            {messages.map((message, index) => (
              <div className={"flex " + (message.author === "user" ? "justify-end" : "justify-start")} key={index}>
                <p
                  className={
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-5 " +
                    (message.author === "user"
                      ? "rounded-br-sm bg-[#17294b] text-white"
                      : "rounded-bl-sm border border-slate-200 bg-white text-slate-600 shadow-sm")
                  }
                >
                  {message.text}
                </p>
              </div>
            ))}
            {typing ? (
              <div className="flex justify-start">
                <p className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-400 shadow-sm">
                  L&apos;assistant écrit…
                </p>
              </div>
            ) : null}
          </div>

          {messages.length <= 1 ? (
            <div className="grid grid-cols-2 gap-2 bg-white p-3">
              {quickReplies.map((reply) => (
                <button
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-bold text-[#233856] transition hover:border-[#e3a641] hover:bg-amber-50"
                  key={reply.label}
                  onClick={() => send(reply.reply)}
                  type="button"
                >
                  {reply.label}
                </button>
              ))}
            </div>
          ) : null}

          <form
            className="flex items-center gap-2 border-t border-slate-100 bg-white p-3"
            onSubmit={(event) => {
              event.preventDefault();
              send(input);
            }}
          >
            <input
              aria-label="Votre message"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
              onChange={(event) => setInput(event.target.value)}
              placeholder="Écrivez votre question…"
              type="text"
              value={input}
            />
            <button
              aria-label="Envoyer"
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e3a641] text-[#14223b] transition hover:bg-[#efb653]"
              type="submit"
            >
              <Icon name="arrow-right" size={17} />
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 bg-white px-3 pb-3">
            <Link className="text-[10px] font-bold text-[#426b95] hover:text-[#17294b]" href="/boutique">
              Boutique
            </Link>
            <span className="text-slate-300">·</span>
            <Link className="text-[10px] font-bold text-[#426b95] hover:text-[#17294b]" href="/realisations">
              Réalisations
            </Link>
            <span className="text-slate-300">·</span>
            <Link className="text-[10px] font-bold text-[#426b95] hover:text-[#17294b]" href="/blog">
              Blog
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
