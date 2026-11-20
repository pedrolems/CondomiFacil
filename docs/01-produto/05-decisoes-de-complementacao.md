# Decisões de complementação dos diagramas

**Data:** 12/11/2026. **Atualizado em:** 16/11/2026. **Decisor:** Pedro Lemos. **Estado:** decisões de produto aprovadas; desenhos técnicos e validações externas mantêm seus próprios estados.

Pedro autorizou implementar as recomendações apresentadas na revisão dos diagramas de sequência e estados. Este registro identifica as 19 escolhas e sua aplicação. Não aceita ADRs inteiros, não comprova PoC, não substitui parecer jurídico e não inicia backend ou integração financeira real.

| Escolha | Decisão aprovada | Rastreabilidade principal | Limite preservado |
| --- | --- | --- | --- |
| 1A | Igualdade exata no prazo de reembolso está incluída: antecedência ≥ prazo configurado | RN-CA-02; RF-RE-04; US-RE-04; UF 5.2; DS 11.4; reserva do morador; S11/E01 | Prazo segue configurável |
| 2A | Condomínio cancela por síndico, sub em substituição, administradora ou suporte autorizado, com motivo e auditoria | RN-CA-05; RF-RE-04/05; US-RE-04; UF 5.2; DS 11.4; cancelamento na gestão; contrato por perfil | Suporte apenas no Gestão + Suporte com autorização vigente |
| 3A | Aguardando pagamento pode ir a Cancelada pelo condomínio, sem devolução se não recebeu | RN-CA-05/RN §7.4; US-RE-04; S11/E01; EstadoReserva | Não criar dinheiro fictício |
| 4A | Recebimento em reserva expirada/cancelada é registrado e encaminhado para resolução assistida | RN §7.4; RF-PG-04; US-RE-03; UF 5.1; S10 | Sem recuperar horário, reativar reserva ou devolver automaticamente |
| 5A | Recebimento em cobrança cancelada registra dinheiro e pendência para administradora/suporte autorizado | RN-FI-13; RF-FI-09; US-FI-03; UF 13.1; S10/S31 | Cobrança continua Cancelada |
| 6A | Pagamento após vencimento classifica Paga com atraso por instante efetivo, mesmo antes da rotina de atraso | RN-FI-13; RF-FI-09; US-FI-03; UF 13.1; E08 | A entrega do webhook não determina o instante efetivo; mapeamento Asaas requer PoC |
| 7A | Manutenção Reaberto aguarda triagem explícita para Orçamento ou Agendado | RN-CH-07; RF-CH-04; US-CH-03; UF 8.3; DS 11; E06 | Apenas síndico/sub em substituição; registra autoria/momento |
| 8A | Perda de mandato/função do julgador reatribui pela tabela vigente, sem manter acesso antigo | RN-RC-03; RF-RS-03/04; US-RS-04; UF 9.2; S07/S24 | Preserva histórico; sem elegível aguarda atribuição |
| 9A | Troca de habilitado preserva caso/score no episódio original e acesso próprio à defesa/recurso | RN-SC-04/RN §5.3; RF-RS-09/11; US-RS-04/05; UF 9; S06/S24/S25 | Acesso restrito ao caso, sem dados atuais da unidade; revisão de privacidade antes do código |
| 10A | Reversão devolve somente a perda efetivamente aplicada | RN-RC-07; RF-RS-09; US-RS-05; UF 9.3; MER movimento_score; S25 | Ex.: 3 → 0 por penalidade nominal 10 devolve 3; teto 100 permanece |
| 11A | Destinatário autorizado revisa denúncia e encerra sem ação ou oculta conteúdo com motivo/histórico | RN-RC-13; RF-RS-14; US-RS-07; UF 10.1; DS 11.5; S27 | Projeção sem desanonimizar reclamante/avaliador, sem score automático; suporte excluído dos conteúdos vedados |
| 12A | Decisão original de 12/11/2026: administradora/suporte autorizado abriam e encerravam eleição regular. **Substituída em 13/11/2026** por RN-VO-13 (condução local escalonada, em qualquer plano; suporte só no Gestão + Suporte) | RN-VO-13; RN-CD-13; RF-VO-05; US-VO-03; UF 11.2; DS 11.7; S29; registro 06 | Histórico preservado; a restrição anterior a síndico/subsíndico não está vigente |
| 13A | Segundo turno empatado ou ausência de elegível: resultado inconclusivo; em 13/11/2026, o encaminhamento passa ao condutor autorizado de RN-VO-13, inclusive sem administradora | RN-VO-07; RF-VO-08; US-VO-03; UF 11.2; S29 | Sem vencedor automático; encaminhamento operacional não define consequência da convenção |
| 14A | LGPD automatiza o procedimento definido; exceções são assistidas por operador autorizado | RN-CD-18; RF-LG-01/02; US-LG-01; UF 14.1; S34 | Identidade/função e concessão do operador ainda não definidas; nenhuma permissão implícita |
| 15A | Separar fila offline pendente do cache; preservar protegida até sincronização/tratamento explícito | RN-OF-06; RF-VI-05/06/11/RF-CH-03; US-VI-04/US-CH-02; UF 6.3; S16/S21 | Retenção, acesso após logout e tratamento exigem desenho; sem retenção indefinida aprovada |
| 16A | Projetar tolerância controlada a retry legítimo de refresh | SEG-03/04; US-AC-04; UF 3.2; ADR-007; S37 | ~~Duração, identificação do retry e proteção contra replay dependem de revisão de segurança; ADR não aceito integralmente~~ **Definido por Pedro em 20/11/2026:** reuso único do refresh anterior por 30 s enquanto o sucessor não foi usado; fora disso é replay e encerra a sessão (ADR-007, aceito com ressalvas); trava no cliente contra renovações simultâneas |
| 17A | Fontes financeiras individuais restritas, com agregação diária por categoria nas projeções autorizadas | RN-FI-22/29; RF-FI-17/18; US-FI-07; UF 13.3; MER §4.11; ADR-010 | Não ampliar acesso à cobrança por unidade ou salário individual |
| 18A | Exportação financeira assíncrona com acompanhamento e arquivo privado | RN-FI-30; RF-FI-22; US-FI-07; UF 13.3/13.4; DS 11.15; S32/S36 | TTL, retenção e limite operacional ainda não definidos |
| 19A | Assinatura da plataforma assistida/manual no MVP | RN-PL-07; US-PL-01; UF 4.2; S33 | Separada do dinheiro do condomínio; meio comercial e ciclo completo não presumidos |

