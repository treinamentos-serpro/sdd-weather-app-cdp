import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import { MOCK_WEATHER } from '../../src/data/mockWeather';

describe('CurrentWeather', () => {
  it('renderiza — para todas as leituras atuais ausentes', () => {
    render(
      <CurrentWeather
        unit="celsius"
        weather={{
          ...MOCK_WEATHER,
          current: {
            ...MOCK_WEATHER.current,
            temperature: null,
            humidity: null,
            windSpeed: null,
            pressure: null,
            precipitation: null,
            weatherCode: null,
          },
        }}
      />,
    );

    expect(screen.getAllByText('—')).toHaveLength(6);
    expect(screen.getByText('Condição indisponível')).toBeInTheDocument();
  });
});
