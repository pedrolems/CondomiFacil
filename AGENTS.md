# CondomiFacil

App de gestão de condomínios para o Brasil (moradores, porteiros, limpeza, síndico, subsíndico, administradora, conselho fiscal, proprietário não residente, suporte e admin da plataforma). Cobre visitantes e portaria (inclusive offline), reservas pagas, encomendas e entregas esperadas, chamados, reclamações com score, comunicados, assembleias e votações, pesquisa mensal de funcionários, cobrança da taxa condominial e controle de receitas e despesas.

**Estado atual: Design fechado; fase 1 (base executável, RM-10 a RM-15) executada entre 18 e 19/11/2026 na branch `feat/fase-1-base-executavel`, com a prova do gerador P1 aprovada no RM-12.** Existe só a base: monorepo pnpm + Turborepo, API NestJS com `GET /v1/saude` sem banco, app Expo com a tela de saúde, design tokens e componentes da tela de saúde com Storybook, tipos gerados do contrato em `shared-types` e CI de PR só de verificação. Nenhuma funcionalidade de negócio implementada; não existe banco nem deploy. Idioma de tudo: português do Brasil (docs, UI, commits, nomes de telas).

Autor e dono do produto: Pedro Lemos.

## Onde está cada coisa

```
docs/
  01-produto/       Fonte da verdade do negócio (ver abaixo)
  02-design/        Design System e User Flows
  03-arquitetura/   Documento de arquitetura, ADRs e `criterios-de-poc.md` (ver abaixo)
  04-banco-de-dados/ MER/DER do banco (ver abaixo)
  05-backend/       Documentação do backend (ver abaixo) e contrato da API em 05-backend/api/
  06-frontend/     frontend.md (mobile) e painel-web.md (administradora)
  07-seguranca/ ... 09-infra/   Segurança/LGPD, plano de testes, infra e DevOps; `09-infra/pacote-tecnico-fase-1.md` é o pacote da fase 1
backend/apps/api/   API NestJS (hoje só a saúde, RM-13)
frontend/apps/      mobile (Expo, tela de saúde) e catalogo-componentes (Storybook web)
frontend/packages/  design-tokens e ui (RM-14)
packages/           shared-types (tipos e validação gerados do contrato, RM-12) e config
.github/workflows/  ci.yml: CI de PR só de verificação (RM-15)
prototipo/          Wireframes navegáveis em HTML/CSS/JS puro (sem build)
graphify-out/       Grafo de conhecimento gerado, ignorado pelo git
```

### Documentos de produto (`docs/01-produto/`)

| Arquivo | Conteúdo | IDs que define |
| --- | --- | --- |
| `01-visao-de-produto.md` | Problema, personas, proposta de valor, mercado, modelo de negócio, riscos, roadmap | — |
| `02-prd.md` | Escopo MVP x V2, planos e preços, 11 perfis, matriz de permissões, requisitos, stack técnica | `RF-*` (150), `RNF-*` (18), `SEG-*` (18) |
| `03-regras-de-negocio.md` | Regras detalhadas por módulo, glossário, catálogo de parâmetros configuráveis, rotinas automáticas | `RN-XX-nn` (CA, CD, CH, CO, EN, FI, GE, OF, PE, PG, PL, RC, RE, RL, SC, VI, VO) |
| `04-historias-de-usuario.md` | 14 épicos, 74 histórias com critérios de aceite; tabela de cobertura RF -> US | `US-XX-nn` |

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
| `adr/` | 16 ADRs (001 a 016) e índice em `adr/README.md`. **Aceitos, com ressalvas** por Pedro em 10/11/2026: 002 (Asaas), 004 (Supabase + Render para construir o MVP, com revisão obrigatória antes do piloto) e 005 (Resend); e o 015, em 14/11/2026, quanto à organização e às fontes; e o 016, em 16/11/2026 (painel web como site estático do Render em dev e staging, com revisão obrigatória antes do piloto). Os demais seguem Propostos, ainda não aceitos |

### Documentos de banco de dados (`docs/04-banco-de-dados/`)

