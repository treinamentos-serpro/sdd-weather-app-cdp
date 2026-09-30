import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { usePreferences } from '../../src/hooks/usePreferences';

describe('usePreferences', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('restaura a unidade salva e permite redefini-la', () => {
    const first = renderHook(() => usePreferences());
    act(() => first.result.current.setTemperatureUnit('fahrenheit'));
    first.unmount();

    const second = renderHook(() => usePreferences());
    expect(second.result.current.temperatureUnit).toBe('fahrenheit');

    act(() => second.result.current.resetPreferences());
    expect(second.result.current.temperatureUnit).toBe('celsius');
  });
});
