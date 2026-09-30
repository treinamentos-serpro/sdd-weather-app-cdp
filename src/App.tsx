import { useEffect, useRef } from 'react';
import CityResults from './components/CityResults';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import SettingsActions from './components/SettingsActions';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { usePreferences } from './hooks/usePreferences';
import { useWeather } from './hooks/useWeather';

export default function App() {
  const weather = useWeather();
  const preferences = usePreferences();
  const locationAttempted = useRef(false);
  const manualSearchStarted = useRef(false);

  useEffect(() => {
    if (locationAttempted.current || weather.status !== 'idle' || !navigator.geolocation) return;
    locationAttempted.current = true;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (!manualSearchStarted.current) weather.loadLocation(coords.latitude, coords.longitude);
      },
      () => undefined,
    );
  }, [weather.loadLocation, weather.status]);

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
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <UnitToggle
              onChange={preferences.setTemperatureUnit}
              unit={preferences.temperatureUnit}
            />
            <SettingsActions onReset={preferences.resetPreferences} />
          </div>
        </header>

        <div className="mx-auto max-w-3xl">
          <SearchBar
            disabled={weather.busy === 'search'}
            onSearch={(query) => {
              manualSearchStarted.current = true;
              weather.searchCities(query);
            }}
          />

          <div
            aria-busy={weather.status === 'loading'}
            aria-label="Resultados meteorológicos"
            className="mt-6 space-y-8"
            role="region"
          >
            {weather.status === 'idle' && <EmptyState />}
            {weather.status === 'loading' && <LoadingState />}
            {weather.status === 'empty' && (
              <EmptyState message="Nenhuma cidade encontrada. Tente outra busca." />
            )}
            {weather.status === 'error' && (
              <ErrorState
                message={weather.error ?? undefined}
                onRetry={weather.retry}
                retryable={weather.retryable}
              />
            )}
            {weather.status === 'success' && weather.data === null && (
              <CityResults
                cities={weather.cities}
                key={weather.cities.map((city) => city.id).join('-')}
                onSelect={weather.selectCity}
              />
            )}
            {weather.status === 'success' && weather.data !== null && (
              <>
                <CurrentWeather unit={preferences.temperatureUnit} weather={weather.data} />
                <ForecastList forecast={weather.data.forecast} unit={preferences.temperatureUnit} />
              </>
            )}
          </div>

          <footer className="mt-10 border-t border-white/10 pt-5 text-center text-xs text-slate-400">
            Dados meteorológicos por Open-Meteo · © OpenStreetMap contributors · CC BY 4.0
          </footer>
        </div>
      </div>
    </main>
  );
}
