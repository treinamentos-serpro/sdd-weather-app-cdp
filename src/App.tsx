import { useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import UnitToggle from './components/UnitToggle';
import { MOCK_WEATHER } from './data/mockWeather';
import type { TemperatureUnit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');
  const [hasSearch, setHasSearch] = useState(false);

  function handleSearch(query: string) {
    setHasSearch(query.trim().length > 0);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-night-900 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(109,124,255,0.18),_transparent_36%),radial-gradient(circle_at_bottom_left,_rgba(245,185,66,0.08),_transparent_32%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-accent-300">
              WeatherView
            </p>
            <h1 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              O céu da sua cidade, em um só lugar.
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              Previsão clara para planejar o que vem pela frente.
            </p>
          </div>
          <UnitToggle onChange={setUnit} unit={unit} />
        </header>

        <div className="mx-auto max-w-3xl">
          <SearchBar onSearch={handleSearch} />

          <div className="mt-6 space-y-8">
            {hasSearch ? <EmptyState /> : <CurrentWeather unit={unit} weather={MOCK_WEATHER} />}
            {!hasSearch && <ForecastList forecast={MOCK_WEATHER.forecast} unit={unit} />}
          </div>

          <footer className="mt-10 border-t border-white/10 pt-5 text-center text-xs text-slate-500">
            Dados meteorológicos demonstrativos para a experiência visual.
          </footer>
        </div>
      </div>
    </main>
  );
}
