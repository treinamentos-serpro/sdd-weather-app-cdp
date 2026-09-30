import { useEffect, useRef } from 'react';
import type { City } from '../types/weather';

interface CityResultsProps {
  cities: City[];
  onSelect: (city: City) => void;
}

export default function CityResults({ cities, onSelect }: CityResultsProps) {
  const firstResultRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    firstResultRef.current?.focus();
  }, []);

  return (
    <section
      aria-labelledby="city-results-heading"
      className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
    >
      <h2 className="text-sm font-semibold text-white" id="city-results-heading">
        Escolha uma cidade
      </h2>
      <ul className="mt-3 space-y-2">
        {cities.map((city, index) => (
          <li key={city.id}>
            <button
              className="flex w-full items-center justify-between rounded-xl border border-transparent px-3 py-3 text-left transition hover:border-accent-400/30 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
              ref={index === 0 ? firstResultRef : undefined}
              onClick={() => onSelect(city)}
              type="button"
            >
              <span>
                <span className="block font-medium text-white">{city.name}</span>
                <span className="mt-1 block text-xs text-slate-400">
                  {city.admin1}, {city.country}
                </span>
              </span>
              <span aria-hidden="true" className="text-slate-300">
                →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
