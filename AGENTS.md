# CondomiFacil

App de gestão de condomínios para o Brasil (moradores, porteiros, limpeza, síndico, subsíndico, administradora, conselho fiscal, proprietário não residente, suporte e admin da plataforma). Cobre visitantes e portaria (inclusive offline), reservas pagas, encomendas e entregas esperadas, chamados, reclamações com score, comunicados, assembleias e votações, pesquisa mensal de funcionários, cobrança da taxa condominial e controle de receitas e despesas.

**Estado atual: fase de Design, antes do código.** O repositório só tem documentação e um protótipo HTML. Não existe backend, app nem banco. Idioma de tudo: português do Brasil (docs, UI, commits, nomes de telas).

Autor e dono do produto: Pedro Lemos.

## Onde está cada coisa

```
docs/
  01-produto/       Fonte da verdade do negócio (ver abaixo)
  02-design/        Design System e User Flows
  03-arquitetura/   Documento de arquitetura e ADRs (ver abaixo)
  04-banco-de-dados/ ... 09-infra/   Vazias (.gitkeep): banco, backend, frontend,
                                     segurança, qualidade, infra
prototipo/          Wireframes navegáveis em HTML/CSS/JS puro (sem build)
graphify-out/       Grafo de conhecimento gerado, ignorado pelo git
```

### Documentos de produto (`docs/01-produto/`)

| Arquivo | Conteúdo | IDs que define |
| --- | --- | --- |
| `01-visao-de-produto.md` | Problema, personas, proposta de valor, mercado, modelo de negócio, riscos, roadmap | — |
| `02-prd.md` | Escopo MVP x V2, planos e preços, 11 perfis, matriz de permissões, requisitos, stack técnica | `RF-*` (138), `RNF-*` (18), `SEG-*` (18) |
| `03-regras-de-negocio.md` | Regras detalhadas por módulo, glossário, catálogo de parâmetros configuráveis, rotinas automáticas | `RN-XX-nn` (CA, CD, CH, CO, EN, FI, GE, OF, PE, PG, PL, RC, RE, SC, VI, VO) |
| `04-historias-de-usuario.md` | 13 épicos, 71 histórias com critérios de aceite; tabela de cobertura RF -> US | `US-XX-nn` |

### Documentos de design (`docs/02-design/`)

| Arquivo | Conteúdo |
| --- | --- |
| `01-design-system.md` | Marca, cores (azul + coral), tipografia (Inter), ícones (Lucide), tokens, 25+ componentes, padrões de tela 11.x, navegação por perfil, escrita, acessibilidade (WCAG AA, toque mín. 48 dp, 56 na portaria), privacidade na UI. Seção 18 registra decisões e correções; seção 19 é a rastreabilidade |
| `02-user-flows.md` | Fluxos numerados por módulo (3.x acesso ... 13.x cobrança), mensagens de erro transversais, decisões da revisão (16) e **pendências (17)** |

### Documentos de arquitetura (`docs/03-arquitetura/`)

| Arquivo | Conteúdo |
| --- | --- |
| `01-arquitetura.md` | Componentes (mobile, web, API, tempo real, jobs, pagamentos, notificações, arquivos, auditoria, votações, finanças), estratégia multi-tenant (RLS por `condominio_id`), stacks com justificativas, ambientes (dev, staging, produção), segurança/LGPD, RNF, decisões em aberto e riscos (9), rastreabilidade |
| `02-diagramas-de-arquitetura.md` | Diagramas C4 em Mermaid (12): nível 1 contexto, nível 2 containers (fluxos offline, pagamento e implantação), nível 3 componentes do backend; decisões do documento (`sync` como módulo, pagamentos por eventos) e rastreabilidade. Proposta, não aceito |
| `adr/` | 14 ADRs (001 a 014) e índice em `adr/README.md`. Todos em estado Proposto ou Em aberto (002 gateway, 004 nuvem, 005 e-mail): nenhum foi aceito pelo Pedro ainda |

## Decisões de produto que não se deduzem do código

