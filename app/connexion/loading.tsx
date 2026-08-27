import { Spinner } from "@/app/components/ui/loading-button";

export default function Loading() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-[#f5f7fb]">
      <Spinner size={24} />
      <p className="text-sm font-medium text-slate-500">Chargement…</p>
    </div>
  );
}
