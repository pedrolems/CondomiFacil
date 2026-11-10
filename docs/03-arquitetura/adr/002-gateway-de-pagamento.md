# ADR-002: Gateway de pagamento

- **Estado:** Em aberto (candidato inicial Asaas, não decidido)
- **Data:** 06/11/2026
- **Decisores:** Pedro Lemos
- **Depende de:** prova de conceito no sandbox; marco 2 do roadmap; pendência da seção 17 dos User Flows
- **Relacionado a:** [ADR-004](004-nuvem-regiao-residencia-dados.md), [ADR-011](011-ambientes-branches-eas-ota.md)

## Contexto

O PRD seção 10 pede um gateway brasileiro com subconta ou split, boleto registrado com QR Code Pix, Pix e cartão, com confirmação por webhook. A escolha do provedor está pendente (UF 17) e define prazos reais e erros dos fluxos 5.1 e 13.1.

Regras que o gateway precisa atender:

- O dinheiro vai direto para a conta do condomínio; a plataforma não retém (RN-PG-04).
- Conta única do condomínio para reservas e taxa (RN-PG-01). Sem conta cadastrada, sem cobrança nem áreas pagas (RN-FI-01, RN-PG-03).
- Titular pessoa física exige o termo SEG-15 (RN-PG-02, RF-AD-08).
- Taxas do gateway saem do valor recebido e viram despesa "Administração" (RN-PG-05, RN-FI-17, RN-FI-23).
- Reembolso por Pix e cartão, com prazos de RN-CA-01 a RN-CA-06 e RN-PG-07.
- Webhook com assinatura validada, evento idempotente e conciliação diária (SEG-17). Nenhum dado de cartão passa pela API, banco ou logs (SEG-12).

O módulo de cobrança é o de maior peso no prazo do MVP e depende desta decisão (arquitetura 9.4).

## Opções consideradas

Os três provedores devem passar pelos mesmos critérios, medidos em prova de conceito:

| Critério | Pergunta a responder |
| --- | --- |
| Subcontas / split | Cria subconta por condomínio por API? Qual o processo de verificação cadastral (KYC), prazo e documentos? Aceita pessoa física (SEG-15)? |
| Meios | Boleto com QR Code Pix, Pix e cartão por API (RN-FI-02, RN-PG-06) |
| Webhooks | Assinatura verificável, reenvio, id de evento estável, sandbox |
| Reembolso | Pix e cartão por API, prazos reais (RN-CA-*), estorno parcial |
| Taxas | Custo por boleto, Pix e cartão; encaixe no preço por faixa e no custo do condomínio (RN-PG-05) |
| Conciliação | API de listagem de recebimentos e repasses |
| Cobrança recorrente | Boletos mensais, multa e juros (o cálculo é nosso) |
| Qualidade | Documentação, suporte, estabilidade, SDK para Node |
| Certificação | Gateway certificado (SEG-12) |

| Opção | Prós | Contras |
| --- | --- | --- |
| **Asaas** | Provedor brasileiro focado em boleto e Pix com subcontas, o que casa com o modelo sem retenção de dinheiro | Ainda não validado nos critérios acima |
| **Mercado Pago** | Alternativa válida listada no PRD | Não avaliado nos critérios; encaixe com subconta por condomínio a confirmar |
| **Pagar.me** | Alternativa válida listada no PRD | Não avaliado nos critérios; encaixe com subconta por condomínio a confirmar |

Os documentos não trazem comparação de preços nem prazos reais por provedor. Isso está em aberto.

## Recomendação

Não há decisão. Recomenda-se:

1. Tratar **Asaas como candidato inicial** para a prova de conceito, sem compromisso.
2. Implementar a **porta `PaymentGateway`** (`criarSubconta`, `criarCobranca`, `consultar`, `reembolsar`, `validarWebhook`) e **um único adaptador**. A troca de provedor fica isolada no adaptador e não toca regra de negócio.
3. Desenhar já, atrás da porta: webhook com corpo bruto e assinatura validados, gravação em `evento_gateway` com unicidade por provedor, conta recebedora e id do evento (ou só provedor e id, quando o provedor o garante único) e quarentena global para evento sem correlação válida (MER/DER 4.10), resposta 200 rápida e processamento em job, transições de estado monotônicas, conciliação diária.
4. Em dev, staging e local usar só credenciais de sandbox; o adaptador se recusa a iniciar em staging com chave de produção. Fluxos de erro são simulados com um dublê do adaptador nos testes.

## Consequências

**Positivas (da estrutura recomendada)**

- A decisão do provedor fica reversível e não bloqueia o desenho do restante.
- Webhooks, subconta e conciliação ficam especificados antes da escolha.

**Negativas**

- Enquanto o provedor não é escolhido, prazos de confirmação de boleto e Pix, erros e repasses permanecem desconhecidos.
- A porta é uma camada extra, justificável só enquanto houver dúvida.

**Riscos**

- Atraso do MVP, se a escolha demorar (arquitetura 9.4). Mitigação: decidir cedo e começar por acesso, portaria offline e cobrança.
- Provedor que não aceite pessoa física, ou cuja verificação cadastral seja lenta.
- Lacunas conhecidas: processo de KYC da subconta, chargeback e regras de repasse e taxas por provedor.

## Critérios de validação e o que falta para aceitar

- Prova de conceito no sandbox cobrindo: criação de subconta, boleto com Pix, webhook assinado e reenviado, reembolso.
- Resposta por escrito a cada critério da tabela, para os três provedores.
- Custo por meio de pagamento comparado ao preço por faixa do PRD seção 2.
- Marco 2 do roadmap: parecer jurídico (SEG-16) e a pendência da UF 17 resolvida.
- Aprovação do Pedro. Só então o estado muda para Proposto ou Aceito.

## Referências

- `docs/03-arquitetura/01-arquitetura.md`: seções 3.6, 5.1, 5.2 (gateway), 6.3, 9.2, 9.4.
- `docs/01-produto/02-prd.md`: seção 10; SEG-12, SEG-15, SEG-17; RF-PG-01 a 04, RF-AD-08.
- `docs/01-produto/03-regras-de-negocio.md`: RN-PG-01 a RN-PG-07, RN-CA-01 a RN-CA-06, RN-FI-01, RN-FI-02, RN-FI-17, RN-FI-23.
- `docs/02-design/02-user-flows.md`: seções 5.1, 5.2, 13.1 e 17.
