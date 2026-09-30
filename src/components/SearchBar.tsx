import { type FormEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) onSearch(trimmedQuery);
  }

  return (
    <form className="w-full" onSubmit={handleSubmit} role="search">
      <label className="sr-only" htmlFor="city-search">
        Buscar cidade
      </label>
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 shadow-glass backdrop-blur-md focus-within:border-accent-400/70">
        <span aria-hidden="true" className="pl-3 text-lg text-slate-400">
          ⌕
        </span>
        <input
          className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-slate-500"
          id="city-search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar outra cidade"
          type="search"
          value={query}
        />
        <button
          className="rounded-xl bg-accent-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900"
          type="submit"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
