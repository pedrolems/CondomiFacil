# Pacote para validação jurídica — CondomiFacil

**Preparado em:** 16/11/2026. **Responsável pelo produto:** Pedro Lemos. **Estado do pacote:** preparado para consulta futura. **Estado do parecer:** **Pulado — Inacessível (17/11/2026)**.

## 1. Registro da pendência e finalidade

Em 16/11/2026, Pedro informou que não tem acesso a advogado agora e que provavelmente não terá esse acesso. Solicitou preparar este pacote e registrar o parecer como **Pendente - Inacessível**. Não há profissional designado, encaminhamento realizado, prazo de atendimento informado ou parecer recebido. Em 17/11/2026 (Q-13), Pedro alterou o estado para **Pulado — Inacessível (17/11/2026)**.

Este pacote reúne contexto, fontes e perguntas para uma futura análise profissional. Não contém conclusões jurídicas, não valida regras nem substitui parecer. A inacessibilidade registra a condição atual; não é dispensa, rejeição ou aprovação do requisito. O parecer não bloqueia o G0 e é obrigatório antes do primeiro dado real (piloto), conforme [roadmap, seções 4.2 e 5.2](../roadmap.md). O marco G0 permanece aberto pelos demais itens.

| Acompanhamento | Registro atual |
| --- | --- |
| Referência | RM-03 / SEG-16 |
| Estado do parecer | Pulado — Inacessível (17/11/2026); não bloqueia o G0; obrigatório antes do primeiro dado real (piloto) |
| Motivo | Pedro sem acesso a advogado; acesso futuro incerto |
| Responsável pelo acompanhamento | Pedro Lemos |
| Próxima ação condicionada | Quando houver acesso, revisar a atualidade deste pacote e definir escopo, profissional, prazo e encaminhamento |
| Evidência existente | Relato de Pedro e preparação documental de 16/11/2026 |
| Evidência ausente | Análise profissional, parecer e tratamento das condições impeditivas |

## 2. Resumo para quem fará a análise

O CondomiFacil está em Design: há documentação, protótipo HTML com dados fictícios e estruturas preparatórias sem aplicação funcional. Não há API, banco, pagamentos, sincronização ou controles de segurança implementados. O protótipo simula percursos e não demonstra conformidade ou segurança real.

O produto prevê gestão de condomínios brasileiros: acesso e vínculos com unidades, portaria offline, visitantes, encomendas, reservas gratuitas/pagas, chamados, reclamações e score, comunicação, pesquisa de funcionários, assembleias/eleições, cobrança, finanças gerenciais e nove relatórios. Há modalidades com administradora, Essencial com autogestão e Gestão + Suporte. A distribuição detalhada dos poderes locais ainda tem propostas em revisão.

Pontos que precisam de atenção na análise:

- O score é pessoal por vínculo de moradia com a unidade; funcionários e síndico profissional sem unidade têm tratamento próprio. Reclamações podem produzir perda de pontos e restrições previstas nas regras. Identidade do reclamante não é mostrada ao alvo, mas pode ser acessível a funções autorizadas; não se promete anonimato absoluto.
- Uma unidade ocupada tem um morador habilitado. O proprietário vota pela unidade, com exceções de locação descritas nas fontes. O desenho prevê voto secreto, substituição de voto e condução eleitoral quando faltam gestores.
- Suporte da plataforma atua no Gestão + Suporte e não acessa reclamações nem scores. A ausência de gestores não autoriza conceder automaticamente esses acessos.
- Existem cópias offline, arquivos, anexos, registros financeiros, auditoria e relatórios. Prazos de retenção, responsabilidades e transferências com fornecedores têm hipóteses e pendências.

As descrições acima são contexto de produto a analisar, não afirmações de validade jurídica. Se uma regra conflitar com outra fonte, registrar a divergência e pedir esclarecimento a Pedro antes de concluir.

## 3. Fontes e recorte de versões

**Recorte de preparação:** arquivos do repositório consultados em 16/11/2026, com base Git `75a51151a7a1e86379e6138d14e1b03abfceb278`. Este pacote e os registros de status associados são posteriores a essa base. Os links apontam para arquivos vivos; antes de encaminhar, identificar o commit ou a cópia datada efetivamente entregue e conferir mudanças desde este recorte. Preservar as decisões e ressalvas de cada documento; inclusão neste índice não significa aceite de uma proposta.

