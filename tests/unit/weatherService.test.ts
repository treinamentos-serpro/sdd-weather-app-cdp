import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MOCK_WEATHER } from '../../src/data/mockWeather';
import {
  getLocationCity,
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../src/services/weatherService';

const city = MOCK_WEATHER.city;

describe('weatherService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('não consulta a rede para uma busca curta', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    await expect(searchCities('Sol')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('normaliza resultados de geocodificação', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              id: 1,
              name: 'São Paulo',
              country: 'Brasil',
              admin1: 'São Paulo',
              latitude: -23.55,
              longitude: -46.63,
            },
          ],
        }),
        { status: 200 },
      ),
    );

    await expect(searchCities('São Paulo')).resolves.toEqual([city]);
  });

  it('usa o país quando a subdivisão administrativa não existe', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [{ ...city, admin1: undefined }],
        }),
        { status: 200 },
      ),
    );

    await expect(searchCities('São Paulo')).resolves.toEqual([{ ...city, admin1: 'Brasil' }]);
  });

  it('trata limite de chamadas e respostas HTTP indisponíveis', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('', { status: 429 }));
    await expect(searchCities('Carazinho')).rejects.toMatchObject({
      message: 'Limite de consultas atingido. Tente novamente mais tarde.',
      retryable: true,
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('', { status: 503 }));
    await expect(searchCities('Viamão')).rejects.toMatchObject({
      message: 'O serviço de previsão está indisponível.',
    });
  });

  it('trata falhas de rede e JSON inválido', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('offline'));
    await expect(searchCities('Carazinho')).rejects.toMatchObject({
      message: 'Não foi possível conectar à previsão do tempo.',
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('not-json', { status: 200, headers: { 'content-type': 'application/json' } }),
    );
    await expect(searchCities('Viamão')).rejects.toMatchObject({
      message: 'A resposta do serviço está incompleta.',
    });
  });

  it('converte um abortamento em erro de tempo limite', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
      new DOMException('The operation was aborted', 'AbortError'),
    );

    await expect(searchCities('Carazinho')).rejects.toMatchObject({
      message: 'A consulta demorou demais. Tente novamente.',
    });
  });

  it('mapeia o clima atual e exatamente cinco dias', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          current: {
            time: '2026-09-30T12:00',
            temperature_2m: 22,
            relative_humidity_2m: 67,
            precipitation: 0,
            weather_code: 2,
            wind_speed_10m: 12,
            surface_pressure: 1018,
          },
          daily: {
            time: ['1', '2', '3', '4', '5', '6'],
            temperature_2m_min: [1, 2, 3, 4, 5, 6],
            temperature_2m_max: [7, 8, 9, 10, 11, 12],
            relative_humidity_2m_mean: [60, 61, 62, 63, 64, 65],
            weather_code: [0, 1, 2, 3, 61, 80],
            precipitation_probability_max: [0, 10, null, 30, 40, 50],
          },
        }),
        { status: 200 },
      ),
    );

    const weather = await getWeather(city);

    expect(weather.city).toEqual(city);
    expect(weather.current.temperature).toBe(22);
    expect(weather.forecast).toHaveLength(5);
    expect(weather.forecast[0].humidity).toBe(60);
    expect(weather.forecast[2].precipitationProbability).toBeNull();
  });

  it('envia o fuso horário da cidade ao solicitar a previsão', async () => {
    const cityWithTimezone = { ...city, timezone: 'America/Sao_Paulo' };
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          current: {},
          daily: {
            time: ['1', '2', '3', '4', '5'],
            temperature_2m_min: [1, 2, 3, 4, 5],
            temperature_2m_max: [6, 7, 8, 9, 10],
            relative_humidity_2m_mean: [60, 61, 62, 63, 64],
            weather_code: [0, 1, 2, 3, 4],
          },
        }),
        { status: 200 },
      ),
    );

    await getWeather(cityWithTimezone);

    expect(fetchMock.mock.calls[0][0]).toContain('timezone=America%2FSao_Paulo');
  });

  it('identifica a cidade pelas coordenadas no reverse geocoding', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          place_id: 99,
          address: {
            city: 'Viamão',
            state: 'Rio Grande do Sul',
            country: 'Brasil',
          },
        }),
        { status: 200 },
      ),
    );

    await expect(getLocationCity(-30.08, -51.02)).resolves.toMatchObject({
      id: 99,
      name: 'Viamão',
      admin1: 'Rio Grande do Sul',
      country: 'Brasil',
    });
  });

  it('transforma uma resposta sem current em erro tipado', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ daily: {} }), { status: 200 }),
    );

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('transforma uma previsão com séries incompletas em erro tipado', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          current: {},
          daily: { time: ['1'], temperature_2m_min: [1], temperature_2m_max: [2] },
        }),
        { status: 200 },
      ),
    );

    await expect(getWeather(city)).rejects.toMatchObject({
      message: 'A previsão recebida está incompleta.',
      retryable: false,
    });
  });

  it('preserva cinco dias quando métricas diárias estão ausentes', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          current: {},
          daily: { time: ['1', '2', '3', '4', '5'] },
        }),
        { status: 200 },
      ),
    );

    const weather = await getWeather(city);

    expect(weather.forecast).toHaveLength(5);
    expect(weather.forecast[0]).toMatchObject({
      min: null,
      max: null,
      humidity: null,
      weatherCode: null,
      precipitationProbability: null,
    });
  });

  it('usa valores padrão para campos atuais ausentes', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          current: {},
          daily: {
            time: ['1', '2', '3', '4', '5'],
            temperature_2m_min: [1, 2, 3, 4, 5],
            temperature_2m_max: [6, 7, 8, 9, 10],
            relative_humidity_2m_mean: [60, 61, 62, 63, 64],
            weather_code: [0, 1, 2, 3, 4],
          },
        }),
        { status: 200 },
      ),
    );

    const weather = await getWeather(city);
    expect(weather.current.temperature).toBeNull();
    expect(weather.current.time).toBeTruthy();
    expect(weather.current.precipitation).toBeNull();
    expect(weather.forecast[0].precipitationProbability).toBeNull();
  });
});
