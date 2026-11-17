---
name: condomifacil-frontend-design
description: Projetar, prototipar, implementar ou revisar telas e componentes do CondomiFacil (app mobile e painel web da administradora), com modelos por perfil, acessibilidade WCAG AA e avaliação de tendências como Liquid Glass. Use ao criar ou alterar telas, componentes, tokens ou o protótipo HTML em prototipo/, ao revisar UI ou ao responder dúvidas de design de interface do produto.
---

# Design de frontend do CondomiFacil

Fase atual do projeto: **Design, antes do código**. Existem docs e o protótipo HTML em `prototipo/`; `frontend/` é estrutura reservada. Idioma de tudo: português do Brasil. O protótipo substituiu o Figma; estenda `prototipo/js/telas/*.js` salvo pedido do Pedro.

## 1. Antes de desenhar

Defina e anote, em uma linha cada:

1. **Perfil** (morador, porteiro, limpeza, síndico, subsíndico, administradora, conselho fiscal, proprietário não residente, suporte, admin) e o **contexto** (condomínio e unidade).
2. **Tarefa principal** e os estados dela (carregando, vazio, erro com recuperação, sem permissão, offline).
3. **Superfície**: mobile (`docs/06-frontend/frontend.md`), painel web (`docs/06-frontend/painel-web.md`) ou protótipo.

Se o pedido for ambíguo ou exigir decisão de produto, pergunte ao Pedro com opções, consequências e recomendação, e pause até a resposta (AGENTS.md).

## 2. Fontes de trabalho

Leia por seção (os docs são grandes), nunca o arquivo inteiro.

1. Regra do módulo: [Regras de Negócio](../../../docs/01-produto/03-regras-de-negocio.md). Requisito: [PRD](../../../docs/01-produto/02-prd.md). Critérios: [Histórias de Usuário](../../../docs/01-produto/04-historias-de-usuario.md). Sequência: [User Flows](../../../docs/02-design/02-user-flows.md), inclusive decisões e pendências (seções 16 e 17).
2. [Design System](../../../docs/02-design/01-design-system.md): seções 4–9 (tokens), 10–12 (componentes, composição, navegação), 13–16 (texto, acessibilidade, privacidade, desempenho), 18 (decisões) e 19 (rastreabilidade).
3. Código: [mapa do frontend](../../../frontend/README.md) e [biblioteca de componentes](../../../docs/06-frontend/biblioteca-de-componentes.md). Confira quais arquivos existem de fato. Protótipo: [README do protótipo](../../../prototipo/README.md) (leia antes de mexer). Dados sempre fictícios.
4. Perguntas de arquitetura ou relação entre documentos: consulte primeiro o grafo em `graphify-out/` (`/graphify`).

## 3. Regras duras (não negociáveis sem decisão do Pedro)

- **Estado nunca só por cor**: sempre texto e ícone (WCAG 1.4.1). Score nunca em verde/vermelho.
- **Sem hex solto**: use tokens (`css/tokens.css` espelha o DS, claro e escuro). Marca: Inter, Lucide, azul + **no máximo um destaque coral por tela** (fora gráficos). Texto/ícone coral no claro usa `color.accent.fg`. Erro e bloqueio usam a família `danger`.
- **Termos fixos** (DS seção 13): "Proprietário", "Inquilino", "Despesa extraordinária", "Desocupada"; nunca "locador" ou "locatário".
- **Toque**: mínimo 48 × 48 dp com 8 dp entre alvos; 56 dp nas ações principais da portaria. Ícone acionável tem nome acessível.
- **Portaria**: entrada em até 2 toques, sem diálogo de confirmação (use "Desfazer" por 10 s), funcionando offline com fila de sincronização.
- **Privacidade**: mostre condomínio/unidade onde mudam o significado; use "Indisponível" para restrição sem expor o motivo; suporte da plataforma não vê reclamações nem scores; voto é secreto.
- **Perfil Manutenção** no protótipo é proposta (banner até o PRD decidir).
- Não altere nada além do pedido. Se a mudança exigir tocar em outro documento por rastreabilidade, explique e pergunte antes.

## 4. Desenho e implementação

- Escolha a composição pela tarefa e densidade. Reutilize componentes e tokens existentes antes de criar novos; crie componente novo só se resolver um problema real e registre no DS.
- Modele todos os estados aplicáveis; condicione dados e ações ao contexto autorizado (troca de unidade, revogação, sincronização quando previstas). Registre pendências de produto em vez de decidir sozinho.
- Padrões de projeto (SOLID, GRASP, GoF) valem para código real; em protótipo HTML puro não aplique padrão por enfeite.
- Modelos de tela e composição: [padrões e modelos](references/padroes-e-modelos.md). Atualização visual, transparência e movimento: [tendências e Liquid Glass](references/tendencias-e-liquid-glass.md) (comece sempre pela versão opaca).

## 5. Verificação antes de entregar

Marque cada item ou diga por que não foi feito:

- [ ] Tarefa principal concluída nos temas claro e escuro.
- [ ] Larguras: até 599 (1 coluna), 600–1023, ≥ 1024 (painel: barra lateral 256, conteúdo até 1280).
- [ ] Contraste 4,5:1 (texto) e 3:1 (texto grande e elementos essenciais); texto a 200% sem perda; ordem de leitura; foco por teclado na web; movimento reduzido.
- [ ] Estados: carregando (esqueleto), vazio, erro com "Tentar de novo", sem permissão, offline (quando houver).
- [ ] Termos fixos, ausência de hex solto, no máximo um coral.
- [ ] No protótipo: rodou `cd prototipo && python -m http.server 8765` e exercitou a rota `#/perfil/tela` afetada; indicou o que é simulado.

## 6. Rastreabilidade e entrega

- Cite os IDs que sustentam o comportamento (RN-XX-nn, RF-*, US-XX-nn, seção do fluxo, seção do DS).
- Mudou regra? Atualize na mesma alteração: RN → PRD → história → fluxo → Design System → protótipo. Mudança de design entra na tabela da seção 18 do DS com data (dd/mm/aaaa) e motivo, **somente se o Pedro autorizou** a mudança de design.
- Ao finalizar, informe: arquivos alterados, o que foi verificado e como, o que ficou simulado ou pendente. Não commite nem faça push sem aprovação do Pedro e indicação da branch.
