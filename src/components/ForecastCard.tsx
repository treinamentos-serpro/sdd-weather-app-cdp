import { formatDay, formatTemperature, getWeatherIcon, getWeatherLabel } from '../lib/weather';
import type { ForecastDay, TemperatureUnit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  index: number;
  unit: TemperatureUnit;
}

export default function ForecastCard({ day, index, unit }: ForecastCardProps) {
  const weatherLabel =
    day.weatherCode === null ? 'Condição indisponível' : getWeatherLabel(day.weatherCode);

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition hover:-translate-y-1 hover:border-accent-400/30">
      <p className="text-sm font-semibold capitalize text-slate-200">
        {formatDay(day.date, index)}
      </p>
      <div aria-label={weatherLabel} className="my-5 text-4xl" role="img">
        {day.weatherCode === null ? '—' : getWeatherIcon(day.weatherCode)}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-semibold text-white">
          {day.max === null ? '—' : formatTemperature(day.max, unit)}
        </span>
        <span className="text-sm text-slate-400">
          {day.min === null ? '—' : formatTemperature(day.min, unit)}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>Chuva</span>
        <span className="font-semibold text-accent-300">
          {day.precipitationProbability === null ? '—' : `${day.precipitationProbability}%`}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span>Umidade</span>
        <span>{day.humidity === null ? '—' : `${day.humidity}%`}</span>
      </div>
    </article>
  );
}
