# Discovery — Aplicação de previsão do tempo

## Contexto

A empresa solicita uma aplicação de previsão do tempo que permita pesquisar cidades, consultar as condições atuais e a previsão para cinco dias, escolher entre Celsius e Fahrenheit e usar o serviço em dispositivos móveis. As decisões registradas abaixo detalham o briefing. A aplicação terá como público pessoas que consultam o clima no dia a dia, planejam viagens, usam unidades internacionais, acessam pelo celular ou dependem de redes instáveis.

## Requisitos Funcionais

- **RF1 — Buscar cidades:** aceitar consultas com pelo menos cinco caracteres e executar a busca somente quando a pessoa usuária pressionar Enter.
- **RF2 — Consultar clima atual:** exibir temperatura, condição meteorológica, umidade relativa, precipitação no período corrente, velocidade do vento e pressão atmosférica para a cidade selecionada.
- **RF3 — Consultar previsão:** exibir um resumo diário para o dia atual e os quatro dias seguintes, incluindo condição meteorológica, temperaturas mínima e máxima, umidade relativa e precipitação diária.
- **RF4 — Alternar unidades:** usar unidades SI por padrão (temperatura em Celsius e precipitação em milímetros); permitir Fahrenheit como alternativa somente para temperatura.
- **RF5 — Refletir unidade selecionada:** apresentar as temperaturas de acordo com a unidade escolhida, tanto no clima atual quanto na previsão.
- **RF6 — Salvar configuração:** manter as configurações da aplicação no navegador da pessoa usuária e oferecer uma ação para redefinir todas as configurações aos padrões.
- **RF7 — Identificar localidade:** sempre mostrar o nome da cidade e a subdivisão administrativa pertinente (por exemplo, UF/estado) ou equivalente adequado ao país, além do país quando necessário para distinguir localidades.
- **RF8 — Pesquisar com diacríticos:** aceitar acentuação compatível com o idioma usado na consulta.
- **RF9 — Idioma e formatação:** manter o idioma configurado no sistema da pessoa usuária e usar suas convenções de formatação.
- **RF10 — Localizar pessoa usuária:** solicitar permissão para obter a localização da pessoa usuária na primeira visita; quando autorizada, selecionar a localidade mais próxima como cidade inicial e contextualizar a previsão; se a permissão for recusada ou a localização não estiver disponível, permitir continuar pela busca manual de cidade.
- **RF11 — Desambiguar cidades:** distinguir resultados homônimos por estado/subdivisão administrativa e país.
- **RF12 — Exibir estados da aplicação:** comunicar carregamento, ausência de resultados, erro de rede, timeout, indisponibilidade da API e dados incompletos sem deixar a interface travada; oferecer nova tentativa quando a falha puder ser repetida.

## Requisitos Não Funcionais

- **RNF1 — Uso móvel:** a aplicação deve ser utilizável em viewports a partir de 320 px de largura.
- **RNF2 — Usabilidade:** busca, consulta e alternância de unidade devem ser compreensíveis e operáveis nos dispositivos suportados.
- **RNF3 — Responsividade:** o conteúdo e os controles devem permanecer acessíveis em telas móveis, tablets e desktops, sem exigir uma matriz específica de dispositivos além do viewport mínimo definido.
- **RNF4 — Base de desenvolvimento:** Chromium será o navegador de referência durante o desenvolvimento; as funcionalidades devem evitar dependência desnecessária de um navegador específico.
- **RNF5 — Localização:** a interface deve respeitar o idioma do sistema e a formatação regional da pessoa usuária. A referência temporal da previsão deve considerar o fuso horário da cidade consultada.
- **RNF6 — Desempenho:** a carga inicial deve ocorrer em até 2 segundos em condições normais, e uma requisição sem resposta deve atingir timeout em até 10 segundos.
- **RNF7 — Acessibilidade:** a aplicação deve oferecer navegação por teclado, foco visível, nomes acessíveis para controles e contraste suficiente para uso básico; não será criada uma matriz adicional de requisitos de acessibilidade nesta etapa.

## Riscos

