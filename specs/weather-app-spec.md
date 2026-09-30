# Especificação do produto — Weather App

## Visão geral (Overview)

A aplicação web de previsão do tempo que permite pesquisar cidades, consultar as
condições meteorológicas atuais e visualizar a previsão para cinco dias. A
aplicação deve funcionar em dispositivos móveis e computadores, respeitar o idioma
e a formatação regional da pessoa usuária e permitir a escolha entre Celsius e
Fahrenheit.

O produto usará a Open-Meteo como fonte de geocodificação e dados
meteorológicos. O uso previsto é não comercial, sem chave de API, cadastro ou
cartão de crédito. A aplicação deve exibir a atribuição exigida pela licença
CC BY 4.0.

### Objetivos

- Permitir encontrar rapidamente uma cidade e consultar seu clima.
- Apresentar informações atuais e uma previsão diária de cinco dias.
- Oferecer uma experiência compreensível em telas a partir de 320 px.
- Manter a interface utilizável quando a localização não for autorizada ou a
  fonte de dados estiver indisponível.

## Requisitos funcionais (Functional Requirements)

- **RF1 — Buscar cidades:** aceitar consultas com pelo menos cinco caracteres e
  executar a busca somente quando a pessoa usuária pressionar Enter.
- **RF2 — Consultar clima atual:** exibir temperatura, condição meteorológica,
  umidade relativa, precipitação no período corrente, velocidade do vento e
  pressão atmosférica para a cidade selecionada.
- **RF3 — Consultar previsão:** exibir um resumo diário para hoje e os quatro
  dias seguintes, incluindo condição meteorológica, temperaturas mínima e
  máxima, umidade relativa e precipitação diária.
- **RF4 — Alternar unidades:** usar Celsius por padrão e permitir Fahrenheit
  como alternativa somente para temperatura. A precipitação permanece em
  milímetros.
- **RF5 — Refletir unidade selecionada:** apresentar as temperaturas de acordo
  com a unidade escolhida no clima atual e na previsão.
- **RF6 — Salvar configuração:** manter as preferências da aplicação no
  navegador e oferecer uma ação para restaurá-las aos padrões. A redefinição
  não deve apagar a cidade selecionada.
- **RF7 — Identificar localidade:** mostrar o nome da cidade e a subdivisão
  administrativa pertinente, além do país quando necessário para distinguir
  localidades.
- **RF8 — Pesquisar com diacríticos:** aceitar acentuação compatível com o
  idioma usado na consulta.
- **RF9 — Idioma e formatação:** usar o idioma configurado no sistema e suas
  convenções de formatação regional.
- **RF10 — Localizar pessoa usuária:** solicitar permissão de localização na
  primeira visita e, quando autorizada, selecionar a localidade mais próxima
  como cidade inicial. A busca manual deve continuar disponível quando a
  permissão for recusada ou a localização não estiver disponível.
- **RF11 — Desambiguar cidades:** distinguir resultados homônimos por
  estado/subdivisão administrativa e país.
- **RF12 — Exibir estados da aplicação:** comunicar carregamento, ausência de
  resultados, erro de rede, tempo limite, indisponibilidade da fonte e dados
  incompletos sem deixar a interface travada. Deve existir nova tentativa
  quando a falha puder ser repetida.

## Histórias de usuário (User Stories)

- **US1 — Consultante do dia a dia:** Como consultante do dia a dia, quero
  buscar minha cidade para consultar o clima antes de sair ou planejar uma
  atividade.
- **US2 — Planejador de viagens:** Como planejador de viagens, quero visualizar
  a previsão de hoje e dos próximos quatro dias para organizar meus planos.
- **US3 — Pessoa usuária internacional:** Como pessoa usuária internacional,
  quero alternar entre Celsius e Fahrenheit para interpretar a temperatura na
  unidade com que estou familiarizada.
- **US4 — Pessoa usuária móvel:** Como pessoa usuária móvel, quero consultar
  e operar a aplicação em uma tela pequena para verificar o clima em qualquer
  lugar.
- **US5 — Pessoa em rede instável:** Como pessoa em rede instável, quero
  receber mensagens claras quando os dados não carregarem para saber como
  tentar novamente ou continuar usando a aplicação.
- **US6 — Pessoa em localidade nova:** Como pessoa em localidade nova, quero
  permitir que a aplicação identifique minha cidade inicial para consultar o
  clima sem precisar digitá-la.

## Critérios de aceitação (Acceptance Criteria)

### RF1 / US1 — Buscar cidades

- **Dado** que o campo de busca contém menos de cinco caracteres, **quando** a
  pessoa usuária pressionar Enter, **então** nenhuma consulta é enviada e a
  interface informa o tamanho mínimo necessário.
- **Dado** que o campo contém pelo menos cinco caracteres, **quando** a pessoa
  usuária pressiona Enter, **então** a busca é executada e seu estado de
  carregamento é apresentado.

### RF2 — Consultar clima atual

- **Dado** que uma cidade foi selecionada e os dados estão disponíveis,
  **quando** a consulta termina, **então** a aplicação exibe temperatura,
  condição, umidade relativa, precipitação do período corrente, velocidade do
  vento e pressão atmosférica.

