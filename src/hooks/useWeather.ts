import { useRef, useState } from 'react';
import {
  getLocationCity,
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

interface WeatherState {
  data: WeatherData | null;
  cities: City[];
  status: WeatherStatus;
  error: string | null;
  retryable: boolean;
  busy: 'search' | 'forecast' | null;
}

export function useWeather() {
  const [state, setState] = useState<WeatherState>({
    data: null,
    cities: [],
    status: 'idle',
    error: null,
    retryable: false,
    busy: null,
  });
  const retryAction = useRef<(() => Promise<void>) | null>(null);
  const requestId = useRef(0);
  const locationRequestId = useRef(0);

  async function runSearch(query: string): Promise<void> {
    const currentRequest = ++requestId.current;
    setState((previous) => ({
      ...previous,
      data: null,
      cities: [],
      status: 'loading',
      error: null,
      retryable: false,
      busy: 'search',
    }));

    try {
      const cities = await searchCities(query);
      if (currentRequest !== requestId.current) return;
      setState((previous) => ({
        ...previous,
        cities,
        status: cities.length > 0 ? 'success' : 'empty',
        error: null,
        retryable: false,
        busy: null,
      }));
    } catch (error) {
      if (currentRequest !== requestId.current) return;
      const message =
        error instanceof WeatherServiceError ? error.message : 'Não foi possível buscar cidades.';
      setState((previous) => ({
        ...previous,
        status: 'error',
        error: message,
        retryable: error instanceof WeatherServiceError ? error.retryable : true,
        busy: null,
      }));
    }
  }

  async function runForecast(city: City): Promise<void> {
    const currentRequest = ++requestId.current;
    setState((previous) => ({
      ...previous,
      status: 'loading',
      error: null,
      retryable: false,
      busy: 'forecast',
    }));

    try {
      const data = await getWeather(city);
      if (currentRequest !== requestId.current) return;
      setState({ data, cities: [], status: 'success', error: null, retryable: false, busy: null });
    } catch (error) {
      if (currentRequest !== requestId.current) return;
      const message =
        error instanceof WeatherServiceError
          ? error.message
          : 'Não foi possível carregar a previsão.';
      setState((previous) => ({
        ...previous,
        status: 'error',
        error: message,
        retryable: error instanceof WeatherServiceError ? error.retryable : true,
        busy: null,
      }));
    }
  }

  function handleSearch(query: string) {
    locationRequestId.current += 1;
    retryAction.current = () => runSearch(query);
    void runSearch(query);
  }

  function selectCity(city: City) {
    locationRequestId.current += 1;
    retryAction.current = () => runForecast(city);
    void runForecast(city);
  }

  async function loadLocation(latitude: number, longitude: number) {
    const currentLocationRequest = ++locationRequestId.current;
    try {
      const city = await getLocationCity(latitude, longitude);
      if (currentLocationRequest !== locationRequestId.current) return;
      retryAction.current = () => runForecast(city);
      await runForecast(city);
    } catch (error) {
      if (currentLocationRequest !== locationRequestId.current) return;
      setState((previous) => ({
        ...previous,
        status: 'idle',
        error:
          error instanceof WeatherServiceError
            ? error.message
            : 'Não foi possível identificar sua cidade.',
        retryable: false,
        busy: null,
      }));
    }
  }

  function retry() {
    void retryAction.current?.();
  }

  return { ...state, searchCities: handleSearch, selectCity, loadLocation, retry };
}
