"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { useAuth } from "@/app/lib/auth-context";
import { canManageVitrine, getDelegatedIds, setDelegatedIds } from "@/app/lib/vitrine-store";
import * as vitrineApi from "@/app/lib/api/vitrine";
import type {
  VitrineTemoignage,
  VitrineService,
  VitrineGarantie,
  VitrineRealisation,
  VitrineBlogPost,
} from "@/app/lib/api/vitrine";
import { listUsers } from "@/app/lib/api/users";
import type { User } from "@/app/lib/contracts";
import type { IconName } from "@/app/components/ui/app-icon";

const tabs = ["Témoignages", "Services", "Garanties", "Réalisations", "Blog", "Permissions"] as const;
type Tab = (typeof tabs)[number];

const iconOptions: IconName[] = ["folder", "sparkles", "boxes", "hardhat", "building", "shield", "check", "clock", "message", "users", "activity", "info"];

export default function VitrineAdminPage() {
  const { user } = useAuth();
  const [active, setActive] = useState<Tab>("Témoignages");
  const [toast, setToast] = useState("");

  if (!user) return null;

  const allowed = canManageVitrine(user);
  const isGerant = user.role === "ROLE_GERANT";

  if (!allowed) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-[#d19331]">
            <Icon name="lock" size={24} />
          </span>
          <h1 className="mt-5 text-xl font-bold tracking-[-0.035em] text-[#17294b]">Accès vitrine restreint</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            La gestion de la vitrine (témoignages, étoiles, produits, blog, réalisations, services) est réservée au <strong>Gérant</strong>.
            <br />
            Votre rôle actuel ({user.role}) ne dispose pas de cette permission. Demandez au Gérant de vous déléguer l&apos;accès depuis l&apos;onglet Permissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex items-start gap-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e5edf7] text-[#385d86]">
          <Icon name="sparkles" size={22} />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">Vitrine · Contenus dynamiques</p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.045em] text-[#17294b] sm:text-[30px]">Gestion de la vitrine</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
            Tout le contenu public est désormais dynamique. Aucune donnée mockée n&apos;est affichée : si une section est vide, elle est masquée sur le site.
            Créez ici les témoignages (avec étoiles), services, garanties, réalisations et articles de blog. Les produits de la boutique restent gérés via le stock.
          </p>
        </div>
      </section>

      {toast ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span className="flex items-center gap-2">
            <Icon name="check" size={17} />
            {toast}
          </span>
          <button className="rounded-md p-1 text-emerald-700 hover:bg-emerald-100" onClick={() => setToast("")} type="button">
            <Icon name="close" size={16} />
          </button>
        </div>
      ) : null}

      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            aria-pressed={active === tab}
            className={
              "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition " +
              (active === tab ? "bg-[#17294b] text-white shadow-sm" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700")
            }
            onClick={() => setActive(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        {active === "Témoignages" ? <TemoignagesPanel onToast={setToast} /> : null}
        {active === "Services" ? <ServicesPanel onToast={setToast} /> : null}
        {active === "Garanties" ? <GarantiesPanel onToast={setToast} /> : null}
        {active === "Réalisations" ? <RealisationsPanel onToast={setToast} /> : null}
        {active === "Blog" ? <BlogPanel onToast={setToast} /> : null}
        {active === "Permissions" ? <PermissionsPanel isGerant={isGerant} onToast={setToast} currentUser={user} /> : null}
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
        <p className="font-bold">Note backend</p>
        <p className="mt-1">
          Tant que le backend n&apos;expose pas <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]">/api/v1/vitrine/*</code>, les données sont stockées en localStorage et restent parfaitement dynamiques.
          Dès que le backend répondra, aucune modif front ne sera nécessaire — la couche <code className="font-mono">app/lib/api/vitrine.ts</code> basculera automatiquement sur l&apos;API.
          Le cahier des besoins complet est disponible dans <code className="font-mono">SPEC-VITRINE.md</code>.
        </p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Témoignages
// ------------------------------------------------------------------

function TemoignagesPanel({ onToast }: { onToast: (m: string) => void }) {
  const [list, setList] = useState<VitrineTemoignage[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VitrineTemoignage | null>(null);
  const [form, setForm] = useState({ name: "", role: "", text: "", image: "", rating: 5 });

  const refresh = async () => setList(await vitrineApi.listTemoignages());
  useEffect(() => {
    void refresh();
    const h = () => void refresh();
    window.addEventListener("wugams:vitrine:change", h);
    return () => window.removeEventListener("wugams:vitrine:change", h);
  }, []);

  const submit = async () => {
    if (!form.name.trim() || !form.text.trim()) return onToast("Nom et témoignage requis.");
    if (editing) {
      await vitrineApi.updateTemoignage(editing.id, { ...form, rating: Number(form.rating) });
      onToast("Témoignage modifié.");
    } else {
      await vitrineApi.createTemoignage({ ...form, rating: Number(form.rating), is_published: true });
      onToast("Témoignage créé — visible sur la page d’accueil.");
    }
    setOpen(false);
    setEditing(null);
    setForm({ name: "", role: "", text: "", image: "", rating: 5 });
    void refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#17294b]">Avis clients · étoiles</h3>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-[#e3a641] px-4 py-2 text-xs font-bold text-[#14223b] shadow-sm hover:bg-[#efb653]"
          onClick={() => {
            setEditing(null);
            setForm({ name: "", role: "", text: "", image: "", rating: 5 });
            setOpen(true);
          }}
          type="button"
        >
          <Icon name="plus" size={14} /> Nouveau témoignage
        </button>
      </div>
      <p className="text-xs leading-5 text-slate-500">Chaque témoignage affiche le nom, le rôle, le texte, la photo (URL Unsplash) et la note de 1 à 5 étoiles. Masqué automatiquement si vide.</p>

      {list.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
          <Icon name="message" size={20} className="text-slate-300" />
          <p className="mt-2 text-xs font-bold text-slate-500">Aucun témoignage</p>
          <p className="mt-1 text-[11px] text-slate-400">La section &quot;Preuve sociale&quot; sera masquée sur la page d&apos;accueil.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((t) => (
            <div key={t.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className={"size-3.5 " + (s <= t.rating ? "fill-current" : "fill-slate-200")} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-[11px] font-bold text-slate-400">{t.rating}/5</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600">&ldquo;{t.text}&rdquo;</p>
              <p className="mt-2 text-xs font-bold text-[#233856]">
                {t.name} <span className="font-normal text-slate-400">· {t.role}</span>
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:border-slate-300"
                  onClick={() => {
                    setEditing(t);
                    setForm({ name: t.name, role: t.role, text: t.text, image: t.image, rating: t.rating });
                    setOpen(true);
                  }}
                  type="button"
                >
                  Modifier
                </button>
                <button
                  className="rounded-lg border border-red-200 px-2.5 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-50"
                  onClick={async () => {
                    await vitrineApi.deleteTemoignage(t.id);
                    onToast("Témoignage supprimé.");
                    void refresh();
                  }}
                  type="button"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#17294b]">{editing ? "Modifier" : "Nouveau"} témoignage</h4>
              <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" onClick={() => setOpen(false)} type="button">
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-xs font-bold text-slate-600">Nom</span>
                <input className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#7ea5ca] focus:bg-white" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex. Koffi Amara" />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-600">Rôle / Fonction</span>
                <input className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#7ea5ca] focus:bg-white" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Ex. Propriétaire, Résidence Cocody" />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-600">Témoignage</span>
                <textarea className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#7ea5ca] focus:bg-white" rows={3} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="Texte du témoignage" />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-600">Image URL</span>
                <input className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#7ea5ca] focus:bg-white" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://images.unsplash.com/..." />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-600">Note (1–5)</span>
                <select className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} ★
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600" onClick={() => setOpen(false)} type="button">
                Annuler
              </button>
              <button className="rounded-xl bg-[#17294b] px-4 py-2 text-xs font-bold text-white hover:bg-[#243a61]" onClick={submit} type="button">
                {editing ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ServicesPanel({ onToast }: { onToast: (m: string) => void }) {
  const [list, setList] = useState<VitrineService[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VitrineService | null>(null);
  const [form, setForm] = useState({ title: "", description: "", icon: "folder" as IconName, order: 1 });

  const refresh = async () => setList(await vitrineApi.listServices());
  useEffect(() => {
    void refresh();
    const h = () => void refresh();
    window.addEventListener("wugams:vitrine:change", h);
    return () => window.removeEventListener("wugams:vitrine:change", h);
  }, []);

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim()) return onToast("Titre et description requis.");
    if (editing) {
      await vitrineApi.updateService(editing.id, form);
      onToast("Service modifié.");
    } else {
      await vitrineApi.createService({ ...form, is_published: true });
      onToast("Service créé.");
    }
    setOpen(false);
    setEditing(null);
    void refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#17294b]">Services / Filiales (page d&apos;accueil)</h3>
        <button className="inline-flex items-center gap-2 rounded-xl bg-[#e3a641] px-4 py-2 text-xs font-bold text-[#14223b]" onClick={() => { setEditing(null); setForm({ title: "", description: "", icon: "folder", order: list.length + 1 }); setOpen(true); }} type="button">
          <Icon name="plus" size={14} /> Ajouter
        </button>
      </div>
      <p className="text-xs leading-5 text-slate-500">Gère la section &quot;Une équipe, cinq expertises&quot;. Masquée si vide — conserve les cartes existantes.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((s) => (
          <div key={s.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-[#edf3f9] text-[#426b95]">
                <Icon name={s.icon} size={18} />
              </span>
              <span className="text-[11px] font-bold text-slate-400">#{s.order}</span>
            </div>
            <p className="mt-3 text-sm font-bold text-[#24395d]">{s.title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{s.description}</p>
            <div className="mt-3 flex gap-2">
              <button className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-600" onClick={() => { setEditing(s); setForm({ title: s.title, description: s.description, icon: s.icon, order: s.order }); setOpen(true); }} type="button">
                Modifier
              </button>
              <button className="rounded-lg border border-red-200 px-2.5 py-1.5 text-[11px] font-bold text-red-600" onClick={async () => { await vitrineApi.deleteService(s.id); onToast("Service supprimé."); void refresh(); }} type="button">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
      {list.length === 0 ? <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-xs text-slate-400">Aucun service — la section sera masquée.</div> : null}

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h4 className="text-sm font-bold text-[#17294b]">{editing ? "Modifier" : "Nouveau"} service</h4>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-xs font-bold text-slate-600">Titre</span>
                <input className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-600">Description</span>
                <textarea className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-600">Icône</span>
                <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value as IconName })}>
                  {iconOptions.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-600">Ordre</span>
                <input type="number" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600" onClick={() => setOpen(false)} type="button">
                Annuler
              </button>
              <button className="rounded-xl bg-[#17294b] px-4 py-2 text-xs font-bold text-white" onClick={submit} type="button">
                {editing ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GarantiesPanel({ onToast }: { onToast: (m: string) => void }) {
  const [list, setList] = useState<VitrineGarantie[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VitrineGarantie | null>(null);
  const [form, setForm] = useState({ title: "", text: "", icon: "shield" as IconName, order: 1 });

  const refresh = async () => setList(await vitrineApi.listGaranties());
  useEffect(() => {
    void refresh();
    const h = () => void refresh();
    window.addEventListener("wugams:vitrine:change", h);
    return () => window.removeEventListener("wugams:vitrine:change", h);
  }, []);

  const submit = async () => {
    if (!form.title.trim()) return onToast("Titre requis.");
    if (editing) {
      await vitrineApi.updateGarantie(editing.id, form);
      onToast("Engagement modifié.");
    } else {
      await vitrineApi.createGarantie({ ...form, is_published: true });
      onToast("Engagement créé.");
    }
    setOpen(false);
    setEditing(null);
    void refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#17294b]">Engagements / Garanties</h3>
        <button className="inline-flex items-center gap-2 rounded-xl bg-[#e3a641] px-4 py-2 text-xs font-bold text-[#14223b]" onClick={() => { setEditing(null); setForm({ title: "", text: "", icon: "shield", order: list.length + 1 }); setOpen(true); }} type="button">
          <Icon name="plus" size={14} /> Ajouter
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((g) => (
          <div key={g.id} className="rounded-xl border border-slate-200 p-4">
            <span className="grid size-9 place-items-center rounded-xl bg-[#edf3f9] text-[#426b95]">
              <Icon name={g.icon} size={18} />
            </span>
            <p className="mt-3 text-sm font-bold text-[#24395d]">{g.title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{g.text}</p>
            <div className="mt-3 flex gap-2">
              <button className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-600" onClick={() => { setEditing(g); setForm({ title: g.title, text: g.text, icon: g.icon, order: g.order }); setOpen(true); }} type="button">
                Modifier
              </button>
              <button className="rounded-lg border border-red-200 px-2.5 py-1.5 text-[11px] font-bold text-red-600" onClick={async () => { await vitrineApi.deleteGarantie(g.id); onToast("Supprimé."); void refresh(); }} type="button">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
      {list.length === 0 ? <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-xs text-slate-400">Aucun engagement — section masquée.</div> : null}
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h4 className="text-sm font-bold text-[#17294b]">{editing ? "Modifier" : "Nouvel"} engagement</h4>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-xs font-bold text-slate-600">Titre</span>
                <input className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-600">Texte</span>
                <textarea className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" rows={3} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-600">Icône</span>
                <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value as IconName })}>
                  {iconOptions.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600" onClick={() => setOpen(false)} type="button">
                Annuler
              </button>
              <button className="rounded-xl bg-[#17294b] px-4 py-2 text-xs font-bold text-white" onClick={submit} type="button">
                {editing ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function RealisationsPanel({ onToast }: { onToast: (m: string) => void }) {
  const [list, setList] = useState<VitrineRealisation[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VitrineRealisation | null>(null);
  const [form, setForm] = useState({ title: "", filiale: "Rénovation", client: "", location: "", value: "", year: "2026", image: "", tags: "", description: "" });

  const refresh = async () => setList(await vitrineApi.listRealisations());
  useEffect(() => {
    void refresh();
    const h = () => void refresh();
    window.addEventListener("wugams:vitrine:change", h);
    return () => window.removeEventListener("wugams:vitrine:change", h);
  }, []);

  const submit = async () => {
    if (!form.title.trim()) return onToast("Titre requis.");
    const payload = {
      title: form.title,
      filiale: form.filiale,
      client: form.client,
      location: form.location,
      value: form.value,
      year: form.year,
      image: form.image,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      description: form.description,
      is_published: true,
    };
    if (editing) {
      await vitrineApi.updateRealisation(editing.id, payload);
      onToast("Réalisation modifiée.");
    } else {
      await vitrineApi.createRealisation(payload);
      onToast("Réalisation créée.");
    }
    setOpen(false);
    setEditing(null);
    void refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#17294b]">Réalisations</h3>
        <button className="inline-flex items-center gap-2 rounded-xl bg-[#e3a641] px-4 py-2 text-xs font-bold text-[#14223b]" onClick={() => { setEditing(null); setForm({ title: "", filiale: "Rénovation", client: "", location: "", value: "", year: "2026", image: "", tags: "", description: "" }); setOpen(true); }} type="button">
          <Icon name="plus" size={14} /> Ajouter
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((r) => (
          <div key={r.id} className="overflow-hidden rounded-xl border border-slate-200">
            <div className="aspect-[16/10] bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" decoding="async" src={r.image} alt={r.title} className="size-full object-cover" />
            </div>
            <div className="p-3">
              <p className="text-xs font-bold text-[#233856]">{r.title}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {r.client} · {r.location} · {r.value}
              </p>
              <div className="mt-2 flex gap-2">
                <button className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600" onClick={() => { setEditing(r); setForm({ title: r.title, filiale: r.filiale, client: r.client, location: r.location, value: r.value, year: r.year, image: r.image, tags: r.tags.join(", "), description: r.description }); setOpen(true); }} type="button">
                  Modifier
                </button>
                <button className="rounded-lg border border-red-200 px-2.5 py-1 text-[11px] font-bold text-red-600" onClick={async () => { await vitrineApi.deleteRealisation(r.id); onToast("Supprimée."); void refresh(); }} type="button">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {list.length === 0 ? <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-xs text-slate-400">Aucune réalisation — page masquée si vide.</div> : null}
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <h4 className="text-sm font-bold text-[#17294b]">{editing ? "Modifier" : "Nouvelle"} réalisation</h4>
            <div className="mt-4 space-y-3">
              {[
                { k: "title", label: "Titre", ph: "Rénovation complète — Villa Cocody" },
                { k: "client", label: "Client", ph: "Particulier" },
                { k: "location", label: "Lieu", ph: "Cocody, Abidjan" },
                { k: "value", label: "Valeur", ph: "38,5 M FCFA" },
                { k: "year", label: "Année", ph: "2026" },
                { k: "image", label: "Image URL", ph: "https://..." },
                { k: "tags", label: "Tags (séparés par ,)", ph: "Rénovation, Finitions" },
              ].map((f) => (
                <label key={f.k} className="block">
                  <span className="text-xs font-bold text-slate-600">{f.label}</span>
                  <input className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" value={(form as unknown as Record<string, string>)[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} placeholder={f.ph} />
                </label>
              ))}
              <label className="block">
                <span className="text-xs font-bold text-slate-600">Filiale</span>
                <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" value={form.filiale} onChange={(e) => setForm({ ...form, filiale: e.target.value })}>
                  {["Construction", "Rénovation", "Entretien", "Mobilier", "Matériaux"].map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-600">Description</span>
                <textarea className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600" onClick={() => setOpen(false)} type="button">
                Annuler
              </button>
              <button className="rounded-xl bg-[#17294b] px-4 py-2 text-xs font-bold text-white" onClick={submit} type="button">
                {editing ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BlogPanel({ onToast }: { onToast: (m: string) => void }) {
  const [list, setList] = useState<VitrineBlogPost[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VitrineBlogPost | null>(null);
  const [form, setForm] = useState({ slug: "", title: "", category: "Conseils", author: "", date: "", read_time: "4 min", excerpt: "", image: "", content: "" });

  const refresh = async () => setList(await vitrineApi.listBlogPosts());
  useEffect(() => {
    void refresh();
    const h = () => void refresh();
    window.addEventListener("wugams:vitrine:change", h);
    return () => window.removeEventListener("wugams:vitrine:change", h);
  }, []);

  const submit = async () => {
    if (!form.title.trim()) return onToast("Titre requis.");
    const payload: Record<string, unknown> = {
      title: form.title,
      category: form.category,
      author: form.author,
      date: form.date || new Date().toLocaleDateString("fr-FR"),
      read_time: form.read_time,
      excerpt: form.excerpt,
      image: form.image,
      content: form.content.split("\n").filter(Boolean),
      is_published: true,
    };
    if (form.slug.trim()) (payload as Record<string, unknown>).slug = form.slug.trim();
    if (editing) {
      await vitrineApi.updateBlogPost(editing.id, payload as unknown as Partial<VitrineBlogPost>);
      onToast("Article modifié.");
    } else {
      await vitrineApi.createBlogPost(payload as unknown as Omit<VitrineBlogPost, "id" | "created_at">);
      onToast("Article créé.");
    }
    setOpen(false);
    setEditing(null);
    void refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#17294b]">Blog</h3>
        <button className="inline-flex items-center gap-2 rounded-xl bg-[#e3a641] px-4 py-2 text-xs font-bold text-[#14223b]" onClick={() => { setEditing(null); setForm({ slug: "", title: "", category: "Conseils", author: "", date: "", read_time: "4 min", excerpt: "", image: "", content: "" }); setOpen(true); }} type="button">
          <Icon name="plus" size={14} /> Nouvel article
        </button>
      </div>
      <div className="space-y-2">
        {list.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#233856]">{p.title}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {p.category} · {p.slug} · {p.date}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600" onClick={() => { setEditing(p); setForm({ slug: p.slug, title: p.title, category: p.category, author: p.author, date: p.date, read_time: p.read_time, excerpt: p.excerpt, image: p.image, content: p.content.join("\n") }); setOpen(true); }} type="button">
                Modifier
              </button>
              <button className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-600" onClick={async () => { await vitrineApi.deleteBlogPost(p.id); onToast("Supprimé."); void refresh(); }} type="button">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
      {list.length === 0 ? <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-xs text-slate-400">Aucun article — vitrine masquée.</div> : null}
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <h4 className="text-sm font-bold text-[#17294b]">{editing ? "Modifier" : "Nouvel"} article</h4>
            <div className="mt-4 space-y-3">
              {[
                { k: "slug", label: "Slug (URL)", ph: "ma-super-realisation" },
                { k: "title", label: "Titre" },
                { k: "author", label: "Auteur" },
                { k: "excerpt", label: "Extrait" },
                { k: "image", label: "Image URL" },
                { k: "read_time", label: "Temps de lecture", ph: "4 min" },
              ].map((f) => (
                <label key={f.k} className="block">
                  <span className="text-xs font-bold text-slate-600">{f.label}</span>
                  <input className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" value={(form as unknown as Record<string, string>)[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} placeholder={f.ph} />
                </label>
              ))}
              <label className="block">
                <span className="text-xs font-bold text-slate-600">Catégorie</span>
                <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {["Conseils", "Actualités", "Réalisations", "Boutique"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-600">Contenu (un paragraphe par ligne)</span>
                <textarea className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600" onClick={() => setOpen(false)} type="button">
                Annuler
              </button>
              <button className="rounded-xl bg-[#17294b] px-4 py-2 text-xs font-bold text-white" onClick={submit} type="button">
                {editing ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PermissionsPanel({ isGerant, onToast, currentUser }: { isGerant: boolean; onToast: (m: string) => void; currentUser: { id: string; role: string } }) {
  const [users, setUsers] = useState<User[]>([]);
  const [delegated, setDelegated] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    // Tente d'abord l'API (source de vérité), fallback local
    import("@/app/lib/api/vitrine").then(({ listVitrinePermissions }) =>
      listVitrinePermissions()
        .then((ids) => {
          if (!cancelled) {
            setDelegated(ids);
            // Sync local cache
            try {
              const { writeLocal } = require("@/app/lib/vitrine-store");
              writeLocal("wugams:vitrine:permissions", ids);
            } catch {}
          }
        })
        .catch(() => {
          if (!cancelled) setDelegated(getDelegatedIds());
        })
    );
    listUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = async (userId: string) => {
    if (!isGerant) return onToast("Seul le Gérant peut déléguer.");
    const isAdding = !delegated.includes(userId);
    const next = isAdding ? [...delegated, userId] : delegated.filter((id) => id !== userId);
    // Optimiste UI
    setDelegated(next);
    setDelegatedIds(next);
    try {
      const { grantVitrinePermission, revokeVitrinePermission } = await import("@/app/lib/api/vitrine");
      if (isAdding) await grantVitrinePermission(userId);
      else await revokeVitrinePermission(userId);
      onToast(isAdding ? "Permission accordée (API)." : "Permission retirée (API).");
    } catch {
      // Fallback local déjà fait, on informe
      onToast(isAdding ? "Permission accordée (local, API indisponible)." : "Permission retirée (local).");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-[#17294b]">Délégation de la vitrine</h3>
      <p className="text-xs leading-5 text-slate-500">
        Le <strong>Gérant</strong> peut déléguer la gestion de la vitrine à n&apos;importe quel autre rôle (Secrétaire, Manager, Dev Digital, etc.).
        Les personnes autorisées verront le même atelier vitrine. Le Gérant reste le seul à pouvoir retirer/donner cette permission.
      </p>
      {!isGerant ? <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">Vous êtes délégué : vous pouvez gérer les contenus, mais pas les permissions.</p> : null}
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Peut gérer la vitrine</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const name = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email;
              const isG = u.role === "ROLE_GERANT";
              const checked = isG || delegated.includes(u.id);
              const isSelf = u.id === currentUser.id;
              return (
                <tr key={u.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="text-xs font-bold text-slate-700">
                      {name} {isSelf ? "(vous)" : ""}
                    </p>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{u.role}</td>
                  <td className="px-4 py-3">
                    <button
                      aria-pressed={checked}
                      className={
                        "relative inline-flex h-6 w-11 items-center rounded-full transition " +
                        (checked ? "bg-emerald-500" : "bg-slate-200") +
                        (isG || !isGerant ? " opacity-50 cursor-not-allowed" : "")
                      }
                      disabled={isG || !isGerant}
                      onClick={() => toggle(u.id)}
                      type="button"
                    >
                      <span className={"inline-block size-5 transform rounded-full bg-white shadow transition " + (checked ? "translate-x-5" : "translate-x-0.5")} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
