export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface City {
  id: number;
  name: string;
  country: string;
  admin1: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface CurrentWeather {
  time: string;
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  pressure: number | null;
  precipitation: number | null;
  weatherCode: number | null;
}

export interface ForecastDay {
  date: string;
  min: number | null;
  max: number | null;
  humidity: number | null;
  weatherCode: number | null;
  precipitationProbability: number | null;
}

export interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: ForecastDay[];
}