| Arquivo | Conteúdo |
| --- | --- |
| `01-mer-e-der.md` | MER conceitual e DER lógico do MVP (acesso, pessoas, unidades, locação, planos, parâmetros, reservas, visitantes, encomendas, chamados, reclamações e score, pesquisa, comunicação, reuniões e eleições, cobrança, pagamentos, finanças, arquivos, notificações, auditoria e sincronização), com dicionário por domínio (seção 4), regras de integridade e operações indivisíveis, isolamento por RLS por condomínio, unidade e função, anonimização e retenção, ciclos de vida, rastreabilidade, pendências a decidir (seção 9) e critérios para o modelo físico. Proposta de 08/11/2026, não aceita pelo Pedro; sem banco nem migrações |

### Documentos de backend (`docs/05-backend/`)

| Arquivo | Conteúdo |
| --- | --- |
| `01-backend.md` | Monólito modular NestJS (processos API e worker), estrutura de pastas **híbrida** do `apps/api` (`interfaces/http/<perfil>/` na borda e `modulos/<dominio>/` no núcleo, com tabela perfil -> pasta -> módulos), padrões de código (SOLID, GRASP, GoF, erros, idempotência, outbox, testes), as 22 rotinas agendadas com os destaques QR Code Pix, lembretes de reserva e limpeza de dados, serviços externos e integrações, pendências e rastreabilidade. Proposta, não aceita pelo Pedro |
| `api/README.md` | Índice do contrato da API, como validar e visualizar, tabela de cobertura RF -> operação (todos os RF do PRD), contagem de operações por arquivo e pendências consolidadas para o Pedro decidir |
| `api/01-guia-da-api.md` | Convenções: autenticação, versão `/v1`, cabeçalhos, caminho por perfil, paginação por cursor, filtros, erros, idempotência, limite de taxa, envio de arquivos |
| `api/02-eventos-e-webhooks.md` | Catálogo de eventos de domínio, WebSocket, push e e-mail, e webhooks recebidos (transição de estado por evento do Asaas) |
| `api/03-integracoes-externas.md` | Asaas, Resend, Supabase Storage, Expo Push e FCM, Sentry: chamadas por porta, segredos, ambientes, limites do plano gratuito e lacunas |
| `api/openapi/*.yaml` e `api/redocly.yaml` | OpenAPI 3.1: um arquivo por pasta de interface (comum, morador, proprietário não residente, síndico, conselho fiscal, portaria, limpeza, sync, administradora, plataforma, webhooks) e componentes compartilhados; regras de lint |
| `api/asyncapi/tempo-real.yaml` | AsyncAPI 3.0: canais e mensagens do Socket.IO da portaria. Todo o contrato é proposta de 10/11/2026, não aceita pelo Pedro |

## Decisões de produto que não se deduzem do código

