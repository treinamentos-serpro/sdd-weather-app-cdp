import { describe, expect, it } from 'vitest';
import {
  convertTemperature,
  formatDay,
  getWeatherIcon,
  getWeatherLabel,
} from '../../src/lib/weather';

describe('funções meteorológicas', () => {
  it('converte Celsius para Fahrenheit', () => {
    expect(convertTemperature(22, 'fahrenheit')).toBeCloseTo(71.6);
  });

  it('mantém Celsius quando essa unidade está selecionada', () => {
    expect(convertTemperature(22, 'celsius')).toBe(22);
  });

  it('fornece um rótulo para o código meteorológico', () => {
    expect(getWeatherLabel(2)).toBe('Parcialmente nublado');
  });

  it('cobre os rótulos e ícones meteorológicos suportados', () => {
    const codes = [0, 3, 48, 67, 77, 82, 95];

    expect(codes.map(getWeatherLabel)).toEqual([
      'Céu limpo',
      'Parcialmente nublado',
      'Névoa',
      'Chuva leve',
      'Neve',
      'Pancadas de chuva',
      'Trovoada',
    ]);
    expect(codes.map(getWeatherIcon)).toHaveLength(7);
  });

  it('formata dias atuais e futuros', () => {
    expect(formatDay('2026-09-30', 0)).toBe('Hoje');
    expect(formatDay('2026-10-01', 1)).toMatch(/qui/);
  });
});
