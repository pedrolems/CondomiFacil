# ADR-004: Provedor de nuvem, região e residência de dados

- **Estado:** Em aberto
- **Data:** 06/11/2026
- **Decisores:** Pedro Lemos
- **Depende de:** estimativa de custo real (Visão de Produto); exigências de LGPD
- **Relacionado a:** [ADR-005](005-email-transacional.md), [ADR-013](013-rpo-rto-backup-pitr.md), [ADR-002](002-gateway-de-pagamento.md), [ADR-011](011-ambientes-branches-eas-ota.md)

## Contexto

O PRD seção 10 pede armazenamento de objetos compatível com S3, mas não escolhe provedor de nuvem nem região. A arquitetura lista isso como lacuna (seções 9.3 e 5.2).

Forças em jogo:

- **Custo (RNF-18):** infraestrutura entre 10 e 15% da receita; R$ 300 a 470 por mês no lançamento, até 20 condomínios. Limite de gasto e alertas em 80% e 100% são obrigatórios.
- **Latência:** RNF-01 (95% abaixo de 500 ms), RNF-02 (3 s no 4G) e RNF-05 (visitante na portaria em até 5 s) favorecem região no Brasil.
- **LGPD:** residência de dados e lista de subprocessadores (nuvem, gateway, e-mail, Sentry, Expo/FCM) não estão fechadas. Subprocessadores internacionais pedem avaliação de transferência internacional.
- **Banco:** PostgreSQL gerenciado com backup diário e restauração a qualquer ponto (RNF-13).
- **Processos longos:** WebSocket e worker precisam de processo de longa duração.
- **Equipe pequena:** operação simples pesa muito.

## Opções consideradas

| Critério (peso) | A. AWS em São Paulo | B. PaaS (Render, Fly.io, Railway) + PostgreSQL gerenciado e S3 compatível (ex.: Cloudflare R2) | C. Outro provedor com região no Brasil |
| --- | --- | --- | --- |
| Custo (alto) | A estimar | Menor custo inicial e operação enxuta | A estimar |
| Região no Brasil (alto) | Sim | Menos opções de região no Brasil | Sim, por premissa |
| PostgreSQL gerenciado com backup e PITR (alto) | RDS PostgreSQL | Gerenciado, conforme provedor | A verificar |
| Objetos S3 (alto) | S3 nativo | Compatível (ex.: R2) | A verificar |
| Operação simples (alto) | Mais configuração (ECS Fargate ou App Runner, CloudFront) | Mais simples | A verificar |
| Processo de longa duração (médio) | Suportado | A verificar por provedor | A verificar |
| Teto de gasto e alertas (obrigatório) | A configurar | A configurar | A configurar |
| Coerência com e-mail (ADR-005) | SES é natural | Resend tende a ser mais simples | Depende |

Os documentos não trazem preços por provedor. As entradas "A estimar" e "A verificar" são lacunas, não avaliações.

## Recomendação

Não há decisão. Recomendação condicional, da arquitetura 5.2:

- Começar por **A, com poucos serviços gerenciados**, se região no Brasil e S3 nativo pesarem mais.
- Começar por **B**, se custo inicial e operação enxuta pesarem mais.

A escolha pede uma **estimativa de custo real** comparada ao orçamento da Visão de Produto (R$ 300 a 470 por mês até 20 condomínios). A região e a residência de dados também precisam de definição junto com a base legal e a lista de subprocessadores.

Esta ADR deve ser decidida antes da [ADR-005](005-email-transacional.md), que depende dela.

## Consequências

**Positivas (de decidir cedo)**

- Desbloqueia e-mail transacional, backup/PITR, IaC (`docs/09-infra`) e CI/CD.
- Dá base para a política de privacidade e a lista de subprocessadores.

**Negativas**

- Escolher A aumenta a carga de operação para uma equipe pequena. Escolher B pode limitar a região e a opção de residência no Brasil.
- Trocar de nuvem depois custa migração de banco e objetos.

**Riscos**

- Custo acima de 10 a 15% da receita (arquitetura 9.4). Mitigação: poucos serviços gerenciados no início, alertas 80%/100%, estimativa antes de decidir.
- Disponibilidade de 99,5% ao mês (RNF-09) com equipe pequena.
- Não conformidade LGPD por subprocessadores internacionais e residência indefinida.

## Critérios de validação e o que falta para aceitar

- Estimativa de custo por opção, para o lançamento e para 20 condomínios, contra RNF-18.
- Confirmação de região no Brasil, PostgreSQL gerenciado com PITR e S3 compatível em cada opção.
- Parecer sobre residência de dados e transferência internacional (LGPD).
- Confirmação de que WebSocket e worker rodam como processo de longa duração.
- Decisão do Pedro. A ADR passa a Proposto quando houver recomendação fundamentada em números.

## Referências

- `docs/03-arquitetura/01-arquitetura.md`: seções 5.2 (provedor de nuvem e região), 6.8, 6.9, 7, 9.3, 9.4.
- `docs/01-produto/02-prd.md`: seção 10; RNF-01, RNF-02, RNF-05, RNF-09, RNF-13, RNF-18.
- `docs/01-produto/01-visao-de-produto.md`: orçamento de infraestrutura.