- **Planos:** Essencial (com administradora ou autogestão sem administradora e sem serviço administrativo pago, preço por faixa de unidades) e Gestão + Suporte (sem administradora; a equipe da plataforma faz o papel dela). Autogestão concentra administração na gestão local; síndico executa, sub substitui e conselho fiscaliza, com aprovação específica da troca de conta; complementos operacionais e lote 3 aprovados em 17/11/2026 no registro `docs/01-produto/06-autogestao-e-conducao-eleitoral.md`. Detalhes e preços no PRD, seção 2.
- **Eleições (13/11/2026):** em qualquer plano, síndico conduz; ausente/cargo vago, subsíndico; sem ambos, conselho; sem todos, proprietário designado com permissão temporária restrita à eleição. Administradora vinculada também pode; suporte autorizado só no plano Gestão + Suporte; ações auditadas, voto secreto e resultado só após encerramento (RN-VO-13).
- **Uma unidade ocupada tem um único morador habilitado** (proprietário, ou inquilino se alugada). Quem vota pela unidade é sempre o proprietário (RN-CD-19, RN-VO-01); o inquilino tem voto próprio só nos casos da regra de locação (exceção: RF-VO-11, RN-VO-18).
- **Score** é pessoal por vínculo de moradia com cada unidade, começando em 100 em cada novo vínculo, sem herdar pontos do ocupante anterior; saldo, histórico, recuperação e bloqueio ficam separados por unidade. Funcionários e síndico profissional sem unidade têm score individual por condomínio. O score público do síndico morador usa a unidade vinculada ao mandato. É referência para o julgador, não julgamento público; nunca usar verde/vermelho para ele. Subsíndico e conselho fiscal julgam reclamações contra o síndico conforme RN-RC-03 e RN-RC-07; suporte da plataforma não vê reclamações nem scores.
- **Portaria:** registro de entrada em até 2 toques, sem diálogo de confirmação (usa "Desfazer"), funcionando offline com fila de sincronização. Em Áreas, consulta reservas do dia e marca Em andamento, Cumprida ou Não comparecimento conforme RN-RE-13; vistoria inclusive de paga não usada exige internet. Falta paga não gera perda de pontos nem reembolso automático.
- **Limpeza offline:** em conclusões do mesmo ciclo, vale o menor horário registrado pelo celular, mesmo enviado depois (RN-CH-04). Avaliação da conclusão superada fica apenas no histórico, fora das médias e sem transferência; a efetiva pode receber nova avaliação na janela configurada desde sua disponibilização. A correção não reinicia as 48h de reabertura. Desempate exato e relógio incorreto continuam propostas técnicas no ADR-014.
- **Finanças do condomínio:** com administradora, ela edita e síndico/conselho só leem e comentam; no Essencial com autogestão, a distribuição local aprovada (RN-PL-08/RN-FI-29) põe síndico ou sub em substituição na execução e conselho na fiscalização; mês fechado só se altera por estorno. Receitas de cobrança e reservas entram automaticamente e agregadas, sem unidade. Não é contabilidade formal.
- **Fora de escopo:** contabilidade oficial (balancete, parecer, ata), catracas e interfones, entrega de comida por app. **MVP (14/11/2026):** nove relatórios gerenciais para administradora, PDF/CSV/XLSX e PNG/SVG só de gráficos agregados, com jobs privados e acesso revalidado (RN-RL-01 a 08). Novos relatórios não ampliam acessos de outros perfis. **Versão 2:** acordos de parcelamento.
- **Stack planejada (PRD seção 10 e ADRs 002, 004, 005 e 016):** React Native + TypeScript com Expo (Android, iOS e web via React Native Web), Node.js + NestJS, PostgreSQL com Row Level Security, WebSockets para a lista da portaria, SQLite ou WatermelonDB offline, Asaas como gateway de pagamento (ADR-002), Supabase (só PostgreSQL e Storage compatível com S3, região São Paulo) e Render (API, WebSocket e worker) para construir o MVP em dev e staging, sem custo (ADR-004; a nuvem do piloto com dados reais é revisão obrigatória antes do piloto), painel web como site estático do Render, plano gratuito (ADR-016, 16/11/2026), Resend para e-mail (ADR-005), Expo Push/FCM, Sentry. Decisões de Pedro de 10/11/2026, aceitas com ressalvas. No plano gratuito do Render o worker roda no mesmo serviço web da API e as rotinas param quando o serviço dorme.
- **Roadmap (estimativa):** Descoberta M1, Design M2 (marco: protótipo validado; testes com usuários Pulado — Inacessível (17/11/2026): não bloqueia G0), MVP M3 a M6 (parecer jurídico SEG-16 Pulado — Inacessível (17/11/2026): não bloqueia G0; obrigatório antes do primeiro dado real (piloto); substitui a exigência antes de iniciar o MVP, decisão de 14/11/2026), Piloto M7 em 1 a 3 condomínios, Lançamento M8, V2 M9 a M11.

## Protótipo (`prototipo/`)

HTML/CSS/JS puro, sem build. Abrir `prototipo/index.html` ou `cd prototipo && python -m http.server 8765`. Roda sem internet (Inter e Lucide em `prototipo/vendor/`). O `prototipo/README.md` lista todas as telas, perfis e simulações; leia-o antes de mexer.

- Rotas por hash: `#/perfil/tela/arg`.
- `css/tokens.css` espelha o Design System (claro e escuro); `css/components.css` espelha a seção 10; `css/app.css` é só a moldura do protótipo.
- `js/core.js` (rotas, layout, componentes), `js/data.js` (dados fictícios em memória, `S.fin` para finanças), `js/telas/*.js` (acesso, morador, sindico, funcionarios, admin, financas).
- O painel lateral troca perfil e tema e simula situações (score baixo, unidade em atraso, sem internet, substituição ativa etc.).
- O perfil de acesso **Manutenção** foi retirado por decisão de 17/11/2026; empresas e chamados acompanhados pelo síndico permanecem. Não criar um 12º perfil.
- O protótipo substituiu o Figma (limite do plano Starter no MCP). Estenda `prototipo/js/telas/*.js` em vez de voltar ao Figma, salvo pedido do Pedro.

## Convenções de trabalho

