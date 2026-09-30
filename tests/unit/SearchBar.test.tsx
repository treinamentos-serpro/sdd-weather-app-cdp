import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

describe('SearchBar', () => {
  it('não envia uma consulta formada apenas por espaços', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cidade' }), {
      target: { value: '   ' },
    });
    fireEvent.submit(screen.getByRole('search'));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('envia a consulta ao pressionar Enter pelo teclado', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('searchbox', { name: 'Buscar cidade' });
    await user.click(input);
    await user.type(input, 'Viamão');
    await user.keyboard('{Enter}');

    expect(onSearch).toHaveBeenCalledWith('Viamão');
  });
});
