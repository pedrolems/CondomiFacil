# Rotinas, outbox e integrações

Fontes: [01-backend.md](../../../../docs/05-backend/01-backend.md) (linhas 385-485), [eventos e webhooks](../../../../docs/05-backend/api/02-eventos-e-webhooks.md), [integrações externas](../../../../docs/05-backend/api/03-integracoes-externas.md), [ADR-002](../../../../docs/03-arquitetura/adr/002-gateway-de-pagamento.md), [ADR-005](../../../../docs/03-arquitetura/adr/005-email-transacional.md), [ADR-006](../../../../docs/03-arquitetura/adr/006-fila-agendador-eventos.md), [ADR-012](../../../../docs/03-arquitetura/adr/012-fuso-horario-por-condominio.md). Referências externas: [NestJS](https://docs.nestjs.com), [Asaas](https://docs.asaas.com), [Resend](https://resend.com/docs).

**Estado**: nada disto está implementado. `main.worker.ts` é stub; `rotinas/`, `integracoes/*` e `compartilhado/outbox` têm só README.

## Outbox (proposta; ADR-006 proposto)

- Mudança, `evento_saida` e auditoria na mesma transação. Despacho no worker com `FOR UPDATE SKIP LOCKED` e `NOTIFY`; entrega ao menos uma vez; consumidores idempotentes.
- Carga mínima: sem nome, documento, situação financeira nem voto.
- **Pendente** (E13): na fase 2, só outbox e despachante em laço.

## Rotinas (proposta)

- Worker em `main.worker.ts`. No plano gratuito do Render roda no mesmo serviço da API e **para quando o serviço dorme** (ADR-004 aceito).
- `RotinaBase` (Template Method): abre contexto, verifica chave, executa, grava `execucao_rotina`, trata falha. Fan-out: um job por condomínio, cada um com `TenantContext`. Fila pg-boss é proposta (ADR-006).
- Fuso por condomínio, padrão `America/Sao_Paulo` (ADR-012, proposto); faixas meia-noite, madrugada e 09:00 locais.
- Idempotência por chave única por efeito: duas execuções dão o mesmo resultado.

As 22 rotinas (número, tema, regra):

| Nº | Rotina | Regra |
| --- | --- | --- |
| 1 | Expirar reservas não pagas (5 min) | RN-RE-03 |
| 2 | Saída não registrada em 24 h | RN-VI-07 |
| 3 | Visitantes que não vieram | RN-VI-09 |
| 4 | Recuperação de score (+5 após 2 meses) | RN-SC-08 |
| 5 | Bloqueio de reservas gratuitas | RN-SC-09 |
| 6 | Fechamento da pesquisa | RN-PE-05 a 08 |
| 7 | Faltas em reservas | RN-RE-10 |
| 8 | Lembretes de encomenda | RN-EN-03 e 04 |
| 9 | Entregas esperadas não chegadas | RN-EN-12 e 13 |
| 10 | Prazos de reclamação e chamado | RN-RC-04, RN-RC-06, RN-CH-06 |
| 11 | Lembrete de avaliação de chamado | RN-CH-17 |
| 12 | Encerrar reclamações sem recurso | RN-RC-15 |
| 13 | Limpeza de dados offline | RN-OF-06, SEG-09 |
| 14 | Anonimização de visitantes (6 meses padrão) | RN-VI |
| 15 | Gerar cobranças mensais | RN-FI-05 |
| 16 | Marcar atraso | RN-FI-06 e 09 |
| 17 | Lembretes de cobrança | RN-FI-16 |
| 18 | Lançamentos recorrentes | RN-FI-26 |
| 19 | Fechar mês financeiro | RN-FI-28 |
| 20 | Fim de contrato de locação | RN-CD-21 |
| 21 | Lembrete de reserva (5 min) | RN-RE-14 |
| 22 | Conciliação diária com o gateway | SEG-17 (15/11/2026) |

## Portas e adaptadores (proposta, exigidos pelo AGENTS.md)

`PaymentGateway` (criarSubconta, criarCobranca, consultar, reembolsar, validarWebhook), `Mailer` (enviar), `PushSender` (enviar, consultarRecibos), `ArmazenamentoDeObjetos` (urlEnvio, urlLeitura, remover), `ParametrosService`. Adaptadores: `AdaptadorAsaas`, `AdaptadorResend`, push, armazenamento S3, monitoramento Sentry. Nunca chame provedor dentro da transação do ato; use outbox ou job. Dublê de adaptador nos testes.

## Provedores

- **Asaas** (ADR-002, aceito com ressalvas): sandbox `api-sandbox.asaas.com/v3`, cabeçalho `access_token`. Cartão só por `invoiceUrl`: a API não recebe dados de cartão (SEG-12). Webhook com token no cabeçalho `asaas-access-token` comparado em tempo constante; responder 200 rápido e processar em job; token inválido dá 401; evento sem correlação vai para quarentena com 200. Só sandbox em local, dev e staging; integração real está bloqueada. Prazos de boleto e Pix, KYC, chargeback e conta em CNPJ seguem pendentes (a PoC do sandbox os verifica).
- **Resend** (ADR-005, aceito com ressalvas): `Idempotency-Key` por 24 h; webhook `/webhooks/email/resend` com assinatura Svix sobre o corpo bruto (inválida: 401). Em dev e staging, caixa de saída falsa por `MAILER_MODE` (**pendente**, E14).
- **Storage** (Supabase, S3): URL assinada; chaves S3 ignoram RLS, a autorização é da API.
- **Expo Push**: até 100 por requisição; recibos cerca de 15 min depois; `DeviceNotRegistered` remove o token.
- **Sentry**: filtrar dados sensíveis.
- Segredos só por variável de ambiente. `.env.example` lista nomes; hoje o código lê só `APP_ENV`, `PORT` e `CORS_ALLOWED_ORIGINS`.

## Testes de rotina

Duas execuções = mesmo resultado; fuso do condomínio; fan-out isolado (falha de um condomínio não afeta outro); relógio injetável.
