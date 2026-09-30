import type { City, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const REVERSE_GEOCODING_URL = 'https://nominatim.openstreetmap.org/reverse';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;

export class WeatherServiceError extends Error {
  readonly retryable: boolean;

  constructor(message: string, retryable = true) {
    super(message);
    this.name = 'WeatherServiceError';
    this.retryable = retryable;
  }
}

interface GeocodingResponse {
  results?: Array<{
    id: number;
    name: string;
    country: string;
    country_code?: string;
    admin1?: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  }>;
}

interface ForecastResponse {
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    weather_code?: number;
    wind_speed_10m?: number;
    surface_pressure?: number;
  };
  daily?: {
    time?: string[];
    temperature_2m_min?: number[];
    temperature_2m_max?: number[];
    relative_humidity_2m_mean?: number[];
    weather_code?: number[];
    precipitation_probability_max?: Array<number | null>;
  };
}

interface ReverseGeocodingResponse {
  place_id: number;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
  };
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new WeatherServiceError('A consulta demorou demais. Tente novamente.');
    }

    throw new WeatherServiceError('Não foi possível conectar à previsão do tempo.');
  } finally {
    window.clearTimeout(timeout);
  }
}

async function readJson<T>(url: string): Promise<T> {
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    if (response.status === 429) {
      throw new WeatherServiceError('Limite de consultas atingido. Tente novamente mais tarde.');
    }

    throw new WeatherServiceError('O serviço de previsão está indisponível.');
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new WeatherServiceError('A resposta do serviço está incompleta.');
  }
}

export async function searchCities(query: string): Promise<City[]> {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 5) return [];

  const params = new URLSearchParams({
    name: trimmedQuery,
    count: '10',
    language: navigator.language.split('-')[0],
    format: 'json',
  });
  const data = await readJson<GeocodingResponse>(`${GEOCODING_URL}?${params.toString()}`);

  return (data.results ?? []).map((result) => ({
    id: result.id,
    name: result.name,
    country: result.country,
    admin1: result.admin1 ?? result.country,
    latitude: result.latitude,
    longitude: result.longitude,
    ...(result.timezone ? { timezone: result.timezone } : {}),
  }));
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,surface_pressure',
    daily:
      'weather_code,temperature_2m_min,temperature_2m_max,relative_humidity_2m_mean,precipitation_probability_max',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
    timezone: city.timezone ?? 'auto',
    forecast_days: '5',
  });
  const data = await readJson<ForecastResponse>(`${FORECAST_URL}?${params.toString()}`);

  if (!data.current || !data.daily) {
    throw new WeatherServiceError('A resposta do serviço está incompleta.', false);
  }

  const current = data.current;
  const daily = data.daily;
  const times = daily.time ?? [];
  const minimums = daily.temperature_2m_min ?? [];
  const maximums = daily.temperature_2m_max ?? [];
  const humidities = daily.relative_humidity_2m_mean ?? [];
  const weatherCodes = daily.weather_code ?? [];
  const precipitationProbabilities = daily.precipitation_probability_max ?? [];

  if (times.length < 5) {
    throw new WeatherServiceError('A previsão recebida está incompleta.', false);
  }

  const forecast: ForecastDay[] = times.slice(0, 5).map((date, index) => ({
    date,
    min: minimums[index] ?? null,
    max: maximums[index] ?? null,
    humidity: humidities[index] ?? null,
    weatherCode: weatherCodes[index] ?? null,
    precipitationProbability: precipitationProbabilities[index] ?? null,
  }));

  return {
    city,
    current: {
      time: current.time ?? new Date().toISOString(),
      temperature: current.temperature_2m ?? null,
      humidity: current.relative_humidity_2m ?? null,
      windSpeed: current.wind_speed_10m ?? null,
      pressure: current.surface_pressure ?? null,
      precipitation: current.precipitation ?? null,
      weatherCode: current.weather_code ?? null,
    },
    forecast,
  };
}

export async function getLocationCity(latitude: number, longitude: number): Promise<City> {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    format: 'json',
    addressdetails: '1',
    'accept-language': navigator.language,
  });
  const data = await readJson<ReverseGeocodingResponse>(
    `${REVERSE_GEOCODING_URL}?${params.toString()}`,
  );
  const address = data.address ?? {};
  const name = address.city ?? address.town ?? address.village ?? address.municipality;

  if (!name || !address.country) {
    throw new WeatherServiceError('Não foi possível identificar sua cidade.', false);
  }

  return {
    id: data.place_id,
    name,
    country: address.country,
    admin1: address.state ?? address.country,
    latitude,
    longitude,
    timezone: 'auto',
  };
}
