export default function LoadingState() {
  return (
    <div
      aria-label="Carregando previsão"
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300"
      role="status"
    >
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-400 border-t-transparent" />
      Carregando previsão...
    </div>
  );
}
