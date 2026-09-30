# Backlog de tarefas — Weather App

Este backlog deriva de [specs/weather-app-spec.md](../specs/weather-app-spec.md)
e [plans/weather-app-plan.md](../plans/weather-app-plan.md). As tarefas estão
ordenadas por dependência e cada uma representa uma unidade implementável e
testável.

## Entrega 1 — Fundação e contratos

### T-01 — Definir os tipos de domínio e estados da aplicação

- **Tipo:** Data
- **Descrição:** Criar os contratos para cidade, clima atual, dia da previsão,
  relatório meteorológico, preferências, estados de busca e erros normalizados.
- **Requisitos:** RF1, RF2, RF3, RF6, RF12.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/types/location.ts`, `src/types/weather.ts`,
  `src/types/api.ts`.
- **Critérios de aceite:**
  - Os tipos `City`, `CurrentWeather`, `ForecastDay`, `WeatherReport`,
    `Preferences` e `WeatherError` existem.
  - Temperaturas internas são representadas em Celsius e precipitação em
    milímetros.
  - Campos meteorológicos ausentes aceitam `null`.
  - Estados de busca distinguem inatividade, carregamento, sucesso, vazio e
    erro.

### T-02 — Implementar conversão de temperatura e códigos meteorológicos

- **Tipo:** Data
- **Descrição:** Criar funções puras para converter Celsius/Fahrenheit e
  transformar códigos meteorológicos em descrições e rótulos acessíveis.
- **Requisitos:** RF2, RF3, RF4, RF5.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`, `src/lib/weatherCodes.ts`.
- **Critérios de aceite:**
  - A conversão entre Celsius e Fahrenheit é determinística.
  - A unidade interna permanece Celsius.
  - Códigos meteorológicos conhecidos produzem descrições em português.
  - Código desconhecido produz uma descrição neutra sem lançar exceção.

### T-03 — Implementar formatação regional e validação de consultas

- **Tipo:** Data
- **Descrição:** Centralizar formatação com `Intl` e validação do mínimo de
  cinco caracteres, preservando diacríticos.
- **Requisitos:** RF1, RF8, RF9, RNF de localização.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/formatting.ts`, `src/lib/validation.ts`.
- **Critérios de aceite:**
  - Consultas com menos de cinco caracteres são rejeitadas sem normalizar ou
    remover diacríticos.
  - Consultas com cinco ou mais caracteres são aceitas.
  - Datas e números usam o idioma e a região recebidos pelo formatador.
  - O fuso horário informado da cidade pode ser usado na formatação da data.

### T-04 — Criar o cliente HTTP com tempo limite e erros normalizados

- **Tipo:** Data
- **Descrição:** Criar um cliente de rede compartilhado para requisições GET,
  cancelamento após 10 segundos e classificação de falhas.
- **Requisitos:** RF12, RNF de desempenho, RNF de resiliência.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/openMeteoClient.ts`.
- **Critérios de aceite:**
  - Uma requisição sem resposta é cancelada após 10 segundos.
  - Falha de rede, tempo limite, limite de chamadas e resposta inválida geram
    códigos de erro distintos.
  - O cliente não expõe detalhes de implementação HTTP aos componentes.
  - Respostas HTTP não bem-sucedidas não são tratadas como dados válidos.

## Entrega 2 — Integração com a Open-Meteo

### T-05 — Implementar o serviço de geocodificação

- **Tipo:** Data
- **Descrição:** Consultar a API de geocodificação, enviar o idioma do
  navegador e normalizar resultados para `City`.
- **Requisitos:** RF1, RF7, RF8, RF11.
- **Dependências:** T-01, T-03, T-04.
- **Arquivos prováveis:** `src/services/geocodingService.ts`.
- **Critérios de aceite:**
  - O serviço envia a consulta somente após receber uma entrada válida.
  - A consulta preserva caracteres acentuados.
  - Cada resultado normalizado contém nome, coordenadas, país e, quando
    disponível, subdivisão administrativa e fuso horário.
  - Ausência de resultados retorna uma coleção vazia, sem lançar erro de
    aplicação.

