# Integrações externas — CondomiFacil

**Estado:** Proposta de 10/11/2026, não aceita pelo Pedro. **Decisão do Pedro em 10/11/2026:** gateway Asaas (ADR-002), e-mail Resend (ADR-005), Supabase (só PostgreSQL e Storage por API compatível com S3) e Render (API, WebSocket e worker no mesmo serviço web no plano gratuito) para construir o MVP em dev e staging (ADR-004). Push (Expo Push e FCM) e erros (Sentry) já estavam no PRD seção 10. Todo o resto deste documento é Proposta.

Os fatos sobre serviços externos vêm da documentação oficial, consultada em 10/11/2026; o endereço de cada página está na seção 8. Onde a página não confirmou, o texto diz **a confirmar** e não afirma. Nenhuma requisição externa levou nome, e-mail ou dado do projeto.

## Índice

1. [Regras comuns](#1-regras-comuns)
2. [Asaas (pagamento)](#2-asaas-pagamento)
3. [Resend (e-mail)](#3-resend-e-mail)
4. [Supabase Storage (arquivos)](#4-supabase-storage-arquivos)
5. [Expo Push e FCM (push)](#5-expo-push-e-fcm-push)
6. [Sentry (erros)](#6-sentry-erros)
7. [Hospedagem e banco (Render e Supabase PostgreSQL)](#7-hospedagem-e-banco-render-e-supabase-postgresql)
8. [Páginas consultadas](#8-páginas-consultadas)
9. [Lacunas e itens a confirmar](#9-lacunas-e-itens-a-confirmar)

## 1. Regras comuns

Valem para todos (`01-backend.md` seção 6, Proposta):

- Cada serviço entra por uma **porta** em `compartilhado/portas/` e um **adaptador** em `integracoes/`. O domínio nunca fala com o SDK do provedor (Adapter, GoF; inversão de dependência, SOLID).
- Chamadas com tempo limite e nova tentativa com recuo; as tentativas longas são de jobs. Falha externa não derruba a transação do usuário quando há caminho assíncrono (outbox).
- Segredos só no servidor, em variáveis injetadas, um conjunto por ambiente (SEG-02). Nenhum dado sensível em log nem no Sentry (ADR-010).
- Dados de cartão nunca passam pela API, pelo banco nem pelos logs (SEG-12).
- Em dev e staging: só credenciais de sandbox e dados fictícios (ADR-004).

| Serviço | Porta | Adaptador | Estado |
| --- | --- | --- | --- |
| Pagamento | `PaymentGateway` | `AdaptadorAsaas` | Decisão do Pedro (10/11/2026) |
| E-mail | `Mailer` | `AdaptadorResend` | Decisão do Pedro (10/11/2026) |
| Arquivos | `ArmazenamentoDeObjetos` | `integracoes/armazenamento/` sobre API S3 do Supabase | Decisão do Pedro para dev e staging (ADR-004) |
| Push | `PushSender` | `integracoes/push/` com Expo Push | Decidido no PRD 10 |
| Erros | n/a | `integracoes/monitoramento/` com Sentry | Decidido no PRD 10 |

## 2. Asaas (pagamento)

**Finalidade:** subconta por condomínio, cobrança por boleto (com Pix), Pix e cartão, reembolso e confirmação por webhook (PRD 10, RN-PG-04, RF-PG-01 a RF-PG-04, RF-FI-09). O dinheiro vai direto à conta do condomínio; a plataforma não retém (RN-PG-04).

**Porta `PaymentGateway`:** `criarSubconta`, `criarCobranca`, `consultar`, `reembolsar`, `validarWebhook` (arquitetura 3.6). Um único adaptador, o `AdaptadorAsaas`.

### 2.1 Chamadas usadas e método da porta

Base: sandbox `https://api-sandbox.asaas.com/v3`; produção `https://api.asaas.com/v3`. Autenticação das chamadas do backend: chave de API no cabeçalho `access_token`. Requisição `GET` precisa ir com corpo vazio: com corpo, o Asaas responde `403` (dito nas páginas de referência do QR Code Pix e da linha digitável, seção 8; para as demais chamadas `GET`, a regra é a confirmar).

| Método da porta | Chamada no Asaas | O que usamos | Observações conferidas |
| --- | --- | --- | --- |
| `criarSubconta` | `POST /v3/accounts` | Obrigatórios: `name`, `email`, `cpfCnpj`, `mobilePhone`, `incomeValue`, `address`, `addressNumber`, `province`, `postalCode`. Resposta: `id`, `walletId`, `accountNumber`, `accessToken.apiKey`, `commercialInfoExpiration` | A `apiKey` vem **aninhada** em `accessToken` e **só é devolvida uma vez**: gravar no cofre antes de qualquer outro passo. A conta principal precisa ser pessoa jurídica (CNPJ). Aceita `webhooks` na criação (um webhook por subconta) |
| `criarCobranca` | `POST /v3/payments` | Obrigatórios: `customer`, `billingType`, `value`, `dueDate`. `billingType`: `BOLETO`, `PIX`, `CREDIT_CARD`, `UNDEFINED` (o pagador escolhe). `externalReference` recebe o id da `tentativa_pagamento`. Resposta: `id`, `status`, `invoiceUrl`, `bankSlipUrl`, `nossoNumero`, `value`, `netValue`, `dueDate` | Sem menção a idempotência na página: a duplicidade é evitada pela `chave_idempotencia` da tentativa e por busca por `externalReference` antes de recriar (Proposta) |
| `criarCobranca` (complemento) | `GET /v3/payments/{id}/identificationField` | `identificationField` (linha digitável), `nossoNumero`, `barCode` | Para `BOLETO` ou `UNDEFINED` com boleto disponível. Valor ou vencimento alterados mudam a linha: buscar de novo e reagir ao `PAYMENT_UPDATED` |
| `criarCobranca` (complemento) | `GET /v3/payments/{id}/pixQrCode` | `encodedImage` (imagem em Base64), `payload` (Pix copia e cola), `expirationDate` | Para `PIX`, `BOLETO` ou `UNDEFINED` com Pix. QR dinâmico, pago uma vez. Atualizou a cobrança, buscar novo QR |
| `consultar` | Consulta de cobrança por `id` e listagem para conciliação | Campos de `PaymentGetResponseDTO` | **A confirmar:** páginas de `GET /v3/payments/{id}` e de listagem com filtros. Base da conciliação diária (SEG-17) |
| `reembolsar` | `POST /v3/payments/{id}/refund` | Corpo opcional: `value` (parcial), `description`, `splitRefunds`. Resposta: cobrança com `status` e `refunds[]` (`status`: `PENDING`, `AWAITING_CRITICAL_ACTION_AUTHORIZATION`, `AWAITING_CUSTOMER_EXTERNAL_AUTHORIZATION`, `CANCELLED`, `DONE`) | Cartão: estorno em cobrança confirmada ou recebida, total ou parcial; pode levar até 10 dias úteis para aparecer na fatura. Pix: total ou parciais, soma limitada ao valor; taxas não voltam; estorno logo após receber pode falhar com `400` por saldo insuficiente. Regras de boleto estão em outra página (a confirmar) |
| `validarWebhook` | Cabeçalho `asaas-access-token` da requisição recebida | Comparação em tempo constante com o segredo | Ver 2.3 |
| Configuração | `POST /v3/webhooks` | `url`, `email`, `enabled`, `interrupted`, `authToken`, `sendType`, `events` | Até 10 webhooks por conta. `sendType`: `SEQUENTIALLY` (ordem preservada) ou `NON_SEQUENTIALLY` (sem garantia de ordem). A documentação recomenda listar só os eventos necessários |

**Cartão (SEG-12).** Dados de cartão não passam pela API. O caminho documentado pelo Asaas que cumpre isso é criar a cobrança `CREDIT_CARD` (ou `UNDEFINED`) e **redirecionar o pagador à `invoiceUrl`**, onde ele digita o cartão na interface do Asaas. A alternativa de enviar o cartão pela API do Asaas está documentada, mas **não será usada**: exigiria dados de cartão no nosso servidor. Débito não é cobrado enviando dados pela API; para oferecê-lo, redireciona-se à `invoiceUrl` com `billingType` `CREDIT_CARD` ou `UNDEFINED` (página de cobranças via cartão, lida em 11/11/2026). As regras de negócio aceitam Pix e cartão de crédito (RN-PG-06); o que fazer com o débito que a fatura pode oferecer é **a confirmar** (Pedro).

### 2.2 Dados de pagamento devolvidos ao cliente

Nomes fixos que a API devolve ao app (usados nos arquivos `morador.yaml` e `proprietario-nao-residente.yaml`).

| Campo na API | Campo no Asaas | Chamada de origem | Observação |
| --- | --- | --- | --- |
| `linha_digitavel` | `identificationField` | `GET /v3/payments/{id}/identificationField` | Só boleto de cobrança condominial. Buscar de novo se a cobrança foi atualizada (segunda via com multa e juros do dia, RN-FI-08) |
| `pix_copia_e_cola` | `payload` | `GET /v3/payments/{id}/pixQrCode` | Pix de reserva, de cobrança e QR Code Pix do boleto |
| `pix_qr_code_base64` | `encodedImage` | `GET /v3/payments/{id}/pixQrCode` | Imagem do QR em Base64 |
| `url_checkout` | `invoiceUrl` | Resposta de `POST /v3/payments` | Página hospedada pelo Asaas, usada para pagar com cartão (SEG-12). Também abre boleto e Pix |
| `expira_em` | `expirationDate` do QR Code Pix, **só para Pix** | `GET /v3/payments/{id}/pixQrCode` | **Sem equivalente fechado.** Para a **reserva**, o prazo de pagamento é nosso (RN-RE-03, padrão 24 h) e vem de `tentativa_pagamento.expira_em` (MER/DER 4.10), não do Asaas. Para boleto e cartão o Asaas não devolve um campo de "expiração da tentativa": o limite é o vencimento (`dueDate`) |

**Pontos de atenção do Pix (a confirmar):** a documentação do QR diz que ele expira 12 meses depois do vencimento da cobrança e, em outro trecho, que sem chave Pix cadastrada ele vale até 23h59 do mesmo dia (comportamento transitório). Os dois não coincidem com o prazo da reserva; por isso a reserva expira pela rotina 1 e `expira_em` da API vem do nosso banco. Valor de QR "estático ou dinâmico" (pendência do ADR-002): a página classifica o QR da cobrança como **dinâmico**, de uso único.

### 2.3 Webhook: autenticação, entrega e eventos

- **Autenticação por token, não por assinatura.** O backend define um `authToken` (32 a 255 caracteres, sem espaços, sem sequência simples, diferente de qualquer chave de API do Asaas) ao criar o webhook. O Asaas o envia em cada entrega no cabeçalho **`asaas-access-token`**. Não existe HMAC do corpo. Consequências: segredo no cofre, rotação, comparação em tempo constante, e o endereço não registra esse cabeçalho em log (ADR-002).
- **Entrega "ao menos uma vez".** O mesmo evento pode chegar mais de uma vez. Cada carga traz um `id` único do evento, usado como chave de idempotência (`evento_gateway`, MER/DER 4.10).
- **Reenvio.** Sem confirmação, o evento entra em novo fluxo de tentativas. A página **não informa** intervalos nem número de tentativas. Depois de **15 falhas consecutivas** de entrega a fila pode ser interrompida: sem processar, a confirmação atrasa, e a conciliação diária cobre (SEG-17).
- **Sequência recomendada pelo Asaas:** receber, gravar em fila, responder `200`, processar. Resposta esperada: `HTTP 200` (o corpo `{"received": true}` aparece nos exemplos, mas não é exigido). Timeout numérico não está na página; o endpoint responde rápido e processa em job.
- **Ordem.** Em `NON_SEQUENTIALLY` não há garantia de ordem entre eventos; por isso as transições são monotônicas (arquitetura 3.6). A escolha entre `SEQUENTIALLY` e `NON_SEQUENTIALLY` é **a decidir** no adaptador.
- **Endereço.** `POST /webhooks/pagamentos/asaas`, em `openapi/webhooks.yaml`. Tabela de eventos e transições em `02-eventos-e-webhooks.md`.
- **Webhook por subconta.** A criação da subconta aceita `webhooks`. Um só token para a plataforma ou um por subconta: **a decidir**.

### 2.4 Segredos, ambientes e limites

| Item | Proposta |
| --- | --- |
| Segredos | Chave de API da conta principal; `apiKey` de cada subconta (gravada na criação, devolvida uma vez); `authToken` do webhook. Todos no cofre, um conjunto por ambiente |
| Ambientes | Local, dev e staging só com **sandbox** (`api-sandbox.asaas.com`); produção só em produção. A conta do sandbox é criada em `sandbox.asaas.com` e é independente da de produção; usar chave de sandbox na URL de sandbox e a de produção na URL de produção, e nunca chave de produção no sandbox (páginas do sandbox e do FAQ, lidas em 11/11/2026). Que a chave de produção no sandbox "responde `401`": **a confirmar** (as páginas lidas não dizem o código) |
| Trava de ambiente | O adaptador se recusa a subir em staging com chave de produção (ADR-002) |
| Saldo no sandbox | Não é disponibilizado automaticamente e nenhum valor real é movimentado: criar cliente e cobrança Pix ou boleto e **confirmar o pagamento manualmente** (FAQ do sandbox). Pagar QR Pix no sandbox exige um QR compatível com os cenários suportados e pode dar `404` se a conta não tem chave Pix cadastrada; cadastrar a chave não corrige QR anteriores (página de erro 404 do QR Pix). O QR Pix do boleto existe, "porém não é um QR Code efetivo". Multa, juros e desconto em boleto ou Pix não são testáveis (página "O que pode ser testado") |
| Subconta BaaS | No sandbox é possível criar e listar subcontas BaaS; o link de onboarding é só simulação, sem envio real de documentos (página "O que pode ser testado"). O modelo BaaS exige habilitação com o gerente de contas (ADR-002). Que testes de confirmação de pagamento em subconta BaaS passam pela equipe de integração: **a confirmar** (as páginas lidas só citam essa equipe para teste de chargeback) |
| Limites da avaliação | Limites de subcontas em período de avaliação vieram de busca, não de leitura da página: **a confirmar** (ADR-002) |
| Lacunas | KYC da subconta (prazo, documentos, aceitação de pessoa física, SEG-15), chargeback, taxas por meio, prazos reais de confirmação de boleto e Pix, repasse (ADR-002, UF 17) |

## 3. Resend (e-mail)

**Finalidade:** código de acesso de 6 dígitos (RF-AC-01), comprovante de pagamento e de reembolso (RF-PG-04, RN-PG-07) e cópia dos dados por link expirável (RF-LG-01). Lembretes de cobrança: canal não definido em RF-FI-11.

**Porta `Mailer`:** `enviar` (destinatário, assunto, corpo, chave de idempotência). O adaptador é o `AdaptadorResend`.

| Item | O que a documentação oficial diz |
| --- | --- |
| Envio | `POST https://api.resend.com/emails`, cabeçalho `Authorization: Bearer <chave>`. Campos: `from`, `to` (texto ou lista, máximo 50), `subject`; `html` e `text` opcionais (o texto é gerado do HTML se faltar); também `cc`, `bcc`, `reply_to`, `scheduled_at`, `headers`, `tags`, `attachments`. Resposta: `id` do e-mail |
| Idempotência | Cabeçalho opcional `Idempotency-Key`, único por requisição, expira em 24 h, até 256 caracteres. O adaptador envia a `chave_idempotencia` da notificação |
| Anexos | Até 40 MB por e-mail, depois do Base64. Comprovante e cópia LGPD saem por **link expirável**, não por anexo |
| Eventos de webhook | `email.sent`, `email.delivered`, `email.delivery_delayed`, `email.bounced`, `email.complained`, `email.failed`, `email.suppressed`, `email.scheduled`, `email.opened`, `email.clicked`, `email.received` |
| Verificação | Cabeçalhos `svix-id`, `svix-timestamp` e `svix-signature`, sobre o **corpo bruto** (reserializar o JSON invalida a assinatura). O SDK oferece `resend.webhooks.verify()` com o segredo do endpoint. Como a assinatura é calculada e a tolerância de relógio: não constam na página (a confirmar) |
| Reenvio | Retentativa com recuo: imediata, 5 s, 5 min, 30 min, 2 h, 5 h, 10 h e 10 h. Reenvio manual no painel. Endpoint que falha sempre é desativado e o time é avisado por e-mail. O critério de sucesso (qual status HTTP) não consta na página |
| Plano gratuito | 3.000 e-mails por mês e 100 por dia (ADR-005, consulta de 10/11/2026). Não serve a produção (um condomínio com muitos primeiros acessos no mesmo dia passa de 100). Em dev e staging a porta `Mailer` usa **caixa de saída falsa** e nenhum e-mail real sai (ADR-005, `01-backend.md` 6.3), então o plano gratuito só é usado em testes pontuais de entregabilidade e o webhook do Resend **só dispara com envio real** |

**Webhook do Resend: Proposta.** Nenhum documento de produto ou de arquitetura o exige. Serve para saber se o código de acesso ou o comprovante foi entregue ou rejeitado, e atualizar `entrega_notificacao` (MER/DER 4.12). Só entra se o Pedro aprovar. Endereço proposto: `POST /webhooks/email/resend`, em `openapi/webhooks.yaml`. Falha de entrega nunca altera a resposta de `/v1/acesso/codigo`, que é igual para e-mail cadastrado ou não (RN-CD-02).

**Ambientes (arquitetura 6.1 e 6.2, Proposta):** local com captura (Mailpit); dev e staging com **caixa de saída falsa**, nenhum e-mail real; produção com o Resend e domínio com SPF, DKIM e DMARC. **LGPD:** o Resend é subprocessador internacional; endereços, conteúdo e eventos de e-mail saem do Brasil e a avaliação de transferência internacional é obrigatória (ADR-005). Região de envio e plano gratuito com `sa-east-1`: a confirmar (ADR-005).

**Segredos:** chave de API e segredo de assinatura do webhook, no cofre.

## 4. Supabase Storage (arquivos)

**Finalidade:** fotos, atas, comprovantes e arquivos de chamado (arquitetura 3.8, PRD 10). Para construir o MVP, o Storage do Supabase, pela API compatível com S3 (ADR-004).

**Porta `ArmazenamentoDeObjetos`:** `urlEnvio(chave, tipo, tamanho)`, `urlLeitura(chave)`, `remover(chave)`. O código usa o protocolo S3; trocar de nuvem não toca o domínio.

| Item | O que a documentação oficial diz |
| --- | --- |
| Endereço S3 | `https://<project_ref>.storage.supabase.co/storage/v1/s3`; região do projeto (a página de configuração S3 mostra o código). Local: `http://127.0.0.1:54321/storage/v1/s3`, região `local` |
| Credenciais | Par de chaves S3 gerado nas configurações de Storage, **só para uso no servidor**. As chaves dão acesso total a todos os buckets e **ignoram a RLS**; a autorização é nossa (a API só emite URL depois de autorizar, arquitetura 3.8) |
| Operações | Entre as implementadas: `GetObject`, `PutObject`, `HeadObject`, `DeleteObject`, `CopyObject`, upload multipart |
| URL assinado | O Storage aceita URL assinado por parâmetros de consulta, com **AWS Signature Version 4**, para `GetObject` e `PutObject`. É preciso ativar a conexão pelo protocolo S3 nas configurações de Storage. A página não detalha o tempo máximo de expiração |
| Não suportado | Versionamento (arquivo apagado não volta), ACLs, bloqueio de objeto, etiquetas, checksums, `Content-MD5`, SSE-C e operações de CORS e de ciclo de vida do bucket |
| Plano gratuito | Storage de 1 GB por projeto (ADR-004). Limite de tamanho de arquivo no gratuito: **a confirmar** (a regra pede até 10 MB para comprovante, RN-FI-24) |

**Fluxo (guia, seção 11):** cliente pede o URL de envio à API; a API autoriza e devolve URL assinado de `PUT` de curta duração; o cliente envia direto ao Storage; confirma à API, que registra `arquivo`. Leitura sempre por URL assinado de curta duração, nunca permanente. Bucket privado; chave `c/{condominio_id}/{modulo}/{uuid}`.

**Atenção (a confirmar):** como o app web envia por `PUT` direto ao Storage e o Supabase não implementa as operações de CORS do bucket, a configuração de CORS para o cliente web precisa ser verificada na prova de conceito.

**Segredos:** chaves S3 restritas ao servidor, uma por ambiente. **Ambientes:** local com emulador compatível (MinIO), dev e staging no Supabase (arquitetura 6.1). **Verificação de vírus e retenção de arquivos:** lacuna (arquitetura 3.8).

## 5. Expo Push e FCM (push)

**Finalidade:** notificações de visitante, encomenda, reserva, chamado, comunicado, votação e reclamação (RF-NO-01). **Porta `PushSender`:** `enviar(mensagens)` e `consultarRecibos(ids)`. Adaptador em `integracoes/push/`. O backend fala com a API do Expo, que entrega pelo FCM no Android e pelo serviço da Apple no iOS. Credenciais do FCM no Expo: **a confirmar** a página do Expo.

| Item | O que a documentação oficial diz |
| --- | --- |
| Envio | `POST https://exp.host/--/api/v2/push/send`. Mensagem ou lista de até **100** por requisição (`PUSH_TOO_MANY_NOTIFICATIONS` acima disso). Campos: `to` (obrigatório, um ou vários tokens), `title`, `body`, `data`, `ttl`, `priority` (`default`, `normal`, `high`), `channelId` (Android) |
| Tamanho | Carga total enviada à Apple e ao Google de no máximo **4 KiB** |
| Resposta | Lista de "tickets" na mesma ordem. `status: ok` traz o `id` do recibo; `status: error` traz `message` e `details`. Ticket `ok` significa que o Expo aceitou, não que o usuário recebeu |
| Recibos | `POST https://exp.host/--/api/v2/push/getReceipts` com `{ "ids": [...] }` (até 1.000 por requisição). Consultar cerca de **15 minutos** depois do envio. Recibos são apagados após 24 h |
| `DeviceNotRegistered` | Vem em ticket ou recibo (`details.error`). Parar de enviar àquele token até o aparelho se registrar de novo (no projeto: remover o token, arquitetura 3.7) |
| Limite e nova tentativa | 600 notificações por segundo por projeto (`TOO_MANY_REQUESTS`). Em `429` e `5xx`, nova tentativa com recuo exponencial. Não repetir erro permanente (`400`) |
| Segurança | O Expo oferece "segurança reforçada" no painel: com ela, a requisição exige token de acesso em `Authorization: Bearer`. Sem ela, quem tiver um token de push pode enviar mensagem àquele aparelho. **Proposta:** ligar a segurança reforçada |

**Regras do projeto (arquitetura 3.7, `01-backend.md` 6.4):**

- O `notificacoes` consome o outbox, aplica as preferências e monta texto **sem dado sensível**; o detalhe só abre dentro do app autenticado. Situação financeira nunca aparece na tela bloqueada.
- **Tipos obrigatórios**, fixos em código: decisão de reclamação contra a pessoa e divergência de sincronização para o porteiro (US-NO-01, RN-RC-10, RN-OF-04).
- **Horário:** push gerado por rotina da madrugada fica agendado para **09:00 locais** do condomínio; push de evento disparado por pessoa sai na hora (decisão do Pedro em 09/11/2026, RN 14). O lembrete de reserva (rotina 21) segue a regra própria de RN-RE-14.
- Falha de push não apaga a notificação interna (`entrega_notificacao`, MER/DER 4.12). Logout remove o token do aparelho.

**Limites do plano gratuito:** a página de envio informa apenas limites técnicos (600 notificações por segundo por projeto, lotes de 100); limite do plano gratuito do Expo ou do EAS: não consultado, a confirmar.

**Segredos:** credencial de FCM e token de acesso do Expo, no cofre. **Ambientes:** dev e staging só com aparelhos de teste cadastrados; local desligado.

## 6. Sentry (erros)

**Finalidade:** erros do servidor e do cliente, e alerta de falha repetida de rotina (PRD 10, arquitetura 3.5 e 6.8). Decidido no PRD 10. O que segue é Proposta (`01-backend.md` 4.8 e 6.6): filtro de dados sensíveis no SDK, no cliente e no servidor; nunca corpo de reclamação, avaliação ou voto, nem nome, e-mail ou documento (ADR-010); projeto próprio por ambiente; local desligado. O token de autenticação (mapas de fonte) fica no cofre; o DSN é configuração do ambiente. Este documento não registra fato externo novo sobre o Sentry. **Limites do plano gratuito do Sentry** (eventos por mês, retenção): não consultado, a confirmar.

## 7. Hospedagem e banco (Render e Supabase PostgreSQL)

Para construir o MVP, em dev e staging, sem custo (ADR-004). Resumo do que afeta a API; as páginas e as ressalvas completas estão no ADR-004.

- **Render:** API, WebSocket e worker no **mesmo serviço web** (o gratuito só oferece serviço web). O serviço é suspenso após 15 minutos sem tráfego de entrada, inclusive mensagens de WebSocket, e a próxima requisição o acorda em cerca de 1 minuto. Sem região no Brasil. Quando dorme, o worker dorme junto: rotinas e jobs (webhooks, push, e-mail, prazos) param. O webhook do Asaas encontra o serviço dormindo e pode demorar a ser respondido (a conciliação diária cobre).
- **Supabase:** só PostgreSQL e Storage. Sem Supabase Auth, com a Data API desligada; acesso só pelo backend. Pausa por inatividade e sem PITR no gratuito. Conexão direta ou pooler em modo sessão para `pg-boss` e `LISTEN/NOTIFY` (ADR-006).
- RNF-01, RNF-02, RNF-05 e RPO e RTO **não** são medidos de forma válida nesse ambiente. Proibido usar dados reais (ADR-004).

## 8. Páginas consultadas

Consulta de 10/11/2026.

| Serviço | Tema | Endereço |
| --- | --- | --- |
| Asaas | Webhook: autenticação, entrega, reenvio, fila | https://docs.asaas.com/docs/receba-eventos-do-asaas-no-seu-endpoint-de-webhook |
| Asaas | Eventos de cobrança e fluxos | https://docs.asaas.com/docs/webhook-para-cobrancas |
| Asaas | Criar webhook pela API | https://docs.asaas.com/docs/criar-novo-webhook-pela-api |
| Asaas | Criar subconta | https://docs.asaas.com/reference/criar-subconta |
| Asaas | Criar cobrança | https://docs.asaas.com/reference/criar-nova-cobranca |
| Asaas | QR Code Pix da cobrança | https://docs.asaas.com/reference/obter-qr-code-para-pagamentos-via-pix |
| Asaas | Linha digitável do boleto | https://docs.asaas.com/reference/obter-linha-digitavel-do-boleto |
| Asaas | Estornar cobrança | https://docs.asaas.com/reference/estornar-cobranca |
| Asaas | Cartão por fatura, débito (lida em 11/11/2026) | https://docs.asaas.com/docs/cobrancas-via-cartao-de-credito |
| Asaas | Sandbox e produção (lida em 11/11/2026) | https://docs.asaas.com/docs/sandbox |
| Asaas | O que pode ou não ser testado no sandbox (lida em 11/11/2026) | https://docs.asaas.com/docs/o-que-pode-ser-testado |
| Asaas | FAQ do sandbox: saldo e chave incorreta (lida em 11/11/2026) | https://docs.asaas.com/docs/faq-sandbox |
| Asaas | Erro 404 ao pagar QR Pix no sandbox (lida em 11/11/2026) | https://docs.asaas.com/docs/tentar-pagar-qr-code-pix-no-sandbox-sem-chave-cadastrada-erro-404 |
| Resend | Exemplos de `email.delivery_delayed`, `email.complained`, `email.failed`, `email.suppressed` | https://resend.com/docs/webhooks/emails/delivery-delayed, https://resend.com/docs/webhooks/emails/complained, https://resend.com/docs/webhooks/emails/failed, https://resend.com/docs/webhooks/emails/suppressed |
| Asaas | Eventos de situação da conta (resumo de busca; página não lida) | https://docs.asaas.com/docs/webhook-para-verificar-situacao-da-conta |
| Resend | Enviar e-mail | https://resend.com/docs/api-reference/emails/send-email |
| Resend | Introdução, tipos de evento, verificação, reenvio | https://resend.com/docs/webhooks/introduction, https://resend.com/docs/webhooks/event-types, https://resend.com/docs/webhooks/verify-webhooks-requests, https://resend.com/docs/webhooks/retries-and-replays |
| Resend | Exemplo de evento `email.bounced` | https://resend.com/docs/webhooks/emails/bounced |
| Supabase | Autenticação do S3 | https://supabase.com/docs/guides/storage/s3/authentication |
| Supabase | Compatibilidade S3 e URL assinado | https://supabase.com/docs/guides/storage/s3/compatibility |
| Expo | Envio de push, recibos, limites | https://docs.expo.dev/push-notifications/sending-notifications/ |
| Render, Supabase | Suspensão, regiões, planos | ver ADR-004 (https://render.com/docs/free, https://render.com/docs/regions, https://supabase.com/docs/guides/platform/regions) |

Fontes internas: `01-backend.md` 4.6, 4.7, 5.2, 5.5 e 6; arquitetura 3.4, 3.6, 3.7 e 3.8; ADR-002, 004, 005 e 006; MER/DER 4.10 e 4.12.

## 9. Lacunas e itens a confirmar

| Item | Estado |
| --- | --- |
| KYC da subconta (prazo, documentos, pessoa física, SEG-15), chargeback, taxas, prazos reais de boleto e Pix, repasse | Lacuna (ADR-002, UF 17) |
| Cobranças criadas com a chave da subconta ou pela conta principal com `split` e `walletId` (RN-PG-04 aceita as duas formas) | A confirmar (decisão de adaptador) |
| Criação do `customer` no Asaas (página não lida) e quais dados pessoais do morador seguem ao Asaas (LGPD) | A confirmar |
| Páginas de consulta de cobrança e listagem para conciliação; regras de estorno de boleto | A confirmar |
| Campos exatos de `payment` por evento de webhook; formato e fuso de `dateCreated` | A confirmar no sandbox |
| Se os eventos `ACCOUNT_STATUS_*` da subconta chegam ao mesmo endpoint e com qual formato | A confirmar |
| Token único ou por subconta; `SEQUENTIALLY` ou `NON_SEQUENTIALLY` | A decidir |
| Intervalos e número de reenvios do Asaas | A documentação não informa |
| Limites de subcontas em avaliação | A confirmar (ADR-002) |
| Débito oferecido pela fatura do Asaas frente a RN-PG-06 (só crédito) | A confirmar com o Pedro |
| Sandbox do Asaas: código `401` para chave de produção; testes de confirmação em subconta BaaS pela equipe de integração; `403` em `GET` com corpo nas demais chamadas | A confirmar |
| Limites dos planos gratuitos do Expo e do Sentry | Não consultado, a confirmar |
| Resend: região `sa-east-1` no plano gratuito, localização dos dados, algoritmo e tolerância da assinatura, critério de sucesso do webhook | A confirmar |
| Supabase: limite de tamanho de arquivo no gratuito, expiração máxima do URL assinado, CORS para o app web | A confirmar |
| Expo: configuração do FCM nas credenciais do Expo | A confirmar |
| Retenção da quarentena de webhooks, de arquivos e de logs; verificação de vírus; limites de taxa | Lacuna (MER/DER P-09, arquitetura 3.8 e 9.3) |

## Complementação de 12/11/2026

[Decisões aprovadas](../../01-produto/05-decisoes-de-complementacao.md) fixam registro e resolução assistida de dinheiro tardio, sem recuperar horário/reativar cobrança, e classificação de atraso pelo instante efetivo. A PoC deve identificar o campo confiável desse instante; confirmação/recebimento não pode usar hora de entrega do webhook como substituto arbitrário. Nada nesta edição comprova KYC, prazos, chargeback, devolução ou sandbox. Assinatura da plataforma no MVP é assistida/manual e separada dos recebimentos condominiais.
