# ADRs do CondomiFacil

## O que é um ADR neste projeto

ADR (Architecture Decision Record) é um registro curto de uma decisão de arquitetura: o problema, as opções, o que se decidiu (ou recomenda) e as consequências. Serve para que a equipe entenda **por que** o sistema é como é, sem depender de memória.

Cada ADR segue o modelo Nygard/MADR enxuto, em português do Brasil:

1. Título `# ADR-NNN: <título>` e metadados (estado, data, decisores, dependências).
2. Contexto, com IDs de RF, RNF, SEG, RN e US que motivam a decisão.
3. Opções consideradas, com prós e contras.
4. Decisão (ou Recomendação, quando ainda está em aberto).
5. Consequências: positivas, negativas e riscos.
6. Critérios de validação: o que falta para aceitar (prova de conceito, parecer, custo).
7. Referências às seções de `01-arquitetura.md` e aos documentos de produto.

A fonte das decisões é [`../01-arquitetura.md`](../01-arquitetura.md) (seção 9.1). Os ADRs não inventam requisitos: o que não está definido nos documentos aparece como em aberto.

## Ciclo de estados

| Estado | Significado |
| --- | --- |
| **Em aberto** | Ainda não há recomendação fechada; faltam dados (custo, prova de conceito, parecer) |
| **Proposto** | Há uma recomendação fundamentada, aguardando validação do Pedro |
| **Aceito** | O Pedro validou; vale para o projeto |
| **Aceito, com ressalvas** | O Pedro validou, com condições ou revisão obrigatória registradas no ADR (ex.: 002, 004 e 005, em 10/11/2026; 016, em 16/11/2026; 001, 003, 007 e 008, em 20/11/2026) |
| **Aceito quanto a ...** | O Pedro validou só o escopo indicado; o restante do ADR segue pendente (ex.: 015, em 14/11/2026, quanto à organização e às fontes dos contratos) |
| **Rejeitado** | Avaliado e recusado; permanece registrado com o motivo |
| **Substituído** | Trocado por outro ADR, que é citado no cabeçalho |
| **Obsoleto** | Deixou de se aplicar (ex.: o componente saiu do projeto), sem substituto |

Transições usuais: Em aberto, depois Proposto, depois Aceito ou Rejeitado; um Aceito pode virar Substituído ou Obsoleto. **Só o Pedro move um ADR para Aceito.** Em 10/11/2026 o Pedro aceitou, com ressalvas, os ADRs 002, 004 e 005; em 14/11/2026 aceitou o ADR-015 quanto à organização e às fontes dos contratos, com versões Node 26.13.1 e pnpm 12.21.0 aprovadas em 18/11/2026 (D1), e ferramenta de geração escolhida após a PoC P1 em 18/11/2026: openapi-typescript 7.13.0 + Ajv 8.20.0 + @asyncapi/parser 3.6.6 (com ressalva do peer de TypeScript). Em 16/11/2026 aceitou, com ressalvas, o ADR-016 (painel web como site estático do Render em dev e staging, com revisão obrigatória antes do piloto). Em 20/11/2026, depois das PoCs P2 a P5 do RM-16, aceitou, com ressalvas, os ADRs 001 (RLS), 003 (offline), 007 (sessões, com retry do refresh B+E de 30 s e exceção do módulo `autenticacao`) e 008 (Kysely com postgres.js e Flyway, sem Zod); o ADR-014 continua condicionado e não foi aceito. Os demais continuam sem validação.

## Como criar um novo ADR

1. Pegue o próximo número livre (hoje, 017) e crie `NNN-titulo-curto-em-kebab-case.md` nesta pasta.
2. Copie a estrutura de um ADR existente e preencha todas as seções. Datas em dd/mm/aaaa.
3. Confirme cada ID citado (RF, RNF, SEG, RN, US) nos documentos de `docs/01-produto/`.
4. Comece em **Em aberto** ou **Proposto**. Nunca em Aceito.
5. Acrescente uma linha na tabela abaixo e na seção 9.1 de `01-arquitetura.md`.
6. Para substituir um ADR, crie o novo, marque o antigo como Substituído e cite um no outro. Não apague ADR antigo.
7. Mudou uma regra de produto por causa do ADR? Atualize a cadeia de rastreabilidade (RN, PRD, histórias, fluxos, Design System, protótipo) na mesma alteração.
8. Nenhum commit vai para uma branch sem validação do Pedro.

## Índice

