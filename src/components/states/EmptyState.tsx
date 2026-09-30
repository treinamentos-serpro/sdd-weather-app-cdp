interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div
      aria-live="polite"
      className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-slate-300"
      role="status"
    >
      {message ?? 'Busque uma cidade para ver a previsão do tempo.'}
    </div>
  );
}