- **Perguntar em caso de dúvida ou decisão importante.** Antes de escolher uma interpretação ou tomar uma decisão importante, faça perguntas ao Pedro. Apresente as opções possíveis, explique brevemente suas consequências e recomende qual opção escolher, com o motivo da recomendação.
- **Respeitar o escopo do pedido.** Não altere nada além do que foi solicitado. Se for necessário mexer em algo que não esteja no comando, explique a necessidade e pergunte antes de alterar, inclusive quando a mudança decorrer da rastreabilidade entre documentos.
- **Aguardar as respostas antes de continuar.** O desenvolvimento só deve continuar depois que todas as perguntas apresentadas tiverem respostas. Enquanto houver pergunta sem resposta, pause o desenvolvimento e as alterações, inclusive nos subagentes. Silêncio, tempo decorrido e opção pré-selecionada não são respostas nem autorização.
- **Rastreabilidade é a regra central.** Mudou uma regra? Atualize, na mesma alteração, o que depende dela: RN -> PRD (RF) -> história de usuário -> fluxo -> Design System -> protótipo. Mudanças de design entram na tabela da seção 18 do Design System com data e motivo.
- **Padrões de projeto em alta no mercado: SOLID, GRASP e GoF.** Ao planejar e ao implementar código (backend, frontend, jobs, integrações), siga os três. SOLID: responsabilidade única por classe e inversão de dependência por portas e adaptadores (por exemplo `PaymentGateway` e `Mailer`). GRASP: Controller, Information Expert, Low Coupling e High Cohesion. GoF: Adapter para gateway de pagamento e e-mail, Strategy, Observer para eventos de domínio e outbox, Factory, Template Method para rotinas. Registre o padrão escolhido no doc ou em ADR quando a decisão for relevante. Não aplique padrão por enfeite: use quando resolver um problema real.
- Texto de interface: termos fixos do Design System seção 13 (por exemplo "Proprietário", "Inquilino", "Despesa extraordinária", "Desocupada"; nunca "locador" ou "locatário").
- Estado nunca só por cor: sempre texto e ícone (WCAG 1.4.1). Hex solto no código é erro; use referências à paleta.
- Docs em Markdown, tabelas para regras e matrizes, diagramas em Mermaid. Datas no formato dd/mm/aaaa nos docs.
- Git: branch de trabalho `docs/design-system-e-user-flows`; também existem `develop`, `staging` e `main`. **Nenhum commit vai para uma branch sem validação do Pedro.** Antes de commitar ou enviar ao `origin`, mostre o que será incluído e peça aprovação; o Pedro diz para qual ou quais branches o commit deve ir. Sem essa indicação, não commite, não faça merge ou fast-forward entre branches e não dê push. Aprovação para uma branch ou para um commit não vale para os próximos. Commits em português, descrevendo o conjunto da mudança.
- `graphify-out/` é gerado pela skill graphify e não vai para o git.

## Padrão de commits e pull requests

### Commits

Adotar **Conventional Commits**: `tipo(escopo): descrição`. O tipo e o escopo ficam em minúsculas; a descrição é em português, começa com verbo no infinitivo e resume o resultado, sem ponto final. O escopo identifica o módulo ou documento e pode ser omitido quando a mudança for transversal.

| Tipo | Quando usar |
| --- | --- |
| `feat` | Nova funcionalidade |
| `fix` | Correção de comportamento ou defeito |
| `docs` | Documentação, regras e contratos escritos antes da implementação |
| `refactor` | Reorganização de código sem mudar o comportamento |
| `test` | Criação ou ajuste de testes |
| `style` | Formatação de código sem mudança de comportamento |
| `perf` | Melhoria de desempenho |
| `build` | Dependências, empacotamento e ferramentas de build |
| `ci` | Automação de integração e entrega |
| `chore` | Manutenção que não se encaixa nos tipos anteriores |
| `revert` | Reversão de uma alteração, identificando o commit revertido no corpo |

Exemplos: `docs(readme): incluir manuais por perfil`, `docs(api): alinhar contrato de reservas` e `fix(portaria): corrigir registro de saída offline`. Para uma quebra de compatibilidade, usar `!` antes dos dois-pontos e explicar o impacto e a migração no corpo com `BREAKING CHANGE:`.

Cada commit deve formar uma mudança coerente e revisável. No corpo, quando necessário, explicar o motivo, os IDs de requisitos/regras relacionados e os impactos. **O formato não autoriza commit ou push:** continuam obrigatórias a aprovação do Pedro e a indicação das branches conforme a regra de Git acima.

