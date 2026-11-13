# Decisões de complementação dos diagramas

**Data:** 12/11/2026. **Decisor:** Pedro Lemos. **Estado:** decisões de produto aprovadas; desenhos técnicos e validações externas mantêm seus próprios estados.

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
| 12A | Decisão original de 12/11/2026: administradora/suporte autorizado abriam e encerravam eleição regular. **Substituída em 13/11/2026** pela condução local escalonada de RN-VO-13, em qualquer plano | RN-VO-13; RN-CD-13; RF-VO-05; US-VO-03; UF 11.2; DS 11.7; S29; registro 06 | Histórico preservado; a restrição anterior a síndico/subsíndico não está vigente |
| 13A | Segundo turno empatado ou ausência de elegível: resultado inconclusivo; em 13/11/2026, o encaminhamento passa ao condutor autorizado de RN-VO-13, inclusive sem administradora | RN-VO-07; RF-VO-08; US-VO-03; UF 11.2; S29 | Sem vencedor automático; encaminhamento operacional não define consequência da convenção |
| 14A | LGPD automatiza o procedimento definido; exceções são assistidas por operador autorizado | RN-CD-18; RF-LG-01/02; US-LG-01; UF 14.1; S34 | Identidade/função e concessão do operador ainda não definidas; nenhuma permissão implícita |
| 15A | Separar fila offline pendente do cache; preservar protegida até sincronização/tratamento explícito | RN-OF-06; RF-VI-05/06/11/RF-CH-03; US-VI-04/US-CH-02; UF 6.3; S16/S21 | Retenção, acesso após logout e tratamento exigem desenho; sem retenção indefinida aprovada |
| 16A | Projetar tolerância controlada a retry legítimo de refresh | SEG-03/04; US-AC-04; UF 3.2; ADR-007; S37 | Duração, identificação do retry e proteção contra replay dependem de revisão de segurança; ADR não aceito integralmente |
| 17A | Fontes financeiras individuais restritas, com agregação diária por categoria nas projeções autorizadas | RN-FI-22/29; RF-FI-17/18; US-FI-07; UF 13.3; MER §4.11; ADR-010 | Não ampliar acesso à cobrança por unidade ou salário individual |
| 18A | Exportação financeira assíncrona com acompanhamento e arquivo privado | RN-FI-30; RF-FI-22; US-FI-07; UF 13.3/13.4; DS 11.15; S32/S36 | TTL, retenção e limite operacional ainda não definidos |
| 19A | Assinatura da plataforma assistida/manual no MVP | RN-PL-07; US-PL-01; UF 4.2; S33 | Separada do dinheiro do condomínio; meio comercial e ciclo completo não presumidos |

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

Contrato revisto: 338 operações OpenAPI com IDs únicos; lint Redocly local nos 11 arquivos de interface passou. A tabela de cobertura mantém 139 RF e suas referências a operações existentes. Sintaxe JavaScript e invocação das 262 telas registradas passaram; 27 verificações de callbacks em VM cobriram permissões, dinheiro tardio, atraso sem cron, triagem, moderação/ocultação, segundo empate, episódio/perda efetiva e exportação assíncrona. Diagramas e links receberam checagem estrutural local.

Essas verificações usam dados fictícios/DOM simulado e não comprovam layout, segurança de execução, pagamento ou persistência. Não houve validação visual no navegador, parser/renderização Mermaid, implementação de backend, PoC Asaas ou parecer jurídico. ADRs permanecem nos estados anteriores. Nenhum commit ou push foi realizado.