| Nº | Título | Estado | Data | Atualizado em | Depende de |
| --- | --- | --- | --- | --- | --- |
| 001 | [Multi-tenant com banco compartilhado, `condominio_id` e RLS](001-multi-tenant-rls.md) | Aceito, com ressalvas (RLS; P3) | 06/11/2026 | 20/11/2026 | Ressalvas: Supavisor não testado; lista do dia da portaria mais lenta sob RLS (mitigações propostas); latência da API inteira na carga da fase 2 |
| 002 | [Gateway de pagamento](002-gateway-de-pagamento.md) | Aceito, com ressalvas (Asaas) | 10/11/2026 | 10/11/2026 | Prova de conceito como verificação; KYC, chargeback e prazos reais; marco 2 |
| 003 | [Banco local do aparelho e sincronização offline](003-banco-local-e-sync-offline.md) | Aceito, com ressalvas (expo-sqlite com SQLCipher e outbox própria; P4) | 06/11/2026 | 20/11/2026 | Ressalvas: iOS e aparelho real não testados; sem SQLCipher na web; ADR-014 continua condicionado |
| 004 | [Provedor de nuvem, região e residência de dados](004-nuvem-regiao-residencia-dados.md) | Aceito, com ressalvas (Supabase + Render, só MVP) | 10/11/2026 | 10/11/2026 | Revisão obrigatória antes do piloto com dados reais (custo, LGPD, PITR) |
| 005 | [E-mail transacional](005-email-transacional.md) | Aceito, com ressalvas (Resend) | 10/11/2026 | 10/11/2026 | Teste de entregabilidade; LGPD (dados fora do Brasil); revisão do ADR-004 |
| 006 | [Fila, agendador e distribuição de eventos](006-fila-agendador-eventos.md) | Proposto (aceite parcial em 21/11/2026: só o outbox transacional em PostgreSQL e o despachante em laço no worker, E13 A; fila e agendador seguem propostos) | 06/11/2026 | 21/11/2026 | Carga esperada |
| 007 | [Autorização com papéis no servidor, JWT sem papéis e refresh rotativo](007-autorizacao-jwt-sem-papeis.md) | Aceito, com ressalvas (jose; retry B+E de 30 s; P2) | 06/11/2026 | 20/11/2026 | Ressalvas: HS256 simétrico (rever EdDSA ou ES256); expo-secure-store não provado em aparelho; retry B+E a implementar e provar na fase 2 |
| 008 | [ORM ou query builder e migrações](008-orm-query-builder-migracoes.md) | Aceito, com ressalvas (Kysely 0.29.9 com postgres.js e Flyway 13.12.2 OSS; P5) | 06/11/2026 | 20/11/2026 | Ressalvas: Supabase real e Supavisor não testados; imagem do Flyway de cerca de 1,1 GB no CI; regras da P5 para a fase 2 |
| 009 | [Votação com registro separado do conteúdo e limite de sigilo](009-votacao-sigilo.md) | Proposto | 06/11/2026 | 15/11/2026 | Parecer jurídico (SEG-16) |
| 010 | [Anonimato com identidade separada, HMAC e limites mínimos](010-anonimato-identidade-separada.md) | Proposto | 06/11/2026 | 12/11/2026 | Parecer jurídico |
| 011 | [Ambientes, branches, promoção, EAS e OTA](011-ambientes-branches-eas-ota.md) | Proposto | 06/11/2026 | 10/11/2026 | Equipe |
| 012 | [Fuso horário e faixas de horário das rotinas por condomínio](012-fuso-horario-por-condominio.md) | Proposto | 06/11/2026 | 15/11/2026 | Produto |
| 013 | [RPO, RTO e política de backup e PITR](013-rpo-rto-backup-pitr.md) | Proposto | 06/11/2026 | 10/11/2026 | Custo (RNF-18) |
| 014 | ["Primeira conclusão" na sincronização](014-primeira-conclusao-sync.md) | Proposto | 08/11/2026 | 12/11/2026 | Critério de produto definido; desempate exato e relógio incorreto pendentes |
| 015 | [Workspaces e contratos compartilhados](015-workspaces-e-contratos-compartilhados.md) | Aceito quanto à organização e às fontes | 14/11/2026 | 14/11/2026 | Node 26.13.1 e pnpm 12.21.0 aprovados em 18/11/2026 (D1); ferramenta de geração escolhida após a PoC P1 em 18/11/2026: openapi-typescript 7.13.0 + Ajv 8.20.0 + @asyncapi/parser 3.6.6 (com ressalva do peer de TypeScript) |
| 016 | [Hospedagem do painel web](016-hospedagem-do-painel-web.md) | Aceito, com ressalvas (Render, site estático, só MVP) | 15/11/2026 | 16/11/2026 | Revisão obrigatória antes do piloto com dados reais, junto com o ADR-004; limites do plano gratuito a confirmar |
