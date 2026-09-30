interface SettingsActionsProps {
  onReset: () => void;
}

export default function SettingsActions({ onReset }: SettingsActionsProps) {
  return (
    <button
      className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
      onClick={onReset}
      type="button"
    >
      Redefinir unidade
    </button>
  );
}
