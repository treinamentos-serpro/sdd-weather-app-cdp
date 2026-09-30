import { describe, expect, it } from 'vitest';
import { convertTemperature, getWeatherLabel } from '../../src/lib/weather';

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
});
