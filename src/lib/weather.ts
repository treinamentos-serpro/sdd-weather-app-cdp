import type { TemperatureUnit } from '../types/weather';

export function convertTemperature(celsius: number, unit: TemperatureUnit): number {
  return unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius;
}

export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  const value = convertTemperature(celsius, unit);
  const formatted = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0,
  }).format(value);

  return `${formatted}°`;
}

export function getWeatherIcon(weatherCode: number): string {
  if (weatherCode === 0) return '☀️';
  if (weatherCode <= 3) return '⛅';
  if (weatherCode <= 48) return '🌫️';
  if (weatherCode <= 67) return '🌧️';
  if (weatherCode <= 77) return '🌨️';
  if (weatherCode <= 82) return '🌦️';
  return '⛈️';
}

export function getWeatherLabel(weatherCode: number): string {
  if (weatherCode === 0) return 'Céu limpo';
  if (weatherCode <= 3) return 'Parcialmente nublado';
  if (weatherCode <= 48) return 'Névoa';
  if (weatherCode <= 67) return 'Chuva leve';
  if (weatherCode <= 77) return 'Neve';
  if (weatherCode <= 82) return 'Pancadas de chuva';
  return 'Trovoada';
}

export function formatDay(date: string, index: number): string {
  if (index === 0) return 'Hoje';

  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
    .format(new Date(`${date}T12:00:00`))
    .replace('.', '');
}
