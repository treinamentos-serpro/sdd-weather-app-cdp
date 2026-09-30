interface ErrorStateProps {
  onRetry: () => void;
  message?: string;
  retryable?: boolean;
}

export default function ErrorState({ message, onRetry, retryable = true }: ErrorStateProps) {
  return (
    <div
      aria-live="assertive"
      className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-5 text-sm text-rose-100"
      role="alert"
    >
      <p className="font-semibold">{message ?? 'Não foi possível carregar a previsão.'}</p>
      <p className="mt-1 text-rose-200/70">
        {retryable
          ? 'Verifique sua conexão e tente novamente.'
          : 'Tente fazer uma nova busca mais tarde.'}
      </p>
      {retryable && (
        <button
          className="mt-4 rounded-lg border border-rose-300/30 px-3 py-2 font-semibold transition hover:bg-rose-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          onClick={onRetry}
          type="button"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
