import type { WeatherData } from '../types/weather';

export const MOCK_WEATHER: WeatherData = {
  city: {
    id: 1,
    name: 'São Paulo',
    country: 'Brasil',
    admin1: 'São Paulo',
    latitude: -23.55,
    longitude: -46.63,
  },
  current: {
    time: '2026-09-30T12:00:00',
    temperature: 22,
    humidity: 67,
    windSpeed: 12,
    pressure: 1018,
    precipitation: 0,
    weatherCode: 2,
  },
  forecast: [
    { date: '2026-09-30', min: 17, max: 24, weatherCode: 2, precipitationProbability: 20 },
    { date: '2026-10-01', min: 16, max: 25, weatherCode: 61, precipitationProbability: 70 },
    { date: '2026-10-02', min: 18, max: 27, weatherCode: 3, precipitationProbability: 30 },
    { date: '2026-10-03', min: 19, max: 28, weatherCode: 0, precipitationProbability: 10 },
    { date: '2026-10-04', min: 20, max: 26, weatherCode: 80, precipitationProbability: 60 },
  ],
};