### Pull requests (PRs)

Usar título no mesmo formato dos commits, descrevendo o conjunto final da mudança. O texto fica em português e segue este modelo, com detalhe proporcional ao tamanho da alteração:

```markdown
## Problema
Qual necessidade ou falha motivou a mudança.

## Alteração
O que passa a acontecer e quais documentos, telas ou módulos foram afetados.
Incluir IDs de rastreabilidade quando aplicável.

## Validação
Quais verificações foram executadas e seus resultados.
Se alguma não foi executada, informar qual e por quê.

## Pendências e riscos
Limitações, decisões pendentes ou impactos relevantes; escrever "Nenhum identificado" quando aplicável.
```

Definir a branch de destino conforme a indicação do Pedro; não presumir `main`. Ao mudar o escopo, atualizar título e descrição para refletir a entrega final. Abrir um PR não autoriza merge, promoção entre branches ou push adicional; as regras de aprovação de Git continuam valendo.

## Padrão de code review

- Revisar o diff e o contexto necessário, inclusive em documentação e protótipo. Priorizar regras de negócio, permissões, privacidade, isolamento de dados, fluxo offline, pagamentos, acessibilidade e rastreabilidade conforme o escopo.
- Apresentar primeiro os achados, do mais grave para o menos grave. Cada achado usa o formato **`[P1] Título objetivo — arquivo:linha`**, seguido do cenário que causa o problema, da consequência e da evidência. Referenciar RN/RF/US quando isso sustentar a conclusão.
- Usar **P0** para problema crítico que impede o uso ou a entrega e exige ação imediata; **P1** para falha grave que deve ser corrigida antes de integrar; **P2** para falha relevante de impacto limitado; **P3** para problema menor concreto. Não inflar a gravidade.
- Relatar problemas introduzidos pela mudança ou diretamente afetados por ela, com evidência verificável. Não tratar preferência pessoal, risco hipotético ou decisão de produto ainda proposta como defeito confirmado. Separar dúvidas e sugestões opcionais dos achados.
- Encerrar com as verificações feitas e as limitações da revisão. Se não houver achados, declarar **"Nenhum problema identificado na revisão"**, sem afirmar ausência garantida de defeitos.
- A revisão não autoriza alterações fora do escopo nem substitui a validação do Pedro para commit, push ou integração entre branches.

## Delegação a subagentes

- **A delegação é obrigatória: toda tarefa é executada por um subagente, um subagente por tarefa**, salvo as exceções explícitas abaixo. Se o Pedro pedir várias tarefas, cada uma vai para um subagente próprio; não concentrar pedidos independentes em um único subagente.
- O modelo da sessão atua como **orquestrador e revisor**. Ele define as tarefas, passa o contexto, acompanha o andamento e revisa tudo o que os subagentes alterarem ou criarem antes de reportar ao Pedro. Não assume a execução de uma tarefa delegada para contornar essa regra.
- Cada delegação deve informar: objetivo e resultado esperado, fontes e decisões já aprovadas, arquivos que podem ser alterados, limites do pedido, critérios de aceite e verificações necessárias. O subagente deve ler as instruções aplicáveis e preservar alterações preexistentes.
- Executar tarefas em paralelo somente quando forem independentes e não disputarem os mesmos arquivos. Se houver dependência ou arquivo compartilhado, ordenar as tarefas; não sobrescrever o trabalho de outro agente nem reverter alterações alheias para resolver conflitos.
- O subagente comunica dúvidas, necessidade de ampliar escopo e bloqueios ao orquestrador antes de decidir ou alterar além do autorizado. Quando houver pergunta ao Pedro sem resposta, o orquestrador pausa o desenvolvimento e as alterações de **todos** os subagentes, conforme as convenções de trabalho. Silêncio não permite retomada.
- A entrega de cada subagente deve listar arquivos alterados, resultado obtido, verificações e resultados, além de pendências ou limitações. Nenhum subagente pode commitar, fazer push, merge ou promover branches sem a autorização específica do Pedro prevista na regra de Git.
- **A entrega do subagente não é aprovação automática.** O orquestrador inspeciona os diffs, confere escopo, critérios de aceite e rastreabilidade, valida as evidências e solicita correções ao responsável quando necessário. Só então apresenta ao Pedro o resultado e eventuais pendências, sem atribuir como realizada uma verificação que não ocorreu.
- Ficam fora desse padrão, e o modelo da sessão faz diretamente:
  - alterações simples, quando o Pedro pede só uma alteração pontual;
  - commit, push ou PR, quando o pedido é só isso (a regra de git acima continua valendo);
  - consultas ao projeto, como perguntas sobre os docs ou o protótipo, sem alteração de arquivos.

