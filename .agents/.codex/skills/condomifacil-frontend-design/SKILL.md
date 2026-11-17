---
name: condomifacil-frontend-design
description: Criar ou alterar telas, componentes, tokens e o protótipo HTML do CondomiFacil, ou revisar UI de mobile e painel web, com modelos por perfil, acessibilidade e avaliação de tendências como Liquid Glass.
---

# Design de frontend do CondomiFacil

O projeto está na fase de **Design, antes do código**. Há documentação e protótipo HTML em `prototipo/`; `frontend/` é estrutura reservada, sem aplicação funcional. Use português do Brasil. O protótipo substituiu o Figma: estenda `prototipo/js/telas/*.js`, salvo pedido do Pedro.

## Antes de desenhar

Identifique o perfil, o contexto aplicável (condomínio e unidade), a tarefa principal e seus estados, e a superfície: mobile, painel web ou protótipo. Use a documentação vigente para decidir o que cada pessoa pode ver ou fazer.

Se o pedido for ambíguo ou exigir decisão de produto, apresente ao Pedro opções, consequências e recomendação, e pause até a resposta conforme AGENTS.md. Não transforme proposta em regra aprovada.

## Fontes de trabalho

Leia os documentos grandes por seção, usando os índices de `##`, em vez de abrir o arquivo inteiro. Para perguntas de arquitetura ou relação entre documentos, consulte primeiro o grafo em `graphify-out/`.

1. Localize a regra do módulo nas [Regras de Negócio](../../../../docs/01-produto/03-regras-de-negocio.md), o requisito no [PRD](../../../../docs/01-produto/02-prd.md), os critérios nas [Histórias de Usuário](../../../../docs/01-produto/04-historias-de-usuario.md) e a sequência em [User Flows](../../../../docs/02-design/02-user-flows.md). Consulte as decisões e pendências pertinentes, inclusive as seções 16 e 17 dos fluxos.
2. No [Design System](../../../../docs/02-design/01-design-system.md), use as seções 4–9 para tokens, 10–12 para componentes, composição e navegação, e 13–16 para texto, acessibilidade, privacidade e desempenho. Confira as decisões da seção 18 e a rastreabilidade da seção 19.
3. Para código, consulte o [mapa do frontend](../../../../frontend/README.md), a [biblioteca de componentes](../../../../docs/06-frontend/biblioteca-de-componentes.md) e o guia da superfície ([mobile](../../../../docs/06-frontend/frontend.md) ou [painel web](../../../../docs/06-frontend/painel-web.md)). Confira quais arquivos existem como estrutura reservada. Antes de mexer no protótipo, leia o [README do protótipo](../../../../prototipo/README.md) e localize a rota e o cenário. Use dados fictícios em exemplos e simulações.

## Regras duras

- Estado nunca só por cor: sempre texto e ícone. Score nunca em verde ou vermelho.
- Sem hex solto: use tokens por tema; `prototipo/css/tokens.css` espelha o Design System. Use Inter, Lucide e azul da marca, com no máximo um destaque coral por tela, fora gráficos. Texto e ícone coral no tema claro usam `color.accent.fg`; erro e bloqueio usam a família `danger`.
- Respeite os termos fixos do Design System, seção 13: "Proprietário", "Inquilino", "Despesa extraordinária" e "Desocupada"; nunca "locador" ou "locatário".
- Alvos de toque de pelo menos 48 × 48 dp, com 8 dp entre alvos; ações principais da portaria com 56 dp de altura. Ícone acionável tem nome acessível.
- Portaria: registrar entrada em até 2 toques, sem diálogo de confirmação, com "Desfazer" por 10 s; operação offline com fila de sincronização.
- Mostre condomínio e unidade onde mudam o significado. Use "Indisponível" para restrição sem expor motivo protegido, preservando as explicações permitidas ao perfil pelo Design System; suporte da plataforma não vê reclamações nem scores; voto é secreto.
- Manutenção é perfil proposto no protótipo: preserve o banner até decisão no PRD.
- Altere apenas o escopo autorizado. Se a rastreabilidade exigir outro arquivo, explique a necessidade e pergunte antes de alterar; aguarde a resposta.

## Desenho e revisão

- Escolha a composição conforme a tarefa, a densidade da informação e a navegação do perfil. Reutilize componentes e tokens disponíveis; proponha componente novo quando resolver uma necessidade real, com registro no Design System dentro do escopo autorizado.
- Modele os estados aplicáveis ao fluxo, incluindo carregamento, vazio, erro com recuperação, permissão e conectividade. Condicione dados e ações ao contexto autorizado. Onde previsto, represente troca de contexto, revogação e sincronização. Identifique as decisões de produto pendentes.
- Aplique SOLID, GRASP e GoF ao código quando resolverem um problema real; evite padrões por enfeite no protótipo HTML puro.
- Consulte os [padrões e modelos de tela](references/padroes-e-modelos.md) para compor ou revisar uma tela e as [referências de tendências e Liquid Glass](references/tendencias-e-liquid-glass.md) para avaliar atualização visual, transparência ou movimento. Comece pela superfície opaca e funcional.

## Verificação antes de entregar

Execute os itens aplicáveis à superfície alterada; informe os não executados ou não aplicáveis e o motivo. Uma edição apenas documental da skill não exige executar telas do produto.

- [ ] Tarefa principal e estados relevantes nos temas claro e escuro.
- [ ] Larguras até 599, de 600 a 1023 e a partir de 1024; confira a composição responsiva prevista no Design System.
- [ ] Contraste de pelo menos 4,5:1 para texto e 3:1 para texto grande e elementos essenciais; texto a 200% sem perda de conteúdo ou função.
- [ ] Ordem de leitura, nome acessível de ações, foco por teclado na web e movimento reduzido.
- [ ] Estados de carregamento, vazio, erro com "Tentar de novo", sem permissão e offline, quando aplicáveis ao fluxo.
- [ ] Termos fixos, ausência de hex solto, limites do coral e estado acompanhado de texto e ícone.
- [ ] Ao alterar o protótipo, rode `cd prototipo && python -m http.server 8765` e exercite a rota afetada (`#/perfil/tela/arg`, conforme o fluxo); identifique o que é simulado. Se não conseguir verificar, declare a limitação.

## Rastreabilidade e entrega

- Cite os IDs que sustentam o comportamento: RN, RF, US, seção do fluxo e seção do Design System.
- Mudou regra? Atualize na mesma alteração RN → PRD → história de usuário → fluxo → Design System → protótipo, depois de obter autorização para os arquivos necessários. Se o escopo não permitir, peça a ampliação antes das alterações dependentes.
- Registre mudança de design autorizada na tabela da seção 18 do Design System, com data em dd/mm/aaaa e motivo; autorização para uma tela não amplia automaticamente o escopo documental.
- Ao finalizar, informe arquivos alterados, o que foi verificado e como, e o que ficou simulado ou pendente. Commit, push ou merge exigem aprovação específica de Pedro e indicação das branches conforme AGENTS.md.