### T-06 — Implementar o serviço de previsão meteorológica

- **Tipo:** Data
- **Descrição:** Consultar clima atual e cinco dias de previsão, usando o fuso
  horário da cidade, e normalizar a resposta para `WeatherReport`.
- **Requisitos:** RF2, RF3, RF7, RF9, RF12.
- **Dependências:** T-01, T-04, T-05.
- **Arquivos prováveis:** `src/services/forecastService.ts`.
- **Critérios de aceite:**
  - A requisição inclui dados atuais e exatamente cinco dias de dados diários.
  - A requisição usa Celsius, milímetros, km/h e hPa conforme o contrato do
    plano.
  - O relatório preserva o fuso horário e a localidade selecionada.
  - Campos ausentes são normalizados para `null` sem descartar a resposta
    inteira.
  - Uma resposta estruturalmente inválida produz erro normalizado.

### T-07 — Testar os serviços e os contratos da Open-Meteo

- **Tipo:** Test
- **Descrição:** Cobrir geocodificação, previsão, normalização, campos ausentes,
  resposta inválida, tempo limite e falhas de rede com respostas simuladas.
- **Requisitos:** RF1, RF2, RF3, RF7, RF8, RF11, RF12.
- **Dependências:** T-05, T-06.
- **Arquivos prováveis:** `tests/services/geocodingService.test.ts`,
  `tests/services/forecastService.test.ts`,
  `tests/services/openMeteoClient.test.ts`.
- **Critérios de aceite:**
  - Nenhum teste depende da disponibilidade real da Open-Meteo.
  - Existe cenário de cidade sem resultados e de cidades homônimas.
  - Existe cenário de resposta parcial e resposta inválida.
  - Existe cenário de falha de rede e tempo limite.
  - Os parâmetros enviados aos dois endpoints são verificados.

## Entrega 3 — Estado e preferências

### T-08 — Implementar persistência e redefinição de preferências

- **Tipo:** Data
- **Descrição:** Criar o hook de preferências para armazenar a unidade de
  temperatura e restaurar Celsius sem apagar a cidade ativa.
- **Requisitos:** RF4, RF5, RF6.
- **Dependências:** T-01, T-02.
- **Arquivos prováveis:** `src/hooks/usePreferences.ts`.
- **Critérios de aceite:**
  - A unidade inicial é Celsius quando não há preferência salva.
  - Uma unidade escolhida é restaurada ao reabrir a aplicação no mesmo
    navegador.
  - A redefinição volta para Celsius.
  - A redefinição não remove a cidade selecionada.

### T-09 — Orquestrar busca, seleção e previsão no hook de clima

- **Tipo:** Data
- **Descrição:** Criar o hook que coordena validação, geocodificação, seleção
  de cidade, previsão, carregamento, vazio, erro e nova tentativa.
- **Requisitos:** RF1, RF2, RF3, RF7, RF11, RF12.
- **Dependências:** T-03, T-05, T-06, T-08.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Critérios de aceite:**
  - Enter com consulta válida inicia a busca e expõe estado de carregamento.
  - Consulta curta não chama a rede e expõe orientação.
  - Selecionar uma cidade inicia a previsão correspondente.
  - Nova tentativa repete somente a operação que falhou.
  - Uma resposta antiga não substitui dados de uma seleção posterior.
  - Estados de sucesso, vazio e erro são distinguíveis pelo consumidor.

### T-10 — Implementar a solicitação de localização inicial

- **Tipo:** Data
- **Descrição:** Criar hook não bloqueante para solicitar localização na
  primeira visita e resolver a cidade inicial sem impedir a busca manual.
- **Requisitos:** RF10, RF7, US6.
- **Dependências:** T-05, T-09.
- **Arquivos prováveis:** `src/hooks/useGeolocation.ts`.
- **Critérios de aceite:**
  - A permissão é solicitada na primeira visita.
  - Coordenadas obtidas são usadas para selecionar uma localidade inicial.
  - Recusa, erro ou indisponibilidade não impede a busca manual.
  - A tentativa de localização não substitui uma seleção manual posterior.

