# Plano técnico — Weather App

## 1. Visão geral da arquitetura (Architecture Overview)

A aplicação será uma SPA React com uma separação simples entre apresentação,
orquestração de estado, acesso à rede e funções puras. O fluxo principal será:

```text
Pessoa usuária
    ↓
App e componentes de interface
    ↓ eventos e ações
Hook de clima (estado e orquestração)
    ↓
Serviços de geocodificação e previsão
    ↓ HTTP
Open-Meteo
    ↓ resposta externa
Normalização e validação dos dados
    ↓
Modelo interno de clima → componentes de apresentação
```

### Camadas

- **Apresentação:** formulário de busca, resultados de cidades, clima atual,
  previsão diária, seletor de unidade, estados de carregamento/vazio/erro e
  atribuição da Open-Meteo.
- **Orquestração:** hook `useWeather` ou equivalente, responsável por
  coordenar busca, seleção de cidade, carregamento da previsão, nova tentativa
  e preferências.
- **Serviços:** funções isoladas para geocodificação e previsão. Componentes
  não conhecerão URLs nem detalhes da resposta externa.
- **Domínio:** tipos compartilhados, conversão Celsius/Fahrenheit, formatação
  regional, mapeamento dos códigos meteorológicos e validações puras.

Essa divisão atende RF1–RF12, especialmente a separação entre busca, seleção
de localidade, dados meteorológicos e estados da interface. Também facilita
testar conversão, formatação e normalização sem rede.

## 2. Tecnologias e justificativas (Tech Stack)

| Tecnologia | Uso | Justificativa |
| --- | --- | --- |
| TypeScript strict | Tipos e contratos | Reduz erros entre respostas da API, serviços e componentes. |
| React | Interface e composição | Stack definida pelo projeto e adequada aos fluxos interativos. |
| Vite | Desenvolvimento e compilação | Configuração simples e compatível com o projeto existente. |
| Tailwind CSS | Estilos responsivos | Atende ao padrão visual do projeto e facilita o suporte a partir de 320 px. |
| Open-Meteo | Geocodificação e meteorologia | Fonte definida no discovery, sem chave no uso não comercial previsto. |
| `Intl` do navegador | Idioma, datas e números | Usa as preferências regionais do sistema para atender RF9. |
| `localStorage` | Preferências locais | Atende RF6 sem conta ou sincronização entre dispositivos. |
| Vitest + Testing Library | Testes unitários e de componentes | Cobrem funções puras, estados e acessibilidade básica. |
| Playwright | Testes de fluxo | Valida busca, seleção, unidade, responsividade e estados de erro. |
| Biome | Verificação e formatação | Ferramenta definida pelo projeto para qualidade do código. |
| pnpm | Gerenciamento de pacotes | Gerenciador definido pelo projeto. |

Não será introduzida uma biblioteca global de estado ou uma camada de cache
complexa. O estado da aplicação é pequeno e pertence ao fluxo principal de
clima.

## 3. Estrutura do projeto (Project Structure)

```text
src/
├── components/
│   ├── SearchForm.tsx
│   ├── CityResults.tsx
│   ├── CurrentWeather.tsx
│   ├── ForecastList.tsx
│   ├── UnitSelector.tsx
│   ├── SettingsActions.tsx
│   ├── Attribution.tsx
│   └── states/
│       ├── LoadingState.tsx
│       ├── EmptyState.tsx
│       └── ErrorState.tsx
├── hooks/
│   ├── useWeather.ts
│   ├── useGeolocation.ts
│   └── usePreferences.ts
├── services/
│   ├── geocodingService.ts
│   ├── forecastService.ts
│   └── openMeteoClient.ts
├── lib/
│   ├── temperature.ts
│   ├── formatting.ts
│   ├── weatherCodes.ts
│   └── validation.ts
├── types/
│   ├── weather.ts
│   ├── location.ts
│   └── api.ts
├── styles/
│   └── globals.css
├── App.tsx
└── main.tsx
```

Responsabilidades:

- `components/`: renderização e eventos de interface; um componente por arquivo.
- `hooks/`: ciclo de vida e coordenação de estado reutilizável.
- `services/`: chamadas HTTP, parâmetros da Open-Meteo e conversão da resposta
  externa para o modelo interno.
- `lib/`: funções puras sem dependência de React ou rede.
- `types/`: contratos compartilhados entre camadas.
- `states/`: estados visuais explícitos exigidos por RF12.

## 4. Modelo de dados (Data Model)

Os nomes abaixo são contratos de domínio; a resposta da Open-Meteo não deve ser
exposta diretamente aos componentes.

```ts
type TemperatureUnit = 'celsius' | 'fahrenheit'

interface City {
  id: number
  name: string
  latitude: number
  longitude: number
  country: string
  countryCode?: string
  administrativeArea?: string
  timezone: string
}

interface CurrentWeather {
  observedAt: string
  temperatureCelsius: number | null
  relativeHumidity: number | null
  precipitationMillimeters: number | null
  weatherCode: number | null
  windSpeedKmh: number | null
  surfacePressureHpa: number | null
}

interface ForecastDay {
  date: string
  weatherCode: number | null
  minimumTemperatureCelsius: number | null
  maximumTemperatureCelsius: number | null
  averageRelativeHumidity: number | null
  precipitationMillimeters: number | null
}

interface WeatherReport {
  city: City
  current: CurrentWeather
  days: ForecastDay[]
  timezone: string
  fetchedAt: string
}

interface Preferences {
  temperatureUnit: TemperatureUnit
}

interface SearchState {
  query: string
  results: City[]
  status: 'idle' | 'loading' | 'success' | 'empty' | 'error'
  error?: WeatherError
}

type WeatherErrorCode =
  | 'invalid_query'
  | 'network'
  | 'timeout'
  | 'rate_limit'
  | 'unavailable'
  | 'invalid_response'

interface WeatherError {
  code: WeatherErrorCode
  message: string
  retryable: boolean
}
```

### Decisões de dados

- A unidade canônica interna será Celsius; Fahrenheit será calculado apenas na
  apresentação, evitando nova consulta ao alternar RF4/RF5.
- Precipitação será mantida em milímetros.
- Vento será normalizado em km/h e pressão em hPa para a interface do v1.
- Campos ausentes serão representados por `null` e exibidos como `—`, conforme
  RF12.
- Os códigos meteorológicos serão convertidos em descrições e rótulos locais
  por `weatherCodes.ts`.
- Datas e números serão formatados com `Intl` usando o idioma do sistema; o
  agrupamento dos dias usará o fuso horário de `City.timezone`.
- A decisão final sobre casas decimais será: temperatura com uma casa decimal,
  vento com uma casa decimal, pressão sem casas decimais e precipitação com uma
  casa decimal, removendo zeros desnecessários quando a apresentação permitir.

## 5. Fluxo de dados (Data Flow)

### Busca manual

1. `SearchForm` mantém o texto digitado e aceita submissão somente por Enter.
2. O hook valida o mínimo de cinco caracteres. Consultas menores permanecem
   locais e produzem orientação, sem chamada de rede.
3. `geocodingService` envia a consulta para a Open-Meteo e normaliza resultados
   para `City`.
4. `CityResults` apresenta nome, subdivisão e país para desambiguação.
5. A seleção de uma cidade atualiza a cidade ativa e inicia a consulta de
   previsão.

### Localização inicial

1. Na primeira visita, `useGeolocation` solicita a permissão do navegador.
2. Com coordenadas disponíveis, o serviço de geocodificação resolve a
   localidade mais próxima e a define como cidade inicial.
3. Em caso de recusa, erro ou indisponibilidade, a aplicação permanece no
   estado inicial com busca manual disponível.

### Previsão

1. `forecastService` recebe latitude, longitude e fuso horário da cidade.
2. O serviço solicita dados atuais e cinco dias de dados diários.
3. A resposta é validada e transformada em `WeatherReport`.
4. `useWeather` publica o estado de carregamento, sucesso, vazio ou erro.
5. Os componentes renderizam o relatório usando a unidade selecionada nas
   preferências.