## O que já está pronto

- Visão de Produto, PRD, Regras de Negócio e Histórias de Usuário (14 épicos, 74 histórias cobrindo 150 requisitos funcionais, conforme a tabela de cobertura).
- Design System e User Flows completos, revisados e alinhados aos docs de produto.
- Protótipo navegável com os fluxos de todos os perfis, incluindo as últimas adições: finanças do condomínio, entregas esperadas, listas de visitantes, avaliação de chamados, urgência e ordenação de chamados, semáforo de prazo de reclamação, política de locação e interface do subsíndico.
- Portaria com reservas do dia e registro de uso/vistoria: Em andamento, Cumprida e Não comparecimento, inclusive em reserva paga não usada; limpeza mantém vistoria (decisão de Pedro em 08/11/2026).
- Escolhas de infraestrutura (decisão de Pedro em 10/11/2026, aceitas com ressalvas): Asaas (ADR-002), Supabase + Render para construir o MVP em dev e staging, sem custo (ADR-004) e Resend (ADR-005).
- Contrato da API em `docs/05-backend/api/` (proposta de 10/11/2026, não aceita pelo Pedro): guia de convenções, 11 arquivos OpenAPI 3.1, AsyncAPI do tempo real, catálogo de eventos e webhooks, integrações externas e tabela de cobertura RF -> operação. É contrato escrito antes do código; do backend só existe a operação de saúde.
- **Fase 1 — base executável (RM-10 a RM-15, 18 e 19/11/2026):** Node 26.13.1 e pnpm 12.21.0 fixados com lockfile; lint, Prettier, TypeScript e Turborepo; geração de tipos e validação a partir do OpenAPI/AsyncAPI (P1 aprovada: openapi-typescript + Ajv + @asyncapi/parser); API NestJS com `GET /v1/saude` e app Expo exibindo a saúde; tokens, tema claro/escuro, componentes da tela de saúde e Storybook web e nativo; CI de PR com `pnpm check`, lint do OpenAPI e gitleaks. Resultados e limitações de cada etapa em `docs/09-infra/pacote-tecnico-fase-1.md`, seção 3.

## Próximos passos

**G0 liberado por Pedro em 18/11/2026 só para a fase 1** (RM-10 a RM-15, com a prova do gerador P1 no RM-12), conforme o pacote técnico (D1 a D8), R6-01 a R6-06 e PC-01 a PC-09. **Fase 1 executada (RM-10 a RM-15, 18 e 19/11/2026)** na branch `feat/fase-1-base-executavel`; RM-10 a RM-15 já estão em `develop`, `staging`, `main` e `docs/design-system-e-user-flows`. Provas em dispositivo (D8) concluídas: app com "API disponível" no emulador Android (19/11/2026) e no iPhone via Expo Go, com a API em túnel temporário (20/11/2026); Storybook nativo no emulador Android (19/11/2026) e no iPhone (20/11/2026). `test:a11y` (axe) no CI desde 20/11/2026. Pendências da fase 1: reprodução da instalação por outra pessoa e RM-16. O CI rodou pela primeira vez no GitHub em 19/11/2026, nos PRs #2 a #5, e passou. **Próximo passo:** Pedro liberar a etapa seguinte (PoCs P2 a P5 do RM-16 e fase 2). Continuam bloqueados: PoCs P2 a P5 (RM-16), banco e acesso (fase 2), deploy no Render ou Supabase, dados reais e commit, merge ou push sem aprovação específica do Pedro.

