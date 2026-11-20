# Critérios das PoCs — IN-02 A (P1 a P5)

**Data:** 18/11/2026. **Atualizado em:** 18/11/2026. **Autor do produto e responsável pelas decisões:** Pedro Lemos.

**Estado:** critérios aceitos por Pedro em 18/11/2026 (PC-01 a PC-09); **P1 executada e aprovada em 18/11/2026** (resultado na seção P1); G0 liberado em 18/11/2026 só para a fase 1: **P2 a P5 continuam não liberadas**. Os critérios, por si, não liberaram o G0: PoCs só rodam depois do G0 e da autorização de escopo ([decisões](../decisoes-para-iniciar-o-desenvolvimento.md), linha 139). Este documento responde ao IN-02 A (comparação curta e PoCs com critérios; desenho aceito condicionado à prova). Aceitar critérios não aceita ADR, ferramenta nem contrato.

**Regra comum a todas as PoCs:** dados fictícios, sem serviço pago, sem publicar, sem credencial no Git ou em log ([decisões](../decisoes-para-iniciar-o-desenvolvimento.md), linha 141; [pacote técnico da fase 1](../09-infra/pacote-tecnico-fase-1.md)). Se uma PoC reprovar, revê-se a proposta, sem enfraquecer RLS, sigilo ou integridade ([roadmap](../roadmap.md), linhas 264-265). Versões de bibliotecas abaixo: registro npm consultado em 18/11/2026, **não** confirmadas em changelogs completos; confirmar antes de fixar.

## Índice

