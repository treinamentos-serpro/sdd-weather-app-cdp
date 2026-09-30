import { formatTemperature, getWeatherIcon, getWeatherLabel } from '../lib/weather';
import type { TemperatureUnit, WeatherData } from '../types/weather';

interface CurrentWeatherProps {
  weather: WeatherData;
  unit: TemperatureUnit;
}

export default function CurrentWeather({ weather, unit }: CurrentWeatherProps) {
  const { city, current } = weather;
  const weatherLabel =
    current.weatherCode === null ? 'Condição indisponível' : getWeatherLabel(current.weatherCode);

  return (
    <section
      aria-labelledby="current-weather-heading"
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-md sm:p-8"
    >
      <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-accent-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent-300">Agora</p>
            <h2 className="mt-2 text-2xl font-semibold text-white" id="current-weather-heading">
              {city.name}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {city.admin1}, {city.country}
            </p>
          </div>
          <div className="text-6xl" role="img" aria-label={weatherLabel}>
            {current.weatherCode === null ? '—' : getWeatherIcon(current.weatherCode)}
          </div>
        </div>

        <div className="mt-8 flex items-end gap-3">
          <span className="text-7xl font-semibold tracking-tight text-white sm:text-8xl">
            {current.temperature === null ? '—' : formatTemperature(current.temperature, unit)}
          </span>
          <span className="mb-3 text-base text-slate-300">{weatherLabel}</span>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric
            label="Umidade"
            value={current.humidity === null ? '—' : `${current.humidity}%`}
          />
          <Metric
            label="Vento"
            value={current.windSpeed === null ? '—' : `${current.windSpeed} km/h`}
          />
          <Metric
            label="Pressão"
            value={current.pressure === null ? '—' : `${current.pressure} hPa`}
          />
          <Metric
            label="Chuva"
            value={current.precipitation === null ? '—' : `${current.precipitation} mm`}
          />
        </div>
      </div>
    </section>
  );
}

interface MetricProps {
  label: string;
  value: string;
}

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-night-800/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}