1. **Resolver as pendências do negócio** (User Flows seção 17), que bloqueiam partes do desenho:
   - Parecer jurídico sobre reclamações (SEG-16) e sobre as regras de locação; é o marco 2 do roadmap. Pulado — Inacessível (17/11/2026): não bloqueia G0; obrigatório antes do primeiro dado real (piloto). Pacote preparado em 16/11/2026; parecer não emitido nem aprovado.
   - Gateway de pagamento: o Asaas está escolhido (ADR-002). Seguem pendentes os prazos reais de confirmação de boleto e Pix, o KYC da subconta, o chargeback e a conta principal em CNPJ (definem prazos e erros dos fluxos 5.1 e 13.1); a prova de conceito no sandbox os verifica.
   - Prazo de 5 dias de resposta do alvo da reclamação: validar no piloto.
   - Finanças: orçamento anual previsto, transparência financeira para moradores, saldo do fundo de reserva e da conta de obras, plano de contas por administradora.
   - Cobrança em atraso como notificação obrigatória (proposta, ainda fora das RN e do US-NO-01).
2. **Validar o protótipo** com síndicos, porteiros e moradores (marco 1 do roadmap) e ajustar docs e telas com o que sair disso. Pulado — Inacessível (17/11/2026): não bloqueia G0; não realizado nem aprovado. Retomar quando houver acesso aos participantes.
3. **Perfil Manutenção resolvido (17/11/2026):** retirado do protótipo; preservar empresas e chamados pelo síndico.
4. **Validar os ADRs de `docs/03-arquitetura/adr/`**: os ADRs 002, 004 e 005 (10/11/2026) e 015 (14/11/2026, organização e fontes) já estão aceitos com ressalvas (a nuvem do piloto tem revisão obrigatória do ADR-004 antes do piloto com dados reais); aceitar, rejeitar ou ajustar os demais (dependem de PoC, custo ou parecer). Validar também o contrato da API de `docs/05-backend/api/` e decidir as pendências consolidadas em `api/README.md` e **preencher as pastas ainda vazias de `docs/`** na ordem natural: 07-seguranca (SEG-* e LGPD), 08-qualidade (estratégia de testes a partir dos critérios de aceite), 09-infra. A 04-banco-de-dados já tem o MER/DER em `docs/04-banco-de-dados/01-mer-e-der.md` e a 05-backend já tem a proposta em `docs/05-backend/01-backend.md`, ambos a validar.
5. **Demais fases do MVP (M3 a M6; só a fase 1 foi liberada e executada)** dependem dos itens 1 e 2, exceto o parecer jurídico (SEG-16) e a validação do protótipo, que estão Pulado — Inacessível (17/11/2026) e não bloqueiam G0: sobre a base do monorepo Expo + NestJS, começando por acesso e conta, portaria offline e cobrança, que são os módulos de maior risco.
6. Manter o README raiz (hoje só o nome) com uma descrição curta e links para os docs.

## Ferramentas e memória

- Existe grafo de conhecimento em `graphify-out/` (`/graphify` para consultar ou regenerar). Para perguntas de arquitetura e relação entre documentos, consulte o grafo primeiro.
- Os documentos são grandes (100 KB cada nos de design). Leia por seção, usando os índices de `##`, em vez de abrir o arquivo inteiro.

## Relatórios e painel web — 14/11/2026

Pedro autorizou antecipar relatórios ao MVP e alinhar documentação, contratos e protótipo. Fontes: RN-RL-01 a 08; RF-RL-01 a 11; US-RL-01 a 03; `docs/06-frontend/painel-web.md`. Protótipo em Administradora > Relatórios/Exportações, com dados e processamento simulados. Contratos e arquitetura continuam propostas, sem backend implementado e sem aceitação automática de ADRs.

## Complementos de autogestão e lote 3 — 17/11/2026

Pedro aprovou a rodada de 14 decisões: **1C, 2A, 3A, 4A, 5A, 6A, 7A, 8B, 9A, 10A, 11A, 12A, 13A, 14A**, com alinhamento de docs e protótipo autorizado. Fonte vigente: `docs/01-produto/06-autogestao-e-conducao-eleitoral.md`, seção 2.1. Somente dados fictícios até o primeiro condomínio oficial; nomear operador antes dele, sem atribuir Admin a Pedro. Conta recebedora exige aprovação local independente, sem Admin financeiro. Canal técnico/comercial por e-mail terá responsável/endereço antes de disponibilizar; não há canal operante presumido. Lote 4 respondido em 17/11/2026: **IN-01 A** (primeiro pacote após G0: base local reproduzível, depois acesso, portaria/offline e cobrança) e **IN-02 A** (comparação curta e PoCs com critérios; desenho aceito condicionado à prova). G0 liberado em 18/11/2026 só para a fase 1; continuam sem liberação automática dados reais, ADRs, demais PoCs e Git.