## Decisões de 16/11/2026

Pedro aprovou doze decisões sobre o contrato da API, a hospedagem do painel web e o alinhamento dos documentos. O contrato continua proposta e não fica aceito como um todo; os ADRs mantêm os estados registrados neles.

| Decisão | Decisão aprovada | Rastreabilidade principal | Limite preservado |
| --- | --- | --- | --- |
| 16/11-1 | Webhook do Asaas com token inválido responde `401`; token válido sem correlação vai para a quarentena com `200` (confirma a decisão de 08/11/2026) | SEG-17; `webhooks.yaml`; `02-eventos-e-webhooks.md` | Retenção da quarentena (MER P-09) e token único ou por subconta continuam pendentes |
| 16/11-2 | Webhook do Resend fica no contrato (`webhookResendReceberEvento`), com verificação obrigatória da assinatura do Resend antes de processar; ausente ou inválida responde `401` | ADR-005; RN-CD-02; `webhooks.yaml`; `03-integracoes-externas.md` | Saída de dados de e-mail do Brasil (LGPD) continua pendente; algoritmo e tolerância de relógio a confirmar na implementação |
| 16/11-3 | Cancelamento com reembolso: antecedência maior ou igual a 12 h antes do início, igualdade incluída (confirma a escolha 1A) | RN-CA-02; RF-RE-04; `morador.yaml` | Prazo segue configurável (`reserva.prazo_cancelamento_reembolso_horas`); RN e PRD sem alteração |
| 16/11-4 | Reserva paga nasce Aguardando pagamento; gratuita nasce Confirmada | RN-RE-02; RN-RE-03; RN §7.4; `morador.yaml`; `EstadoReserva` | Estados da tentativa de pagamento seguem dependentes da PoC Asaas |
| 16/11-5 | Voto repetido responde `409` `VOTACAO_VOTO_JA_REGISTRADO`; transição de estado não permitida responde `409` `<MODULO>_ESTADO_INVALIDO`; `422` fica para regra violada sem conflito de estado | RN-VO-01; RN-VO-11; ciclos de vida das RN; guia da API, seção 8 | Textos de mensagem seguem Proposta; padronização dos códigos `*_JA_<ESTADO>` em `422` ainda a decidir |
| 16/11-6 | Chaves de regra de área seguem o catálogo de parâmetros configuráveis; chaves divergentes do contrato foram renomeadas | RN 13; RF-AD-07; `morador.yaml` | Chave sem correspondente no catálogo não é inventada |
| 16/11-7 | ADR-016: Vercel Pro rejeitada (MVP completamente gratuito); site estático do Render em dev e staging, aceito com ressalvas, revisão obrigatória antes do piloto | ADR-016; ADR-004 | Hospedagem do piloto com dados reais exige revisão antes do piloto |
| 16/11-8 | Códigos em `422` que descreviam conflito de estado do recurso (`*_JA_<ESTADO>` e afins) passam a `409` `<MODULO>_ESTADO_INVALIDO`, com a mesma mensagem; regras de prazo, horário ou cadastro seguem em `422` (resolve a pendência de 16/11-5) | Guia da API, seção 8; README da API, atualização de 16/11/2026, item 7; ciclos de vida das RN | `ESTORNO_NAO_SE_ESTORNA`, `LISTA_PESSOA_JA_ENTROU`, `VISITANTE_NAO_EDITAVEL` e `LISTA_RESERVA_NAO_CONFIRMADA` seguem a decidir; mensagens seguem Proposta |
| 16/11-9 | Códigos de estado que já respondiam `409` com nome fora do padrão passam a `<MODULO>_ESTADO_INVALIDO` (por exemplo, `RECLAMACAO_JA_DECIDIDA`, `SUGESTAO_JA_DECIDIDA`, `REUNIAO_JA_ENCERRADA`, `RECURSO_JA_DECIDIDO`, `EVENTO_JA_DESFEITO`), e `SUBSTITUICAO_ESTADO_INVALIDO` fica igual em administradora e síndico | Guia da API, seção 8; README da API, atualização de 16/11/2026, item 8; RN-RC-04; RN-RC-05; RN-RC-07; RN-CD-12 | Códigos de unicidade (`RECURSO_JA_REGISTRADO`, `CHAMADO_JA_AVALIADO`, `ENCOMENDA_ENTREGA_JA_VINCULADA`) mantidos e listados como dúvida |
| 16/11-10 | `LANCAMENTO_EM_MES_FECHADO`, `LANCAMENTO_DE_MES_FECHADO_SO_ESTORNA` e `ESTORNO_SO_EM_MES_FECHADO` ficam em `422` com os nomes atuais, como exceção documentada: indicam ao app se oferece editar ou estornar | RN-FI-25; RN-FI-28; guia da API, seção 8; README da API, item 8 | Não viram `MES_FINANCEIRO_ESTADO_INVALIDO`; mensagens seguem Proposta |
| 16/11-11 | Texto "até 12h antes" alinhado a RN-CA-02 ("12h ou mais de antecedência", igualdade incluída) no PRD (escopo), nas Histórias, no Design System 11.4 (registrado na seção 18), nos User Flows, na introdução de Reservas e na RN-RE-14 das RN, em `01-arquitetura.md` e no protótipo (`morador.js` e README) | RN-CA-02; RN-RE-14; RF-RE-04; Design System, seção 18 | A regra não mudou; prazo segue configurável (`reserva.prazo_cancelamento_reembolso_horas`) |
| 16/11-12 | Documentos de arquitetura, infra, frontend, roadmap, MER/DER e `AGENTS.md` alinhados ao ADR-016 aceito com ressalvas (site estático do Render) | ADR-016; ADR-004 | Limites do plano gratuito do site estático seguem "a confirmar"; revisão obrigatória antes do piloto |

