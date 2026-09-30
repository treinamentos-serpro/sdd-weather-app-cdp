import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { MOCK_WEATHER } from '../../src/data/mockWeather';
import type { City } from '../../src/types/weather';

const { searchCitiesMock, getLocationCityMock, getWeatherMock, MockWeatherServiceError } =
  vi.hoisted(() => {
    class HoistedWeatherServiceError extends Error {
      retryable = true;

      constructor(message: string) {
        super(message);
        this.name = 'WeatherServiceError';
      }
    }

    return {
      searchCitiesMock: vi.fn(),
      getLocationCityMock: vi.fn(),
      getWeatherMock: vi.fn(),
      MockWeatherServiceError: HoistedWeatherServiceError,
    };
  });

vi.mock('../../src/services/weatherService', () => ({
  searchCities: searchCitiesMock,
  getLocationCity: getLocationCityMock,
  getWeather: getWeatherMock,
  WeatherServiceError: MockWeatherServiceError,
}));

const city: City = MOCK_WEATHER.city;

describe('Weather App com dados da Open-Meteo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    searchCitiesMock.mockResolvedValue([city]);
    getWeatherMock.mockResolvedValue(MOCK_WEATHER);
  });

  it('começa em estado vazio sem fazer uma chamada de rede', () => {
    render(<App />);

    expect(screen.getByText('Busque uma cidade para ver a previsão do tempo.')).toBeInTheDocument();
    expect(searchCitiesMock).not.toHaveBeenCalled();
  });

  it('não dispara busca para uma consulta vazia', () => {
    render(<App />);

    fireEvent.submit(screen.getByRole('search'));

    expect(searchCitiesMock).not.toHaveBeenCalled();
    expect(screen.getByText('Busque uma cidade para ver a previsão do tempo.')).toBeInTheDocument();
  });

  it('orienta consultas com menos de cinco caracteres sem chamar o service', () => {
    render(<App />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cidade' }), {
      target: { value: 'Rio' },
    });
    fireEvent.submit(screen.getByRole('search'));

    expect(screen.getByRole('alert')).toHaveTextContent('pelo menos 5 caracteres');
    expect(searchCitiesMock).not.toHaveBeenCalled();
  });

  it('marca a região como ocupada e desabilita a busca durante o carregamento', async () => {
    let resolveSearch: (cities: City[]) => void = () => undefined;
    searchCitiesMock.mockImplementation(
      () =>
        new Promise<City[]>((resolve) => {
          resolveSearch = resolve;
        }),
    );
    render(<App />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cidade' }), {
      target: { value: 'Carazinho' },
    });
    fireEvent.submit(screen.getByRole('search'));

    expect(screen.getByRole('region', { name: 'Resultados meteorológicos' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();

    resolveSearch([city]);
    expect(await screen.findByRole('heading', { name: 'Escolha uma cidade' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buscar' })).not.toBeDisabled();
  });

  it('não deixa uma falha tardia de localização apagar uma busca manual', async () => {
    let resolveLocation: PositionCallback | undefined;
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) => {
          resolveLocation = success;
        },
      },
    });
    getLocationCityMock.mockRejectedValueOnce(
      new MockWeatherServiceError('Localização indisponível'),
    );
    render(<App />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cidade' }), {
      target: { value: 'Carazinho' },
    });
    fireEvent.submit(screen.getByRole('search'));
    expect(await screen.findByRole('heading', { name: 'Escolha uma cidade' })).toBeInTheDocument();

    resolveLocation?.({
      coords: { latitude: -30.08, longitude: -51.02 } as GeolocationCoordinates,
    } as GeolocationPosition);
    await Promise.resolve();

    expect(screen.getByRole('heading', { name: 'Escolha uma cidade' })).toBeInTheDocument();
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: undefined });
  });

  it('busca uma cidade, permite selecioná-la e exibe cinco dias', async () => {
    render(<App />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cidade' }), {
      target: { value: 'Curitiba' },
    });
    fireEvent.submit(screen.getByRole('search'));

    expect(await screen.findByRole('heading', { name: 'Escolha uma cidade' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /São Paulo/ })[0]).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: /São Paulo/ }));

    expect(await screen.findByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(getWeatherMock).toHaveBeenCalledWith(city);
  });

  it('distingue e seleciona resultados homônimos', async () => {
    const otherCity: City = {
      ...city,
      id: 2,
      name: city.name,
      admin1: 'Minas Gerais',
    };
    searchCitiesMock.mockResolvedValue([city, otherCity]);
    getWeatherMock.mockResolvedValue({ ...MOCK_WEATHER, city: otherCity });
    render(<App />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cidade' }), {
      target: { value: 'São Paulo' },
    });
    fireEvent.submit(screen.getByRole('search'));

    const homonymousButtons = await screen.findAllByRole('button', { name: /São Paulo/ });
    expect(homonymousButtons).toHaveLength(2);
    fireEvent.click(homonymousButtons[1]);

    expect(await screen.findByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    expect(getWeatherMock).toHaveBeenCalledWith(otherCity);
  });

  it('converte a temperatura ao alternar para Fahrenheit sem novo forecast', async () => {
    render(<App />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cidade' }), {
      target: { value: 'Curitiba' },
    });
    fireEvent.submit(screen.getByRole('search'));
    fireEvent.click(await screen.findByRole('button', { name: /São Paulo/ }));
    await screen.findByRole('heading', { name: 'São Paulo' });

    fireEvent.click(screen.getByRole('button', { name: '°F' }));

    expect(screen.getByText('72°')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
    expect(getWeatherMock).toHaveBeenCalledTimes(1);
  });

  it('exibe o estado vazio quando a busca não encontra cidades', async () => {
    searchCitiesMock.mockResolvedValue([]);
    render(<App />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cidade' }), {
      target: { value: 'Cidade X' },
    });
    fireEvent.submit(screen.getByRole('search'));

    await waitFor(() => {
      expect(screen.getByText('Nenhuma cidade encontrada. Tente outra busca.')).toBeInTheDocument();
    });
  });

  it('exibe erro e permite repetir uma busca que falhou', async () => {
    searchCitiesMock.mockRejectedValueOnce(new MockWeatherServiceError('Falha de conexão'));
    render(<App />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cidade' }), {
      target: { value: 'Carazinho' },
    });
    fireEvent.submit(screen.getByRole('search'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de conexão');
    searchCitiesMock.mockResolvedValueOnce([city]);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('heading', { name: 'Escolha uma cidade' })).toBeInTheDocument();
  });

  it('exibe erro quando o forecast falha', async () => {
    getWeatherMock.mockRejectedValueOnce(new MockWeatherServiceError('Forecast indisponível'));
    render(<App />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cidade' }), {
      target: { value: 'Carazinho' },
    });
    fireEvent.submit(screen.getByRole('search'));
    fireEvent.click(await screen.findByRole('button', { name: /São Paulo/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Forecast indisponível');
  });

  it('não oferece retry para uma resposta não repetível', async () => {
    const nonRetryableError = new MockWeatherServiceError('Resposta incompleta');
    nonRetryableError.retryable = false;
    getWeatherMock.mockRejectedValueOnce(nonRetryableError);
    render(<App />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cidade' }), {
      target: { value: 'Carazinho' },
    });
    fireEvent.submit(screen.getByRole('search'));
    fireEvent.click(await screen.findByRole('button', { name: /São Paulo/ }));

    await screen.findByRole('alert');
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument();
  });

  it('persiste e redefine a unidade de temperatura', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '°F' }));
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Redefinir unidade' }));
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'true');
    expect(JSON.parse(localStorage.getItem('weather-view-preferences') ?? '{}')).toEqual({
      temperatureUnit: 'celsius',
    });
  });

  it('exibe uma mensagem clara quando a consulta expira', async () => {
    getWeatherMock.mockRejectedValueOnce(
      new MockWeatherServiceError('A consulta demorou demais. Tente novamente.'),
    );
    render(<App />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cidade' }), {
      target: { value: 'Carazinho' },
    });
    fireEvent.submit(screen.getByRole('search'));
    fireEvent.click(await screen.findByRole('button', { name: /São Paulo/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'A consulta demorou demais. Tente novamente.',
    );
  });

  it('recupera a interface após retry do forecast', async () => {
    getWeatherMock.mockRejectedValueOnce(new MockWeatherServiceError('Falha temporária'));
    render(<App />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cidade' }), {
      target: { value: 'Carazinho' },
    });
    fireEvent.submit(screen.getByRole('search'));
    fireEvent.click(await screen.findByRole('button', { name: /São Paulo/ }));
    await screen.findByRole('alert');

    getWeatherMock.mockResolvedValueOnce(MOCK_WEATHER);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
  });

  it('substitui a cidade exibida quando uma nova busca é feita', async () => {
    const secondCity: City = {
      ...city,
      id: 2,
      name: 'Viamão',
      admin1: 'Rio Grande do Sul',
    };
    searchCitiesMock.mockResolvedValueOnce([city]).mockResolvedValueOnce([secondCity]);
    getWeatherMock.mockResolvedValueOnce(MOCK_WEATHER).mockResolvedValueOnce({
      ...MOCK_WEATHER,
      city: secondCity,
    });
    render(<App />);

    const search = screen.getByRole('searchbox', { name: 'Buscar cidade' });
    fireEvent.change(search, { target: { value: 'Carazinho' } });
    fireEvent.submit(screen.getByRole('search'));
    fireEvent.click(await screen.findByRole('button', { name: /São Paulo/ }));
    await screen.findByRole('heading', { name: 'São Paulo' });

    fireEvent.change(search, { target: { value: 'Viamão' } });
    fireEvent.submit(screen.getByRole('search'));
    fireEvent.click(await screen.findByRole('button', { name: /Viamão/ }));

    expect(await screen.findByRole('heading', { name: 'Viamão' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'São Paulo' })).not.toBeInTheDocument();
  });
});
