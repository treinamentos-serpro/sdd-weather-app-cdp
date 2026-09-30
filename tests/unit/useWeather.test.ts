import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MOCK_WEATHER } from '../../src/data/mockWeather';
import { useWeather } from '../../src/hooks/useWeather';
import type { City } from '../../src/types/weather';

const { getLocationCityMock, getWeatherMock, searchCitiesMock, WeatherServiceErrorMock } =
  vi.hoisted(() => {
    class MockWeatherServiceError extends Error {
      retryable: boolean;

      constructor(message: string, retryable = true) {
        super(message);
        this.name = 'WeatherServiceError';
        this.retryable = retryable;
      }
    }

    return {
      getLocationCityMock: vi.fn(),
      getWeatherMock: vi.fn(),
      searchCitiesMock: vi.fn(),
      WeatherServiceErrorMock: MockWeatherServiceError,
    };
  });

vi.mock('../../src/services/weatherService', () => ({
  getLocationCity: getLocationCityMock,
  getWeather: getWeatherMock,
  searchCities: searchCitiesMock,
  WeatherServiceError: WeatherServiceErrorMock,
}));

const city: City = MOCK_WEATHER.city;

describe('useWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getWeatherMock.mockResolvedValue(MOCK_WEATHER);
    searchCitiesMock.mockResolvedValue([city]);
  });

  it('orquestra localização autorizada até o forecast', async () => {
    getLocationCityMock.mockResolvedValue(city);
    const { result } = renderHook(() => useWeather());

    act(() => {
      void result.current.loadLocation(-23.55, -46.63);
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(getLocationCityMock).toHaveBeenCalledWith(-23.55, -46.63);
    expect(getWeatherMock).toHaveBeenCalledWith(city);
    expect(result.current.data?.city).toEqual(city);
  });

  it('mantém a busca manual disponível quando a localização falha', async () => {
    getLocationCityMock.mockRejectedValue(
      new WeatherServiceErrorMock('Não foi possível identificar sua cidade.', false),
    );
    const { result } = renderHook(() => useWeather());

    act(() => {
      void result.current.loadLocation(-23.55, -46.63);
    });

    await waitFor(() =>
      expect(result.current.error).toBe('Não foi possível identificar sua cidade.'),
    );
    expect(result.current.status).toBe('idle');
    expect(result.current.retryable).toBe(false);
  });

  it('mantém a busca manual quando a localização resolve depois dela', async () => {
    let resolveLocation: (value: City) => void = () => undefined;
    getLocationCityMock.mockImplementation(
      () =>
        new Promise<City>((resolve) => {
          resolveLocation = resolve;
        }),
    );
    const { result } = renderHook(() => useWeather());

    act(() => {
      void result.current.loadLocation(-23.55, -46.63);
      result.current.searchCities('Carazinho');
    });
    await waitFor(() => expect(result.current.status).toBe('success'));

    act(() => resolveLocation(city));
    await Promise.resolve();

    expect(result.current.cities).toEqual([city]);
    expect(getWeatherMock).not.toHaveBeenCalled();
  });

  it('mantém a busca manual quando a localização rejeita depois dela', async () => {
    let rejectLocation: (reason?: unknown) => void = () => undefined;
    getLocationCityMock.mockImplementation(
      () =>
        new Promise<City>((_resolve, reject) => {
          rejectLocation = reject;
        }),
    );
    const { result } = renderHook(() => useWeather());

    act(() => {
      void result.current.loadLocation(-23.55, -46.63);
      result.current.searchCities('Carazinho');
    });
    await waitFor(() => expect(result.current.status).toBe('success'));

    act(() => rejectLocation(new Error('localização indisponível')));
    await Promise.resolve();

    expect(result.current.status).toBe('success');
    expect(result.current.cities).toEqual([city]);
    expect(result.current.error).toBeNull();
  });
});