| Risco | Impacto potencial | Consideração para mitigação |
| --- | --- | --- |
| Resultados ambíguos para cidades com nomes iguais | A pessoa usuária pode consultar a localidade errada | Distinguir resultados por estado/subdivisão administrativa e país |
| Fonte de dados indisponível, inadequada ou com termos incompatíveis | Clima atual ou previsão podem não ser exibidos ou o uso pode violar limites/licenças | Monitorar disponibilidade e limites; exibir a atribuição exigida pela licença CC BY 4.0 |
| Definição da precipitação “no momento” difere entre fontes | O valor pode representar intervalos ou métricas diferentes | Verificar definição, intervalo e unidade do campo fornecido pela API |
| Uso móvel limitado por telas, navegadores ou conectividade | Busca e leitura podem ficar difíceis ou indisponíveis | Definir dispositivos-alvo e expectativas para redes lentas ou instáveis; testar além do Chromium de referência |
| Erros de conversão ou de consistência entre unidades | Temperaturas diferentes podem ser apresentadas incorretamente | Definir arredondamento e verificar a consistência entre as telas |
| Acentuação ou identificação regional inconsistente entre busca e API | Uma localidade válida pode não ser encontrada ou identificada corretamente | Validar comportamento para idiomas, diacríticos e nomes regionais suportados pela fonte escolhida |
| Permissão de localização recusada ou indisponível | A cidade inicial pode não ser identificada automaticamente | Manter a busca manual disponível e não bloquear o uso da aplicação |
| Fuso horário diferente entre dispositivo e cidade consultada | O dia exibido pode não corresponder à localidade pesquisada | Usar o fuso horário da cidade consultada para definir o período da previsão |
| Campo meteorológico ausente na resposta | Um cartão ou resumo pode quebrar ou apresentar informação enganosa | Exibir `—` no campo ausente e manter os demais dados disponíveis |
| API respondendo lentamente | A pessoa usuária pode interpretar a tela como travada | Exibir carregamento, aplicar timeout e oferecer nova tentativa |

## Perguntas em Aberto

Nenhuma pergunta de produto bloqueante permanece após a validação da fonte de dados.

## Suposições adotadas

- A Open-Meteo será usada como fonte de geocodificação e dados meteorológicos do projeto, sem chave de API, cadastro ou cartão de crédito no fluxo padrão.
- O uso previsto é não comercial e permanece dentro do limite gratuito de 10.000 chamadas diárias informado pela Open-Meteo.
- A aplicação exibirá atribuição conforme a licença CC BY 4.0 dos dados.
- As configurações da aplicação são armazenadas localmente no navegador; não há requisito de conta ou sincronização entre dispositivos.
- A temperatura usa Celsius por padrão, com Fahrenheit como alternativa; precipitação é exibida em milímetros. A redefinição restaura as preferências aos padrões, mas não apaga a cidade selecionada nem dados fora do escopo da aplicação.
- A previsão é um resumo diário com condição, mínima, máxima, umidade relativa e precipitação diária para hoje e os quatro dias seguintes.
- A precipitação atual representa o período corrente fornecido pela fonte de dados.
- A consulta de cidade só é enviada com Enter e após pelo menos cinco caracteres; resultados homônimos são distinguidos por estado/subdivisão administrativa e país.
- A aplicação solicita localização na primeira visita e seleciona a cidade inicial quando possível; busca manual permanece disponível caso isso não seja possível.
- O idioma da interface segue o idioma do sistema; a busca deve aceitar diacríticos conforme o idioma digitado.
- Chromium é a base de desenvolvimento, sem dependência intencional de recursos exclusivos desse navegador.
- A experiência deve funcionar a partir de 320 px e também em tablets e desktops, sem uma matriz detalhada de dispositivos nesta versão.
- Condição meteorológica, vento e pressão fazem parte do v1; favoritos, histórico persistente, contas e funcionamento offline não fazem parte do v1.

## Fonte de dados definida

Open-Meteo será a fonte do projeto para geocodificação e previsão meteorológica. A documentação consultada informa uso sem chave, cadastro ou cartão de crédito; uso não comercial gratuito até 10.000 chamadas diárias; dados sob licença CC BY 4.0, com atribuição obrigatória; cobertura global e atualizações frequentes dos modelos. O projeto deve exibir a atribuição exigida e monitorar limites e disponibilidade.

| Serviço | Decisão |
| --- | --- |
| Open-Meteo | Fonte definida para geocodificação e previsão meteorológica do v1; sem autenticação no uso padrão, limite não comercial de 10.000 chamadas diárias e atribuição CC BY 4.0 |