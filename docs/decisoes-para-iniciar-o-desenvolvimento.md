# Decisões para iniciar o desenvolvimento

**Preparado em:** 17/11/2026. **Decisor:** Pedro Lemos. **Estado:** lotes 1 e 2 e rodada complementar de 14 decisões/lote 3 aprovados, com alinhamento documental e simulações autorizados. Respostas: **1C, 2A, 3A, 4A, 5A, 6A, 7A, 8B, 9A, 10A, 11A, 12A, 13A, 14A**. Operador antes do primeiro condomínio oficial; Pedro não assume como Admin; dados fictícios até lá. Lote 4 e liberação técnica pendentes.

Este é o roteiro de conversa para encerrar o Design com o menor conjunto de decisões necessário à primeira entrega. O [roadmap](roadmap.md) continua sendo o plano de fases. As fontes de produto, dados, contratos e ADRs conservam seus estados até respostas e atualização autorizada.

## 1. O que já está decidido

| Tema | Decisão vigente / limite |
| --- | --- |
| Organização — confirmação de 17/11/2026 | Pedro decide produto e valida entregas; subagentes preparam análises e executam alterações autorizadas; orquestrador coordena e revisa. Prioridade: autogestão e implantação, depois revisão técnica |
| Lote 1 — decisão de 17/11/2026 | Pedro autorizou seguir as recomendações apresentadas: **AG-01 A**, **AG-02 A** e **AG-07 C**. Complementos aprovados na seção 5.1; operador oficial adiado, sem encerrar G0 |
| Lote 2 — decisão de 17/11/2026 | Pedro aprovou **AG-03 C (combinação A+B)**, **AG-04 A**, **AG-05 A**, **AG-06 A** e **AG-12 B**, conforme as opções apresentadas na conversa. Complementos aprovados na seção 5.1, com alinhamento autorizado. AG-03 C não significa autodeclaração |
| Testes com usuários e parecer jurídico | **Pulado — Inacessível**, por decisão de 17/11/2026. Não bloqueiam o avanço por essa ausência enquanto adiados; não foram executados nem aprovados. Sem data de retomada |
| Planos e eleição | Essencial com administradora ou autogestão; Gestão + Suporte sem administradora. Hierarquia eleitoral já aprovada. Suporte atua somente no Gestão + Suporte e nunca acessa reclamações ou scores; ver [diretrizes](01-produto/06-autogestao-e-conducao-eleitoral.md), seção 1 |
| Fornecedores | Asaas, Supabase + Render para construção em dev/staging e Resend aceitos com ressalvas; painel estático no Render em dev/staging aceito com ressalvas. Revisão da nuvem obrigatória antes do piloto com dados reais. Não reabrir escolha de fornecedor nesta rodada |
| Organização técnica | pnpm único, pacotes compartilhados e OpenAPI/AsyncAPI como fontes estruturais canônicas aprovados no ADR-015. Geradores, versões e provas ainda pendentes |
| UI | Biblioteca própria, tokens compartilhados e catálogo Storybook principal web/complementar nativo já orientam a implementação; não substituir por outra biblioteca por conveniência |
| Escopo preservado | Relatórios gerenciais da administradora fazem parte do MVP; acordos de parcelamento permanecem V2. Perfil de acesso Manutenção retirado; empresas e chamados pelo síndico preservados |

Fontes: [roadmap, seções 2 e 4](roadmap.md), [ADRs e seus estados](03-arquitetura/adr/README.md), [biblioteca de componentes](06-frontend/biblioteca-de-componentes.md). Aceitar uma escolha acima não comprova integração, teste ou controle operante.

## 2. Como responder sem decidir tudo de uma vez

Os **lotes 1 e 2 e complementos operacionais/lote 3 estão aprovados**. A próxima rodada é o **lote 4: IN-01/IN-02**, com recorte técnico e pacote concreto de implementação. A seção 5.1 registra as escolhas atuais; perguntas e alternativas anteriores preservam o histórico. Pessoas/canal e provas operacionais antes do primeiro condomínio oficial; somente dados fictícios até lá.

