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
| **Rejeitado** | Avaliado e recusado; permanece registrado com o motivo |
| **Substituído** | Trocado por outro ADR, que é citado no cabeçalho |
| **Obsoleto** | Deixou de se aplicar (ex.: o componente saiu do projeto), sem substituto |

Transições usuais: Em aberto, depois Proposto, depois Aceito ou Rejeitado; um Aceito pode virar Substituído ou Obsoleto. **Só o Pedro move um ADR para Aceito.** Hoje nenhum ADR está aceito.

## Como criar um novo ADR

1. Pegue o próximo número livre (hoje, 015) e crie `NNN-titulo-curto-em-kebab-case.md` nesta pasta.
2. Copie a estrutura de um ADR existente e preencha todas as seções. Datas em dd/mm/aaaa.
3. Confirme cada ID citado (RF, RNF, SEG, RN, US) nos documentos de `docs/01-produto/`.
4. Comece em **Em aberto** ou **Proposto**. Nunca em Aceito.
5. Acrescente uma linha na tabela abaixo e na seção 9.1 de `01-arquitetura.md`.
6. Para substituir um ADR, crie o novo, marque o antigo como Substituído e cite um no outro. Não apague ADR antigo.
7. Mudou uma regra de produto por causa do ADR? Atualize a cadeia de rastreabilidade (RN, PRD, histórias, fluxos, Design System, protótipo) na mesma alteração.
8. Nenhum commit vai para uma branch sem validação do Pedro.

## Índice

| Nº | Título | Estado | Data | Depende de |
| --- | --- | --- | --- | --- |
| 001 | [Multi-tenant com banco compartilhado, `condominio_id` e RLS](001-multi-tenant-rls.md) | Proposto | 06/11/2026 | Prova de conceito de RLS com carga |
| 002 | [Gateway de pagamento](002-gateway-de-pagamento.md) | Em aberto | 06/11/2026 | Prova de conceito; marco 2; UF 17 |
| 003 | [Banco local do aparelho e sincronização offline](003-banco-local-e-sync-offline.md) | Proposto | 06/11/2026 | Prova de conceito de criptografia e fila |
| 004 | [Provedor de nuvem, região e residência de dados](004-nuvem-regiao-residencia-dados.md) | Em aberto | 06/11/2026 | Estimativa de custo; LGPD |
| 005 | [E-mail transacional](005-email-transacional.md) | Em aberto | 06/11/2026 | ADR-004 |
| 006 | [Fila, agendador e distribuição de eventos](006-fila-agendador-eventos.md) | Proposto | 06/11/2026 | Carga esperada |
| 007 | [Autorização com papéis no servidor, JWT sem papéis e refresh rotativo](007-autorizacao-jwt-sem-papeis.md) | Proposto | 06/11/2026 | Revisão de segurança |
| 008 | [ORM ou query builder e migrações](008-orm-query-builder-migracoes.md) | Proposto | 06/11/2026 | Controle de transação |
| 009 | [Votação com registro separado do conteúdo e limite de sigilo](009-votacao-sigilo.md) | Proposto | 06/11/2026 | Parecer jurídico (SEG-16) |
| 010 | [Anonimato com identidade separada, HMAC e limites mínimos](010-anonimato-identidade-separada.md) | Proposto | 06/11/2026 | Parecer jurídico |
| 011 | [Ambientes, branches, promoção, EAS e OTA](011-ambientes-branches-eas-ota.md) | Proposto | 06/11/2026 | Equipe |
| 012 | [Fuso horário por condomínio para rotinas "à meia-noite"](012-fuso-horario-por-condominio.md) | Proposto | 06/11/2026 | Produto |
| 013 | [RPO, RTO e política de backup e PITR](013-rpo-rto-backup-pitr.md) | Proposto | 06/11/2026 | Custo (RNF-18) |
| 014 | ["Primeira conclusão" na sincronização](014-primeira-conclusao-sync.md) | Proposto | 06/11/2026 | Produto |