### T-11 — Testar hooks e funções de domínio

- **Tipo:** Test
- **Descrição:** Testar preferências, redefinição, orquestração do clima e
  localização com serviços simulados.
- **Requisitos:** RF4, RF5, RF6, RF10, RF12.
- **Dependências:** T-08, T-09, T-10.
- **Arquivos prováveis:** `tests/hooks/usePreferences.test.ts`,
  `tests/hooks/useWeather.test.ts`, `tests/hooks/useGeolocation.test.ts`,
  `tests/lib/temperature.test.ts`, `tests/lib/validation.test.ts`.
- **Critérios de aceite:**
  - Preferências são restauradas e redefinidas conforme a spec.
  - A troca de unidade não dispara nova chamada de previsão.
  - Todos os estados do hook de clima são exercitados.
  - Localização concedida, recusada e indisponível são cobertas.
  - Conversão, arredondamento e validação têm testes determinísticos.

## Entrega 4 — Interface base e busca

### T-12 — Criar a estrutura visual responsiva da aplicação

- **Tipo:** UI
- **Descrição:** Criar a composição visual inicial, estilos globais e regiões
  semânticas para conteúdo, busca e mensagens.
- **Requisitos:** US4, RNF de responsividade, RNF de acessibilidade.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/App.tsx`, `src/styles/globals.css`.
- **Critérios de aceite:**
  - A estrutura funciona a partir de 320 px sem rolagem horizontal indevida.
  - Regiões principais têm estrutura semântica e foco visível.
  - A área de atribuição possui espaço reservado na composição.
  - O estado inicial pode ser exibido sem cidade selecionada.

### T-13 — Implementar o formulário de busca acessível

- **Tipo:** UI
- **Descrição:** Criar campo de busca e submissão por Enter, conectando o
  componente às ações fornecidas pelo hook.
- **Requisitos:** RF1, RF8, US1, RNF de acessibilidade.
- **Dependências:** T-03, T-09, T-12.
- **Arquivos prováveis:** `src/components/SearchForm.tsx`.
- **Critérios de aceite:**
  - O campo possui nome acessível e foco visível.
  - Pressionar Enter dispara a busca, sem depender de clique em botão.
  - Consultas curtas exibem orientação e não geram chamada.
  - O texto acentuado é preservado no valor submetido.

### T-14 — Implementar a lista de resultados de cidades

- **Tipo:** UI
- **Descrição:** Exibir resultados normalizados e permitir selecionar uma
  cidade com nome, subdivisão e país.
- **Requisitos:** RF7, RF11, US1, RF12.
- **Dependências:** T-09, T-12.
- **Arquivos prováveis:** `src/components/CityResults.tsx`.
- **Critérios de aceite:**
  - Resultados homônimos são visualmente distinguíveis.
  - Cada resultado pode ser selecionado por teclado e ponteiro.
  - Estado vazio não mostra previsão de uma cidade anterior como se fosse nova.
  - Seleção chama a ação de cidade ativa exatamente uma vez.

### T-15 — Criar os componentes de carregamento, vazio e erro

- **Tipo:** UI
- **Descrição:** Criar estados visuais reutilizáveis para carregamento, vazio,
  erro, tempo limite e nova tentativa.
- **Requisitos:** RF12, US5, RNF de resiliência.
- **Dependências:** T-12.
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`,
  `src/components/states/EmptyState.tsx`,
  `src/components/states/ErrorState.tsx`.
- **Critérios de aceite:**
  - Cada estado tem mensagem compreensível e papel semântico adequado.
  - O estado de erro mostra nova tentativa quando `retryable` for verdadeiro.
  - O estado de carregamento não deixa a interface aparentar travamento.
  - O estado vazio orienta a próxima ação da pessoa usuária.

### T-16 — Testar a interface de busca e seus estados

- **Tipo:** Test
- **Descrição:** Testar formulário, resultados, acessibilidade básica e estados
  visuais com Testing Library.