1. [P1 — Gerador de contratos](#p1--gerador-de-contratos-rm-12-fase-1-limite-2-dias)
2. [P2 — Sessões e autenticação](#p2--sessões-e-autenticação--adr-007-rm-16-antes-da-fase-2-3-dias)
3. [P3 — RLS multi-tenant](#p3--rls-multi-tenant--adr-001-rm-16-3-dias)
4. [P4 — Persistência offline e fila](#p4--persistência-offline-e-fila--adr-003-e-adr-014-rm-16-antes-da-fase-3-4-dias)
5. [P5 — Migrations e acesso a dados](#p5--migrations-e-acesso-a-dados-rm-16-2-dias-para-p5ap5b)
6. [Decisões aceitas (PC-01 a PC-09)](#decisões-aceitas-in-02-a)
7. [Riscos](#riscos)
8. [Divergências conhecidas](#divergências-conhecidas)
9. [Rastreabilidade](#rastreabilidade)

## P1 — Gerador de contratos (RM-12, fase 1; limite 2 dias)

- **Pergunta:** qual ferramenta gera tipos e validação estrutural a partir de OpenAPI 3.1 e AsyncAPI 3.0 para `packages/shared-types`. Condiciona a parte de ferramentas e versões do [ADR-015](adr/015-workspaces-e-contratos-compartilhados.md) (linhas 3 e 6) e o gerador citado no [ADR-008](adr/008-orm-query-builder-migracoes.md) (linha 20).
- **O contrato usa** (contagem do agente em `docs/05-backend/api`): `$ref` entre arquivos (~1.080) e locais (~5.300), `oneOf` (302), `allOf` (57), `discriminator` (7), nulo do 3.1 (191).
- **Candidatos:** openapi-typescript 7.13.0 + Ajv 8.20.0 (só tipos; exige TypeScript ^5.x); @hey-api/openapi-ts 0.99.0 (tipos + Zod 4; 0.x com quebras frequentes; Node >=22.18); orval 8.48.0 (tipos + Zod; foco em clientes; Node >=22.18). AsyncAPI: @asyncapi/parser 3.6.6 + JSON Schema + Ajv (principal) ou @asyncapi/modelina 5.10.1 (sem release desde 19/10/2025).
- **Aprovação** (ADR-015, linhas 40-42; pacote técnico, seção 3): gerar duas vezes = diff vazio; `git diff --exit-code` no CI acusa artefato desatualizado; resposta fora do esquema é rejeitada; NestJS 12 (ESM) e Expo/Metro importam o pacote; recurso não suportado falha de forma explícita (sem degradar para `any`).
- **Reprovação:** perder `oneOf`/`discriminator`/nulo; exigir esquema manual equivalente; saída não determinística; `shared-types` importar NestJS ou React Native.
- **Evidência:** saída da geração repetida, teste de rejeição, log do CI, relatório de cobertura de recursos.
- **Se reprovar:** próximo candidato; se nenhum servir, voltar a Pedro com "tipos gerados + Ajv sobre JSON Schema canônico". Nunca Zod manual (ADR-015, linha 27).

### Resultado (18/11/2026): aprovada

Pedro aceitou a escolha em 18/11/2026, com ressalva. **Escolha:** openapi-typescript 7.13.0 (tipos) + Ajv 8.20.0 e ajv-formats 3.0.1 (validação em execução sobre o JSON Schema extraído do mesmo contrato) + @asyncapi/parser 3.6.6 (AsyncAPI) + @redocly/openapi-core 1.34.24 (bundle de `$ref`). Zod gerado não adotado. Nenhum contrato foi alterado.

**Ressalva:** openapi-typescript declara peer `typescript ^5.x`; com TypeScript 6.0.3 (PC-09) geração, typecheck e testes passam, com aviso permanente no `pnpm peers check`. Versão fixada; revalidação obrigatória a cada atualização do gerador ou do TypeScript.

**Comparação**

| | openapi-typescript 7.13.0 + Ajv 8.20.0 | @hey-api/openapi-ts 0.99.0 (Zod 4.6.7) | orval 8.48.0 (Zod) |
| --- | --- | --- | --- |
| Peer de TypeScript | ^5.x, não atendido com 6.0.3 (funciona) | >=5.5.3 ou >=6.0.0, atendido | sem peer de TypeScript |
| Determinismo | idêntico em 2 gerações | idêntico | idêntico |
| Rejeição em execução | Ajv rejeita todos os casos testados | Zod aceita valor que casa com dois ramos de `oneOf` ([integer, number] com 1): `z.union` não exige exatamente um ramo | gerado; execução não testada |
| `oneOf` | união; Ajv exige exatamente um ramo | `z.union` | `zod.union` |
| `allOf` | interseção | `.and()` | n/d |
| `discriminator` | etiqueta injetada nos ramos | idem | n/d |
| Nulo 3.1 | `string \| null` preservado | `.nullable()`/`.nullish()` | `.nullish()` |
| `$ref` entre arquivos | ok (bundle Redocly) | ok | exige configuração explícita |
| Não suportado | some em silêncio (mitigado pela lista de palavras-chave permitidas do gerador) | idem | não testado |
| Conclusão | escolhido | reprovado como principal: 0.x, perde a semântica do `oneOf`, não emite JSON Schema, AsyncAPI exigiria Ajv | reprovado: foco em clientes, saída inline repetida |

**Critérios**

| Critério | Resultado |
| --- | --- |
| Determinismo | Passa: 2 gerações idênticas; em clone, `git diff --exit-code` = 0 |
| Artefato desatualizado | Passa: em clone temporário, campo novo em `SaudeComum` fez `verificar-contratos` sair com código 1 |
| Resposta fora do esquema | Passa: 7/7 testes `node:test` (`SaudeComum` e `GET /v1/saude`; `oneOf` de `GET /v1/score`; nulos; eventos do AsyncAPI) |
| Importação Node ESM pelo `exports` | Passa. Expo/Metro: passa no RM-13 (18/11/2026): o Metro resolve `@condomifacil/shared-types` pelo `exports`, sem configuração extra |
| Recurso não suportado | Passa: o gerador tem lista de palavras-chave permitidas e falha com mensagem (ex.: "Palavra-chave de esquema não suportada: \"if\""); Ajv estrito também falha |
| `shared-types` sem NestJS/React Native | Passa (lint de fronteiras) |

**Cobertura no recorte:** `oneOf` em 1 ocorrência (`GET /v1/score`); `allOf`, `discriminator` e `const` com 0 no recorte, cobertos por fixture de teste; nulo 3.1 coberto no contrato real; bundle com 52 esquemas e 32 caminhos, sem `$ref` externo remanescente.

**Decisões de Pedro (18/11/2026)**

| ID | Decisão |
| --- | --- |
| P1-01 | Adotar openapi-typescript 7.13.0 + Ajv 8.20.0 + @asyncapi/parser 3.6.6, com a ressalva do peer de TypeScript e revalidação a cada atualização |
| P1-02 | Manter bloqueado o script de instalação do @scarf/scarf (telemetria trazida pelo @asyncapi/parser) via `allowBuilds: '@scarf/scarf': false` no `pnpm-workspace.yaml` |
| P1-03 | Testar no RM-13 o Ajv no Hermes (Expo); se falhar, o gerador passa a emitir validadores pré-compilados (modo standalone do Ajv), sem mudar contrato nem escolha. **Resolvida em 18/11/2026 (R13-02) pelo plano B:** o gerador emite validadores Ajv standalone em `packages/shared-types/src/gerado/*.validadores.ts`, sem `new Function`, `eval` ou compilação em execução (teste e grep no `dist`); `criarAjv` removido; API pública (`validarComum`, `validarEventoTempoReal`) inalterada; o bundle Android Hermes compila com eles |

**Pontos de atenção**

- O recorte gerado é maior que `comum.yaml`: ele referencia `sindico.yaml`, que referencia `administradora.yaml` e `morador.yaml`; o bundle inclui só o alcançável (ex.: `EleicaoSindico`). Cobertura dos demais arquivos OpenAPI: decidir depois.
- `discriminator` fica só nos tipos; no JSON Schema é removido (o `oneOf` já exige um ramo, e o `discriminator` do Ajv recusa ramos com `allOf`).
- `verificar-contratos` (`git diff --exit-code` em `src/gerado`) só detecta divergência em artefatos já commitados; o CI (RM-15) roda depois do commit.
- Parâmetros de rota, query e cabeçalho não têm esquema de execução; os objetos do contrato não usam `additionalProperties: false`, então campos extras passam.
- Os testes da prova usam `node:test`; a ferramenta de testes do projeto é decidida no RM-13 (R6-06).

**Pendências**

- Execução dos validadores no Hermes (provas de execução em Android e em iPhone via Expo Go, a cargo de Pedro; o app ainda não foi executado em emulador nem em aparelho Android, só o bundle Hermes compilou): o risco que motivou o P1-03 (`new Function`) foi eliminado, mas a execução real depende dessa prova. A importação pelo Expo/Metro está fechada.
- RM-15: CI com gerar-contratos + `git diff --exit-code` sobre artefatos commitados.
- Decidir a cobertura dos demais arquivos OpenAPI pelo gerador.

## Liberação do RM-16 (20/11/2026)

Pedro liberou o RM-16 (P2 a P5) em 20/11/2026, com estas escolhas:

| Ponto | Decisão |
| --- | --- |
| Ordem | P3, depois P5 e P2 no mesmo banco; P4 em paralelo |
| Código | Pasta descartável `pocs/rm-16/`, fora do workspace pnpm, na branch `poc/rm-16`; o aprovado é reescrito na fase 2 a partir dos relatórios |
| Banco (P2, P3, P5) | PostgreSQL em Docker, na versão principal do Supabase, descartável (PC-06) |
| P4 | Dev build local no emulador Android com 3 GB de RAM (PC-08); iOS fora, sem Mac |

A liberação não libera a fase 2 nem os ADRs condicionados; cada um depende do resultado da sua PoC.

## P2 — Sessões e autenticação — ADR-007 (RM-16, antes da fase 2; 3 dias)

- **Pergunta:** o desenho de JWT curto (15 min, `sub` e `sid`), refresh opaco rotativo guardado como hash, cookie httpOnly na web e expo-secure-store no app ([ADR-007](adr/007-autorizacao-jwt-sem-papeis.md), linhas 33-44) funciona. Condiciona o ADR-007 e a entrada da fase 2 ([roadmap](../roadmap.md), linhas 276 e 383).
- **Candidatos:** jose 6.2.17 + tabela de sessões própria + argon2 0.45.2 (principal); @nestjs/jwt 12.0.5 com guards próprios; better-auth 1.7.26 só se aderir ao ADR-007. Evitar passport-jwt (última release 12/2022).
- **Aprovação** (ADR-007, linhas 77-79; [segurança](../07-seguranca/seguranca.md), linha 287): replay indevido de refresh revoga a sessão; renovação concorrente coberta; troca de papel vale dentro do tempo de cache; `X-Condominio-Id` sem vínculo recusado; suporte fora do plano Gestão + Suporte não abre contexto; custo da consulta de papel medido contra RNF-01; logout, troca de senha e exclusão LGPD revogam; CSRF no cookie. Retry legítimo (ADR-007, linha 91): só comparar alternativas, sem fixar duração.
- **Reprovação:** permissão antiga além da janela; reuso aceito; token acessível ao JavaScript na web; sessão irrevogável.
- **Evidência:** suíte de integração e relatório para revisão de segurança. **Se reprovar:** revisar o ADR-007 com Pedro; a fase 2 não começa.

### Resultado (20/11/2026): aprovada, aguardando aceite de Pedro

Relatório: [`pocs/rm-16/p2/RELATORIO.md`](../../pocs/rm-16/p2/RELATORIO.md) (branch `poc/rm-16`). Implementação própria com jose 6.2.17, refresh opaco com hash SHA-256 e argon2 0.45.2, NestJS 12.5.1, Kysely com postgres.js. Suíte de integração: 49/49, conferida pelo orquestrador.

- Aprovados todos os critérios: JWT de 15 min só com `sub` e `sid`; replay revoga a sessão; 8 renovações concorrentes com uma só vencedora; troca de papel efetiva entre 4,9 s e 5,1 s (cache de 5 s); `X-Condominio-Id` sem vínculo recusado; suporte só no plano Gestão + Suporte; logout, troca de senha e exclusão LGPD revogam; cookie httpOnly, Secure e SameSite=Lax com CSRF. Consulta de papel com p95 de 1,69 ms (RNF-01).
- **Decisão pendente para Pedro e revisão de segurança:** retry legítimo (ADR-007, linha 91). A política estrita derruba a sessão quando a resposta da renovação se perde; o relatório compara cinco alternativas, sem fixar duração.
- Achados para a fase 2: login e renovação rodam fora do `TenantContext`, o que exige exceção explícita e estreita à regra da P5; `@nestjs/jwt` só é seguro com `algorithms`, `issuer` e `audience` fixados numa função única; HS256 é simétrico.
- Não provados: expo-secure-store em aparelho, várias abas na web, carga RNF-17, limites de taxa e memória do Argon2 no Render.

## P3 — RLS multi-tenant — ADR-001 (RM-16; 3 dias)

- **Pergunta:** `app_user` sem BYPASSRLS e não dono, FORCE RLS, `set_config(...,true)` por transação e falha fechada ([ADR-001](adr/001-multi-tenant-rls.md), linhas 40-46) isolam e cabem no orçamento de desempenho. Condiciona o ADR-001 (linha 6; [roadmap](../roadmap.md), linha 270) e a entrada da fase 2 ([decisões](../decisoes-para-iniciar-o-desenvolvimento.md), linha 143).
- **Candidatos (ligação):** driver pg 8.23.1 ou postgres.js 4.1.1; conexão direta x pooler.
- **Aprovação** (ADR-001, linhas 74-75; [plano de testes](../08-qualidade/01-plano-de-testes.md), linha 182): catálogo de RLS (habilitada, forçada, política em toda tabela); papel sem BYPASSRLS; dois tenants em leitura e escrita; sem contexto = zero linhas; nenhum vazamento de contexto ao reutilizar conexão, inclusive após erro/rollback; 404 e não 403; carga RNF-17 (5.000 unidades, 10 portarias) mantendo RNF-01 e RNF-05, com `EXPLAIN`.
- **Reprovação:** qualquer cruzamento de tenant; necessidade de credencial dona ou `service_role` na API; RNF-01 violado sem mitigação que preserve RLS.
- **Ambiente:** PostgreSQL local descartável, na mesma versão principal do destino, sem projeto Supabase novo. **Se reprovar:** rever políticas/índices ou o ADR-001; nunca relaxar RLS.

### Resultado (20/11/2026): aprovada, aguardando aceite de Pedro

Relatório: [`pocs/rm-16/p3/RELATORIO.md`](../../pocs/rm-16/p3/RELATORIO.md). PostgreSQL 17.12 (versão principal do Supabase) em Docker. Suíte: 34/34, conferida pelo orquestrador.

- Aprovados todos os critérios: catálogo de RLS completo; `app_user` sem BYPASSRLS, não dono; dois tenants em leitura e escrita; sem contexto, zero linhas; nenhum vazamento de contexto ao reutilizar conexão, inclusive após erro e no PgBouncer; 404 idêntico ao inexistente. Carga RNF-17 (5.000 unidades, 10 portarias): 0 cruzamentos em 454.598 transações, pior p95 de 309 ms.
- **Driver:** postgres.js (p95 cerca de 2,5 vezes menor que pg), confirmado pela P5b.
- Achado não bloqueante: a lista do dia da portaria leva 4,1 ms em vez de 0,1 ms sob RLS (estimativa de linhas); mitigações que preservam a RLS no relatório.
- Não provados: latência da API inteira (sem NestJS, rede e TLS) e o pooler do Supabase (Supavisor).

## P4 — Persistência offline e fila — ADR-003 e ADR-014 (RM-16, antes da fase 3; 4 dias)

- **Pergunta:** expo-sqlite com SQLCipher e outbox própria cumprem SEG-09 e RNF-06/07/08/16 ([ADR-003](adr/003-banco-local-e-sync-offline.md), linhas 7 e 78-80; [roadmap](../roadmap.md), linha 272). O [ADR-014](adr/014-primeira-conclusao-sync.md) fica condicionado em desempate exato e relógio incorreto (linhas 62-65).
- **Candidatos:** expo-sqlite 58.0.18 (principal; SQLCipher só em Android/iOS, não funciona no Expo Go, sem SQLCipher na web); @nozbe/watermelondb 0.28.0 (última release 04/2025, RN 0.88 não confirmado); @op-engineering/op-sqlite 19.0.5 (reserva).
- **Aprovação** (ADR-003, linhas 78-80; plano de testes, linha 198): banco ilegível sem chave; 10.000 operações em aparelho de 3 GB; queda no meio do envio com reenvio idempotente por `op_id`; ordem preservada; divergência RN-OF-04 com diálogo bloqueante; cache apagado no logout com fila separada e protegida (ADR-003, linha 92); dev build compatível com EAS.
- **Reprovação:** perda ou duplicação; banco legível sem chave; criptografia que falha sem aviso.
- Exige dev build local (exceção ao D8, aprovada em PC-08). **Se reprovar:** avaliar op-sqlite ou WatermelonDB.

### Resultado (20/11/2026): aprovada, aguardando aceite de Pedro

Relatório: [`pocs/rm-16/p4/RELATORIO.md`](../../pocs/rm-16/p4/RELATORIO.md). expo-sqlite 58.0.18 com SQLCipher 4.17.0 e outbox própria, dev build local no emulador Android com 3 GB. Testes do servidor de sync: 4/4, conferidos pelo orquestrador; as provas no emulador não foram repetidas.

- Aprovados todos os critérios: banco ilegível sem chave; abertura recusada se o build vier sem SQLCipher; 10.000 operações (106 s para enfileirar, 41 s para enviar, pico de 113 MB); queda no envio e morte do app sem perda nem duplicação; ordem preservada; diálogo bloqueante RN-OF-04; logout apaga o cache e mantém a fila em arquivo cifrado separado. EAS aprovado só na configuração (`expo prebuild` e `expo-doctor`), sem rodar o `eas-cli`.
- ADR-014: o relógio atrasado vence a conclusão honesta; desempate e relógio incorreto seguem condicionados.
- Achados para a fase 2: o React Native reenvia POST sozinho, então a idempotência por `op_id` no servidor é obrigatória; o logout precisa fechar as conexões antes de apagar o cache; o build nativo no Windows esbarra no limite de 260 caracteres de caminho.
- Não provados: iOS (sem Mac), web (sem SQLCipher) e aparelho real.

## P5 — Migrations e acesso a dados (RM-16; 2 dias para P5a+P5b)

Antes das primeiras migrations funcionais; pode usar o mesmo banco da P3.

- **P5a — executor** (MS-01, Flyway Community SQL-first, [estratégia de migrations](../04-banco-de-dados/03-estrategia-de-migrations-e-seeds.md), linha 42): só Flyway 13.12.2 (CLI com Java 25); alternativa (dbmate, node-pg-migrate) só se o Flyway falhar. **Aprovação** (mesma estratégia, linha 356; [roadmap](../roadmap.md), linha 311): histórico com checksum e validação; lock com `transactional.lock=false` e dois migradores concorrentes; SSL e modo de conexão; arquivo não transacional (`CONCURRENTLY`); reconexão após erro. **Reprovação:** recurso pago ou lock não confiável.
- **P5b — acesso a dados** (ADR-008): kysely 0.29.9 ou drizzle-orm 0.45.4. **Aprovação** ([ADR-008](adr/008-orm-query-builder-migracoes.md), linhas 68-70): transação com `set_config` local, consulta sob RLS, conexão limpa ao voltar ao pool; migração de exemplo com RLS forçada, `EXCLUDE` e gatilho pelo papel dono; teste de catálogo de RLS. **Reprovação:** biblioteca abrir conexão fora do `TenantContext`.

### Resultado (20/11/2026): P5a e P5b aprovadas, aguardando aceite de Pedro

Relatório: [`pocs/rm-16/p5/RELATORIO.md`](../../pocs/rm-16/p5/RELATORIO.md). Suítes: P5a 9/9 (saída registrada) e P5b 46/46, esta conferida pelo orquestrador.

- **P5a, Flyway 13.12.2 OSS:** checksum e validação detectam migration alterada, fora de ordem ou removida; dois migradores concorrentes com `transactional.lock=false` aplicam cada versão uma vez, mesmo com um deles derrubado; SSL `verify-full`; `CREATE INDEX CONCURRENTLY`; reconexão após erro. Sem recurso pago.
- **P5b:** Kysely e Drizzle passaram; **recomendado Kysely 0.29.9 com postgres.js** (`kysely-postgres-js` 5.1.0). O Drizzle perdeu na geração de esquema e no tratamento de erros; a falta de integração oficial do Kysely com Zod precisa ser harmonizada com o ADR-015 na revisão do ADR-008.
- Regras para a fase 2: `validate` estrito (`-ignoreMigrationPatterns=` vazio); `CONCURRENTLY` reexecutável (drop e create); listener de erro no driver; migrations só por ligação direta ou pooler em modo session; `inflightQueryAbortStrategy` padrão, sem conexão de controle.
- Não provados: Supabase real e Supavisor, custo do Kysely sob carga, telemetria do Flyway e o peso de 1,1 GB da imagem no CI.

## Decisões aceitas (IN-02 A)

Aceitas por Pedro em 18/11/2026.

| ID | Decisão |
| --- | --- |
| PC-01 | Gerador deve suportar `oneOf`, `discriminator` e nulo 3.1 por completo e falhar de forma explícita no que não suportar |
| PC-02 | Validação em execução: provar no RM-12 Zod gerado e Ajv sobre JSON Schema; escolher pelos critérios |
| PC-03 | AsyncAPI: parser + JSON Schema como principal; Modelina como alternativa |
| PC-04 | Sessões: implementação própria com jose como principal; Better Auth só se aderir ao ADR-007 |
| PC-05 | Migrations: provar só o Flyway; alternativa só se ele falhar |
| PC-06 | P3 e P5 em PostgreSQL local descartável, sem provisionar Supabase |
| PC-07 | Limites: P1 2 dias, P2 3, P3 3, P4 4, P5 2 |
| PC-08 | Dev build local autorizado só para a P4, sem conta de loja (exceção ao D8) |
| PC-09 | TypeScript: **TypeScript 6.0.3** (alterado em 18/11/2026, substitui a regra anterior). Motivo: o template oficial do Expo SDK 58 (`expo-template-default@sdk-58`) declara `typescript ~6.0.3`; `@nestjs/cli` e `@nestjs/schematics` 12.0.13 exigem `typescript >=6.0.0`; o typescript-eslint 8.73.0 aceita `<6.1.0`. A 5.9.3 não serve e a 7.0.2 sai do peer do typescript-eslint. Fonte: manifestos do registro npm consultados em 18/11/2026; a página docs.expo.dev/guides/typescript não fixa versão. *Texto anterior (histórico, aceito em 18/11/2026): fixar no RM-10 a versão 5.x mais recente compatível com Expo SDK 58 e NestJS 12, confirmada em fonte oficial.* |

## Riscos

- Ferramentas 0.x (Hey API, Kysely, Drizzle) e pouco mantidas (Modelina, WatermelonDB).
- SQLCipher falha sem aviso fora do dev build.
- RLS pode pesar no RNF-01.
- Java a mais no CI (Flyway).
- NestJS 12 só funciona com ESM.
- O ADR-008 pede tipos "compatíveis com Zod" (linha 40) e o ADR-015 proíbe Zod manual concorrente; harmonizar na revisão do ADR-008.

## Divergências conhecidas

Registradas aqui, **não corrigidas** (fora do pedido). Não duplicar em outros documentos.

- `01-arquitetura.md` linha 791 diz "Jest/Vitest" e linha 800 diz "versões pendentes".
- O recorte de geração no pacote técnico (seção 1) e em `baseline-de-escopo-mvp.md` (linha 41) não cita o AsyncAPI, que o D3 inclui.
- A saúde no contrato declara resposta 429 e `X-Request-Id`.
- Ambiente local com PostgreSQL/MinIO/Mailpit (`01-arquitetura.md`, linhas 832-834) x D5 (sem PostgreSQL local na fase 1).
- `infra-e-devops.md` linha 134 fala em "publicação" x D6 (CI só de verificação).
- `.env.example` só com nomes (`infra-e-devops.md`, linha 180) x valores fictícios (`seguranca.md`, linha 175).
- `backend/apps/api/.env.example` lista variáveis fora da fase 1.
- Esqueletos Dialog e DataTable fora do D4.
- `02-diagramas-de-arquitetura.md` linha 22 lista só 002, 004 e 005 como aceitos.

## Rastreabilidade

RM-12, RM-16, RM-06; IN-02 A, D2, D3, D8; ADR-001, 003, 007, 008, 014, 015; MS-01, MS-02, P-07; SEG-04, SEG-05, SEG-09, SEG-17; RNF-01, 02, 05, 06, 07, 08, 11, 16, 17, 18; RN-OF-01 a 06, RN-CH-04. Recorte da fase 1: [decisões, seção 6.2](../decisoes-para-iniciar-o-desenvolvimento.md) e [pacote técnico](../09-infra/pacote-tecnico-fase-1.md).
