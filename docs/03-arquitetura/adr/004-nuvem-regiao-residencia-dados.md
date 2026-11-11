# ADR-004: Provedor de nuvem, região e residência de dados

- **Estado:** Aceito, com ressalvas, para construir o MVP (desenvolvimento e staging). Decisão de Pedro em 10/11/2026. **Revisão obrigatória antes do piloto com dados reais**
- **Data:** 06/11/2026 (proposta); 10/11/2026 (decisão)
- **Decisores:** Pedro Lemos
- **Depende de:** revisão antes do piloto (custo real, LGPD, RPO e RTO, PITR); estimativa de custo (Visão de Produto)
- **Relacionado a:** [ADR-005](005-email-transacional.md), [ADR-013](013-rpo-rto-backup-pitr.md), [ADR-002](002-gateway-de-pagamento.md), [ADR-011](011-ambientes-branches-eas-ota.md)

## Contexto

O PRD seção 10 pede armazenamento de objetos compatível com S3, mas não escolhe provedor de nuvem nem região. A arquitetura listava isso como lacuna (seções 9.3 e 5.2).

Forças em jogo:

- **Custo (RNF-18):** infraestrutura entre 10 e 15% da receita; R$ 300 a 470 por mês no lançamento, até 20 condomínios. Limite de gasto e alertas em 80% e 100% são obrigatórios.
- **Latência:** RNF-01 (95% abaixo de 500 ms), RNF-02 (3 s no 4G) e RNF-05 (visitante na portaria em até 5 s) favorecem região no Brasil.
- **LGPD:** residência de dados e lista de subprocessadores (nuvem, gateway, e-mail, Sentry, Expo/FCM) não estão fechadas. Subprocessadores internacionais pedem avaliação de transferência internacional.
- **Banco:** PostgreSQL gerenciado com backup diário e restauração a qualquer ponto (RNF-13).
- **Processos longos:** WebSocket e worker precisam de processo de longa duração.
- **Equipe pequena:** operação simples pesa muito.

## Opções consideradas (histórico)

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

Os documentos não trazem preços por provedor. As entradas "A estimar" e "A verificar" eram lacunas, não avaliações.

## Decisão

**Para construir o MVP: Supabase + Render.** Decisão de Pedro em 10/11/2026.

| Parte | Provedor | Uso |
| --- | --- | --- |
| Banco e objetos | **Supabase**, região São Paulo | Só PostgreSQL e Storage (API compatível com S3) |
| Processos | **Render** | API NestJS, WebSocket e worker (processos de longa duração). No plano gratuito não há serviço de worker: em dev e staging o worker roda no mesmo serviço web da API, e as rotinas param quando o serviço dorme |

- **Escopo:** construção do MVP, em desenvolvimento e staging, a custo zero (planos gratuitos). Não é decisão para produção com dados reais.
- **Motivo:** Pedro não quer gastar para produzir o MVP. A AWS foi descartada nesta fase por não caber no custo zero pedido pelo Pedro (decisão de 10/11/2026); o Amazon SES sai junto, e por isso o e-mail é o Resend ([ADR-005](005-email-transacional.md)).
- **Gatilho de revisão (obrigatório):** antes do piloto com dados reais (marco M7). A revisão reavalia nuvem, região, plano pago, backup e PITR, contra RNF-13, [ADR-013](013-rpo-rto-backup-pitr.md) e LGPD. As opções A, B e C acima voltam à mesa nessa revisão.

### Regras de uso do Supabase

1. Usar **somente PostgreSQL e Storage** (API compatível com S3). Nenhum outro produto do Supabase.
2. **Sem Supabase Auth.** A autenticação é o JWT próprio sem papéis do [ADR-007](007-autorizacao-jwt-sem-papeis.md).
3. **Data API (PostgREST) desligada**, ou tabelas fora de qualquer esquema exposto. O acesso ao banco é só pelo backend; nenhum cliente fala com o banco.
4. **Conexão direta ou pooler em modo sessão** para o pg-boss e o `LISTEN/NOTIFY` ([ADR-006](006-fila-agendador-eventos.md)). O pooler em modo transação provavelmente não serve a esses dois (a confirmar na prova de conceito).
5. A **RLS por `set_config`** do [ADR-001](001-multi-tenant-rls.md) não muda.

### Fatos conferidos na documentação oficial (consulta de 10/11/2026)