- **Planos:** Essencial (condomínio com administradora, preço por faixa de unidades) e Gestão + Suporte (sem administradora; a equipe da plataforma faz o papel dela). Detalhes e preços no PRD, seção 2.
- **Uma unidade ocupada tem um único morador habilitado** (proprietário, ou inquilino se alugada). Quem vota pela unidade é sempre o proprietário (RN-CD-19, RN-VO-01); o inquilino tem voto próprio só nos casos da regra de locação.
- **Score** é pessoal por vínculo de moradia com cada unidade, começando em 100 em cada novo vínculo, sem herdar pontos do ocupante anterior; saldo, histórico, recuperação e bloqueio ficam separados por unidade. Funcionários e síndico profissional sem unidade têm score individual por condomínio. O score público do síndico morador usa a unidade vinculada ao mandato. É referência para o julgador, não julgamento público; nunca usar verde/vermelho para ele. Subsíndico e conselho fiscal julgam reclamações contra o síndico conforme RN-RC-03 e RN-RC-07; suporte da plataforma não vê reclamações nem scores.
- **Portaria:** registro de entrada em até 2 toques, sem diálogo de confirmação (usa "Desfazer"), funcionando offline com fila de sincronização. Em Áreas, consulta reservas do dia e marca Em andamento, Cumprida ou Não comparecimento conforme RN-RE-13; vistoria inclusive de paga não usada exige internet. Falta paga não gera perda de pontos nem reembolso automático.
- **Limpeza offline:** em conclusões do mesmo ciclo, vale o menor horário registrado pelo celular, mesmo enviado depois (RN-CH-04). Avaliação da conclusão superada fica apenas no histórico, fora das médias e sem transferência; a efetiva pode receber nova avaliação na janela configurada desde sua disponibilização. A correção não reinicia as 48h de reabertura. Desempate exato e relógio incorreto continuam propostas técnicas no ADR-014.
- **Finanças do condomínio:** a administradora edita; síndico e conselho fiscal só leem e comentam; mês fechado só se altera por estorno. Receitas de cobrança e reservas entram automaticamente e agregadas, sem unidade. Não é contabilidade formal.
- **Fora de escopo:** contabilidade oficial (balancete, parecer, ata), catracas e interfones, entrega de comida por app. **Versão 2:** relatórios e acordos de parcelamento.
- **Stack planejada (PRD seção 10):** React Native + TypeScript com Expo (Android, iOS e web via React Native Web), Node.js + NestJS, PostgreSQL com Row Level Security, WebSockets para a lista da portaria, SQLite ou WatermelonDB offline, gateway brasileiro de pagamento (Asaas, Mercado Pago ou Pagar.me, ainda a escolher), Expo Push/FCM, S3, Sentry.
- **Roadmap (estimativa):** Descoberta M1, Design M2 (marco: protótipo validado), MVP M3 a M6 (marco: parecer jurídico SEG-16), Piloto M7 em 1 a 3 condomínios, Lançamento M8, V2 M9 a M11.

## Protótipo (`prototipo/`)

HTML/CSS/JS puro, sem build. Abrir `prototipo/index.html` ou `cd prototipo && python -m http.server 8765`. Só precisa de internet para a fonte Inter e os ícones Lucide (CDN). O `prototipo/README.md` lista todas as telas, perfis e simulações; leia-o antes de mexer.

- Rotas por hash: `#/perfil/tela/arg`.
- `css/tokens.css` espelha o Design System (claro e escuro); `css/components.css` espelha a seção 10; `css/app.css` é só a moldura do protótipo.
- `js/core.js` (rotas, layout, componentes), `js/data.js` (dados fictícios em memória, `S.fin` para finanças), `js/telas/*.js` (acesso, morador, sindico, funcionarios, admin, financas).
- O painel lateral troca perfil e tema e simula situações (score baixo, unidade em atraso, sem internet, substituição ativa etc.).
- O perfil **Manutenção** é uma *proposta*: o PRD não o define (hoje o síndico acompanha empresas cadastradas). Se o PRD ganhar o perfil, remover o banner de proposta.
- O protótipo substituiu o Figma (limite do plano Starter no MCP). Estenda `prototipo/js/telas/*.js` em vez de voltar ao Figma, salvo pedido do Pedro.

## Convenções de trabalho

