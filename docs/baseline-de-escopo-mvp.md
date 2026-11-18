# Baseline de escopo do MVP — RM-08

**Preparado em:** 17/11/2026. **Decisor:** Pedro Lemos. **Estado:** aceita por Pedro em 18/11/2026, incluindo o recorte da primeira entrega (seção 7); não encerra G0 e não aceita ADR, contrato ou MER.

Este documento entrega o RM-08 do [roadmap](roadmap.md) ("Reconciliar divergências de estado e preparar baseline de escopo"). Consolida quatro análises somente leitura (produto, documentação, arquitetura/API/banco e design/protótipo), revisadas pelo orquestrador com conferência por amostragem das evidências arquivo:linha.

## Índice

1. [Objetivo, escopo e limites](#1-objetivo-escopo-e-limites)
2. [Decisões de Pedro nesta rodada](#2-decisões-de-pedro-nesta-rodada)
3. [Fontes e revisões](#3-fontes-e-revisões)
4. [Marcos e gates](#4-marcos-e-gates)
5. [Estado das decisões](#5-estado-das-decisões)
6. [Escopo funcional do MVP](#6-escopo-funcional-do-mvp)
7. [Recorte técnico da primeira entrega](#7-recorte-técnico-da-primeira-entrega)
8. [Divergências consolidadas](#8-divergências-consolidadas)
9. [Pendências classificadas para o G0](#9-pendências-classificadas-para-o-g0)
10. [Perguntas abertas ao Pedro](#10-perguntas-abertas-ao-pedro)
11. [Rastreabilidade e próximos passos](#11-rastreabilidade-e-próximos-passos)

## 1. Objetivo, escopo e limites

| Item | Definição |
| --- | --- |
| Objetivo | Lista de fontes e revisões, marcos, RF/US do MVP e divergências, como base para o item 2 e 3 do [checklist G0](roadmap.md#42-checklist-g0--pronto-para-iniciar-o-mvp) e para o RM-09 |
| Escopo | Registrar. As divergências ficam listadas com correção proposta; **nenhum outro documento é corrigido por este RM** |
| Exceção autorizada | Criação dos RF/US da plataforma em PRD, RN e US (seção 2.1), feita em rodada paralela |
| Limites | Correções fora deste arquivo aguardam autorização de Pedro, por pacote. Este documento não aceita ADR, contrato ou MER, não libera a fase 1, não autoriza commit, push, dados reais ou PoC |
| Método | Leitura por seção e busca nos docs, contagens por script somente leitura; evidências citadas como `arquivo:linha` no estado da branch `docs/design-system-e-user-flows` (HEAD `a0231bb`) |

## 2. Decisões de Pedro nesta rodada

| Tema | Decisão (17/11/2026) | Efeito na baseline |
| --- | --- | --- |
| Destino do RM-08 | Arquivo novo; no roadmap só a linha RM-08 aponta para ele | Este documento |
| Divergências | Só listar, com correção proposta; corrigir depois por pacote aprovado | Seção 8, estado "Registrada — aguarda autorização" |
| Parecer jurídico (SEG-16) | Adiado por falta de orçamento: **não bloqueia G0**, mas é **obrigatório antes do primeiro dado real (piloto)** e, portanto, antes do lançamento. Até lá, somente dados fictícios | Resolve o alcance do "Pulado — Inacessível" ([roadmap.md:166](roadmap.md)); ajuste do checklist pré-piloto/G2 fica pendente (BL-DV-04) |
| Contagem do MVP | Contar só o MVP, sem a V2: a regra decidida resultou em **149 RF e 73 US** antes dos acréscimos da seção 2.1. Com eles, a contagem vigente é **153 RF e 76 US no MVP**, mais 1 RF e 1 US da V2 (RF-FI-14 e US-FI-06, acordos de parcelamento); total 154 RF e 77 US | Seção 6; G1 não cobra o parcelamento |
| RF/US da plataforma | Criar nesta rodada em PRD, RN e US; fluxos, Design System, protótipo e API ficam como pendência rastreável | Seção 2.1; BL-DV-05 tratado no produto |
| RF-AC-07 ("Como funciona") | Mantido. Desenvolvimento usa texto provisório com dados fictícios; texto revisado pelo parecer é obrigatório antes do primeiro uso real | BL-DV-07 resolvido quanto à regra |
| Saúde da API | `GET` de saúde em `comum.yaml`; recorte de geração da base = saúde + `comum.yaml` inteiro (só gerado, sem implementar) | BL-DV-03; **aplicado ao contrato em 18/11/2026** (`GET /v1/saude`, `comumConsultarSaude`; 430 → 431 operações, conforme o `api/README.md`) |

### 2.1 RF/US da plataforma criados nesta rodada

Feito em 17/11/2026 em [02-prd.md](01-produto/02-prd.md), [03-regras-de-negocio.md](01-produto/03-regras-de-negocio.md) e [04-historias-de-usuario.md](01-produto/04-historias-de-usuario.md), revisado e aprovado pelo orquestrador.

| Tipo | ID | Conteúdo |
| --- | --- | --- |
| RF | RF-AD-22 | Cadastrar condomínios e administradoras, com plano e modalidade de gestão (com administradora, autogestão no Essencial ou Gestão + Suporte) |
| RF | RF-AD-23 | Registrar mudança de plano ou de modalidade com transição assistida |
| RF | RF-AD-24 | Conceder e revogar acesso de suporte a um condomínio, só no Gestão + Suporte |
| RF | RF-AD-25 | Verificar identidade, representação e documentos em capacidade restrita |
| RN | RN-PL-09 | Papel do Admin da plataforma e limite da capacidade restrita (sem conteúdo de gestão, reclamações ou scores) |
| US | US-PL-03 | Cadastrar condomínio e administradora (RF-AD-22) |
| US | US-PL-04 | Conceder acesso de suporte (RF-AD-24) |
| US | US-PL-05 | Verificar habilitação em capacidade restrita (RF-AD-25) |
| US alterada | US-PL-01 | Passa a citar RF-AD-23 e RN 11.1 |
| PRD | 02-prd.md:91 e :174 | Admin da plataforma descrito com a capacidade restrita de verificação |

O atendimento por e-mail (decisão 12A) **não virou RF**: o canal é externo e ainda não tem responsável nem endereço; segue como critério de aceite de US-PL-01. Pendências de rastreabilidade em BL-DV-05.

## 3. Fontes e revisões

Datas "declaradas" vêm do cabeçalho de cada arquivo; "git" é o último commit que o alterou. Vários cabeçalhos estão parados em 15/11 apesar de conteúdo de 17/11 (BL-DV-21).

| Grupo | Arquivo | Revisão declarada | Estado declarado |
| --- | --- | --- | --- |
| Projeto | [AGENTS.md](../AGENTS.md) | sem data; git 17/11 | "fase de Design, antes do código" (AGENTS.md:5) — desatualizado (BL-DV-19) |
| Projeto | [README.md](../README.md) | git 17/11 | fase de Design; cita workspace pnpm |
| Planejamento | [roadmap.md](roadmap.md) | 15/11, atualizado 17/11 | plano para revisão; não autoriza o MVP |
| Planejamento | [decisoes-para-iniciar-o-desenvolvimento.md](decisoes-para-iniciar-o-desenvolvimento.md) | 17/11 | lotes 1–3 aprovados, lote 4 respondido, G0 pendente (:3) |
| Produto | 01-visao-de-produto.md | 15/11 | marcos 1 e 2 ainda como pré-condição (:189) |
| Produto | 02-prd.md, 03-regras-de-negocio.md, 04-historias-de-usuario.md | 15/11 (conteúdo de 17/11) | fontes oficiais de RF, RN e US |
| Produto | 05-decisoes-de-complementacao.md | 12/11, atualizado 16/11 | 19 escolhas aprovadas |
| Produto | 06-autogestao-e-conducao-eleitoral.md | 13/11, atualizado 17/11 | lotes 1–3 aprovados; lote 4 ainda "pendente" (:3) |
| Design | 01-design-system.md, 02-user-flows.md | 15/11 (conteúdo de 17/11) | DS §18 e UF §16–17 com notas de 17/11 |
| Arquitetura | 01-arquitetura.md, 02-diagramas-de-arquitetura.md | 15/11 | proposta, não aceita |
| Arquitetura | adr/README.md e ADR-001 a 016 | ver seção 5 | 6 aceitos (com ressalvas/escopo), 10 propostos |
| Banco | 01-mer-e-der.md, 02-politica-de-acesso-a-dados.md, 03-estrategia-de-migrations-e-seeds.md | 15/11, 15/11, 14/11 | propostas |
| Backend | 01-backend.md, 02-diagramas-de-sequencia-e-estados.md, api/README.md + OpenAPI/AsyncAPI | 15/11 (README com notas de 16 e 17/11) | proposta, não aceita; 430 operações; 30 pendências |
| Frontend | 06-frontend/frontend.md, painel-web.md, biblioteca-de-componentes.md | 15/11, 15/11, 14/11 | propostas / planejamento |
| Segurança | 07-seguranca/seguranca.md, lgpd.md, pacote-para-validacao-juridica.md | 15/11, 14/11, git 16/11 | propostas; SEG-16 "Pendente - Inacessível (16/11/2026)" |
| Qualidade | 08-qualidade/01-plano-de-testes.md | 15/11 | proposta |
| Infra | 09-infra/infra-e-devops.md, monitoramento-e-runbook.md, guia-de-publicacao-para-as-lojas.md | 16/11, 15/11, 15/11 | planejamento / proposta |
| Protótipo | [prototipo/README.md](../prototipo/README.md) | git 17/11 | offline com `vendor/`; Manutenção retirada |
| Estrutura | `backend/`, `frontend/`, `packages/`, `package.json`, `pnpm-workspace.yaml` | commits de 15/11 | esqueleto preparatório (ADR-015), sem dependências nem scripts |
| Outros | docs/superpowers/plans/2026-11-10-documentacao-da-api.md | 10/11 | plano de trabalho antigo; fora do mapa do AGENTS (Q-14) |

Contagens conferidas por script antes dos acréscimos da seção 2.1: 150 RF, 18 RNF, 18 SEG, 74 US, 14 épicos, 430 operações sem `operationId` duplicado. Nenhum link relativo quebrado nos docs.

## 4. Marcos e gates

| Marco | Estado em 17/11/2026 | Evidência |
| --- | --- | --- |
| M1 Descoberta | Artefatos disponíveis; pesquisa de mercado não comprovada | roadmap.md:137 |
| M2 Design (fase 0) | Em andamento documental | roadmap.md:138 |
| Marco 1 — protótipo validado | Pulado — Inacessível (RM-02); só retorno positivo de moradores | roadmap.md:63, :165 |
| Marco 2 — parecer jurídico | Pulado — Inacessível para G0 (RM-03); obrigatório antes do piloto (decisão desta rodada) | roadmap.md:166; seção 2 |
| **G0 — pronto para o MVP** | **Aberto.** 1 de 4 itens marcado (decisões de implantação). Esta baseline atende parte dos itens 2 e 3; o item 4 (liberação de Pedro) segue aberto | roadmap.md:174-181 |
| M3–M6 MVP (fases 1 a 5) | Fase 1 bloqueada por G0; demais não iniciadas | roadmap.md:139-143 |
| G1 — MVP homologado | Não iniciado | roadmap.md:492 |
| M7 Piloto / G2 | Não iniciado; passa a exigir parecer (BL-DV-04) | roadmap.md:538 |
| M8 Lançamento | Não iniciado | roadmap.md:145 |
| M9–M11 V2 | Não iniciado | roadmap.md:146 |

| RM | Estado | Evidência |
| --- | --- | --- |
| RM-01 | Parcial: relato positivo de moradores | roadmap.md:164 |
| RM-02, RM-03 | Pulado — Inacessível (17/11) | roadmap.md:165-166 |
| RM-04 | Decisões de produto e lote 3 aprovados; desenho técnico pendente; operador adiado | roadmap.md:167 |
| RM-05 | 14A aceita; lote 4 respondido; pacote concreto a apresentar | roadmap.md:168 |
| RM-06 | Propostas disponíveis, não revisadas | roadmap.md:169 |
| RM-07 | Concluído (13A) | roadmap.md:170 |
| RM-08 | Concluído: baseline aceita por Pedro em 18/11/2026 | Este documento |
| RM-09 | Bloqueado por RM-05 e RM-06 | roadmap.md:172 |

## 5. Estado das decisões

| Item | Estado | Fonte |
| --- | --- | --- |
| ADR-001 RLS, 003 offline, 006 a 013 | Propostos | linha 3 de cada ADR; adr/README.md |
| ADR-014 primeira conclusão da limpeza | Proposto (critério de produto em RN-CH-04) | adr/014:3 |
| ADR-002 Asaas, 005 Resend | Aceitos, com ressalvas (10/11) | adr/002:3, adr/005:3 |
| ADR-004 Supabase + Render | Aceito, com ressalvas, só dev e staging; revisão antes do piloto | adr/004:3 |
| ADR-015 workspaces | Aceito quanto à organização e às fontes (14/11); gerador e versões pendentes | adr/015:3 |
| ADR-016 painel web | Aceito, com ressalvas (16/11), só dev e staging | adr/016:3 |
| Contrato da API | Proposta, não aceita; 30 pendências | api/README.md:3 |
| MER/DER | Proposta, não aceita; 16 pendências P-* | 01-mer-e-der.md:3, §9 |
| Política de acesso, migrations, backend, arquitetura, C4 | Propostas | cabeçalhos |
| Complementação (12/11) | 19 escolhas aprovadas | 05-decisoes-de-complementacao.md:3 |
| Lote 1 (AG-01 A, AG-02 A, AG-07 C) | Aprovado em 17/11 | decisoes:12 |
| Lote 2 (AG-03 C, AG-04 A, AG-05 A, AG-06 A, AG-12 B) | Aprovado em 17/11 | decisoes:13 |
| Lote 3 / rodada complementar (1C, 2A–7A, 8B, 9A–14A) | Aprovado em 17/11 | registro 06 §2.1 |
| Lote 4 (IN-01 A, IN-02 A) | Respondido em 17/11; pacote técnico a apresentar | decisoes:3, :138-139 |
| Lote 5 | Fila sem respostas | decisoes:145-159 |
| Decisões desta rodada | Seção 2 | — |

## 6. Escopo funcional do MVP

**Contagem vigente:** 153 RF e 76 US no MVP; 1 RF (RF-FI-14) e 1 US (US-FI-06) na V2; total 154 RF e 77 US. Antes dos acréscimos da seção 2.1 eram 149 RF e 73 US no MVP. A única RN da V2 é RN-FI-18. Todo RF tem ao menos uma US e toda US cita RF existente (cruzamento por script, feito antes dos acréscimos; os novos RF-AD-22 a 25 são citados por US-PL-01, 03, 04 e 05).

| # | Módulo / épico | RF do MVP | US | RN principais | Observação |
| --- | --- | --- | --- | --- | --- |
| 1 | Acesso e conta | RF-AC-01 a 08 (8) | US-AC-01 a 06 | RN-CD-01 a 03 | RF-AC-07 com texto provisório até o parecer (seção 2) |
| 2 | Administração | RF-AD-01 a 15, 17 a 21 (20) | US-AD-01 a 12 | RN-CD, RN §3.1, RN-PL-08, RN-PG-01 a 04 | Lotes 1–3 refletidos em RF-AD-08/09/13 |
| 3 | Reservas e pagamentos | RF-RE-01 a 10, RF-PG-01 a 04 (14) | US-RE-01 a 06 | RN-RE, RN-CA, RN-PG | Portaria marca Em andamento, Cumprida, Não comparecimento |
| 4 | Visitantes e portaria | RF-VI-01 a 15 (15) | US-VI-01 a 08 | RN-VI, RN-OF | Offline; fase 3 pelo IN-01 A |
| 5 | Encomendas | RF-EN-01 a 08 (8) | US-EN-01 a 04 | RN-EN | — |
| 6 | Chamados | RF-CH-01 a 11 (11) | US-CH-01 a 05 | RN-CH | Perfil Manutenção retirado (13A) |
| 7 | Reclamações e score | RF-RS-01 a 16 (16) | US-RS-01 a 08 | RN-RC, RN-SC | Sem julgador elegível, o caso aguarda (10A) |
| 8 | Pesquisa mensal | RF-PE-01 a 04 (4) | US-PE-01, 02 | RN-PE | — |
| 9 | Comunicação | RF-CO-01 a 04 (4) | US-CO-01 a 03 | RN-CO | — |
| 10 | Votações e eleições | RF-VO-01 a 11 (11) | US-VO-01 a 03 | RN-VO, RN-VO-13 | Condução escalonada; designação até 30 dias (6A) |
| 11 | Planos e suporte | RF-AD-16, RF-AD-22 a 25 (5) | US-PL-01 a 05 | RN-PL, RN-PL-09, RN §11.1 | Painel da plataforma com RF próprio desde 17/11/2026 (seção 2.1) |
| 12 | Notificações e LGPD | RF-NO-01, RF-LG-01/02 (3) | US-NO-01, US-LG-01 | SEG-11 | Operador de LGPD "a definir" (02-prd.md:355) |
| 13 | Cobrança e finanças | RF-FI-01 a 13, 15 a 24 (23) | US-FI-01 a 05, 07 a 10 | RN-FI, RN-FI-29, RN-PG-01 | Troca de conta 8B e baixas manuais 9A |
| 14 | Relatórios | RF-RL-01 a 11 (11) | US-RL-01 a 03 | RN-RL-01 a 08 | No MVP por decisão de 14/11/2026 |
| | **Total** | **153** | **76** | | |

**Fora do MVP:**

| Item | Situação | Fonte |
| --- | --- | --- |
| Acordos de parcelamento | V2 (M9–M11) | 02-prd.md:374; 04-historias:886; 03-rn:557 |
| Contabilidade oficial, catracas e interfones, entrega de comida | Fora de escopo | 02-prd.md:60 |
| Perfil de acesso Manutenção e login de empresa | Retirado (13A, 17/11); empresas e chamados pelo síndico preservados; sem 12º perfil | registro 06:70 |

**Extensões não aprovadas (14A — decidir antes do módulo afetado, nenhuma entra por consequência):** notificação obrigatória de cobrança em atraso; ações sem RF/RN; denúncia pela administradora; orçamento anual, transparência financeira aos moradores, saldos de fundo de reserva e conta de obras, plano de contas (02-prd.md:75; registro 06:71; 02-user-flows.md:1499-1503).

## 7. Recorte técnico da primeira entrega

Ordem do IN-01 A: base local reproduzível → acesso → portaria/offline e cobrança. Propostas técnicas seguem não aceitas; o aceite fica condicionado à prova (IN-02 A).

| Módulo | O que existe | Lacunas | Depende de | PoC |
| --- | --- | --- | --- | --- |
| Base local (RM-10 a RM-16) | ADR-015 (fontes canônicas), ADR-016; `redocly.yaml`; esqueleto `backend/apps/api` sem código; `pnpm-workspace.yaml` sem `packageManager` | Operação de saúde aplicada ao contrato em 18/11/2026; recorte de geração decidido, geração não executada; gerador, Node/pnpm, lockfile | BL-DV-03 | Gerador OpenAPI/AsyncAPI |
| Acesso, conta, condomínio, permissões (RM-20 a RM-25) | `comum.yaml`, `administradora.yaml`, `plataforma.yaml`; MER 4.1–4.3; política de acesso; Flyway proposto; ADR-001/007/008 | RF/US da plataforma tratados no produto, pendentes em fluxos, DS, protótipo, API e MER; verificação restrita do Admin no sistema; habilitação, comprovantes e mandatos na autogestão; reautenticação; capacidades simultâneas no RLS; executor de migrations; ator técnico da primeira carga | BL-DV-05, 06, 09, 10, 11, 13, 14 | RLS, sessões, query builder, migrations |
| Portaria e offline (RM-30 a RM-34) | `portaria.yaml` (24), `sync.yaml` (2), AsyncAPI (4 mensagens); MER 4.4 e 4.12; ADR-003/006/014 | Revalidação do WebSocket; caminho do sync nos docs; modo treinamento sem operação; reentrada (MER P-10); compensação do Desfazer (API 16–18) | BL-DV-12, 24 | ADR-003, ADR-014 |
| Cobrança e reservas (RM-35 a RM-39) | Cobrança e conta em `administradora.yaml` e gestão do síndico; `webhooks.yaml`; MER 4.10; ADR-002 aceito | Troca de conta com aprovação (8B); reautenticação (9A); pendências Asaas (MER P-06/P-16; API 7, 9, 11–13, 26); fuso (P-05) | BL-DV-08, 09 | PoC Asaas (roadmap §5.7), ADR-006/012 |
| Eleições e relatórios | Fora da primeira entrega | Condutor sem mandato no MER; prazo da concessão | BL-DV-18, 23 | — |

**Cobertura de telas do protótipo por perfil:**

| Perfil | Situação no protótipo |
| --- | --- |
| Acesso, Morador, Síndico morador, Subsíndico, Portaria, Limpeza, Proprietário não residente, Administradora (web) | Fluxos do MVP cobertos |
| Conselho fiscal | Acessa finanças, autogestão e procedimentos pelo morador; **não julga reclamações** (BL-DV-15) |
| Síndico profissional, Suporte, Admin da plataforma | **Sem perfil no protótipo** (prototipo/js/core.js:5-20; BL-DV-15) |

## 8. Divergências consolidadas

72 achados dos quatro relatórios, deduplicados em 49 itens, mais 1 achado da rodada de produto (BL-DV-50); total 50. Origem: `PROD` produto, `DOC` documentação, `ARQ` arquitetura, `DES` design. Estado padrão: **Registrada — aguarda autorização**. Donos por papel: Pedro/produto, documentação, engenharia, design, segurança/jurídico.

### 8.1 Bloqueiam G0

| ID | Origem | Descrição | Fontes | Dono | Correção proposta | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| BL-DV-01 | DOC-01 a 04; PROD-01; DES-01, 02 | Parecer e validação do protótipo ainda aparecem como pré-condição do MVP; SEG-16 com rótulo e data divergentes | AGENTS.md:77, :183-192; 01-visao:169, :176, :189; 01-arquitetura:30, :951, :1019; 06-frontend/frontend.md:395; 02-user-flows.md:1495, :1498; seguranca.md:304, :337; lgpd.md:235; pacote-para-validacao-juridica.md:58, :111 x roadmap.md:63, :176-177 | Documentação | Registrar "Pulado — Inacessível (17/11/2026): não bloqueia G0; obrigatório antes do primeiro dado real (piloto)", preservando linhas e histórico | Aplicada em 18/11/2026 (autorização de 17/11/2026); sobras do `pacote-para-validacao-juridica.md` corrigidas em 18/11/2026; registro histórico de 16/11 e pergunta ao advogado (linha 88) mantidos |
| BL-DV-02 | DOC-05; PROD-06; DES-03 | Lote 4 descrito como pendente ou "próxima rodada" | decisoes:25, :174; registro 06:3, :73; 02-user-flows.md:1485; frontend.md:439; prototipo/README.md:99; 01-design-system.md:1257 x decisoes:3, :138-139 | Documentação | "Lote 4 respondido (IN-01 A, IN-02 A); pacote técnico e G0 pendentes" | Aplicada em 18/11/2026 (autorização de 17/11/2026); `06-autogestao-e-conducao-eleitoral.md:77` corrigida em 18/11/2026; linha histórica do DS §18 mantida |
| BL-DV-03 | ARQ-06 | Primeira entrega exige "app alcança health da API", mas o contrato não tem operação de saúde nem recorte de geração | decisoes:138; roadmap.md:371-372 x OpenAPI (busca sem resultado) | Engenharia | `GET` de saúde em `comum.yaml`; recorte = saúde + `comum.yaml`; atualizar contagem e README da API | Aplicada em 18/11/2026: `GET /v1/saude` (`comumConsultarSaude`), 37 operações em `comum.yaml`, 431 no total; lint Redocly sem erros; exceção de cabeçalho registrada no `01-guia-da-api.md` (seção 1 e tabela da seção 3) em 18/11/2026 |

### 8.2 Bloqueiam piloto

| ID | Origem | Descrição | Fontes | Dono | Correção proposta | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| BL-DV-04 | DOC-14 | PRD exige parecer antes do lançamento; checklist pré-piloto/G2/lançamento não traz SEG-16 | 02-prd.md:476; roadmap.md:505-545, :547-561 | Pedro / documentação | Incluir SEG-16 e texto revisado do RF-AC-07 no checklist pré-piloto (§11.1) e G2 | Aplicada em 18/11/2026: SEG-16 e RF-AC-07 no checklist pré-piloto (§11.1) e no G2 do roadmap |

### 8.3 Bloqueiam módulo

| ID | Origem | Módulo | Descrição | Fontes | Dono | Correção proposta | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BL-DV-05 | PROD-03; ARQ-01; DES-05 | Acesso / implantação | Painel da plataforma é MVP sem RF/US de cadastro, planos, suporte e verificação restrita; Admin descrito como "sem acesso a tenant" contra AG-02 A, 3A, 4A, 11A | 02-prd.md:54, :91, :174 x :69, :101; 01-arquitetura.md:605; 01-backend.md:231; 02-politica:75, :112; frontend.md:147; painel-web.md:93 | Produto / engenharia | Capacidade técnica restrita (Q-05) e alinhamento de arquitetura, política, frontend, fluxos, DS, protótipo e API | Tratado no produto em 17/11/2026 (PRD, RN, US); pendente nos fluxos, Design System, protótipo, API (`plataforma.yaml` e tabela RF -> operação sem RF-AD-22 a 25), MER (entidades de verificação, comprovantes, revisão) e AGENTS.md |
| BL-DV-06 | ARQ-02 | Acesso / eleições | Sem operações e entidades para primeira habilitação, comprovantes por evento, ausência e emergência, contestação, mandato por posse na autogestão (AG-07 C), concessão eleitoral, representante do conselho, transição assistida | plataforma.yaml:2657-2671; api/README.md:79-82, :303, :324; 01-mer-e-der.md:927, :964-966 | Engenharia | Recorte mínimo antes do RM-22 (habilitação, comprovante, revisão); concessão eleitoral e conselho no RM-45 | Registrada — aguarda autorização |
| BL-DV-07 | PROD-02 | Acesso | RF-AC-07 depende de texto revisado pelo parecer adiado | 02-prd.md:192; 04-historias:35-40 | Produto | Anotar no RF: texto provisório no desenvolvimento; revisado obrigatório antes do primeiro uso real | Resolvido quanto à regra (seção 2); anotação aguarda autorização |
| BL-DV-08 | ARQ-04 | Cobrança | Troca de conta exige solicitar/aprovar (8B), mas o contrato só tem cadastro unilateral e `conta_recebedora` não tem aprovação | sindico.yaml:5383; administradora.yaml:3601; 01-mer-e-der.md:638; 01-backend.md:228, :230 x registro 06:49, :65 | Engenharia | Pedido de troca com "Aguardando aprovação independente" e operações solicitar/aprovar/recusar; abrangência em Q-04 | Registrada — aguarda autorização |
| BL-DV-09 | ARQ-05 | Cobrança / acesso | Reautenticação (9A) sem mecanismo no guia, ADR-007 ou componentes | busca sem resultado em 01-guia-da-api.md, adr/, componentes | Engenharia | Mecanismo de reautenticação curta no ADR-007 e guia; momento em Q-03 | Registrada — aguarda autorização |
| BL-DV-10 | ARQ-13 | Acesso | Contexto RLS com `app.papel` único contra capacidades simultâneas | 01-arquitetura.md:574; adr/007:51, :100; 02-politica:90 | Engenharia | Validar na PoC de RLS políticas por capacidades vigentes | Registrada — aguarda autorização |
| BL-DV-11 | ARQ-15 | Acesso (migrations) | ADR-008 não registra Flyway nem separa executor de migrations | adr/008:26-27, :34; 01-arquitetura.md:784, :882 x 03-estrategia-de-migrations:42 | Engenharia | Q-02 | Registrada — aguarda autorização |
| BL-DV-12 | ARQ-12 | Portaria | AsyncAPI só autentica no handshake; sem revalidação ou expulsão ao revogar vínculo/sessão | tempo-real.yaml:97-100, :197-201 x roadmap.md:390 | Engenharia | Registrar lacuna; desconexão pelo servidor ao revogar | Registrada — aguarda autorização |
| BL-DV-13 | DES-04 | Acesso / permissões | Distribuição local da autogestão descrita como "proposta" ou "em revisão" após AG-01 A; painel-web sem alinhamento de 17/11 | frontend.md:153; painel-web.md:96 x 02-prd.md:101; 01-design-system.md:1004 | Documentação | Alinhar ao AG-01 A; incluir seção de 17/11 no painel-web | Registrada — aguarda autorização |
| BL-DV-14 | DES-06 | Acesso / autogestão | Rótulos de estado da autogestão divergem entre registro 06, DS, UF e protótipo | registro 06:73; 01-design-system.md:1012-1016; 02-user-flows.md:370; prototipo/js/data.js:9; governanca.js:21, :43, :48 | Design | Q-06 | Registrada — aguarda autorização |
| BL-DV-15 | DES-11, 12 | Reclamações / gestão / web | Conselho fiscal não julga no protótipo; síndico profissional, Suporte e Admin sem perfil | prototipo/js/telas/morador.js:28, :39; prototipo/js/core.js:5-20 x 01-design-system.md:1042-1046; 02-prd.md:173 | Design | Q-07 | Registrada — aguarda autorização |
| BL-DV-16 | DES-16 | Pesquisa / score | Funcionário do setor Manutenção com score e na pesquisa, sem perfil de acesso definido | prototipo/js/data.js:157, :159, :229 x 02-prd.md:87-88, :142-143; registro 06:70 | Produto | Q-08 | Registrada — aguarda autorização |
| BL-DV-17 | DOC-13 | Votações / reclamações | ADR-002, 009 e 010 dependem do "marco 2/parecer"; 009 e 010 sem critério de aceite alcançável antes do piloto | adr/002:6; adr/009:7; adr/010:7; 01-arquitetura.md:999, :1006-1007 | Engenharia / Pedro | Q-01 | Registrada — aguarda autorização |
| BL-DV-18 | ARQ-03 | Eleições | `eleicao.convocante_mandato_id` não representa condutores sem mandato (designado, administradora, suporte) | 01-mer-e-der.md:580 x RN-VO-13 (03-rn:496) | Engenharia | Registrar condutor pela origem da autorização; separar quem abre e encerra | Registrada — aguarda autorização |

### 8.4 Menores

| ID | Origem | Descrição | Fontes | Dono | Correção proposta |
| --- | --- | --- | --- | --- | --- |
| BL-DV-19 | DOC-07, 08, 10, 12, 16, 17; PROD-11; ARQ-17 | AGENTS.md desatualizado: pastas 07–09 "vazias", "não existe backend", README "só o nome", ADR-016 omitido nos próximos passos, mapa sem vários docs, caminho `apps/api` | AGENTS.md:5, :19, :58, :191, :193, :9-63 | Documentação | Atualizar árvore, estado, mapa e próximos passos; `backend/apps/api` |
| BL-DV-20 | DOC-09 | README raiz diz que Inter e Lucide carregam por CDN | README.md:38 x prototipo/README.md:23 | Documentação | "Funciona sem internet, `prototipo/vendor/`" |
| BL-DV-21 | DOC-15; PROD-08; DES-20 | Cabeçalhos "Atualizado em 15/11/2026" com conteúdo de 17/11 | 02-prd:3; 03-rn:3; 04-us:3; 01-ds:3; 02-uf:3; 01-arq:3; mer:4; 01-backend:3; api/README:3; frontend.md:5; painel-web.md:5 | Documentação | Q-12 |
| BL-DV-22 | PROD-09; ARQ-08; DES-15 | Restos do perfil Manutenção como pendência ou "proposta" | 01-arquitetura.md:1026; 02-diagramas:886; 01-backend.md:233, :612; 01-guia-da-api.md:89; frontend.md:155; prototipo/js/telas/funcionarios.js:1 | Documentação / design | "Retirado em 17/11/2026 (13A)" |
| BL-DV-23 | ARQ-09 | Concessão eleitoral "sem prazo arbitrário" contra 6A (até 30 dias) | 01-arquitetura.md:1091; 01-mer-e-der.md:927; 02-politica:481; 01-backend.md:678; 01-guia-da-api.md:636 | Documentação | Anotar substituição pela 6A |
| BL-DV-24 | ARQ-07 | Contrato usa `/v1/sync`; docs usam `/sync/push` e `/sync/pull` | sync.yaml:15 x 01-backend.md:106; 01-arquitetura.md:201, :206; 02-diagramas:243, :268-269, :440 | Engenharia | Alinhar ao contrato (ADR-015) antes do RM-32 |
| BL-DV-25 | DOC-11; ARQ-19 | C4 omite ADR-015 e 016; roadmap §5.4 omite ADR-016 | 02-diagramas:22; roadmap.md:268-284 | Documentação | Incluir |
| BL-DV-26 | DOC-18 | Índice de ADRs mistura data de proposta e de decisão | adr/README.md:50-62 | Documentação | Padronizar "proposta / decisão" |
| BL-DV-27 | DOC-19 | DS §18 fora de ordem cronológica | 01-design-system.md:1269-1301 | Design | Reordenar |
| BL-DV-28 | DOC-20 | "Atualização de 13/11" cita decisão de 17/11 | 02-politica:57 | Documentação | "13/11, complementada em 17/11" |
| BL-DV-29 | DOC-06 | Alinhamento do lote 2 descrito como pendente no roadmap | roadmap.md:66, :678 | Documentação | Registrar alinhamento de 17/11 |
| BL-DV-30 | PROD-04 | Contagem antiga 150 RF e 74 US citada como total ou MVP (PRD e US já atualizados em 17/11/2026) | AGENTS.md:31, :174; api/README.md:48; api/01-guia-da-api.md:610; demais docs de arquitetura/backend por conferir na correção | Documentação | "153 RF e 76 US do MVP, mais 1 RF e 1 US da V2" (seção 2) |
| BL-DV-31 | PROD-05 | Tabela de cobertura RF → US não bate com as citações (RF-AD-15, RF-RE-07, RF-FI-04, RF-CH-04, RF-RS-03, RF-VO-04) | 04-historias:1004-1015 | Produto | Ajustar a tabela |
| BL-DV-32 | PROD-07 | PRD "composição conselho/sub em revisão", já decidida (AG-06 A) | 02-prd.md:416 | Produto | Redação de RN-CD-14 |
| BL-DV-33 | PROD-10 | Resumo de finanças do PRD omite execução local na autogestão | 02-prd.md:420 x RN-FI-29 | Produto | Ajustar resumo |
| BL-DV-34 | DES-07 | Faixa de substituição "até o síndico ou a administradora desativar" contra início/fim da regra vigente | 01-design-system.md:882; 02-user-flows.md:302-303 | Design | Atualizar texto e diagrama 4.4 |
| BL-DV-35 | DES-08 | Designação e comprovação "ainda exigem revisão", já resolvidas | 01-design-system.md:829; 02-user-flows.md:1197 | Design | Referenciar RN §3.1 e registro 06 |
| BL-DV-36 | DES-09 | UF 5.3 "envio desabilitado" offline contra DS e protótipo ("Aguardando internet") | 02-user-flows.md:521 x 01-design-system.md:780 | Design | Alinhar UF ao DS |
| BL-DV-37 | DES-10 | DS diz limpeza com "mesmo comportamento offline"; frontend restringe "Iniciar atendimento" a online | 01-design-system.md:789-790 x frontend.md:213 | Design | Q-10 |
| BL-DV-38 | DES-13 | Hex direto no código do produto | prototipo/js/core.js:378; morador.js:75; prototipo/css/components.css:5, :133, :236, :263, :288-290 | Design | Q-09 |
| BL-DV-39 | DES-14 | 13 tons da paleta ausentes em `tokens.css`, pendência só no README do protótipo | prototipo/README.md:129 | Design | Q-09 |
| BL-DV-40 | DES-17 | README do protótipo não lista `governanca.js`, `autogestao.js`, `relatorios.js` | prototipo/README.md:27-39 | Design | Completar |
| BL-DV-41 | DES-18 | Mapa dos UF sem o 4.6; 11.2 sem sub, conselho e designado | 02-user-flows.md:37-76, :68 | Design | Completar |
| BL-DV-42 | DES-19 | DS §19 sem linhas para 11.16 e 11.17 | 01-design-system.md:1307-1349 | Design | Acrescentar |
| BL-DV-43 | DES-21 | Matriz do PRD "reclamação contra funcionário ou unidade" omite síndico/sub (D-01) | 02-prd.md:138 x 02-user-flows.md:1441 | Produto | Ajustar rótulo |
| BL-DV-44 | DES-22 | "titular" e "fatura" no protótipo com sentido fora do glossário | governanca.js:45; sindico.js:283-327 | Design | Q-11 |
| BL-DV-45 | ARQ-10 | Backend declara "9 pastas de perfil"; árvore tem 8 mais `comum/` | 01-backend.md:209 x backend/apps/api/src/interfaces/http/ | Engenharia | "8 pastas de perfil mais `comum/`" |
| BL-DV-46 | ARQ-11 | Proprietário não residente sem módulo `visitantes`, embora RF-VI-13 tenha operação | 01-backend.md:232 x api/README.md:118 | Engenharia | Incluir, restrito ao hóspede (RN-VI-10) |
| BL-DV-47 | ARQ-16 | Nomes de entidades de vínculo divergem entre arquitetura e MER | 01-arquitetura.md:602-603 x 01-mer-e-der.md:268, :281 | Engenharia | Usar nomes do MER |
| BL-DV-48 | ARQ-18 | `proprietarioConsultarEleicao` fora do prefixo; linhas RF-VO-05 e RF-RE-04 do README da API | proprietario-nao-residente.yaml:1819; api/README.md:95, :164 | Engenharia | Renomear e corrigir linhas |
| BL-DV-49 | ARQ-14 | ADR-007 e PRD atribuem pré-cadastro/conselho só a administradora ou suporte | adr/007:16; 02-prd.md:92 | Engenharia / produto | Incluir autogestão e primeira habilitação |
| BL-DV-50 | Rodada de produto | Linha em branco antes de RN-PL-08/RN-PL-09 quebra a tabela RN-PL no Markdown (preexistente) | 03-regras-de-negocio.md:523 | Produto | Remover a linha em branco |

**Resumo por gravidade:** 3 bloqueiam G0, 1 bloqueia piloto, 14 bloqueiam módulo, 32 menores (total 50).

## 9. Pendências classificadas para o G0

Atende ao item 2 do checklist G0. Classificação de bloqueio conforme roadmap §3.3: **geral de início** (impede G0), **módulo** (impede o módulo indicado), **piloto** (impede dado real).

| Tema | Fonte | Dono | Evidência esperada | Próxima ação | Bloqueio |
| --- | --- | --- | --- | --- | --- |
| Divergências BL-DV-01 a 03 | Seção 8.1 | Documentação / engenharia | Textos alinhados; saúde no contrato | Pedro autorizar pacote (Q-15) | Geral de início |
| Revisão desta baseline e recorte da primeira entrega | Este documento; RM-05, RM-06 | Pedro | Aceite registrado em 18/11/2026 | Concluído | Resolvido (era geral de início) |
| RF/US da plataforma e verificação restrita | Seção 2.1; BL-DV-05 | Produto | RF/US com cobertura; depois fluxos, DS, API | Produto concluído em 17/11/2026; alinhar demais artefatos (BL-DV-05) | Módulo acesso |
| ADRs propostos (001, 003, 006 a 014) | adr/README.md; roadmap §5.4 | Engenharia | Aceite com limites e critérios de PoC | Revisar antes de cada módulo | Módulo (conforme ADR) |
| Gerador, Node/pnpm, lockfile | roadmap.md:369-371; ADR-015 | Engenharia | Workspace reproduzível | Fase 1 após G0 | Módulo base |
| Pendências da API (30) | api/README.md, seção de pendências | Engenharia / produto | Cada item com módulo: 19 e 22 acesso; 7, 9, 11–13, 26 cobrança; 16–18 portaria; 29 portaria/proprietário | Classificar os demais itens na revisão do contrato | Módulo |
| Pendências do MER (16 P-*) | 01-mer-e-der.md §9 | Engenharia | Decisão por P-*: P-05 fuso (cobrança/rotinas), P-06 e P-16 Asaas (cobrança), P-10 reentrada (portaria) | Classificar os demais na revisão do MER | Módulo |
| Autoria técnica da primeira carga | 03-estrategia-de-migrations-e-seeds.md:204 | Engenharia | Ator técnico definido | Junto com BL-DV-06 | Módulo acesso |
| Prazos de boleto/Pix, KYC, chargeback, conta em CNPJ (Asaas) | 02-user-flows.md:1496; roadmap §5.7 | Engenharia / financeiro | Relatório da PoC no sandbox | PoC após G0 | Módulo cobrança |
| Compensação do Desfazer após a fila | 02-user-flows.md:1508; API 16–18 | Engenharia | Regra e contrato | Antes do RM-32 | Módulo portaria |
| Relógio incorreto na limpeza offline | 02-user-flows.md:1506; ADR-014 | Engenharia | PoC | Antes da limpeza offline | Módulo limpeza |
| Retenção das listas de visitantes | 02-user-flows.md:1505 | Produto / LGPD | Prazo definido | Antes do módulo visitantes | Módulo visitantes |
| Limite de pequenos grupos nos relatórios | 02-user-flows.md:1507; RN-RL-08 | Produto / LGPD | Limite definido | Antes do módulo relatórios | Módulo relatórios |
| Finanças: orçamento, transparência, saldos, plano de contas | 02-user-flows.md:1499-1502 | Pedro / produto | Decisão por item (14A) | Antes do módulo finanças | Módulo finanças |
| Cobrança em atraso como notificação obrigatória | 02-user-flows.md:1503 | Pedro / produto | Decisão (14A) | Antes do módulo notificações | Módulo notificações |
| Parecer jurídico (SEG-16) e revisão da locação | 02-user-flows.md:1495, :1498; seção 2 | Pedro / jurídico | Parecer emitido | Contratar quando houver orçamento | Piloto |
| Texto revisado do RF-AC-07 | BL-DV-07 | Produto / jurídico | Texto aprovado pelo parecer | Junto com o parecer | Piloto |
| Revisão da nuvem do piloto (ADR-004, ADR-016) | adr/004:3; adr/016:3 | Engenharia | Revisão obrigatória | Antes do piloto | Piloto |
| Operador da plataforma e canal técnico/comercial | AGENTS.md (Complementos); registro 06 §2.1 | Pedro | Pessoa e endereço nomeados | Antes do primeiro condomínio oficial | Piloto |
| Operador de LGPD | 02-prd.md:355 | Pedro / segurança | Nomeação | Antes do piloto | Piloto |
| Prazo de 5 dias de resposta do alvo | 02-user-flows.md:1497 | Produto | Dados do piloto | Validar no piloto | Piloto (validação) |
| Risco dos comentários anônimos (mínimo de 3) | 02-user-flows.md:1504 | Produto | Dados do piloto | Validar no piloto | Piloto (validação) |

## 10. Perguntas abertas ao Pedro

Respondidas por Pedro em 17/11/2026 (coluna "Resposta"). Cada uma traz a recomendação dos agentes, revisada pelo orquestrador. A aplicação das respostas aos demais documentos segue a Q-15 e depende de autorização.

| ID | Pergunta | Opções e consequências | Recomendação | Resposta (17/11/2026) |
| --- | --- | --- | --- | --- |
| Q-01 | Critério de aceite dos ADR-009 e 010 sem parecer (BL-DV-17) | A: aceite técnico condicionado, revisto quando houver parecer. B: manter Proposto e bloquear votação e reclamações até o parecer (trava módulos sem data). C: critério técnico substituto (revisão de segurança e privacidade) | A, alinhada ao IN-02 A; C como alternativa | **A**: aceite técnico condicionado, revisto quando houver parecer |
| Q-02 | Executor de migrations (BL-DV-11) | A: atualizar ADR-008 registrando Flyway separado do query builder. B: novo ADR-017. C: migrador do query builder (contradiz a estratégia e cria duas cadeias) | A | **A**: atualizar o ADR-008 com Flyway separado do query builder |
| Q-03 | Quando desenhar a reautenticação (BL-DV-09) | A: agora no ADR-007, junto da PoC de sessões; implementar na cobrança. B: só na cobrança (pode exigir mudar sessões entregues) | A | **A**: desenhar agora no ADR-007, junto da PoC de sessões; implementar na cobrança |
| Q-04 | Abrangência da dupla aprovação da troca de conta (BL-DV-08) | A: só autogestão, como nos textos atuais. B: também com administradora e no Gestão + Suporte (amplia escopo) | A, com confirmação explícita | **A**: só autogestão (confirmação explícita de Pedro) |
| Q-05 | Como o Admin faz a verificação restrita no sistema (BL-DV-05) | A: funções ou visões limitadas a habilitação e comprovantes, papel de banco próprio e auditoria. B: contexto temporário no condomínio (abre todas as tabelas). C: fora do app, registrando só o resultado (dificulta auditoria e guarda LGPD) | A | **A**: funções ou visões limitadas, papel de banco próprio e auditoria |
| Q-06 | Rótulos de estado da autogestão (BL-DV-14) | A: os do registro 06. B: os do DS 11.17. C: conjunto canônico novo na tabela do DS 4.5, alinhando registro 06, UF 4.6 e protótipo (mexe em quatro arquivos) | C | **C**: conjunto canônico na tabela do DS 4.5, alinhando registro 06, UF 4.6 e protótipo |
| Q-07 | Perfis sem tela no protótipo (BL-DV-15) | A: criar todos antes do G0. B: registrar como lacuna e desenhar quando o módulo chegar. C: criar só síndico profissional e "Para julgar" do conselho; Suporte e Admin no painel web | B; C se quiser referência navegável do julgamento pelo conselho | **B**: registrar como lacuna e desenhar quando o módulo chegar |
| Q-08 | Funcionário do setor Manutenção (BL-DV-16) | A: funcionário sem perfil de acesso, avaliado e com score, com regra nova de como vê o score e recorre. B: retirar dos dados, mantendo só empresas. C: tratar como limpeza (perfil disfarçado) | A ou B; não C | **A reduzida** (recomendação aceita em 17/11/2026): funcionário sem perfil de acesso segue cadastrado e na pesquisa mensal, com notas só informativas à gestão; sem score individual (RN-SC-01 incluirá "funcionário sem perfil de acesso"; RN-PE-05 não ajusta score dele); reclamação sobre o serviço vai à gestão, não à pessoa. Score real exigiria perfil de acesso, decisão de Pedro |
| Q-09 | Hex no código e 13 tons ausentes (BL-DV-38, 39) | A: tokens nos arquivos do produto, `app.css` declarado moldura isenta, acrescentar os 13 tons. B: aceitar as exceções | A | **A**: tokens nos arquivos do produto, `app.css` moldura isenta, acrescentar os 13 tons |
| Q-10 | "Iniciar atendimento" da limpeza sem internet (BL-DV-37) | A: só online, ajustando o DS (RN-CH-04 trata só da conclusão). B: entra na fila offline, ajustando frontend e sync (amplia a fila) | A | **A**: só online, ajustando o DS |
| Q-11 | "titular" e "fatura" (BL-DV-44) | A: a regra de termos vale também aí; trocar por "síndico" e "cobrança da plataforma". B: a regra cobre só o sentido residencial e financeiro do condomínio | A | **A**: trocar por "síndico" e "cobrança da plataforma" |
| Q-12 | "Atualizado em" deve refletir a última alteração de conteúdo, inclusive notas de alinhamento? (BL-DV-21) | Sim: datas recuperam valor de revisão. Não: manter data da última revisão completa | Sim | **Sim** |
| Q-13 | Rótulo do SEG-16 nos docs de segurança (BL-DV-01) | A: padronizar no rótulo do roadmap ("Pulado — Inacessível", 17/11, com o alcance desta rodada), guardando 16/11 como histórico. B: manter "Pendente - Inacessível (16/11)" | A | **A**: rótulo do roadmap ("Pulado — Inacessível", 17/11), 16/11 como histórico |
| Q-14 | `docs/superpowers/plans/2026-11-10-documentacao-da-api.md` | Manter fora do mapa, citar no AGENTS como artefato de trabalho ou arquivar | Manter e decidir só se cita | **Deletar** o arquivo (fora das opções); excluído em 17/11/2026 com confirmação de Pedro |
| Q-15 | Pacote de correções fora deste arquivo | A: primeiro só as que bloqueiam G0 e piloto (BL-DV-01 a 04), mantendo linhas puladas marcadas em vez de removê-las. B: todas as textuais de uma vez (diff grande). C: cada uma quando o módulo afetado chegar | A agora; depois menores que tocam a primeira entrega; eleições (BL-DV-18, 23) com o RM-45 | **A**: primeiro BL-DV-01 a 04; depois menores da primeira entrega; eleições (BL-DV-18, 23) com o RM-45 |
| Q-16 | Quem cadastra os primeiros usuários de uma administradora? | A: o Admin pré-cadastra só o responsável, que cadastra a equipe (menos acesso concentrado no Admin). B: o Admin cadastra toda a equipe | A | **A**: Admin pré-cadastra só o responsável, que cadastra a equipe |
| Q-17 | O valor padrão de plataforma dos parâmetros (03-regras-de-negocio.md:24, RN seção 13) precisa de RF? | A: criar RF, se o painel do MVP editar esses valores. B: manter só como regra | A, condicionada a o painel do MVP editar os valores | **B na prática** (recomendação aceita em 17/11/2026): o painel do MVP não edita o valor padrão, logo sem RF; padrões do catálogo da RN 13 entram por carga inicial versionada e mudam só por versão publicada; edição pelo painel na V2; nota na tabela de níveis da RN (03-regras-de-negocio.md:24) |

## 11. Rastreabilidade e próximos passos

| Item do RM-08 ([roadmap.md:171](roadmap.md)) | Onde está |
| --- | --- |
| Lista de fontes e revisões | Seção 3 |
| Marcos | Seção 4 |
| RF/US do MVP | Seções 6 e 2.1 |
| Divergências | Seção 8 |
| Itens do checklist G0 apoiados | Item 2 (seção 9) e item 3 (seção 7); item 4 depende de Pedro |

**Próximos passos até o RM-09:**

1. Pedro revisa esta baseline e responde Q-01 a Q-17. Concluído: respostas em 17/11/2026 e aceite da baseline em 18/11/2026.
2. Alinhar os RF/US da plataforma nos demais artefatos (BL-DV-05).
3. Aplicar o pacote de correções autorizado (Q-15), começando por BL-DV-01 a 04.
4. RM-05/RM-06: revisar o recorte técnico e os ADRs da primeira entrega (seção 7).
5. RM-09: Pedro revisa o G0 e decide a liberação do primeiro pacote da fase 1 (RM-10).

**Limitações:** as evidências vêm de leitura por seção e busca; não foram verificados regra a regra o corpo completo de PRD, RN, US e fluxos, o conteúdo interno de todos os ADRs, todas as operações dos YAML, o protótipo renderizado nem o lint do contrato (não executado para não baixar pacotes). Afirmações de ausência (saúde da API, reautenticação) vêm de busca textual.