### RF3 / US2 — Consultar previsão

- **Dado** que uma cidade foi selecionada e os dados estão disponíveis,
  **quando** a consulta termina, **então** a aplicação exibe exatamente cinco
  dias: hoje e os quatro dias seguintes.
- **Dado** um dia da previsão, **quando** seus dados são exibidos, **então** o
  resumo apresenta condição, temperatura mínima, temperatura máxima, umidade
  relativa e precipitação diária.

### RF4 / US3 — Alternar unidades

- **Dado** que a aplicação está em Celsius, **quando** a pessoa usuária escolhe
  Fahrenheit, **então** a unidade de temperatura exibida muda para Fahrenheit
  e a precipitação continua em milímetros.
- **Dado** que a aplicação está em Fahrenheit, **quando** a pessoa usuária
  escolhe Celsius, **então** a unidade de temperatura exibida muda para Celsius.

### RF5 / US3 — Refletir unidade selecionada

- **Dado** que existem dados atuais e de previsão carregados, **quando** a
  pessoa usuária alterna a unidade, **então** todas as temperaturas visíveis,
  atuais e diárias, são convertidas de forma consistente sem exigir uma nova
  consulta de dados.

### RF6 — Salvar configuração

- **Dado** que a pessoa usuária escolheu uma unidade, **quando** fecha e abre
  novamente a aplicação no mesmo navegador, **então** a unidade escolhida é
  restaurada.
- **Dado** que existem preferências personalizadas, **quando** a pessoa
  usuária aciona a redefinição, **então** as preferências retornam aos
  padrões, a temperatura volta para Celsius e a cidade selecionada permanece
  disponível.

### RF7 — Identificar localidade

- **Dado** que uma cidade foi selecionada, **quando** seus dados são exibidos,
  **então** a interface mostra cidade, subdivisão administrativa e país quando
  necessário para evitar ambiguidade.

### RF8 — Pesquisar com diacríticos

- **Dado** que a consulta contém caracteres acentuados válidos, **quando** a
  pessoa usuária confirma a busca, **então** a aplicação envia a consulta sem
  remover indevidamente os diacríticos e pode retornar a localidade
  correspondente.

### RF9 — Idioma e formatação

- **Dado** que o dispositivo informa um idioma e uma região, **quando** a
  aplicação exibe datas, números e unidades formatáveis, **então** utiliza as
  convenções regionais informadas pelo dispositivo.

### RF10 / US6 — Localizar pessoa usuária

- **Dado** que a pessoa visita a aplicação pela primeira vez, **quando** a
  aplicação inicia, **então** solicita permissão para obter sua localização.
- **Dado** que a permissão foi concedida e a localização foi obtida, **quando**
  a inicialização termina, **então** a localidade mais próxima é selecionada
  como cidade inicial.
- **Dado** que a permissão foi recusada ou a localização não foi obtida,
  **quando** a inicialização termina, **então** a busca manual permanece
  disponível e a pessoa pode continuar sem bloqueio.

### RF11 — Desambiguar cidades

- **Dado** que a busca retorna cidades com o mesmo nome, **quando** os
  resultados são apresentados, **então** cada resultado inclui informação de
  subdivisão e país suficiente para distingui-los.
- **Dado** que existem resultados homônimos, **quando** a pessoa seleciona um
  resultado, **então** a previsão exibida corresponde exatamente à localidade
  selecionada.

### RF12 / US5 — Estados da aplicação

- **Dado** que uma consulta está em andamento, **quando** os dados ainda não
  chegaram, **então** a interface exibe um estado de carregamento e continua
  operável.
- **Dado** que a busca não encontra cidades, **quando** a consulta termina,
  **então** a interface exibe um estado vazio informativo e permite uma nova
  busca.
- **Dado** que ocorre falha de rede, tempo limite ou indisponibilidade da fonte,
  **quando** a consulta falha, **então** a interface informa o problema e
  oferece uma ação de nova tentativa.
- **Dado** que um campo meteorológico está ausente, **quando** os demais dados
  são exibidos, **então** o campo incompleto mostra `—` e a interface continua
  utilizável.

## Requisitos não funcionais (Non-Functional Requirements)

- **Desempenho:** a carga inicial deve ocorrer em até 2 segundos em condições
  normais. Uma requisição sem resposta deve atingir o tempo limite em até 10 segundos.
- **Responsividade:** a aplicação deve ser utilizável em áreas de visualização a partir de
  320 px e manter seus controles acessíveis em tablets e computadores.
- **Acessibilidade:** os fluxos principais devem ser operáveis por teclado,
  possuir foco visível, nomes acessíveis para controles e contraste suficiente
  para uso básico.
- **Localização:** idioma, datas e números devem respeitar as preferências
  regionais do sistema. Os limites do dia e da previsão devem usar o fuso
  horário da cidade consultada.
- **Resiliência:** falhas, tempos limite, respostas vazias e campos ausentes não
  devem travar a aplicação nem ocultar silenciosamente o problema.
