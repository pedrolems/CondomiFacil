---
name: condomifacil-frontend-design
description: Projetar, prototipar, implementar ou revisar o design de telas e componentes do CondomiFacil para mobile e painel web, com modelos por perfil, padrões de acessibilidade e avaliação de tendências como Liquid Glass.
---

# Design de frontend do CondomiFacil

Defina o perfil, o condomínio e a unidade aplicáveis, a tarefa principal e seus estados. Use os termos do produto em português do Brasil e a documentação vigente para decidir o que cada pessoa pode ver ou fazer.

## Fontes de trabalho

1. Localize a regra do módulo nas [Regras de Negócio](../../../../docs/01-produto/03-regras-de-negocio.md), o requisito no [PRD](../../../../docs/01-produto/02-prd.md), os critérios nas [Histórias de Usuário](../../../../docs/01-produto/04-historias-de-usuario.md) e a sequência em [User Flows](../../../../docs/02-design/02-user-flows.md). Consulte as decisões e pendências pertinentes.
2. No [Design System](../../../../docs/02-design/01-design-system.md), use as seções 4–9 para tokens, 10–12 para componentes, composição e navegação, e 13–16 para texto, acessibilidade, privacidade e desempenho. Confira as decisões da seção 18 e a rastreabilidade da seção 19.
3. Para código, consulte o [mapa do frontend](../../../../frontend/README.md), a [biblioteca de componentes](../../../../docs/06-frontend/biblioteca-de-componentes.md) e o guia da superfície ([mobile](../../../../docs/06-frontend/frontend.md) ou [painel web](../../../../docs/06-frontend/painel-web.md)). Confira quais arquivos existem como estrutura reservada. Para protótipo, localize a rota e o cenário no [README do protótipo](../../../../prototipo/README.md). Use dados fictícios em exemplos e simulações.

## Desenho e revisão

- Escolha a composição conforme a tarefa e a densidade da informação. Use Inter, Lucide, tokens por tema e a navegação do perfil. Reutilize os componentes e tokens disponíveis. Preserve a regra do coral, os limites de toque e a relação entre estado, texto e ícone.
- Modele os estados aplicáveis ao fluxo, incluindo carregamento, vazio, erro com recuperação, permissão e conectividade. Condicione dados e ações ao contexto autorizado. Onde previsto, represente troca de contexto, revogação e sincronização. Identifique as decisões de produto pendentes.
- Consulte os [padrões e modelos de tela](references/padroes-e-modelos.md) para compor ou revisar uma tela e as [referências de tendências e Liquid Glass](references/tendencias-e-liquid-glass.md) para avaliar atualização visual, transparência ou movimento.
- Valide a tarefa principal e os estados relevantes em ambos os temas e nas larguras afetadas. Confira contraste, texto ampliado a 200%, ordem de leitura, foco por teclado na web e movimento reduzido. Exercite a superfície executável quando houver implementação e indique os estados simulados ou pendentes.
- Registre os IDs que sustentam o comportamento. Para mudanças de design autorizadas, siga a rastreabilidade do projeto e registre a decisão na seção 18 do Design System. Se uma escolha necessária mudar regra, permissão ou escopo, apresente as opções ao Pedro conforme AGENTS.md.