| Tema | O que a documentação diz | Página |
| --- | --- | --- |
| Render, suspensão | Serviço web gratuito é suspenso após 15 minutos sem tráfego de entrada, inclusive mensagens de WebSocket; a próxima requisição ou conexão o acorda, em cerca de 1 minuto | https://render.com/docs/free |
| Render, horas | 750 horas de instância gratuita por mês e por espaço de trabalho; serviço suspenso não consome horas; esgotadas as horas, os serviços gratuitos ficam suspensos até o mês seguinte | mesma página |
| Render, banco gratuito | Banco gratuito do Render expira em 30 dias (**não será usado**: o banco é o do Supabase) | mesma página |
| Render, tipos de serviço | Instâncias gratuitas só para serviço web, Render Postgres e Key Value (e sites estáticos); os demais tipos, como background worker, não suportam instância gratuita | https://render.com/docs/free |
| Render, regiões | Oregon, Ohio, Virginia (EUA), Frankfurt e Singapura. **Não há região no Brasil** | https://render.com/docs/regions |
| Supabase, regiões | Há a região South America (São Paulo), código `sa-east-1` | https://supabase.com/docs/guides/platform/regions |
| Supabase, plano gratuito | Banco de 500 MB por projeto; Storage de 1 GB; dois projetos gratuitos ativos | https://supabase.com/docs/guides/platform/billing-on-supabase |
| Supabase, pausa | Projeto gratuito pausa após 1 semana de inatividade (segundo a página de preços, obtida por busca; **a confirmar** na página oficial de pausa) | https://supabase.com/pricing e https://supabase.com/docs/guides/platform/free-project-pausing |
| Supabase, backup e PITR | PITR é complemento de planos pagos (não incluído no gratuito). Backups diários no plano gratuito: **a confirmar** (a busca indica que não são incluídos) | https://supabase.com/pricing |

## Consequências

**Positivas**

- Custo zero para construir o MVP, sem comprometer orçamento antes de haver validação.
- Banco e objetos em São Paulo (`sa-east-1`) já na fase de construção, perto do modelo final.
- PostgreSQL padrão: sem dependência de recurso proprietário do Supabase, o que mantém a saída para outra nuvem (RDS, por exemplo) como migração de dados, não de código.
- Desbloqueia e-mail ([ADR-005](005-email-transacional.md)), IaC (`docs/09-infra`) e CI/CD.

**Negativas**

- **Render gratuito dorme sem tráfego** e a API fica sem região no Brasil (latência até os EUA ou Frankfurt). RNF-01, RNF-02 e RNF-05 **não são medidos de forma válida** nesse ambiente; a portaria e o WebSocket só valem para desenvolvimento.
- **Supabase gratuito pausa por inatividade (a confirmar) e não tem PITR.** RPO e RTO do [ADR-013](013-rpo-rto-backup-pitr.md) **não são atendidos** no plano gratuito.
- O plano gratuito do Render só oferece serviço web (background worker, cron job e serviço privado não têm instância gratuita, consulta de 10/11/2026). Em dev e staging o **worker roda no mesmo serviço web da API** (mesmo processo ou segundo processo no mesmo contêiner; a confirmar). Quando o serviço dorme, o worker dorme junto: as rotinas agendadas e os jobs (webhooks, push, e-mail, prazos) param, o que vale só para dev e staging.
- Limites de 500 MB de banco e 1 GB de Storage servem a desenvolvimento e staging, não ao piloto.

**Riscos**

- Usar o ambiente gratuito com dados reais (pessoas, pagamentos, votos). Mitigação: **proibido**; dev e staging só com dados fictícios, até a revisão.
- Subprocessadores internacionais e residência: a API fica fora do Brasil (Render) e o e-mail tem região a confirmar ([ADR-005](005-email-transacional.md)). Pesa na revisão de LGPD.
- Custo acima de 10 a 15% da receita no piloto (arquitetura 9.4). Mitigação: estimativa na revisão e alertas 80%/100% (RNF-18).
- Disponibilidade de 99,5% ao mês (RNF-09) não é atendida no plano gratuito.

## Critérios de validação (ressalvas que continuam)

- **Antes do piloto com dados reais**, rodar a revisão: estimativa de custo para o lançamento e para 20 condomínios contra RNF-18; região da API (Brasil ou não); plano pago com backup diário e PITR (RNF-13, [ADR-013](013-rpo-rto-backup-pitr.md)); parecer sobre residência de dados e transferência internacional (LGPD).
- Confirmar na documentação oficial a pausa por inatividade e os backups do Supabase gratuito (marcados "a confirmar").
- Confirmar que WebSocket e worker rodam como processo de longa duração no Render no plano que valer para o piloto.
- Confirmar que o worker pode rodar no mesmo serviço web da API no Render gratuito (mesmo processo ou segundo processo no mesmo contêiner), e como as rotinas agendadas são testadas com o serviço dormindo; para o piloto, avaliar serviço de worker próprio (plano pago).
- Confirmar pooler em modo sessão ou conexão direta com pg-boss e `LISTEN/NOTIFY` na prova de conceito.

## Referências

- `docs/03-arquitetura/01-arquitetura.md`: seções 5.2 (provedor de nuvem e região), 6.8, 6.9, 7, 9.3, 9.4.
- `docs/01-produto/02-prd.md`: seção 10; RNF-01, RNF-02, RNF-05, RNF-09, RNF-13, RNF-18.
- `docs/01-produto/01-visao-de-produto.md`: orçamento de infraestrutura.
- Documentação oficial do Render e do Supabase, consultada em 10/11/2026 (endereços na tabela acima).
