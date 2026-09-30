import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import EmptyState from '../../src/components/states/EmptyState';
import LoadingState from '../../src/components/states/LoadingState';

describe('estados acessíveis', () => {
  it('anuncia vazio como status', () => {
    render(<EmptyState />);

    expect(screen.getByRole('status')).toHaveTextContent('Busque uma cidade');
  });

  it('anuncia carregamento como status', () => {
    render(<LoadingState />);

    expect(screen.getByRole('status', { name: 'Carregando previsão' })).toBeInTheDocument();
  });
});