## 6. APIs externas (External APIs)

### 6.1 Geocodificação

**Endpoint:**

```text
GET https://geocoding-api.open-meteo.com/v1/search
```

Parâmetros planejados:

| Parâmetro | Valor |
| --- | --- |
| `name` | Texto da consulta, preservando diacríticos |
| `count` | Limite pequeno de resultados, como `10` |
| `language` | Idioma principal informado pelo navegador |
| `format` | `json` |

O resultado será filtrado e normalizado para `City`. Resultados devem conter
coordenadas, nome, país e, quando disponível, subdivisão administrativa e fuso
horário.

### 6.2 Previsão

**Endpoint:**

```text
GET https://api.open-meteo.com/v1/forecast
```

Parâmetros planejados:

```text
latitude={latitude}
longitude={longitude}
current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,surface_pressure
daily=weather_code,temperature_2m_min,temperature_2m_max,relative_humidity_2m_mean,precipitation_sum
temperature_unit=celsius
wind_speed_unit=kmh
precipitation_unit=mm
timezone={cityTimezone}
forecast_days=5
```

O contrato final dos nomes e da disponibilidade dos campos deve ser confirmado
na documentação da Open-Meteo durante a implementação do serviço. Se um campo
não vier na resposta, ele será `null`, sem invalidar os demais dados.

### 6.3 Atribuição e limites

- A interface deve exibir atribuição à Open-Meteo e à licença CC BY 4.0 em uma
  área visível, preferencialmente no rodapé da aplicação.
- O uso deve permanecer não comercial e dentro do limite informado de 10.000
  chamadas diárias.
- Erros de limite ou indisponibilidade serão convertidos para
  `WeatherErrorCode` e apresentados com nova tentativa quando apropriado.

## 7. Gerenciamento de estado (State Management)

O estado será local ao `App` e aos hooks, sem biblioteca global.

### Estado persistente

`usePreferences` gerencia `Preferences` e salva apenas a unidade de temperatura
no navegador. O padrão é Celsius. A redefinição restaura Celsius e não remove a
cidade ativa, conforme RF6.

### Estado de sessão

`useWeather` mantém:

- consulta atual e resultados de geocodificação;
- cidade ativa;
- relatório meteorológico;
- estado de carregamento, sucesso, vazio ou erro;
- última operação repetível;
- unidade selecionada recebida de `usePreferences`.

`useGeolocation` mantém apenas o estado da tentativa de localização e não deve
bloquear a busca manual.

## 8. Estratégia de tratamento de erros (Error Handling Strategy)

| Situação | Estado visual | Ação |
| --- | --- | --- |
| Consulta vazia ou curta | Orientação junto ao campo | Corrigir a consulta |
| Busca em andamento | Carregamento | Aguardar ou substituir a consulta |
| Busca sem resultados | Estado vazio | Fazer nova busca |
| Previsão em andamento | Carregamento no conteúdo meteorológico | Aguardar |
| Falha de rede | Erro compreensível | Tentar novamente |
| Tempo limite | Erro específico de tempo limite | Tentar novamente |
| Limite de chamadas | Indisponibilidade temporária | Tentar mais tarde |
| Resposta incompleta | Conteúdo disponível e `—` nos campos ausentes | Continuar usando |
| Localização recusada | Estado inicial normal | Buscar cidade manualmente |

Regras de implementação:

- Toda operação de rede terá tempo limite de 10 segundos.
- A ação de nova tentativa repetirá somente a operação que falhou.
- Uma resposta antiga não poderá substituir dados de uma seleção mais recente.
- Mensagens técnicas detalhadas ficarão fora da interface; a pessoa usuária
  receberá mensagens acionáveis e compreensíveis.
- Falhas inesperadas serão normalizadas como indisponibilidade, sem lançar
  erro que desmonte a interface.

## 9. Estratégia de testes (Testing Strategy)

