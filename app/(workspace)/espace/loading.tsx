export default function WorkspaceLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-20 max-w-xl rounded-2xl bg-slate-200" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-32 rounded-2xl bg-slate-200" />
        <div className="h-32 rounded-2xl bg-slate-200" />
        <div className="h-32 rounded-2xl bg-slate-200" />
      </div>
      <div className="h-96 rounded-2xl bg-slate-200" />
    </div>
  );
}