- **Requisitos:** RF1, RF7, RF8, RF11, RF12, US1, US5, US4.
- **Dependências:** T-13, T-14, T-15.
- **Arquivos prováveis:** `tests/components/SearchForm.test.tsx`,
  `tests/components/CityResults.test.tsx`,
  `tests/components/states.test.tsx`.
- **Critérios de aceite:**
  - O fluxo de Enter é testado com consulta válida e curta.
  - Resultados homônimos exibem informações de distinção.
  - Carregamento, vazio, erro e nova tentativa são testados.
  - Os controles principais possuem nome acessível e foco verificável.

## Entrega 5 — Clima, previsão e configurações

### T-17 — Implementar o painel de clima atual

- **Tipo:** UI
- **Descrição:** Exibir temperatura, condição, umidade, precipitação corrente,
  vento, pressão e identificação da localidade.
- **Requisitos:** RF2, RF4, RF5, RF7, US1.
- **Dependências:** T-02, T-09, T-12.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Critérios de aceite:**
  - Todos os campos do clima atual são apresentados quando disponíveis.
  - Temperatura respeita a unidade selecionada.
  - Campos `null` aparecem como `—`.
  - Cidade, subdivisão e país são apresentados conforme necessário.

### T-18 — Implementar a lista de previsão diária

- **Tipo:** UI
- **Descrição:** Exibir hoje e os quatro dias seguintes com condição, mínimas,
  máximas, umidade e precipitação diária.