| Ordem | Lote / resultado | Quando precisa estar resolvido |
| --- | --- | --- |
| 1 | Poderes e primeira implantação: AG-01 A, AG-02 A e AG-07 C — complementos aprovados | Seção 5.1; operador antes do primeiro condomínio oficial; G0 não encerrado |
| 2 | Continuidade e eleições: AG-03 C (A+B), AG-04 A, AG-05 A, AG-06 A e AG-12 B — complementos aprovados | Seção 5.1; desenho técnico e evidências antes do uso dependente |
| 3 | Dinheiro, imparcialidade e transições: AG-08, AG-09, AG-10, AG-11; destino das pendências de produto | Produto aprovado na seção 5.1; desenho técnico/PoCs antes do uso dependente |
| 4 | Recorte técnico e primeira entrega: IN-01 e IN-02 | Antes de liberar a base executável; evidências de PoCs vêm após autorização e antes do uso dependente |
| 5 | Fila por módulo e preparação de piloto | Resolver cada item antes da implementação dependente ou do respectivo marco; não exigir resolução integral para uma base sem esses comportamentos |

Lotes são a ordem da conversa, não novas fases obrigatórias. Se uma resposta já satisfizer outra questão, registrá-la por referência em vez de perguntar novamente. Não há prazo prometido sem capacidade e escopo definidos.

## 3. Lote 1 — poderes e primeira implantação

Fonte de todas as perguntas deste lote: [AG-01, AG-02 e AG-07](01-produto/06-autogestao-e-conducao-eleitoral.md), seção 3. As propostas abaixo tornam as alternativas revisáveis; não definem validade jurídica de documentos.

### AG-01 — quem executa na autogestão?

**Pergunta:** o subsíndico e o conselho editam a gestão diariamente ou o subsíndico só substitui e o conselho fiscaliza?

| Opção | Resultado e consequência |
| --- | --- |
| A — Síndico executa; sub em substituição; conselho fiscaliza | Menos concessões e separação entre execução e fiscalização; depende de substituição formal para o sub executar |
| B — Delegação por atividade | Distribui a carga diária; exige lista de atividades delegáveis, validade, revogação e tratamento de conflitos |
| C — Todos executam e editam | Mais disponibilidade; permite ao fiscal alterar aquilo que fiscaliza e exige revisão ampla das salvaguardas |

**Recomendação:** A, pois corresponde ao desenho conservador já documentado e reduz a quantidade de permissões novas. Se faltar colaboração, decidir B por atividade depois, sem pressupor delegação atual.

**Impacto:** matriz de permissões e funções administrativas/financeiras, RN-PL-08/RN-FI-29 e contratos da autogestão. Não concede acesso global a reclamações.

**Resposta de Pedro — 17/11/2026:** **A aceita**, ao autorizar seguir as recomendações apresentadas no lote 1. Síndico executa, subsíndico executa em substituição e conselho fiscaliza. Não há delegação por atividade aprovada; a distribuição foi alinhada na matriz e nas fontes de produto/design e descrição do protótipo; detalhamento técnico não aprovado por consequência.

### AG-02 — como habilitar o primeiro síndico?

**Pergunta:** quem verifica a primeira identidade e representação quando não existe gestão habilitada no condomínio?

| Opção | Resultado e consequência |
| --- | --- |
| A — Verificação restrita de implantação pelo Admin da plataforma | Proposta de capacidade específica para analisar prova e habilitar a primeira autoridade; exige definir operador real, prova, recusa, contestação e recuperação. Não supõe equipe disponível |
| B — Convite validado por representantes do condomínio | Reduz operação da plataforma; exige definir como os primeiros representantes comprovam identidade e vínculo e qual confirmação basta, sem criar outro ciclo de autovalidação |