| Material | Leitura direcionada / uso |
| --- | --- |
| [Visão de Produto](../01-produto/01-visao-de-produto.md) e [PRD](../01-produto/02-prd.md) | Contexto, planos, perfis/permissões; PRD seções 3, 4.8, 6 e 8, incluindo SEG-16 e RF-AC-07 |
| [Regras de Negócio](../01-produto/03-regras-de-negocio.md) | Seções 3–8, 10–12 e 15: vínculos/locação, score, reclamações, pesquisa, reservas, visitantes, voto, planos, cobrança e relatórios |
| [Histórias de Usuário](../01-produto/04-historias-de-usuario.md) | Épicos 2, 3, 7, 8, 10, 12, 13 e 14: comportamento e critérios de aceite |
| [Decisões de complementação](../01-produto/05-decisoes-de-complementacao.md) | Decisões de 12/11 e 16/11; não aceitar propostas remanescentes por consequência |
| [Autogestão e condução eleitoral](../01-produto/06-autogestao-e-conducao-eleitoral.md) | Diretrizes e decisões de 13–15/11; perguntas AG-01 a AG-12 ainda em revisão |
| [User Flows](../02-design/02-user-flows.md) | Fluxos 4.5, 9, 11, 13 e 14; pendências da seção 17 |
| [Design System](../02-design/01-design-system.md) e [protótipo](../../prototipo/README.md) | Mensagens, transparência e telas simuladas; demonstrar somente os percursos pertinentes com dados fictícios |
| [LGPD](lgpd.md) | Agentes, inventário/hipóteses de bases, RIPD preliminar, retenções, minutas, direitos e contrato; seções 2–9 |
| [Segurança](seguranca.md) | Acessos, cópias, sigilo, offline e incidentes; propostas sem controles operantes |
| [ADR-009 — voto](../03-arquitetura/adr/009-votacao-sigilo.md) e [ADR-010 — identidade separada](../03-arquitetura/adr/010-anonimato-identidade-separada.md) | Propostas de sigilo, substituição de voto, correlação e acesso excepcional |
| [ADR-002 — pagamentos](../03-arquitetura/adr/002-gateway-de-pagamento.md), [ADR-004 — nuvem](../03-arquitetura/adr/004-nuvem-regiao-residencia-dados.md), [ADR-005 — e-mail](../03-arquitetura/adr/005-email-transacional.md) e [ADR-016 — painel web](../03-arquitetura/adr/016-hospedagem-do-painel-web.md) | Fornecedores escolhidos com ressalvas; revisão de nuvem antes do piloto e diligências ainda necessárias |
| [MER/DER](../04-banco-de-dados/01-mer-e-der.md) e [integrações](../05-backend/api/03-integracoes-externas.md) | Dados, destinatários, ciclos de vida e pendências técnicas que podem condicionar a análise |
| [Roadmap](../roadmap.md) | RM-03, marco antes do primeiro dado real (piloto) e critérios de encerramento |

## 4. Perguntas para o parecer

Os identificadores `JUR-*` organizam esta consulta; não são novos requisitos de produto. A ordem abaixo prioriza as condições exigidas antes do primeiro dado real (piloto); o parecer está Pulado — Inacessível (17/11/2026) e não bloqueia G0. O profissional deverá indicar o fundamento, as premissas e o momento em que cada condição precisa estar satisfeita. A separação de temas operacionais não adia o parecer exigido antes do primeiro dado real (piloto).

| ID / prioridade da consulta | Pergunta e resultado solicitado | Fontes principais |
| --- | --- | --- |
| JUR-01 — início | As regras de reclamações e score podem ser implementadas nos moldes propostos? Avaliar proporcionalidade de perdas, recuperação, bloqueios e exposição; distinguir score interno de eventual sanção condominial e indicar o que depende de convenção/regimento ou deliberação | RN-SC; RN-RC; PRD 4.8/6; US-RS; RF-AC-07 |
| JUR-02 — início | O procedimento de comunicação ao alvo, defesa, decisão e recurso é suficiente? Avaliar prazos, ausência de resposta, acesso às provas, identidade protegida, julgador interessado, ausência de julgador e decisão sem recurso no app | RN-RC-01/03/04/07/11/14; tabelas 5.1/5.3 das RN; UF 9 |
| JUR-03 — início | Como compatibilizar proprietário e inquilino quanto a representação, voto, procuração, despesas, responsabilidade pela cobrança e acesso às informações? Avaliar voto/substituição do voto preservando sigilo e efeitos do fim da locação | RN-CD-19 em diante; RN-VO-01/18; RN-FI; UF 4.5/11/13; ADR-009 |
| JUR-04 — início | Quais provas, validadores e salvaguardas são necessários para primeira habilitação, mandato, substituição, vacância e proprietário designado para eleição? Quais limites devem orientar AG-01 a AG-12, inclusive dinheiro, conflito de interesses e ausência de conselho? | RN-CD; RN-VO-13; RN-PL-08; registro de autogestão |
| JUR-05 — início | Quem decide e responde por cada finalidade de tratamento na plataforma, condomínio e administradora? Quais bases e salvaguardas sustentam cada operação, incluindo menores e dados sensíveis incidentais? Confirmar ou corrigir hipóteses do inventário, sem aprová-las em bloco | LGPD 2–4; SEG-14; ADR-010 |
| JUR-06 — início | Que conteúdo deve constar de termos, política, regimento e “Como funciona”? Como registrar ciência/aceite e mudanças sem usar aceite genérico como autorização para toda finalidade? Avaliar responsabilidades e limites contratuais das modalidades | RN-CD-03; RF-AC-07; SEG-03/15/16; minutas LGPD 5/6/8 |
| JUR-07 — condições a definir no parecer | Quais critérios/prazos de retenção, preservação de prova, exclusão e anonimização aplicar a cada finalidade? Como tratar desligamento, pedidos sem conta, terceiros em anexos, cópias offline, backups e direitos sem quebrar sigilo de voto/reclamante? | LGPD 3.4/7; MER P-09; RN-CD-07/08/18; RN-OF-06 |
| JUR-08 — condições a definir no parecer | Quais contratos, diligências e instrumentos são necessários para fornecedores, países e transferências? Avaliar pagamentos/KYC e conta PF/CNPJ, reservas, cancelamento/devolução e responsabilidades sem presumir dados ou respostas ainda dependentes de PoC | SEG-11/15; ADR-002/004/005/016; RN-CA; integrações |
| JUR-09 — condições a definir no parecer | Quais limites de acesso/divulgação e salvaguardas usar para pesquisas de funcionários, projeções de score e relatórios, inclusive pequenos grupos e reidentificação? Quais obrigações de resposta a incidentes e evidências devem orientar a operação antes do piloto? | RN-PE/RN-RL; LGPD 4/8; segurança 9; ADR-010 |

