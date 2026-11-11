# ADR-002: Gateway de pagamento

- **Estado:** Aceito, com ressalvas (Asaas). Decisão de Pedro em 10/11/2026
- **Data:** 06/11/2026 (proposta); 10/11/2026 (decisão)
- **Decisores:** Pedro Lemos
- **Depende de:** prova de conceito no sandbox, como verificação da implementação (não como condição da escolha); marco 2 do roadmap e pendência da seção 17 dos User Flows, no que sobrar (KYC, chargeback, prazos reais)
- **Relacionado a:** [ADR-004](004-nuvem-regiao-residencia-dados.md), [ADR-011](011-ambientes-branches-eas-ota.md)

## Contexto

O PRD seção 10 pede um gateway brasileiro com subconta ou split, boleto registrado com QR Code Pix, Pix e cartão, com confirmação por webhook. A escolha do provedor estava pendente (UF 17) e define prazos reais e erros dos fluxos 5.1 e 13.1.

Regras que o gateway precisa atender:

- O dinheiro vai direto para a conta do condomínio; a plataforma não retém (RN-PG-04).
- Conta única do condomínio para reservas e taxa (RN-PG-01). Sem conta cadastrada, sem cobrança nem áreas pagas (RN-FI-01, RN-PG-03).
- Titular pessoa física exige o termo SEG-15 (RN-PG-02, RF-AD-08).
- Taxas do gateway saem do valor recebido e viram despesa "Administração" (RN-PG-05, RN-FI-17, RN-FI-23).
- Reembolso por Pix e cartão, com prazos de RN-CA-01 a RN-CA-06 e RN-PG-07.
- Webhook com autenticação validada, evento idempotente e conciliação diária (SEG-17). Nenhum dado de cartão passa pela API, banco ou logs (SEG-12).

O módulo de cobrança é o de maior peso no prazo do MVP e depende desta decisão (arquitetura 9.4).

## Opções consideradas (histórico)

Os três provedores seriam comparados nos mesmos critérios, medidos em prova de conceito. A tabela fica como registro do que foi considerado; a comparação formal não foi feita, porque o Pedro escolheu o Asaas.

| Critério | Pergunta a responder |
| --- | --- |
| Subcontas / split | Cria subconta por condomínio por API? Qual o processo de verificação cadastral (KYC), prazo e documentos? Aceita pessoa física (SEG-15)? |
| Meios | Boleto com QR Code Pix, Pix e cartão por API (RN-FI-02, RN-PG-06) |
| Webhooks | Autenticação verificável, reenvio, id de evento estável, sandbox |
| Reembolso | Pix e cartão por API, prazos reais (RN-CA-*), estorno parcial |
| Taxas | Custo por boleto, Pix e cartão; encaixe no preço por faixa e no custo do condomínio (RN-PG-05) |
| Conciliação | API de listagem de recebimentos e repasses |
| Cobrança recorrente | Boletos mensais, multa e juros (o cálculo é nosso) |
| Qualidade | Documentação, suporte, estabilidade, SDK para Node |
| Certificação | Gateway certificado (SEG-12) |

| Opção | Prós | Contras |
| --- | --- | --- |
| **Asaas** (escolhida) | Provedor brasileiro focado em boleto e Pix com subcontas, o que casa com o modelo sem retenção de dinheiro | Critérios acima ainda não medidos no sandbox |
| **Mercado Pago** | Alternativa válida listada no PRD | Não avaliada nos critérios; encaixe com subconta por condomínio a confirmar |
| **Pagar.me** | Alternativa válida listada no PRD | Não avaliada nos critérios; encaixe com subconta por condomínio a confirmar |

Os documentos não trazem comparação de preços nem prazos reais por provedor.

## Decisão

**Gateway de pagamento: Asaas.** Decisão de Pedro em 10/11/2026 (estado "Aceito, com ressalvas": a escolha vale; as ressalvas estão em "Critérios de validação").

1. Implementar a **porta `PaymentGateway`** (`criarSubconta`, `criarCobranca`, `consultar`, `reembolsar`, `validarWebhook`) e **um único adaptador**, o `AdaptadorAsaas`. A porta continua útil: isola o provedor da regra de negócio e mantém a troca possível, se a verificação ou o piloto mostrarem problema.
2. Atrás da porta: webhook com corpo bruto e autenticação validados, gravação em `evento_gateway` com unicidade por provedor, conta recebedora e id do evento (ou só provedor e id, quando o provedor o garante único) e quarentena global para evento sem correlação válida (MER/DER 4.10), resposta 200 rápida e processamento em job, transições de estado monotônicas, conciliação diária.
3. Em dev, staging e local usar só credenciais de sandbox; o adaptador se recusa a iniciar em staging com chave de produção. Fluxos de erro são simulados com um dublê do adaptador nos testes.
4. A prova de conceito no sandbox (subconta, boleto com Pix, webhook autenticado e repetido, reembolso) **continua**, como verificação da implementação. O resultado pode gerar ajuste no adaptador; não reabre a escolha por si só.