- **Compatibilidade:** Chromium é o navegador de referência. A aplicação deve
  evitar dependência desnecessária de comportamento exclusivo desse navegador.
- **Dados e licença:** a aplicação deve respeitar o limite informado para o uso
  não comercial e apresentar atribuição conforme a licença CC BY 4.0.

## Casos de borda (Edge Cases)

| Caso | Comportamento esperado |
| --- | --- |
| Consulta vazia | Não dispara busca e orienta a pessoa usuária a informar uma cidade. |
| Consulta com menos de cinco caracteres | Não dispara busca e informa o mínimo de cinco caracteres. |
| Cidade inexistente | Exibe estado vazio com mensagem clara e permite nova busca. |
| Nenhum resultado de geocodificação | Exibe estado vazio sem mostrar previsão de outra cidade. |
| Cidade com caracteres acentuados | Mantém os diacríticos e tenta localizar a cidade correspondente. |
| Resultados homônimos | Exibe subdivisão e país para permitir seleção inequívoca. |
| Falha de rede | Exibe erro compreensível e ação de nova tentativa. |
| Tempo limite excedido | Encerra o carregamento em até 10 segundos, informa o tempo limite e permite tentar novamente. |
| Resposta parcial | Exibe `—` nos campos ausentes e preserva os dados disponíveis. |
| Permissão de localização recusada | Não bloqueia o uso; deixa a busca manual disponível. |
| Fuso do dispositivo diferente do fuso da cidade | Define hoje e os dias seguintes pelo fuso da cidade consultada. |
| Limite de chamadas atingido | Exibe indisponibilidade temporária e orienta a tentar novamente mais tarde. |

## Premissas (Assumptions)

- A Open-Meteo permanece disponível para o uso não comercial previsto e dentro
  do limite de 10.000 chamadas diárias informado em sua documentação.
- Os dados da Open-Meteo podem fornecer os campos necessários para clima atual,
  previsão diária, geocodificação e fuso horário.
- A temperatura é Celsius por padrão e a precipitação é apresentada em
  milímetros.
- A precipitação atual representa o período corrente fornecido pela fonte; a
  precipitação da previsão representa o total diário.
- As preferências são mantidas localmente no navegador, sem conta ou
  sincronização entre dispositivos.
- A cidade selecionada não é apagada pela redefinição das preferências.
- A permissão de localização pode ser recusada sem impedir a busca manual.
- Condição meteorológica, vento e pressão fazem parte do v1.
- Favoritos, histórico persistente, contas, notificações e funcionamento
  offline não fazem parte do v1.

## Riscos (Risks)

- **Limite ou indisponibilidade da Open-Meteo:** pode impedir consultas; a
  aplicação deve informar a falha, permitir nova tentativa e monitorar o uso.
- **Mudança nos termos ou na licença:** pode exigir ajuste da atribuição ou do
  escopo de uso; os termos devem ser revistos antes da entrega.
- **Cidades homônimas:** podem levar a pessoa a consultar a localidade errada;
  resultados devem exibir subdivisão e país.
- **Definição divergente de precipitação:** pode gerar interpretação incorreta;
  a documentação do campo e seu período devem ser registrados no plano técnico.
- **Conversão ou arredondamento incorreto:** pode produzir temperaturas
  inconsistentes; conversão deve ser verificada por testes.
- **Localização recusada:** pode impedir a cidade inicial automática; a busca
  manual deve permanecer sempre disponível.
- **Resposta lenta ou incompleta:** pode causar percepção de travamento; a
  interface deve exibir carregamento, tempo limite e valores ausentes de forma
  explícita.

## Fora do escopo

- Autenticação, contas e sincronização entre dispositivos.
- Favoritos e histórico persistente de cidades.
- Funcionamento offline e cache de previsões para uso sem rede.
- Notificações push, alertas meteorológicos e integração com calendário.
- Dados históricos e previsões superiores a cinco dias.
- Personalização avançada de unidades de vento, pressão ou precipitação.
- Suporte a uma matriz específica de navegadores além da referência Chromium.
- Painel administrativo, análise de uso e monetização.

## Questões em aberto

Nenhuma pergunta de produto bloqueante permanece. A implementação deve
consultar a documentação da Open-Meteo para confirmar os nomes e as unidades
dos campos meteorológicos durante o plano técnico.

## Rastreabilidade

| História de usuário | Requisitos relacionados | Critérios principais |
| --- | --- | --- |
| US1 | RF1, RF2, RF7, RF8, RF11 | Busca confirmada, localidade identificada e clima atual exibido |
| US2 | RF3, RF5, RF9 | Cinco dias, temperaturas na unidade escolhida e datas regionais |
| US3 | RF4, RF5, RF6 | Alternância, conversão consistente e persistência da unidade |
| US4 | RNF de responsividade, acessibilidade e usabilidade | Fluxos operáveis a partir de 320 px |
| US5 | RF12, RNF de resiliência | Carregamento, vazio, erro, tempo limite e nova tentativa |
| US6 | RF10, RF7 | Permissão, cidade inicial e identificação da localidade |