## 5. Cenários fictícios para demonstrar as regras

Usar apenas os dados simulados do protótipo ou nomes como “Pessoa A”, “Pessoa B” e “Unidade 101”. Não anexar CPF, contatos, contratos de moradores, reclamações reais, votos ou credenciais. Documentos reais eventualmente necessários serão solicitados pelo profissional e compartilhados por canal restrito autorizado por Pedro.

| Cenário | Questões a demonstrar, sem antecipar resposta |
| --- | --- |
| Reclamação contra o síndico | Quem vê identidade/provas, quem julga, o que o alvo recebe e como recorre; ausência ou impedimento do julgador |
| Troca de ocupante durante reclamação | Preservação do episódio e do score original; informações que novo ocupante e proprietário podem consultar |
| Inquilino vota e proprietário substitui o voto | Elegibilidade por pauta, prova de representação, unicidade, sigilo e auditoria |
| Condomínio sem gestores cadastrados | Prova de autoridade inicial, condução eleitoral temporária e ausência de poder administrativo automático |
| Exclusão com fatos pendentes | Cobrança, reclamação, reserva paga, evidência e cópias offline sem apagar direitos nem expor terceiros |

## 6. Modelo de solicitação e resposta profissional

**Texto-base para encaminhamento futuro — não enviado:**

> Solicitamos análise jurídica do desenho do CondomiFacil, ainda sem implementação funcional, conforme fontes e versões anexadas. Precisamos de respostas aos quesitos JUR-01 a JUR-09, com fundamentos, premissas, limitações, alterações necessárias e indicação das condições impeditivas antes da implementação e antes do piloto com dados reais. Favor identificar material analisado e informações faltantes. Pedimos proposta com escopo, entrega escrita, prazo, honorários e previsão de apresentação e revisão dos ajustes.

O quadro seguinte fica sem respostas até o recebimento da análise. Sua existência não indica contratação ou aceite profissional.

| Campo da entrega | Preenchimento esperado |
| --- | --- |
| Identificação | Profissional responsável, inscrição profissional, data e identificação do parecer |
| Material analisado | Arquivos/versões, telas, decisões e exclusões de escopo |
| Resposta por JUR | Conclusão, fundamento atualizado, premissas, dados faltantes e limitações |
| Condições | Alteração exigida, justificativa, fonte afetada e momento obrigatório de atendimento |
| Riscos remanescentes | Risco, salvaguarda proposta e questões que exigem esclarecimento ou nova análise |
| Revisão | Como confirmar que os ajustes atendem às condições do parecer |

## 7. Retomada e encerramento do marco

Enquanto o parecer estiver **Pulado — Inacessível (17/11/2026)**, manter este registro e o bloqueio do primeiro dado real (piloto); o parecer não bloqueia o G0. Não há data prometida de retomada. A preparação do pacote está concluída; a consulta e a validação profissional permanecem pendentes.

Quando houver acesso a profissional:

1. Pedro confirma o encaminhamento e o escopo; atualizar o recorte de fontes e combinar canal restrito, entrega e prazo. Nenhum envio ou contratação foi autorizado pela preparação deste pacote.
2. Receber e identificar o parecer; registrar respostas e condições sem armazenar informações sensíveis em Git.
3. Pedro decide as mudanças de produto necessárias e autoriza os arquivos afetados. Atualizar a rastreabilidade RN → PRD/RF → US → fluxos → Design System → protótipo, além de dados/contratos quando afetados.
4. Verificar as condições impeditivas e confirmar com o profissional o que exigir revisão. Se houver redesenho, validar novamente os percursos afetados.
5. Registrar o aceite de Pedro com referência ao parecer e às evidências. O marco jurídico só se encerra com as condições exigidas antes do primeiro dado real (piloto) atendidas. Enquanto estiver Pulado — Inacessível (17/11/2026), não bloqueia G0, que ainda depende dos demais itens e da liberação explícita do pacote de implementação.

**Limite desta entrega:** preparação documental interna, sem análise legal nova, consulta profissional, parecer, envio a terceiros ou dispensa de requisito. As referências normativas já existentes nas fontes deverão ser revalidadas pelo profissional na consulta futura.
