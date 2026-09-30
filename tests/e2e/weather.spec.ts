import { expect, type Page, test } from '@playwright/test';

const city = {
  id: 42,
  name: 'Viamão',
  country: 'Brasil',
  admin1: 'Rio Grande do Sul',
  latitude: -30.08,
  longitude: -51.02,
};

const otherCity = {
  ...city,
  id: 43,
  name: 'São Paulo',
  admin1: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
};

const carazinho = {
  ...city,
  id: 44,
  name: 'Carazinho',
  admin1: 'Rio Grande do Sul',
};

const forecast = {
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
    time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
    temperature_2m_min: [17, 16, 18, 19, 20],
    temperature_2m_max: [24, 25, 27, 28, 26],
    relative_humidity_2m_mean: [67, 72, 64, 58, 70],
    weather_code: [2, 61, 3, 0, 80],
    precipitation_probability_max: [20, 70, 30, 10, 60],
  },
};

async function mockWeatherApi(page: Page) {
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({ json: { results: [city] } });
  });
  await page.route('**/api.open-meteo.com/v1/forecast**', async (route) => {
    await route.fulfill({ json: forecast });
  });
}

test.describe('fluxos do Weather App', () => {
  test('busca uma cidade, exibe previsão e alterna a unidade', async ({ page }) => {
    await mockWeatherApi(page);
    await page.goto('/');

    await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Viamão');
    await page.getByRole('search').press('Enter');
    await expect(page.getByRole('heading', { name: 'Escolha uma cidade' })).toBeVisible();

    await page.getByRole('button', { name: /Viamão/ }).click();
    await expect(page.getByRole('heading', { name: 'Viamão' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Próximos 5 dias' })).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(5);

    await page.getByRole('button', { name: '°F' }).click();
    await expect(page.getByText('72°')).toBeVisible();
    await expect(page.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('exibe estado vazio para cidade sem resultados', async ({ page }) => {
    await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
      await route.fulfill({ json: { results: [] } });
    });
    await page.goto('/');

    await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Cidade X');
    await page.getByRole('search').press('Enter');

    await expect(page.getByText('Nenhuma cidade encontrada. Tente outra busca.')).toBeVisible();
  });

  test('permite tentar novamente depois de uma falha de busca', async ({ page }) => {
    let attempts = 0;
    await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
      attempts += 1;
      if (attempts === 1) {
        await route.fulfill({ status: 503, json: { reason: 'unavailable' } });
        return;
      }
      await route.fulfill({ json: { results: [city] } });
    });
    await page.goto('/');

    await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Viamão');
    await page.getByRole('search').press('Enter');
    await expect(page.getByRole('alert')).toContainText('indisponível');

    await page.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(page.getByRole('heading', { name: 'Escolha uma cidade' })).toBeVisible();
    expect(attempts).toBe(2);
  });

  test('mantém a busca e a previsão utilizáveis em viewport móvel', async ({ page }) => {
    await mockWeatherApi(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    await expect(page.getByRole('searchbox', { name: 'Buscar cidade' })).toBeVisible();
    await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Viamão');
    await page.getByRole('search').press('Enter');
    await page.getByRole('button', { name: /Viamão/ }).click();

    await expect(page.getByRole('heading', { name: 'Viamão' })).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(5);
    expect(
      await page.locator('body').evaluate((element) => element.scrollWidth),
    ).toBeLessThanOrEqual(375);
  });

  test('preserva diacríticos e move o foco para o primeiro resultado', async ({ page }) => {
    await mockWeatherApi(page);
    await page.goto('/');

    const search = page.getByRole('searchbox', { name: 'Buscar cidade' });
    await search.fill('São José');
    await search.press('Enter');

    const result = page.getByRole('button', { name: /Viamão/ });
    await expect(result).toBeFocused();
  });

  test('permite distinguir cidades homônimas pela subdivisão', async ({ page }) => {
    const homonymousCity = {
      ...otherCity,
      admin1: 'Minas Gerais',
    };
    await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
      await route.fulfill({ json: { results: [otherCity, homonymousCity] } });
    });
    await page.route('**/api.open-meteo.com/v1/forecast**', async (route) => {
      await route.fulfill({ json: forecast });
    });
    await page.goto('/');

    await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('São Paulo');
    await page.getByRole('search').press('Enter');

    const results = page.getByRole('button', { name: /São Paulo/ });
    await expect(results).toHaveCount(2);
    await expect(page.getByText('Minas Gerais')).toBeVisible();
    await expect(page.getByText('São Paulo', { exact: true })).toHaveCount(2);
  });

  test('substitui o resultado ao pesquisar uma segunda cidade', async ({ page }) => {
    await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
      const query = new URL(route.request().url()).searchParams.get('name');
      await route.fulfill({ json: { results: [query === 'Viamão' ? city : carazinho] } });
    });
    await page.route('**/api.open-meteo.com/v1/forecast**', async (route) => {
      await route.fulfill({ json: forecast });
    });
    await page.goto('/');

    const search = page.getByRole('searchbox', { name: 'Buscar cidade' });
    await search.fill('Carazinho');
    await search.press('Enter');
    await page.getByRole('button', { name: /Carazinho/ }).click();
    await expect(page.getByRole('heading', { name: 'Carazinho' })).toBeVisible();

    await search.fill('Viamão');
    await search.press('Enter');
    await page.getByRole('button', { name: /Viamão/ }).click();

    await expect(page.getByRole('heading', { name: 'Viamão' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Carazinho' })).not.toBeVisible();
  });

  test('marca o carregamento e exibe probabilidade nula como —', async ({ page }) => {
    let resolveGeocoding: ((value: { results: (typeof city)[] }) => void) | undefined;
    await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
      const response = await new Promise<{ results: (typeof city)[] }>((resolve) => {
        resolveGeocoding = resolve;
      });
      await route.fulfill({ json: response });
    });
    await page.route('**/api.open-meteo.com/v1/forecast**', async (route) => {
      await route.fulfill({
        json: {
          ...forecast,
          daily: { ...forecast.daily, precipitation_probability_max: [null, 10, 20, 30, 40] },
        },
      });
    });
    await page.goto('/');

    await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Viamão');
    await page.getByRole('search').press('Enter');
    await expect(page.getByRole('region', { name: 'Resultados meteorológicos' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    await expect(page.getByRole('button', { name: 'Buscar' })).toBeDisabled();

    resolveGeocoding?.({ results: [city] });
    await page.getByRole('button', { name: /Viamão/ }).click();
    await expect(page.getByText('—', { exact: true }).first()).toBeVisible();
  });

  test('seleciona a cidade inicial quando a geolocalização é autorizada', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['geolocation'], { origin: 'http://localhost:5173' });
    await context.setGeolocation({ latitude: city.latitude, longitude: city.longitude });
    await page.route('**/nominatim.openstreetmap.org/reverse**', async (route) => {
      await route.fulfill({
        json: {
          place_id: city.id,
          address: {
            city: city.name,
            state: city.admin1,
            country: city.country,
          },
        },
      });
    });
    await page.route('**/api.open-meteo.com/v1/forecast**', async (route) => {
      await route.fulfill({ json: forecast });
    });
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Viamão' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Próximos 5 dias' })).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(5);
  });

  test('mantém a busca manual quando a geolocalização é negada', async ({ page, context }) => {
    await context.grantPermissions([], { origin: 'http://localhost:5173' });
    await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
      await route.fulfill({ json: { results: [city] } });
    });
    await page.route('**/api.open-meteo.com/v1/forecast**', async (route) => {
      await route.fulfill({ json: forecast });
    });
    await page.goto('/');

    await expect(page.getByText('Busque uma cidade para ver a previsão do tempo.')).toBeVisible();
    await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Viamão');
    await page.getByRole('search').press('Enter');
    await page.getByRole('button', { name: /Viamão/ }).click();

    await expect(page.getByRole('heading', { name: 'Viamão' })).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(5);
  });
});
