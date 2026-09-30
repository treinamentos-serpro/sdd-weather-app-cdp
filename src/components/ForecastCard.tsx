import { formatDay, formatTemperature, getWeatherIcon, getWeatherLabel } from '../lib/weather';
import type { ForecastDay, TemperatureUnit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  index: number;
  unit: TemperatureUnit;
}

export default function ForecastCard({ day, index, unit }: ForecastCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition hover:-translate-y-1 hover:border-accent-400/30">
      <p className="text-sm font-semibold capitalize text-slate-200">
        {formatDay(day.date, index)}
      </p>
      <div aria-label={getWeatherLabel(day.weatherCode)} className="my-5 text-4xl" role="img">
        {getWeatherIcon(day.weatherCode)}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-semibold text-white">{formatTemperature(day.max, unit)}</span>
        <span className="text-sm text-slate-500">{formatTemperature(day.min, unit)}</span>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>Chuva</span>
        <span className="font-semibold text-accent-300">{day.precipitationProbability}%</span>
      </div>
    </article>
  );
}
