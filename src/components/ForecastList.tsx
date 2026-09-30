import type { TemperatureUnit, WeatherData } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: WeatherData['forecast'];
  unit: TemperatureUnit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-heading">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent-300">Previsão</p>
          <h2 className="mt-1 text-xl font-semibold text-white" id="forecast-heading">
            Próximos 5 dias
          </h2>
        </div>
        <span className="hidden text-sm text-slate-500 sm:block">Atualizado agora</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {forecast.map((day, index) => (
          <ForecastCard day={day} index={index} key={day.date} unit={unit} />
        ))}
      </div>
    </section>
  );
}
