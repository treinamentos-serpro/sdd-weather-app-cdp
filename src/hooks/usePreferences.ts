import { useState } from 'react';
import type { TemperatureUnit } from '../types/weather';

const STORAGE_KEY = 'weather-view-preferences';

interface Preferences {
  temperatureUnit: TemperatureUnit;
}

function readPreferences(): Preferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<Preferences>;
      if (parsed.temperatureUnit === 'celsius' || parsed.temperatureUnit === 'fahrenheit') {
        return { temperatureUnit: parsed.temperatureUnit };
      }
    }
  } catch {
    // Preferências inválidas não devem impedir o uso da aplicação.
  }

  return { temperatureUnit: 'celsius' };
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(readPreferences);

  function setTemperatureUnit(temperatureUnit: TemperatureUnit) {
    const nextPreferences = { temperatureUnit };
    setPreferences(nextPreferences);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPreferences));
  }

  function resetPreferences() {
    setTemperatureUnit('celsius');
  }

  return {
    temperatureUnit: preferences.temperatureUnit,
    setTemperatureUnit,
    resetPreferences,
  };
}
