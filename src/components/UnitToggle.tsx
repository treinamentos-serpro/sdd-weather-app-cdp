import type { TemperatureUnit } from '../types/weather';

interface UnitToggleProps {
  unit: TemperatureUnit;
  onChange: (unit: TemperatureUnit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div
      aria-label="Unidade de temperatura"
      className="flex rounded-xl border border-white/10 bg-white/5 p-1"
      role="group"
    >
      {(['celsius', 'fahrenheit'] as const).map((option) => {
        const isActive = unit === option;
        const label = option === 'celsius' ? '°C' : '°F';

        return (
          <button
            aria-pressed={isActive}
            className={`min-w-12 rounded-lg px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-accent-400 ${
              isActive
                ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
            key={option}
            onClick={() => onChange(option)}
            type="button"
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
