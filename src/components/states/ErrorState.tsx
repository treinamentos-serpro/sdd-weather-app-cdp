interface ErrorStateProps {
  onRetry: () => void;
}

export default function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div
      aria-live="assertive"
      className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-5 text-sm text-rose-100"
      role="alert"
    >
      <p className="font-semibold">Não foi possível carregar a previsão.</p>
      <p className="mt-1 text-rose-200/70">Verifique sua conexão e tente novamente.</p>
      <button
        className="mt-4 rounded-lg border border-rose-300/30 px-3 py-2 font-semibold transition hover:bg-rose-300/10 focus:outline-none focus:ring-2 focus:ring-rose-300"
        onClick={onRetry}
        type="button"
      >
        Tentar novamente
      </button>
    </div>
  );
}