- **Requisitos:** RF3, RF4, RF5, RF9, US2.
- **Dependências:** T-02, T-03, T-09, T-12.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`.
- **Critérios de aceite:**
  - Exatamente cinco dias são renderizados.
  - Mínimas e máximas respeitam Celsius/Fahrenheit.
  - Datas respeitam o idioma e o fuso da cidade consultada.
  - Campos ausentes aparecem como `—` sem quebrar o leiaute.

### T-19 — Implementar seletor de unidade e redefinição

- **Tipo:** UI
- **Descrição:** Criar controles acessíveis para Celsius/Fahrenheit e para
  restaurar preferências.
- **Requisitos:** RF4, RF5, RF6, US3.
- **Dependências:** T-08, T-12, T-17, T-18.
- **Arquivos prováveis:** `src/components/UnitSelector.tsx`,
  `src/components/SettingsActions.tsx`.
- **Critérios de aceite:**
  - O controle indica claramente a unidade atual.
  - Alternar unidade atualiza clima atual e previsão sem nova consulta.
  - A precipitação permanece em milímetros.
  - Redefinir retorna a temperatura para Celsius sem remover a cidade ativa.

### T-20 — Implementar atribuição e composição da tela principal

- **Tipo:** UI
- **Descrição:** Integrar busca, resultados, estados, clima atual, previsão,
  localização, unidade, redefinição e atribuição em `App`.
- **Requisitos:** RF1–RF12, US1–US6, RNF de responsividade e acessibilidade.
- **Dependências:** T-10, T-14, T-15, T-17, T-18, T-19.
- **Arquivos prováveis:** `src/App.tsx`, `src/components/Attribution.tsx`.
- **Critérios de aceite:**
  - A aplicação compõe o fluxo inicial, busca manual e seleção de cidade.
  - A localização autorizada define cidade inicial sem impedir busca manual.
  - A atribuição da Open-Meteo e CC BY 4.0 é visível.
  - Nenhum estado de carregamento, vazio ou erro deixa a tela sem orientação.
  - A composição mantém usabilidade em 320 px e em computador.

### T-21 — Testar os componentes meteorológicos e configurações

- **Tipo:** Test
- **Descrição:** Testar clima atual, previsão, unidades, datas regionais,
  redefinição e atribuição com dados fixos.
- **Requisitos:** RF2, RF3, RF4, RF5, RF6, RF7, RF9, US2, US3.
- **Dependências:** T-17, T-18, T-19, T-20.
- **Arquivos prováveis:** `tests/components/CurrentWeather.test.tsx`,
  `tests/components/ForecastList.test.tsx`,
  `tests/components/settings.test.tsx`, `tests/components/App.test.tsx`.
- **Critérios de aceite:**
  - Clima atual e previsão exibem todos os campos disponíveis.
  - Cinco dias são exibidos e datas respeitam localidade e fuso.
  - Troca de unidade e redefinição são verificadas sem nova chamada.
  - Campos ausentes exibem `—`.
  - Atribuição é encontrada por nome acessível ou texto visível.

## Entrega 6 — Validação de fluxo e entrega

### T-22 — Criar testes E2E do fluxo principal

- **Tipo:** Test
- **Descrição:** Cobrir o caminho de localização ou busca manual até clima atual
  e previsão usando respostas de rede controladas.
- **Requisitos:** RF1, RF2, RF3, RF7, RF10, RF11, US1, US2, US6.
- **Dependências:** T-20, T-21.
- **Arquivos prováveis:** `tests/e2e/weather-search.spec.ts`.
- **Critérios de aceite:**
  - O teste busca uma cidade com cinco ou mais caracteres usando Enter.
  - O teste seleciona um resultado homônimo distinguindo subdivisão e país.
  - O teste verifica clima atual e exatamente cinco dias.
  - O teste cobre localização autorizada e busca manual após recusa.

### T-23 — Criar testes E2E de unidades, falhas e responsividade

- **Tipo:** Test
- **Descrição:** Cobrir alternância persistente de unidade, erros de rede,
  timeout, resposta parcial e viewport móvel.
- **Requisitos:** RF4, RF5, RF6, RF12, US3, US4, US5.
- **Dependências:** T-20, T-21.
- **Arquivos prováveis:** `tests/e2e/weather-resilience.spec.ts`.
- **Critérios de aceite:**
  - Alternar Celsius/Fahrenheit não gera nova requisição de previsão.
  - Reabrir a aplicação preserva a unidade e redefinir restaura Celsius.
  - Falha, tempo limite e resposta parcial mostram estados esperados.
  - A interface permanece utilizável em viewport de 320 px.

### T-24 — Executar a verificação final do projeto

- **Tipo:** Infra
- **Descrição:** Consolidar a validação de qualidade e confirmar que os
  artefatos do fluxo Spec → Plan → Tasks estão presentes antes da implementação.
- **Requisitos:** RNF de desempenho, responsividade, acessibilidade e qualidade.
- **Dependências:** T-07, T-11, T-16, T-21, T-22, T-23.
- **Arquivos prováveis:** `package.json`, `biome.json`, arquivos de CI quando
  necessário.
- **Critérios de aceite:**
  - `pnpm lint` é executado sem erros.
  - `pnpm build` é executado sem erros.
  - `pnpm test` é executado sem falhas.
  - `pnpm test:e2e` é executado com os navegadores configurados.
  - Spec, plano e tarefas estão presentes nos caminhos esperados.

## Cobertura dos requisitos funcionais

| Requisito | Tarefas que o implementam ou verificam |
| --- | --- |
| RF1 — Buscar cidades | T-03, T-05, T-09, T-13, T-16, T-22 |
| RF2 — Clima atual | T-06, T-09, T-17, T-21, T-22 |
| RF3 — Previsão | T-06, T-09, T-18, T-21, T-22 |
| RF4 — Alternar unidades | T-02, T-08, T-19, T-21, T-23 |
| RF5 — Refletir unidade | T-02, T-09, T-17, T-18, T-19, T-23 |
| RF6 — Salvar configuração | T-08, T-19, T-21, T-23 |
| RF7 — Identificar localidade | T-05, T-06, T-14, T-17, T-22 |
| RF8 — Diacríticos | T-03, T-05, T-13, T-16, T-22 |
| RF9 — Idioma e formatação | T-03, T-06, T-18, T-21, T-22 |
| RF10 — Localização | T-10, T-20, T-22 |
| RF11 — Desambiguar cidades | T-05, T-14, T-16, T-22 |
| RF12 — Estados da aplicação | T-04, T-06, T-09, T-15, T-16, T-20, T-23 |