**Recomendação apresentada e direção aceita:** A, por oferecer um ponto explícito de verificação sem cobrar Gestão + Suporte. A nomeação de quem exercerá essa capacidade continua pendente; não há operador nomeado neste pacote. Provas e procedimento aprovados posteriormente na seção 5.1; desenho técnico e nomeação oficial pendentes.

**Limites:** autodeclaração sem verificação não atende à ausência de autoconcessão exigida em G0. A opção A não usa o perfil Suporte no Essencial e não concede ao Admin conteúdo de gestão, reclamações ou scores para fazer a verificação. A direção foi aceita e alinhada nas fontes autorizadas de produto/design e descrição do protótipo; o procedimento de produto está na seção 5.1, sem implementação real. Evidências pessoais futuras ficam fora do Git.

**Impacto:** primeira implantação, recuperação e habilitação de mandatos; API item 3 e requisito de primeira autoridade de G0.

**Resposta de Pedro — 17/11/2026:** **A aceita**, ao autorizar seguir as recomendações apresentadas no lote 1. Admin da plataforma fará a verificação restrita de identidade e representação para a primeira habilitação. **Nomeação do operador pendente**; Pedro não foi designado automaticamente. Provas, recusa, contestação, recuperação e concessão/revogação complementadas na seção 5.1; desenho técnico pendente.

### AG-07 — como validar mandato e alterações interessadas?

**Pergunta:** como registrar posse, renúncia, destituição e contratação profissional sem o interessado aprovar o próprio poder?

| Opção | Resultado e consequência |
| --- | --- |
| A — Registro com evidência e segundo validador independente | Abrange situações fora de eleição; exige definir quem valida cada caso e a alternativa quando não há outro órgão |
| B — Registro pelo condutor competente ligado ao resultado/posse | Reaproveita evidência eleitoral; ainda exige tratamento independente quando o condutor é interessado e para fatos fora de eleição |
| C — Combinar B para resultado eleitoral e A para exceções/conflitos | Evita duplicar o fluxo normal; mantém procedimento explícito para contratação, renúncia, destituição e conflito de interesse |

**Recomendação:** C. Nenhum caminho permite ao interessado aprovar o próprio mandato. A identidade do validador, a evidência e a recuperação de cada exceção precisam ser fechadas antes do fluxo real; não presumir quórum, documento ou acesso de suporte.

**Impacto:** mandatos, substituição, revogação e auditoria; ler junto com AG-02 e AG-03. Conduzir eleição não concede administração geral nem validação do próprio mandato.

**Resposta de Pedro — 17/11/2026:** **C aceita**, ao autorizar seguir as recomendações apresentadas no lote 1. Registro ligado ao resultado/posse eleitoral, com validação independente para exceções e conflitos. Validadores, evidências e recuperação complementados na seção 5.1; não há autovalidação do próprio mandato.

## 4. Lote 2 — continuidade e eleições

Fonte: [registro de autogestão, seção 3](01-produto/06-autogestao-e-conducao-eleitoral.md). A sequência síndico → sub → conselho → proprietário designado já está decidida; aqui se decide como comprovar e conceder o acesso. Recomendações são de operação do produto, sem parecer jurídico.