### Testes unitários

Com Vitest, testar:

- conversão Celsius/Fahrenheit e arredondamento;
- formatação de datas, números e unidades por localidade;
- mapeamento dos códigos meteorológicos;
- validação do mínimo de cinco caracteres;
- normalização de cidades e respostas meteorológicas;
- tratamento de campos ausentes;
- classificação de erros de rede, tempo limite, limite e resposta inválida;
- persistência e redefinição das preferências.

### Testes de componentes

Com Testing Library, testar:

- submissão por Enter e ausência de chamada para consulta curta;
- apresentação e seleção de resultados homônimos;
- exibição do clima atual e de exatamente cinco dias;
- alternância de unidade sem nova consulta;
- estados de carregamento, vazio, erro e nova tentativa;
- navegação por teclado, nomes acessíveis e foco visível;
- atribuição da fonte na interface.

### Testes E2E

Com Playwright e respostas de rede controladas, testar:

- fluxo de busca, seleção de cidade e previsão de cinco dias;
- cidade inexistente e ausência de resultados;
- cidade com diacríticos e resultados homônimos;
- recusa da localização com continuidade pela busca manual;
- alternância e persistência de Celsius/Fahrenheit;
- falha de rede, tempo limite, resposta parcial e nova tentativa;
- viewport móvel a partir de 320 px e viewport de computador;
- datas calculadas pelo fuso da cidade simulada.

Os testes de rede devem usar dados fixos e não depender da disponibilidade da
Open-Meteo durante o CI. Um teste de contrato separado pode verificar a forma
da resposta real sem tornar a suíte principal dependente da API externa.

## 10. Riscos e compensações (Risks & Trade-offs)

| Decisão | Benefício | Custo ou risco | Mitigação |
| --- | --- | --- | --- |
| Estado local em hooks | Simplicidade e baixo acoplamento | Pode crescer se o escopo aumentar | Introduzir biblioteca global somente se surgir estado compartilhado real. |
| Normalização no serviço | Componentes independentes da API | Exige manutenção quando o contrato externo mudar | Testes de normalização e tipos da resposta externa. |
| Celsius como unidade interna | Conversão consistente e sem nova chamada | Exige formatação na apresentação | Funções puras cobertas por testes. |
| Fuso da cidade consultada | “Hoje” corresponde à localidade vista | Requer preservar o fuso retornado pela geocodificação | Testes com cidades em fusos diferentes. |
| Localização opcional na primeira visita | Personaliza a entrada sem bloquear o uso | Permissão pode ser recusada ou imprecisa | Busca manual sempre disponível. |
| Open-Meteo sem chave | Configuração simples e deploy estático | Limite e disponibilidade dependem do serviço | Monitorar chamadas, tratar limite e respeitar atribuição. |
| Sem cache complexo no v1 | Menor complexidade e comportamento previsível | Repetição de consultas pode consumir cota | Evitar chamadas na troca de unidade e manter apenas o estado da sessão. |
| Cobertura de acessibilidade básica | Atende os fluxos principais | Não substitui auditoria completa | Manter teclado, foco, nomes acessíveis e contraste verificáveis. |

## 11. Rastreabilidade para a especificação

| Decisão do plano | Requisitos atendidos |
| --- | --- |
| Formulário com Enter e validação local | RF1, RF8, US1 |
| Serviços separados para geocodificação e previsão | RF1, RF2, RF3, RF7, RF11 |
| Modelo interno normalizado | RF2, RF3, RF5, RF12 |
| Celsius interno e conversão na apresentação | RF4, RF5, RF6, US3 |
| Preferência local de unidade | RF6 |
| `Intl` e fuso da cidade | RF9, RNF de localização |
| Geolocalização não bloqueante | RF10, US6 |
| Estados explícitos e erros normalizados | RF12, US5, RNF de resiliência |
| Componentes responsivos e acessíveis | US4, RNF de responsividade e acessibilidade |
| Atribuição e controle de chamadas | RNF de dados e licença |