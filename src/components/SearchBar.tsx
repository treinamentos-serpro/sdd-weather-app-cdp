import { type FormEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ disabled = false, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 5) {
      setValidationMessage('Digite pelo menos 5 caracteres para buscar uma cidade.');
      return;
    }

    setValidationMessage(null);
    onSearch(trimmedQuery);
  }

  return (
    <form className="w-full" onSubmit={handleSubmit} role="search">
      <label className="sr-only" htmlFor="city-search">
        Buscar cidade
      </label>
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 shadow-glass backdrop-blur-md focus-within:border-accent-300 focus-within:ring-2 focus-within:ring-accent-400/70">
        <span aria-hidden="true" className="pl-3 text-lg text-slate-300">
          ⌕
        </span>
        <input
          className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-accent-400"
          disabled={disabled}
          aria-describedby={validationMessage ? 'city-search-error' : undefined}
          aria-invalid={validationMessage ? 'true' : undefined}
          id="city-search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar outra cidade"
          type="search"
          value={query}
        />
        <button
          className="rounded-xl bg-accent-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-accent-500"
          disabled={disabled}
          type="submit"
        >
          Buscar
        </button>
      </div>
      {validationMessage && (
        <p className="mt-2 text-sm text-amber-200" id="city-search-error" role="alert">
          {validationMessage}
        </p>
      )}
    </form>
  );
}