## Validações e decisões ainda pendentes

- Preservar simultaneamente voto secreto e substituição do voto do inquilino; mecanismo depende de proposta de segurança/jurídica (MER P-03 e ADR-009).
- Executar PoC Asaas para KYC, eventos, prazos, expiração, devolução, chargeback e conta principal; não foi realizada nesta mudança.
- Manter menor horário do celular na limpeza offline; empate exato e relógio incorreto dependem de proposta técnica (ADR-014).
- Definir retenção por finalidade após revisão; sem prazos novos arbitrários para fila, arquivos, logs ou backup.
- Parecer sobre reclamações e locação e validação dos cinco dias de resposta no piloto continuam pendentes.
- Orçamento anual, transparência para moradores, saldos de fundos/obras e plano de contas permanecem fora desta ampliação do MVP.
- Não está resolvida a divergência da matriz sobre administradora denunciar conteúdo. A moderação aprovada não altera quem pode criar denúncia.

## Aplicação e validação

As alterações seguem RN → PRD → histórias → fluxos → Design System (seção 18) → protótipo, além de MER/política de acesso, ADRs afetados, backend, contratos e diagramas. Os requisitos existentes são detalhados; não se cria novo perfil nem backend real. Rotas e operações novas do contrato são propostas de interface para executar decisões aprovadas; isso não aprova todo o contrato ou implementação.

O protótipo simula fatos em memória e não comprova isolamento, pagamentos, persistência, anonimato ou jobs. Testes de sintaxe e consistência documental são distintos dos testes da futura implementação. Aprovação desta tarefa não autoriza commit ou push.

## Verificação desta alteração em 12/11/2026

Contrato revisto: 338 operações OpenAPI com IDs únicos; lint Redocly local nos 11 arquivos de interface passou. A tabela de cobertura mantém 139 RF (registro histórico; hoje 150 RF, com os 11 RF-RL de 14/11/2026) e suas referências a operações existentes. Sintaxe JavaScript e invocação das 262 telas registradas passaram; 27 verificações de callbacks em VM cobriram permissões, dinheiro tardio, atraso sem cron, triagem, moderação/ocultação, segundo empate, episódio/perda efetiva e exportação assíncrona. Diagramas e links receberam checagem estrutural local.

Essas verificações usam dados fictícios/DOM simulado e não comprovam layout, segurança de execução, pagamento ou persistência. Não houve validação visual no navegador, parser/renderização Mermaid, implementação de backend, PoC Asaas ou parecer jurídico. ADRs permanecem nos estados anteriores. Nenhum commit ou push foi realizado.