### Fatos do Asaas conferidos na documentação oficial (consulta de 10/11/2026)

| Tema | O que a documentação diz | Página |
| --- | --- | --- |
| Autenticação do webhook | Se o webhook tem `authToken`, o Asaas o envia no cabeçalho `asaas-access-token`. O backend valida esse valor antes de aceitar. Não é assinatura HMAC do corpo | https://docs.asaas.com/docs/receba-eventos-do-asaas-no-seu-endpoint-de-webhook |
| Entrega e reenvio | Entrega "ao menos uma vez": o mesmo evento pode chegar mais de uma vez; o `id` do evento serve para detectar duplicidade. Sem confirmação, o evento entra em novo fluxo de tentativas. A página não informa intervalos nem número de tentativas. A fila pode ser pausada após 15 falhas consecutivas de entrega. A página não descreve reenvio manual | mesma página |
| Subconta | Criada por `POST /v3/accounts`; a resposta traz a chave em `accessToken.apiKey`, aninhada (devolvida só uma vez, deve ser guardada na hora) e `walletId` (recuperável por endpoint próprio). Há subcontas comuns e BaaS (sem acesso à interface do Asaas, documentos por API ou link `onboardingUrl`); o modelo BaaS exige habilitação com o gerente de contas. Os documentos cadastrais são enviados depois da criação | https://docs.asaas.com/reference/criar-subconta e https://docs.asaas.com/docs/criacao-de-subcontas (obtidas por busca) |
| Limites em avaliação | Resultado de busca cita limites de subcontas em período de avaliação (10 subcontas, R$ 2.000,00 por subconta). **A confirmar** na página oficial | https://docs.asaas.com/docs/criacao-de-subcontas |

Não confirmados: prazo e documentos exigidos na aprovação da subconta (KYC), aceitação de pessoa física como titular da subconta, regras de chargeback, prazos reais de compensação de boleto e Pix, taxas por meio de pagamento. Seguem como lacuna.

## Consequências

**Positivas**

- Provedor definido: o contrato da API, o adaptador e os diagramas passam a usar nomes reais.
- O desenho de webhook (idempotência, quarentena, job) não depende de assinatura de corpo: usa o token do cabeçalho mais o id do evento.
- A porta mantém a troca reversível.

**Negativas**

- Autenticação por token fixo no cabeçalho é mais fraca que assinatura do corpo: o segredo precisa de cofre, rotação e comparação em tempo constante, e o endpoint não pode aparecer em logs com o cabeçalho.
- A conta principal do Asaas precisa ser pessoa jurídica (CNPJ), conforme a página de criação de subconta (https://docs.asaas.com/reference/criar-subconta, consulta de 10/11/2026): a plataforma precisa ter CNPJ antes de criar subcontas.
- A `apiKey` da subconta é devolvida uma única vez: o fluxo de criação precisa gravá-la no cofre antes de qualquer outro passo, com tratamento de falha entre criar e gravar.
- Prazos de confirmação de boleto e Pix, erros e repasses reais continuam desconhecidos até a prova de conceito e o piloto.

**Riscos**

- Atraso do MVP se a verificação da subconta (KYC) for lenta (arquitetura 9.4). Mitigação: começar por acesso, portaria offline e cobrança, e testar a subconta cedo.
- Provedor que não aceite pessoa física como titular, ou cuja verificação cadastral seja lenta.
- Fila de webhook pausada após falhas consecutivas: sem processamento, a confirmação de pagamento atrasa. Mitigação: conciliação diária (SEG-17) e alerta de fila pausada.
- Lacunas conhecidas: processo de KYC da subconta, chargeback e regras de repasse e taxas.

## Critérios de validação (ressalvas que continuam)

- Prova de conceito no sandbox como verificação da implementação: criação de subconta, boleto com Pix, webhook autenticado e repetido, reembolso.
- KYC da subconta: prazo, documentos e aceitação de pessoa física (SEG-15), confirmados com o Asaas.
- Chargeback e regras de repasse: confirmar e registrar nas regras.
- Prazos reais de confirmação de boleto e Pix: medir e ajustar os fluxos 5.1 e 13.1.
- Custo por meio de pagamento comparado ao preço por faixa do PRD seção 2.
- Marco 2 do roadmap: parecer jurídico (SEG-16) e pendência da UF 17, no que restar.

## Referências

- `docs/03-arquitetura/01-arquitetura.md`: seções 3.6, 5.1, 5.2 (gateway), 6.3, 9.2, 9.4.
- `docs/01-produto/02-prd.md`: seção 10; SEG-12, SEG-15, SEG-17; RF-PG-01 a 04, RF-AD-08.
- `docs/01-produto/03-regras-de-negocio.md`: RN-PG-01 a RN-PG-07, RN-CA-01 a RN-CA-06, RN-FI-01, RN-FI-02, RN-FI-17, RN-FI-23.
- `docs/02-design/02-user-flows.md`: seções 5.1, 5.2, 13.1 e 17.
- Documentação oficial do Asaas, consultada em 10/11/2026 (endereços na tabela acima).