- **Rastreabilidade é a regra central.** Mudou uma regra? Atualize, na mesma alteração, o que depende dela: RN -> PRD (RF) -> história de usuário -> fluxo -> Design System -> protótipo. Mudanças de design entram na tabela da seção 18 do Design System com data e motivo.
- Texto de interface: termos fixos do Design System seção 13 (por exemplo "Proprietário", "Inquilino", "Despesa extraordinária", "Desocupada"; nunca "locador" ou "locatário").
- Estado nunca só por cor: sempre texto e ícone (WCAG 1.4.1). Hex solto no código é erro; use referências à paleta.
- Docs em Markdown, tabelas para regras e matrizes, diagramas em Mermaid. Datas no formato dd/mm/aaaa nos docs.
- Git: branch de trabalho `docs/design-system-e-user-flows`; também existem `develop`, `staging` e `main`. **Nenhum commit vai para uma branch sem validação do Pedro.** Antes de commitar ou enviar ao `origin`, mostre o que será incluído e peça aprovação; o Pedro diz para qual ou quais branches o commit deve ir. Sem essa indicação, não commite, não faça merge ou fast-forward entre branches e não dê push. Aprovação para uma branch ou para um commit não vale para os próximos. Commits em português, descrevendo o conjunto da mudança.
- `graphify-out/` é gerado pela skill graphify e não vai para o git.

## Delegação a subagentes

- **Toda tarefa é executada por um subagente, um subagente por tarefa.** Se o Pedro pedir várias tarefas, cada uma vai para um subagente próprio.
- O modelo da sessão não executa as tarefas. Ele orquestra os subagentes: passa o contexto, acompanha o andamento e revisa tudo o que eles alterarem ou criarem antes de reportar ao Pedro.
- Ficam fora desse padrão, e o modelo da sessão faz diretamente:
  - alterações simples, quando o Pedro pede só uma alteração pontual;
  - commit, push ou PR, quando o pedido é só isso (a regra de git acima continua valendo);
  - consultas ao projeto, como perguntas sobre os docs ou o protótipo, sem alteração de arquivos.

## O que já está pronto

- Visão de Produto, PRD, Regras de Negócio e Histórias de Usuário (13 épicos, 71 histórias cobrindo 138 requisitos funcionais, conforme a tabela de cobertura).
- Design System e User Flows completos, revisados e alinhados aos docs de produto.
- Protótipo navegável com os fluxos de todos os perfis, incluindo as últimas adições: finanças do condomínio, entregas esperadas, listas de visitantes, avaliação de chamados, urgência e ordenação de chamados, semáforo de prazo de reclamação, política de locação e interface do subsíndico.
- Portaria com reservas do dia e registro de uso/vistoria: Em andamento, Cumprida e Não comparecimento, inclusive em reserva paga não usada; limpeza mantém vistoria (decisão de Pedro em 08/11/2026).

## Próximos passos

1. **Resolver as pendências do negócio** (User Flows seção 17), que bloqueiam partes do desenho:
   - Parecer jurídico sobre reclamações (SEG-16) e sobre as regras de locação; é o marco 2 do roadmap.
   - Escolha do gateway de pagamento (define prazos e erros dos fluxos 5.1 e 13.1).
   - Prazo de 5 dias de resposta do alvo da reclamação: validar no piloto.
   - Finanças: orçamento anual previsto, transparência financeira para moradores, saldo do fundo de reserva e da conta de obras, plano de contas por administradora.
   - Cobrança em atraso como notificação obrigatória (proposta, ainda fora das RN e do US-NO-01).
2. **Validar o protótipo** com síndicos, porteiros e moradores (marco 1 do roadmap) e ajustar docs e telas com o que sair disso.
3. **Decidir o perfil Manutenção:** incluir no PRD ou descartar do protótipo.
4. **Validar os ADRs de `docs/03-arquitetura/adr/`** (aceitar, rejeitar ou ajustar cada um; os em aberto dependem de PoC, custo ou parecer) e **preencher as pastas vazias de `docs/`** na ordem natural: 04-banco-de-dados (modelo com RLS por condomínio e por unidade), 05-backend (API, jobs da seção 14 das RN, webhooks de pagamento), 06-frontend (estrutura Expo, offline, tokens do Design System), 07-seguranca (SEG-* e LGPD), 08-qualidade (estratégia de testes a partir dos critérios de aceite), 09-infra.
5. **Iniciar o MVP (M3 a M6)** só depois dos itens 1 e 2: monorepo Expo + NestJS, começando por acesso e conta, portaria offline e cobrança, que são os módulos de maior risco.
6. Manter o README raiz (hoje só o nome) com uma descrição curta e links para os docs.

## Ferramentas e memória

- Existe grafo de conhecimento em `graphify-out/` (`/graphify` para consultar ou regenerar). Para perguntas de arquitetura e relação entre documentos, consulte o grafo primeiro.
- Os documentos são grandes (100 KB cada nos de design). Leia por seção, usando os índices de `##`, em vez de abrir o arquivo inteiro.