| ID / pergunta | Opções e consequências | Recomendação e motivo | Impacto / resposta |
| --- | --- | --- | --- |
| AG-03 — Quem valida ausência/vacância? | A: titular registra ausência e vacância tem evidência validada; cobre rotina. B: exceção colegiada para emergência/ninguém com acesso; exige validadores e contestação. C, apresentada na conversa: combinar A+B | Combinar A+B, definindo validação sem autodeclaração unilateral. Reaproveitar o procedimento aprovado em AG-02 quando compatível, sem conceder automaticamente novas capacidades | Substituição e concessão eleitoral. **Resposta de Pedro — 17/11/2026: C aceita (A+B)**; complemento aprovado na seção 5.1, decisões 2 a 5 |
| AG-04 — Como habilitar proprietário designado? | A: designação documentada e verificada por procedimento restrito de implantação/recuperação. B: confirmação por proprietários com acesso, com regra de aprovação ainda a definir | A como primeira proposta; B só após resolver quem já tem acesso. Definir eleição abrangida, validade e revogação, sem finanças/cadastros | Último degrau eleitoral. **Resposta de Pedro — 17/11/2026: A aceita**; complemento aprovado na seção 5.1, decisões 1 a 6 |
| AG-05 — Quem age pelo conselho? | A: representante e substituto designados pelo conselho; menos concorrência. B: qualquer conselheiro elegível; maior disponibilidade, exige resolver comandos simultâneos | A, limitada ao caso em que o conselho conduz. Não cria responsável separado obrigatório em toda eleição | Eleições e auditoria. **Resposta de Pedro — 17/11/2026: A aceita**; designação documentada por eleição, seção 5.1, decisão 7 |
| AG-06 — Como tratar ausência de conselho quando não há sub? | A: manter exigência de composição e registrar ausência como pendência sem bloquear o degrau eleitoral aprovado. B: tornar ambos opcionais; exige revisar governança, julgamento e continuidade | A para preservar regras anteriores com ausência factual tratada. Não significa afirmar a regularidade jurídica da composição | RN-CD-14/RN-VO-09 e RN-VO-13. **Resposta de Pedro — 17/11/2026: A aceita**; ausência não bloqueia eleição nem torna os órgãos opcionais |
| AG-12 — O que funciona sem gestor até a posse? | A: capacidade administrativa temporária separada, com operações, prazo e validador definidos; amplia continuidade e poderes. B: só rotinas automáticas e eleição; pode deixar gestão manual sem executor | B como limite inicial mais simples. A permissão eleitoral nunca herda gestão geral | Vacância, eleição inconclusiva e tarefas paradas. **Resposta de Pedro — 17/11/2026: B aceita**, inclusive a limitação de tarefas administrativas manuais sem executor até a posse; nenhuma capacidade administrativa temporária aprovada |

**Registro do aceite do lote 2 — 17/11/2026:** Pedro autorizou colocar o conjunto recomendado apresentado na conversa. A letra C de AG-03 significa **combinar o procedimento regular A com a exceção colegiada B**, e não a alternativa histórica de autodeclaração no registro 06. As cinco direções aceitas foram complementadas pela seção 5.1, com alinhamento transversal autorizado em RN, PRD, histórias, fluxos, Design System, protótipo e limites das fontes técnicas. Este registro não encerra G0 nem libera implementação.

## 5. Lote 3 — operações sensíveis e destino do produto pendente

Fonte das decisões AG: [registro de autogestão, seção 3](01-produto/06-autogestao-e-conducao-eleitoral.md).

