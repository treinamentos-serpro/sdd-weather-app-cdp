import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../../src/App';

describe('Weather App com dados demonstrativos', () => {
  it('exibe clima atual e cinco dias de previsão', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Próximos 5 dias' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
  });

  it('converte a temperatura ao alternar para Fahrenheit', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '°F' }));

    expect(screen.getByText('72°')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('exibe o estado vazio após uma busca', () => {
    render(<App />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cidade' }), {
      target: { value: 'Curitiba' },
    });
    fireEvent.submit(screen.getByRole('search'));

    expect(screen.getByText('Busque uma cidade para ver a previsão do tempo.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'São Paulo' })).not.toBeInTheDocument();
  });
});