| ID / pergunta | Opções e consequências | Recomendação e motivo | Impacto / resposta |
| --- | --- | --- | --- |
| AG-08 — Como proteger mudança de conta, baixa manual e devolução? | A: executor competente com comprovação, auditoria e confirmação adicional; não depende sempre de outro órgão. B: dupla aprovação; maior controle, mas requer alternativa quando não há segundo representante | Separar rotina das ações sensíveis e detalhar B com exceção verificada por procedimento restrito, se houver operador viável; se não houver, decidir A explicitamente. Nenhuma exceção será implementada só por esta recomendação | Finanças/cobrança; não bloqueia health/app sem dinheiro. **Resposta aceita: 8B para troca de conta e 9A para baixas/cancelamentos/devoluções**, seção 5.1; sem exceção financeira pelo Admin. KYC depende de PoC |
| AG-09 — Quem julga sem julgador imparcial? | A: manter pendente com alerta até existir julgador elegível. B: criar instância externa formal; exige papel, privacidade e custo novos | A, preservando a vedação de autojulgamento e do acesso do suporte a reclamações/scores | Reclamações/recursos. **Resposta aceita: 10A**, aguardar elegível; suporte não julga |
| AG-10 — Como mudar modalidade de gestão? | A: procedimento assistido e auditado; menos automação inicial, exige operador e capacidades. B: autoatendimento com vigência, transferência e revogação; maior desenho inicial | A como proposta de processo, sem presumir equipe; Pedro define operador elegível e capacidade restrita. Suporte não opera administrativamente no Essencial | Transições e acesso antigo: **11A aceita**, transição assistida; seção 5.1 |
| AG-11 — Qual atendimento existe no Essencial? | A: canal técnico/comercial separado da execução administrativa, sem conceder acesso de suporte ao condomínio. B: serviço avulso com oferta/preço próprios; amplia escopo comercial | A, esclarecendo canal, responsável e limites; não importar franquia nem cobrança de R$ 15 do Gestão + Suporte | Oferta, acesso e incidentes: **12A aceita**, e-mail técnico/comercial; pessoa e endereço antes de disponibilizar |

Para as demais questões, o próximo trabalho é classificar o destino, não aceitar todas as propostas da API:

| Grupo / fonte | Escolhas a apresentar por tema | Tratamento recomendado para reduzir o caminho inicial |
| --- | --- | --- |
| Manutenção — RM-07 / PRD | Incluir formalmente o perfil (revisão transversal) ou retirar o perfil proposto do protótipo, preservando empresas acompanhadas pelo síndico | **13A aceita:** retirar perfil, preservar empresas/chamados; sem ampliar MVP |
| API itens 1, 5, 10, 30 | Notificação obrigatória de atraso, ações sem RF/RN, comunicação de preço e denúncia pela administradora: aprovar comportamento e rastrear, rejeitar, ou adiar a ação proposta | Não implementar extensão sem fonte aprovada; trazer cada pergunta no lote do módulo afetado. Canal/texto de preço antes da operação comercial dependente |
| API itens 4, 25; MER P-10 | Cadastro de administradora/condomínio, importação e cardinalidades: fechar recorte da implantação ou manter recurso fora do primeiro pacote | Resolver primeiro os casos que definem identidade, unidade, representação e acesso. Adiar importação da primeira entrega só mediante decisão explícita; não remover do MVP por consequência |
| Finanças — User Flows 17 | Orçamento anual, transparência aos moradores, saldos separados de fundos/obras e plano por administradora: incorporar com revisão de escopo ou adiar expressamente a ampliação proposta | Preservar escopo atual enquanto Pedro decide; não criar contabilidade formal ou novos acessos. Não bloquear base sem finanças |

Fontes: [pendências da API e atualizações posteriores](05-backend/api/README.md), [MER, seção 9](04-banco-de-dados/01-mer-e-der.md), [User Flows, seção 17](02-design/02-user-flows.md). Os itens já resolvidos em 12, 15 e 16/11/2026 não voltam à fila como perguntas abertas.

### 5.1 Rodada complementar aprovada — 17/11/2026

Pedro autorizou todas as recomendações da rodada de 14 decisões, exceto **1C**: não assume como Admin; dados fictícios e nomeação apenas antes do primeiro condomínio oficial. Escolhas completas e limites: [registro de autogestão, seção 2.1](01-produto/06-autogestao-e-conducao-eleitoral.md), **1C; 2A; 3A; 4A; 5A; 6A; 7A; 8B; 9A; 10A; 11A; 12A; 13A; 14A**.

A rodada aprova provas por evento, validação independente/exceções documentais restritas, ausência programada/emergência, revisão sem suspensão automática, acesso eleitoral de 30 dias prorrogável mediante validação, representação por eleição, dupla aprovação da troca de conta sem Admin financeiro, baixas/cancelamentos/devoluções com prova/reautenticação/auditoria, espera por julgador, transição assistida, e-mail técnico/comercial sem pessoa/endereço inventados, retirada do perfil Manutenção e decisão de extensões antes do módulo. Alinhamento de produto/design, protótipo e limites técnicos autorizado; lote 4, dados reais e execução do MVP ainda sem liberação.

## 6. Lote 4 — o mínimo para liberar a primeira entrega técnica

Não é necessário aceitar todo o MER, contrato ou conjunto de ADRs para preparar uma base sem operações de negócio. Também não basta responder AG-01 para declarar G0 encerrado. O [checklist G0](roadmap.md), seção 4.2, continua exigindo decisões suficientes de primeira autoridade/implantação, classificação das pendências, recorte revisado e liberação de Pedro.

| ID / pergunta | Opções e consequências | Recomendação e motivo | Fonte / resposta |
| --- | --- | --- | --- |
| IN-01 — Qual pacote implementar primeiro após G0? | A: base local reproduzível, app alcança health da API, configuração, geração de um recorte de contratos e checks; concentra verificação. B: incluir acesso persistido, banco e sessões de uma vez; aumenta decisões e provas antes de concluir a entrega | A, seguido de acesso/condomínio/permissões, depois portaria/offline e cobrança. Não retira módulos do MVP nem elimina pré-condições de acesso real | Roadmap6–8, RM-10 a RM-16. **Resposta: a decidir** |
| IN-02 — Como fechar escolhas técnicas ainda não provadas? | A: preparar comparação curta e PoCs com critérios para geradores, sessões, RLS e persistência; aceitar desenho condicionado à prova antes do uso dependente. B: escolher ferramenta final antes de provar; pode exigir retrabalho | A. Manter Node/pnpm e geradores sem número arbitrário neste pacote; levantar compatibilidade/documentação atual antes de propor versões. PoCs só depois de G0 e autorização de seu escopo | ADR-001/007/008/015 e estratégia de migrations. **Resposta: a decidir**; aceite condicionado não é PoC concluída |

**Pacote técnico a apresentar para liberação:** arquivos concretos, comandos que serão criados, versões propostas verificadas, critérios de instalação limpa e comunicação app/API, recorte canônico a gerar, dados fictícios e verificações. Não contratar/provisionar, publicar, migrar banco real ou usar dados pessoais por consequência deste pacote. SOLID/GRASP na separação de responsabilidades e portas; Adapter nas integrações quando forem implementadas, sem camadas sem função.

**Antes de acesso persistido:** revisar ADR-001/007/008, política de acesso e MER/contrato apenas das entidades necessárias; fechar identidade, contexto, concessão/revogação, recuperação e prova de tenant/RLS sem credencial dona na API. A escolha do executor de migrations (proposta Flyway SQL-first) é separada da escolha de acesso a dados (Kysely/Drizzle ainda em avaliação). Não gerar migrações de todos os domínios para iniciar a base.

## 7. Lote 5 — fila restante por dependência

Esta fila evita que uma questão de módulo impeça trabalho independente, sem liberá-la implicitamente. Para cada linha, o subagente prepara a pergunta concreta com 2–3 opções e evidência técnica quando chegar a vez; não há respostas presumidas aqui.

| Antes de | Decisões / verificações pendentes | Fontes e critério de saída |
| --- | --- | --- |
| Sessões, acesso e arquivos do recorte | Retry legítimo/replay de refresh, limites de taxa, política de versão mínima, parâmetros de idempotência; formatos/URLs/verificação de arquivos quando usados | ADR-007; API19–22. Proposta de parâmetros e testes de fronteira, sem TTL escolhido arbitrariamente |
| Portaria e limpeza offline | Banco local/criptografia, fila pós-logout, retenção de pendências, operações admitidas, Desfazer, treino/reentrada; empate exato e relógio incorreto | ADR-003/014, API16–18, MER P-04/P-07/P-10. Preservar menor horário do celular já aprovado e separar fila/cache |
| Cobrança, pagamentos e reservas | PoC Asaas: estados, KYC, chargeback, dados transmitidos, meios aceitos, prazos/QR e reenvio; extra por unidade/total, horários reserváveis, checklist e fotos | ADR-002, API7–9/11–13/26/27; MER P-06/P-10/P-16. Manter crédito como regra atual, sem habilitar débito por conveniência do gateway |
| Jobs/rotinas com datas | Executor/agendador/eventos, concorrência/reprocessamento, fuso civil/instante, vencimento e virada do dia | ADR-006/012, MER P-05. Casos de falha e fronteira aprovados/testados; limite do Render gratuito preservado |
| Reclamações, pesquisa e votação | Sigilo e substituição de voto, correlação residual, acesso histórico restrito, HMAC/rotação/direitos, moderação e julgamento elegível, quórum e estados | ADR-009/010; MER P-03/P-11/P-12; API2/6/30. Parecer permanece pulado; desenhos técnicos e decisões de produto continuam necessários |
| Finanças/relatórios e exportações | Crédito após troca de responsável, consistência temporal, pequenos grupos, limites/concorrência, retenção e links privados | MER P-08/P-11; API23/24 e seção de relatórios14/11. Sem ampliar acesso por equivalência de perfil |
| Expurgo/restauração de dados | Retenção por finalidade, exclusão, quarentena, backups e chaves | MER P-09; segurança/LGPD. Não fixar prazos jurídicos por palpite; dados fictícios de desenvolvimento não comprovam conformidade operacional |
| Piloto com dados reais | Revisão obrigatória de nuvem/painel, transferências Resend, contratos/termos, recuperação e RPO/RTO, responsáveis/canais e incidentes | ADR-004/005/013/016, roadmap11. Gratuito de construção não libera uso real; nenhuma conta, custo ou equipe presumidos |
| Pipeline, publicação e V2 | Promoção/branches/EAS/OTA; titularidade e requisitos atuais das lojas; acordos de parcelamento em refinamento próprio | ADR-011, roadmap12–13. Verificar exigências atuais na execução e obter liberação específica |

## 8. Registro e conclusão de cada rodada

O alinhamento rastreável por lote e a autorização prévia do escopo afetado seguem as regras vigentes de AGENTS.md e da seção 14 do roadmap; não constituem nova decisão a confirmar.

| Campo | Como registrar |
| --- | --- |
| Decisão | ID, resposta exata, data, Pedro como decisor, motivo e ressalvas; diferenciar aceito, ajustar e adiado |
| Dependência | Parte liberável e parte ainda bloqueada; responsável por preparar: subagente; revisão: orquestrador; decisões: Pedro |
| Detalhamento faltante | Operações, provas, validadores, exceções, vigência e revogação ainda necessárias. Escolher uma direção não encerra detalhes que determinem comportamento |
| Rastreabilidade | Propor arquivos afetados antes de alterar fora do pacote: RN → PRD/RF → US → fluxo → Design System/protótipo, e dados/API/arquitetura/testes quando aplicável |
| Evidência | Diff revisado e verificações realmente executadas. ADR só muda para aceito no alcance decidido por Pedro; PoC sem execução continua pendente |
| Liberação | Depois de G0, apresentar primeiro pacote concreto para Pedro autorizar. Respostas deste roteiro não autorizam commit, push, merge, dados reais ou publicação |

**Estado desta preparação:** autogestão, implantação e lote 3 aprovados conforme seção 5.1; alinhamento autorizado nesta revisão. Próxima rodada: lote 4 (IN-01/IN-02). Operador e canal reais antes do primeiro condomínio oficial; somente dados fictícios até lá. Desenho técnico, contratos estruturais, PoCs e G0/base continuam pendentes; nenhum ADR ou contrato inteiro aceito por consequência.
